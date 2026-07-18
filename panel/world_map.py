"""World map extraction for the panel Map tab.

Sources (best-effort, all degrade gracefully):

  * ``.fwl`` — world name + seed via :mod:`fwl_io`.
  * ``.db``  — heuristic ASCII scan for portal prefab tags (often empty on
    real saves because ZDOs hash prefab names).
  * ``.mod.serversidemap.explored`` — optional ServerSideMap (Mydayyy) fog +
    shared pins. Format is a Valheim ``ZPackage`` / ``BinaryWriter`` blob:

      int32 version (=3)
      int32 map_size (=2048)
      bool[map_size * map_size]   # 1 byte each
      int32 pin_count
      for each pin:
        string Name               # 7-bit length + UTF-8
        float32 x, y, z
        int32 PinType
        bool Checked

The map PNG is always available (seed-tinted base disc). ServerSideMap only
adds real fog-of-war and shared pins — it is never required.
"""

from __future__ import annotations

import struct
import threading
import zlib
from pathlib import Path
from typing import Any, Optional

# In-process cache for rendered map PNGs (keyed by world + reveal + fog fingerprint).
_PNG_CACHE: dict[tuple, bytes] = {}
_PNG_CACHE_LOCK = threading.Lock()
_PNG_CACHE_MAX = 32

# World coordinates in Valheim fit comfortably inside +/-10000m.
WORLD_MIN = -10000.0
WORLD_MAX = 10000.0

# Known prefab name tags we look for in the raw bytes.
PORTAL_TAGS = ("portal_word", "portal")

DEFAULT_BOUNDS = {
    "min_x": WORLD_MIN,
    "max_x": WORLD_MAX,
    "min_z": WORLD_MIN,
    "max_z": WORLD_MAX,
}

SERVERSIDEMAP_SUFFIX = ".mod.serversidemap.explored"

# Minimap.PinType (Valheim) — keep labels stable for CSS / i18n keys.
PIN_TYPE_NAMES: dict[int, str] = {
    0: "icon0",
    1: "icon1",
    2: "icon2",
    3: "icon3",
    4: "death",
    5: "bed",
    6: "icon4",
    7: "shout",
    8: "none",
    9: "boss",
    10: "player",
    11: "random_event",
    12: "ping",
    13: "event_area",
}

# Friendly labels for common localization keys used as pin names.
PIN_NAME_LABELS: dict[str, str] = {
    "$enemy_eikthyr": "Eikthyr",
    "$enemy_gdking": "The Elder",
    "$enemy_bonemass": "Bonemass",
    "$enemy_dragon": "Moder",
    "$enemy_goblinking": "Yagluth",
    "$enemy_seekerqueen": "The Queen",
    "$enemy_fader": "Fader",
}


def read_seed(fwl_path: Any) -> Optional[dict]:
    """Return ``{name, seed}`` from a ``.fwl`` file, or ``None`` on any error."""
    try:
        from fwl_io import read_fwl

        path = Path(fwl_path)
        if not path.exists():
            return None
        meta = read_fwl(path)
        return {"name": meta.name, "seed": meta.seed_name}
    except Exception:
        return None


def _plausible_coord(value: float) -> bool:
    """True when ``value`` is a finite float within world bounds."""
    if value != value:  # NaN
        return False
    if value in (float("inf"), float("-inf")):
        return False
    return WORLD_MIN <= value <= WORLD_MAX


def extract_markers_from_bytes(data: bytes, max_results: int = 500) -> list[dict]:
    """Scan raw save bytes for portal prefab tags + nearby float coords.

    Heuristic:
      1. Find every ASCII occurrence of a known portal tag.
      2. Try to read a little-endian float32 ``x`` and ``z`` in the bytes
         immediately following the tag (two consecutive 4-byte floats).
      3. Keep the marker only if both coordinates look plausible (finite and
         within ``+/-10000``).

    Returns a list of ``{type:"portal", tag, x, z}``. Longer, more specific tags
    are tried first so a ``portal_word`` match isn't double-counted as a bare
    ``portal``.
    """
    markers: list[dict] = []
    if not data:
        return markers
    seen_offsets: set[int] = set()

    for tag in sorted(PORTAL_TAGS, key=len, reverse=True):
        needle = tag.encode("ascii")
        start = 0
        while len(markers) < max_results:
            idx = data.find(needle, start)
            if idx == -1:
                break
            start = idx + 1
            if idx in seen_offsets:
                continue
            after = idx + len(needle)
            chunk = data[after : after + 8]
            if len(chunk) < 8:
                continue
            try:
                x, z = struct.unpack("<ff", chunk)
            except struct.error:
                continue
            if _plausible_coord(x) and _plausible_coord(z):
                seen_offsets.add(idx)
                markers.append(
                    {
                        "type": "portal",
                        "tag": tag,
                        "name": tag,
                        "x": round(x, 2),
                        "z": round(z, 2),
                        "source": "db_scan",
                    }
                )
    return markers


def scan_portals(db_path: Any, max_results: int = 500) -> list[dict]:
    """Open a world ``.db`` and byte-scan for portal markers. ``[]`` on error."""
    try:
        path = Path(db_path)
        if not path.exists():
            return []
        data = path.read_bytes()
    except Exception:
        return []
    return extract_markers_from_bytes(data, max_results=max_results)


def _read_7bit_int(data: bytes, offset: int) -> tuple[int, int]:
    """Read a .NET BinaryWriter 7-bit encoded integer."""
    result = 0
    shift = 0
    while True:
        if offset >= len(data):
            raise ValueError("truncated 7-bit int")
        byte = data[offset]
        offset += 1
        result |= (byte & 0x7F) << shift
        if not (byte & 0x80):
            return result, offset
        shift += 7
        if shift > 35:
            raise ValueError("7-bit int too long")


def _write_7bit_int(value: int) -> bytes:
    """Write a .NET BinaryWriter 7-bit encoded integer."""
    if value < 0:
        raise ValueError("7-bit int must be non-negative")
    out = bytearray()
    while True:
        byte = value & 0x7F
        value >>= 7
        if value:
            out.append(byte | 0x80)
        else:
            out.append(byte)
            break
    return bytes(out)


def _read_zpackage_string(data: bytes, offset: int) -> tuple[str, int]:
    length, offset = _read_7bit_int(data, offset)
    if length < 0 or offset + length > len(data):
        raise ValueError("truncated string")
    text = data[offset : offset + length].decode("utf-8", errors="replace")
    return text, offset + length


def _write_zpackage_string(text: str) -> bytes:
    raw = (text or "").encode("utf-8")
    return _write_7bit_int(len(raw)) + raw


def invalidate_png_cache(world_name: Optional[str] = None) -> None:
    """Drop cached map PNGs (all worlds, or only those matching ``world_name``)."""
    with _PNG_CACHE_LOCK:
        if world_name is None:
            _PNG_CACHE.clear()
            return
        for key in list(_PNG_CACHE):
            if key and key[0] == world_name:
                _PNG_CACHE.pop(key, None)


def serversidemap_dll_installed(*plugins_dirs: Any) -> bool:
    """True when a ServerSideMap DLL is present under any plugins directory."""
    for raw in plugins_dirs:
        if not raw:
            continue
        root = Path(raw)
        if not root.is_dir():
            continue
        for dll in root.glob("*.dll"):
            if "serversidemap" in dll.name.lower():
                return True
        disabled = root / "disabled"
        if disabled.is_dir():
            for dll in disabled.glob("*.dll"):
                if "serversidemap" in dll.name.lower():
                    return True
    return False


def pin_display_name(raw: str) -> str:
    """Human-readable pin label (localization keys → names)."""
    if not raw:
        return "Pin"
    if raw in PIN_NAME_LABELS:
        return PIN_NAME_LABELS[raw]
    if raw.startswith("$"):
        return raw[1:].replace("_", " ")
    return raw


def serversidemap_path(worlds_dir: Any, world_name: str) -> Path:
    return Path(worlds_dir) / f"{world_name}{SERVERSIDEMAP_SUFFIX}"


def parse_serversidemap(
    path: Any,
    *,
    include_explored: bool = False,
) -> Optional[dict]:
    """Parse a ServerSideMap ``.explored`` file.

    Returns ``{version, map_size, pins, explored_count, explored?}`` or ``None``.
    ``explored`` (raw bool bytes) is only included when ``include_explored`` is
    True — it is ~4 MiB for the default 2048 map.
    """
    try:
        raw = Path(path).read_bytes()
    except Exception:
        return None
    if len(raw) < 12:
        return None
    try:
        version, map_size = struct.unpack_from("<ii", raw, 0)
        if version < 1 or map_size < 8 or map_size > 8192:
            return None
        explored_len = map_size * map_size
        if len(raw) < 8 + explored_len + 4:
            return None
        explored = raw[8 : 8 + explored_len]
        offset = 8 + explored_len
        pin_count = struct.unpack_from("<i", raw, offset)[0]
        offset += 4
        if pin_count < 0 or pin_count > 50_000:
            return None
        pins: list[dict] = []
        for pin_index in range(pin_count):
            name, offset = _read_zpackage_string(raw, offset)
            if offset + 17 > len(raw):
                break
            x, y, z = struct.unpack_from("<fff", raw, offset)
            offset += 12
            pin_type = struct.unpack_from("<i", raw, offset)[0]
            offset += 4
            checked = raw[offset] != 0
            offset += 1
            # Keep every structurally valid pin so ``index`` matches the file.
            type_name = PIN_TYPE_NAMES.get(pin_type, "pin")
            pins.append(
                {
                    "index": pin_index,
                    "type": type_name,
                    "pin_type": pin_type,
                    "tag": name,
                    "name": pin_display_name(name),
                    "x": round(x, 2),
                    "y": round(y, 2),
                    "z": round(z, 2),
                    "checked": bool(checked),
                    "source": "serversidemap",
                    "on_map": _plausible_coord(x) and _plausible_coord(z),
                }
            )
        explored_count = sum(1 for b in explored if b)
        result: dict[str, Any] = {
            "version": version,
            "map_size": map_size,
            "pins": pins,
            "explored_count": explored_count,
            "explored_total": explored_len,
        }
        if include_explored:
            result["explored"] = explored
        return result
    except Exception:
        return None


def write_serversidemap(
    path: Any,
    *,
    version: int,
    map_size: int,
    explored: bytes,
    pins: list[dict],
) -> None:
    """Rewrite a ServerSideMap ``.explored`` file (atomic replace)."""
    expected = map_size * map_size
    if len(explored) != expected:
        raise ValueError(f"explored length {len(explored)} != {expected}")
    if version < 1 or map_size < 8 or map_size > 8192:
        raise ValueError("invalid ServerSideMap header")
    if len(pins) > 50_000:
        raise ValueError("too many pins")

    blob = bytearray()
    blob += struct.pack("<ii", int(version), int(map_size))
    blob += explored
    blob += struct.pack("<i", len(pins))
    for pin in pins:
        name = pin.get("tag")
        if name is None:
            name = pin.get("name") or ""
        blob += _write_zpackage_string(str(name))
        blob += struct.pack(
            "<fff",
            float(pin.get("x", 0.0)),
            float(pin.get("y", 0.0)),
            float(pin.get("z", 0.0)),
        )
        blob += struct.pack("<i", int(pin.get("pin_type", 0)))
        blob += struct.pack("<?", bool(pin.get("checked", False)))

    dest = Path(path)
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".tmp")
    tmp.write_bytes(bytes(blob))
    tmp.replace(dest)


def delete_serversidemap_pin(
    worlds_dir: Any,
    world_name: str,
    pin_index: int,
) -> dict:
    """Remove one pin from the world's ServerSideMap file.

    Returns ``{version, map_size, pins, explored_count, explored_total}`` after
    the rewrite. Raises ``FileNotFoundError`` when the file is missing/unreadable,
    ``IndexError`` for a bad index.
    """
    path = serversidemap_path(worlds_dir, world_name)
    parsed = parse_serversidemap(path, include_explored=True)
    if not parsed or "explored" not in parsed:
        raise FileNotFoundError(f"ServerSideMap data not found for {world_name}")
    pins = list(parsed["pins"])
    if pin_index < 0 or pin_index >= len(pins):
        raise IndexError(f"pin index {pin_index} out of range")

    bak = path.with_suffix(path.suffix + ".bak")
    try:
        bak.write_bytes(path.read_bytes())
    except Exception:
        pass

    del pins[pin_index]
    write_serversidemap(
        path,
        version=int(parsed["version"]),
        map_size=int(parsed["map_size"]),
        explored=parsed["explored"],
        pins=pins,
    )
    invalidate_png_cache(world_name)

    # Re-parse so returned pin indices match the rewritten file.
    refreshed = parse_serversidemap(path)
    if not refreshed:
        raise ValueError("failed to re-read ServerSideMap after delete")
    return refreshed


def _png_chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def _encode_png_rgba(width: int, height: int, rgba: bytes) -> bytes:
    """Encode a raw RGBA buffer as a PNG (stdlib only)."""
    if len(rgba) != width * height * 4:
        raise ValueError("rgba buffer size mismatch")
    raw_rows = bytearray()
    stride = width * 4
    for y in range(height):
        raw_rows.append(0)  # filter: None
        raw_rows.extend(rgba[y * stride : (y + 1) * stride])
    compressed = zlib.compress(bytes(raw_rows), level=6)
    return (
        b"\x89PNG\r\n\x1a\n"
        + _png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        + _png_chunk(b"IDAT", compressed)
        + _png_chunk(b"IEND", b"")
    )


def _seed_u32(seed: Optional[str], world_name: str = "") -> int:
    """Stable 32-bit seed from world seed string (or world name fallback)."""
    text = (seed or world_name or "valheim").encode("utf-8", errors="ignore")
    h = 2166136261
    for b in text:
        h ^= b
        h = (h * 16777619) & 0xFFFFFFFF
    return h or 1


def _hash2(ix: int, iy: int, seed: int) -> float:
    """Deterministic [0, 1) hash for integer lattice points."""
    n = (ix * 374761393 + iy * 668265263 + seed * 362437) & 0xFFFFFFFF
    n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((n ^ (n >> 16)) & 0xFFFFFFFF) / 4294967296.0


def _value_noise(x: float, y: float, seed: int) -> float:
    """Bilinear value noise in [0, 1)."""
    x0 = int(x) if x >= 0 else int(x) - 1
    y0 = int(y) if y >= 0 else int(y) - 1
    fx = x - x0
    fy = y - y0
    # Smoothstep
    ux = fx * fx * (3.0 - 2.0 * fx)
    uy = fy * fy * (3.0 - 2.0 * fy)
    a = _hash2(x0, y0, seed)
    b = _hash2(x0 + 1, y0, seed)
    c = _hash2(x0, y0 + 1, seed)
    d = _hash2(x0 + 1, y0 + 1, seed)
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy


def _fbm(x: float, y: float, seed: int, octaves: int = 2) -> float:
    total = 0.0
    amp = 0.5
    freq = 1.0
    norm = 0.0
    for i in range(octaves):
        total += _value_noise(x * freq, y * freq, seed + i * 1013) * amp
        norm += amp
        amp *= 0.5
        freq *= 2.0
    return total / norm if norm else 0.0


def _terrain_color(nx: float, ny: float, dist: float, seed: int) -> tuple[int, int, int, int]:
    """Approximate Valheim-like disc colours (not real biomes — seed tint only)."""
    n = _fbm(nx * 3.5, ny * 3.5, seed)
    ridge = _value_noise(nx * 7.0 + 20.0, ny * 7.0 - 7.0, seed ^ 0xA5A5)
    # Soft ocean rim.
    if dist > 0.96:
        return (28, 48, 62, 150)
    if dist > 0.90:
        t = (dist - 0.90) / 0.06
        return (
            int(40 + 20 * t),
            int(70 - 10 * t),
            int(90 + 10 * t),
            200,
        )
    # Water pockets.
    if n < 0.32 and dist > 0.35:
        depth = (0.32 - n) / 0.32
        return (30, int(70 - 25 * depth), int(95 - 20 * depth), 230)
    # Mountains / snow.
    if ridge > 0.72 and dist > 0.25:
        v = int(150 + 70 * (ridge - 0.72) / 0.28)
        return (v, v, min(255, v + 12), 235)
    # Plains / meadows / forest bands by noise.
    if n < 0.48:
        g = int(70 + 40 * n)
        return (int(50 + 20 * n), g, int(40 + 15 * n), 230)
    if n < 0.62:
        return (int(55 + 30 * n), int(90 + 25 * n), int(45 + 10 * n), 230)
    if n < 0.78:
        return (int(90 + 40 * (n - 0.62)), int(80 + 10 * n), int(40 + 8 * n), 230)
    # Ash-ish outer dark rock.
    ash = int(55 + 35 * (n - 0.78) / 0.22)
    return (ash + 20, ash, ash - 5, 230)


def _build_base_rgba(
    seed_i: int,
    out_size: int,
) -> bytearray:
    """Paint seed terrain into an RGBA buffer (transparent outside the disc)."""
    # Generate colours on a coarse grid, then nearest-neighbour upsample.
    grid = max(48, min(96, out_size // 4))
    cells: list[tuple[int, int, int, int]] = []
    gcx = (grid - 1) / 2.0
    gcy = (grid - 1) / 2.0
    gr = grid * 0.5
    for gy in range(grid):
        for gx in range(grid):
            dx = gx - gcx
            dy = gy - gcy
            dist = (dx * dx + dy * dy) ** 0.5 / gr
            if dist > 1.05:
                cells.append((0, 0, 0, 0))
                continue
            nx = dx / gr
            ny = -dy / gr
            cells.append(_terrain_color(nx, ny, min(dist, 1.0), seed_i))

    rgba = bytearray(out_size * out_size * 4)
    cx = (out_size - 1) / 2.0
    cy = (out_size - 1) / 2.0
    radius2 = (out_size * 0.5) ** 2
    scale = grid / out_size
    for py in range(out_size):
        gy = min(grid - 1, max(0, int(py * scale)))
        row = gy * grid
        for px in range(out_size):
            dx = px - cx
            dy = py - cy
            if dx * dx + dy * dy > radius2:
                continue
            gx = min(grid - 1, max(0, int(px * scale)))
            r, g, b, a = cells[row + gx]
            if a == 0:
                continue
            idx = (py * out_size + px) * 4
            rgba[idx : idx + 4] = bytes((r, g, b, a))
    return rgba


def render_base_map_png(
    seed: Optional[str] = None,
    *,
    world_name: str = "",
    out_size: int = 512,
) -> bytes:
    """Seed-tinted circular base map (works without ServerSideMap)."""
    out_size = max(64, min(int(out_size), 1024))
    seed_i = _seed_u32(seed, world_name)
    return _encode_png_rgba(out_size, out_size, bytes(_build_base_rgba(seed_i, out_size)))


def render_fog_png(
    explored: bytes,
    map_size: int,
    *,
    out_size: int = 512,
    reveal_all: bool = False,
    seed: Optional[str] = None,
    world_name: str = "",
) -> bytes:
    """Rasterize a circular map PNG with optional ServerSideMap fog.

    When ``reveal_all`` is True (or no explored buffer is useful), the seed
    base terrain is fully visible. Otherwise unexplored cells are fogged.
    """
    out_size = max(64, min(int(out_size), 1024))
    seed_i = _seed_u32(seed, world_name)
    rgba = _build_base_rgba(seed_i, out_size)

    has_fog = (
        not reveal_all
        and map_size > 0
        and explored is not None
        and len(explored) >= map_size * map_size
    )
    if not has_fog:
        return _encode_png_rgba(out_size, out_size, bytes(rgba))

    cx = (out_size - 1) / 2.0
    cy = (out_size - 1) / 2.0
    radius2 = (out_size * 0.5) ** 2
    scale = map_size / out_size
    fog = bytes((14, 18, 22, 230))

    for py in range(out_size):
        src_y = int((out_size - 1 - py) * scale)
        if src_y < 0:
            src_y = 0
        elif src_y >= map_size:
            src_y = map_size - 1
        row = src_y * map_size
        for px in range(out_size):
            dx = px - cx
            dy = py - cy
            if dx * dx + dy * dy > radius2:
                continue
            src_x = int(px * scale)
            if src_x < 0:
                src_x = 0
            elif src_x >= map_size:
                src_x = map_size - 1
            if not explored[row + src_x]:
                idx = (py * out_size + px) * 4
                rgba[idx : idx + 4] = fog
    return _encode_png_rgba(out_size, out_size, bytes(rgba))


def _fog_fingerprint(explored: Optional[bytes], map_size: int) -> tuple:
    if not explored or map_size <= 0:
        return (0, 0, 0)
    # Cheap stable fingerprint — avoid hashing the full 4 MiB every request.
    n = map_size * map_size
    step = max(1, n // 2048)
    sample = explored[::step]
    return (map_size, sum(sample), zlib.crc32(sample) & 0xFFFFFFFF)


def build_fog_png(
    world_name: str,
    worlds_dir: Any,
    *,
    out_size: int = 1024,
    reveal_all: bool = False,
    seed: Optional[str] = None,
) -> bytes:
    """Return a map PNG for ``world_name`` (always succeeds).

    Uses ServerSideMap fog when present and ``reveal_all`` is False; otherwise
    paints the full seed-tinted base disc. Results are cached in-process.
    """
    worlds = Path(worlds_dir) if worlds_dir else None
    resolved_seed = seed
    explored: Optional[bytes] = None
    map_size = 0

    if worlds is not None:
        if not resolved_seed:
            info = read_seed(worlds / f"{world_name}.fwl")
            if info:
                resolved_seed = info.get("seed")
        parsed = parse_serversidemap(
            serversidemap_path(worlds, world_name),
            include_explored=True,
        )
        if parsed and "explored" in parsed:
            explored = parsed["explored"]
            map_size = int(parsed["map_size"])

    if explored is None and not reveal_all:
        # No mod data + fog of war: treat the whole disc as unexplored.
        dummy = 64
        explored = bytes(dummy * dummy)
        map_size = dummy

    cache_key = (
        world_name,
        resolved_seed or "",
        bool(reveal_all),
        int(out_size),
        _fog_fingerprint(explored, map_size),
    )
    with _PNG_CACHE_LOCK:
        cached = _PNG_CACHE.get(cache_key)
    if cached is not None:
        return cached

    if explored is None:
        png = render_base_map_png(
            resolved_seed, world_name=world_name, out_size=out_size
        )
    else:
        png = render_fog_png(
            explored,
            map_size,
            out_size=out_size,
            reveal_all=reveal_all,
            seed=resolved_seed,
            world_name=world_name,
        )

    with _PNG_CACHE_LOCK:
        if len(_PNG_CACHE) >= _PNG_CACHE_MAX:
            # Drop an arbitrary old entry (insertion order on 3.7+).
            _PNG_CACHE.pop(next(iter(_PNG_CACHE)), None)
        _PNG_CACHE[cache_key] = png
    return png


def build_map(
    world_name: str,
    worlds_dir: Any,
    data_dir: Any = None,
    *,
    plugins_dirs: Any = None,
) -> dict:
    """Build a map payload for ``world_name``.

    Looks for ``.fwl``, ``.db`` and optional ServerSideMap ``.explored`` under
    ``worlds_dir``. The map image is always available; the mod only adds fog
    cells + shared pins.
    """
    worlds = Path(worlds_dir) if worlds_dir else None
    seed: Optional[str] = None
    resolved_name = world_name
    markers: list[dict] = []
    explored_info: dict[str, Any] = {
        "available": False,
        "map_size": 0,
        "cells": 0,
        "total": 0,
        "image_url": f"/api/map/{world_name}/fog.png",
    }
    dll_dirs: list[Any] = []
    if plugins_dirs is None:
        dll_dirs = []
    elif isinstance(plugins_dirs, (str, Path)):
        dll_dirs = [plugins_dirs]
    else:
        dll_dirs = list(plugins_dirs)
    mod_info = {
        "serversidemap": False,
        "serversidemap_dll": serversidemap_dll_installed(*dll_dirs),
    }

    if worlds is not None:
        fwl_path = worlds / f"{world_name}.fwl"
        info = read_seed(fwl_path)
        if info:
            seed = info.get("seed")
            resolved_name = info.get("name") or world_name
        db_path = worlds / f"{world_name}.db"
        markers = scan_portals(db_path)

        ssm = parse_serversidemap(serversidemap_path(worlds, world_name))
        if ssm:
            mod_info["serversidemap"] = True
            # Prefer ServerSideMap pins; keep any portal hits that aren't near a pin.
            pin_markers = [p for p in ssm["pins"] if p.get("on_map", True)]
            markers = _merge_markers(pin_markers, markers)
            explored_info = {
                "available": True,
                "map_size": ssm["map_size"],
                "cells": ssm["explored_count"],
                "total": ssm["explored_total"],
                "image_url": f"/api/map/{world_name}/fog.png",
            }

    return {
        "world": resolved_name,
        "seed": seed,
        "markers": markers,
        "bounds": dict(DEFAULT_BOUNDS),
        "explored": explored_info,
        "mod": mod_info,
    }


def _merge_markers(primary: list[dict], secondary: list[dict], radius: float = 8.0) -> list[dict]:
    """Concatenate, dropping secondary markers that sit on top of a primary pin."""
    merged = list(primary)
    for mk in secondary:
        x, z = mk.get("x"), mk.get("z")
        if x is None or z is None:
            continue
        if any(
            abs(p.get("x", 0) - x) < radius and abs(p.get("z", 0) - z) < radius
            for p in primary
        ):
            continue
        merged.append(mk)
    return merged
