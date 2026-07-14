"""Best-effort world map extraction from Valheim save files.

Two independent pieces of data:

  * ``.fwl`` — world metadata (name + seed), read via :mod:`fwl_io`.
  * ``.db``  — the actual save. We do NOT parse the full ZDO binary format
    (that would need a JVM/C# port). Instead we do a heuristic byte scan for
    known prefab name tags (e.g. ``portal_word``) and read a plausible
    little-endian float32 ``x``/``z`` pair immediately following the tag.

The heuristic is documented and intentionally simple; correctness on real
saves is best-effort. Everything degrades to empty results on error.
"""

from __future__ import annotations

import struct
from pathlib import Path
from typing import Any, Optional

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
            chunk = data[after:after + 8]
            if len(chunk) < 8:
                continue
            try:
                x, z = struct.unpack("<ff", chunk)
            except struct.error:
                continue
            if _plausible_coord(x) and _plausible_coord(z):
                seen_offsets.add(idx)
                markers.append(
                    {"type": "portal", "tag": tag, "x": round(x, 2), "z": round(z, 2)}
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


def build_map(world_name: str, worlds_dir: Any, data_dir: Any = None) -> dict:
    """Build a map payload for ``world_name``.

    Looks for ``<world_name>.fwl`` and ``<world_name>.db`` under ``worlds_dir``.
    Degrades to empty markers / null seed when files are missing.
    """
    worlds = Path(worlds_dir) if worlds_dir else None
    seed: Optional[str] = None
    resolved_name = world_name
    markers: list[dict] = []

    if worlds is not None:
        fwl_path = worlds / f"{world_name}.fwl"
        info = read_seed(fwl_path)
        if info:
            seed = info.get("seed")
            resolved_name = info.get("name") or world_name
        db_path = worlds / f"{world_name}.db"
        markers = scan_portals(db_path)

    return {
        "world": resolved_name,
        "seed": seed,
        "markers": markers,
        "bounds": dict(DEFAULT_BOUNDS),
    }
