"""Testes do módulo world_map (seed + portal scan + ServerSideMap)."""

from __future__ import annotations

import struct
import zlib

import pytest

import world_map as wm
from fwl_io import WorldConfig, write_fwl

pytestmark = pytest.mark.unit


def _make_marker_bytes(tag: str, x: float, z: float) -> bytes:
    return tag.encode("ascii") + struct.pack("<ff", x, z)


def _write_7bit_int(value: int) -> bytes:
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


def _write_zstring(text: str) -> bytes:
    raw = text.encode("utf-8")
    return _write_7bit_int(len(raw)) + raw


def _make_serversidemap(
    *,
    map_size: int = 8,
    explored_cells=None,
    pins=None,
    version: int = 3,
) -> bytes:
    explored = bytearray(map_size * map_size)
    for x, y in explored_cells or []:
        explored[y * map_size + x] = 1
    blob = struct.pack("<ii", version, map_size) + bytes(explored)
    pin_list = pins or []
    blob += struct.pack("<i", len(pin_list))
    for name, x, y, z, ptype, checked in pin_list:
        blob += _write_zstring(name)
        blob += struct.pack("<fff", x, y, z)
        blob += struct.pack("<i", ptype)
        blob += struct.pack("<?", checked)
    return blob


def test_extract_markers_basic():
    data = b"\x00\x01" + _make_marker_bytes("portal_word", 100.5, -200.25) + b"\xff\xff"
    markers = wm.extract_markers_from_bytes(data)
    assert len(markers) == 1
    m = markers[0]
    assert m["type"] == "portal"
    assert m["tag"] == "portal_word"
    assert m["x"] == 100.5
    assert m["z"] == -200.25


def test_extract_markers_rejects_out_of_bounds():
    # 999999 is well outside +/-10000 world bounds -> rejected.
    data = _make_marker_bytes("portal", 999999.0, 0.0)
    assert wm.extract_markers_from_bytes(data) == []


def test_extract_markers_multiple():
    data = (
        _make_marker_bytes("portal_word", 10.0, 20.0)
        + b"junkjunk"
        + _make_marker_bytes("portal_word", -30.0, 40.0)
    )
    markers = wm.extract_markers_from_bytes(data)
    assert len(markers) == 2
    xs = sorted(m["x"] for m in markers)
    assert xs == [-30.0, 10.0]


def test_extract_markers_max_results():
    blob = b"".join(_make_marker_bytes("portal_word", float(i), 0.0) for i in range(10))
    markers = wm.extract_markers_from_bytes(blob, max_results=3)
    assert len(markers) == 3


def test_extract_markers_empty():
    assert wm.extract_markers_from_bytes(b"") == []
    assert wm.extract_markers_from_bytes(b"no tags here") == []


def test_extract_markers_truncated_coords():
    # Tag present but not enough trailing bytes for two floats.
    data = b"portal_word\x00\x01"
    assert wm.extract_markers_from_bytes(data) == []


def test_scan_portals_missing_file(tmp_path):
    assert wm.scan_portals(tmp_path / "nope.db") == []


def test_scan_portals_reads_file(tmp_path):
    db_file = tmp_path / "World.db"
    db_file.write_bytes(_make_marker_bytes("portal_word", 5.0, 6.0))
    markers = wm.scan_portals(db_file)
    assert len(markers) == 1
    assert markers[0]["x"] == 5.0


def test_read_seed(tmp_path):
    fwl = tmp_path / "MyWorld.fwl"
    write_fwl(fwl, "MyWorld", WorldConfig(seed="TestSeed01"), backup=False)
    info = wm.read_seed(fwl)
    assert info is not None
    assert info["name"] == "MyWorld"
    assert info["seed"] == "TestSeed01"


def test_read_seed_missing(tmp_path):
    assert wm.read_seed(tmp_path / "gone.fwl") is None


def test_build_map_full(tmp_path):
    fwl = tmp_path / "MyWorld.fwl"
    write_fwl(fwl, "MyWorld", WorldConfig(seed="Seed123456"), backup=False)
    db_file = tmp_path / "MyWorld.db"
    db_file.write_bytes(_make_marker_bytes("portal_word", 1.0, 2.0))
    result = wm.build_map("MyWorld", tmp_path)
    assert result["world"] == "MyWorld"
    assert result["seed"] == "Seed123456"
    assert len(result["markers"]) == 1
    assert result["bounds"]["min_x"] == wm.WORLD_MIN
    assert result["explored"]["available"] is False
    assert result["explored"]["image_url"] == "/api/map/MyWorld/fog.png"
    assert result["mod"]["serversidemap"] is False


def test_build_map_missing_files(tmp_path):
    result = wm.build_map("Ghost", tmp_path)
    assert result["world"] == "Ghost"
    assert result["seed"] is None
    assert result["markers"] == []
    assert result["explored"]["image_url"] == "/api/map/Ghost/fog.png"


def test_parse_serversidemap_pins(tmp_path):
    path = tmp_path / f"W{wm.SERVERSIDEMAP_SUFFIX}"
    path.write_bytes(
        _make_serversidemap(
            map_size=8,
            explored_cells=[(1, 2), (3, 4)],
            pins=[
                ("casa", 100.0, 0.0, -50.0, 1, False),
                ("$enemy_eikthyr", -10.5, 2.0, 20.25, 9, True),
            ],
        )
    )
    parsed = wm.parse_serversidemap(path)
    assert parsed is not None
    assert parsed["map_size"] == 8
    assert parsed["explored_count"] == 2
    assert len(parsed["pins"]) == 2
    assert parsed["pins"][0]["index"] == 0
    assert parsed["pins"][0]["type"] == "icon1"
    assert parsed["pins"][0]["name"] == "casa"
    assert parsed["pins"][0]["source"] == "serversidemap"
    assert parsed["pins"][1]["index"] == 1
    assert parsed["pins"][1]["type"] == "boss"
    assert parsed["pins"][1]["name"] == "Eikthyr"
    assert parsed["pins"][1]["checked"] is True


def test_parse_serversidemap_rejects_bad(tmp_path):
    bad = tmp_path / "bad.explored"
    bad.write_bytes(b"nope")
    assert wm.parse_serversidemap(bad) is None
    assert wm.parse_serversidemap(tmp_path / "missing.explored") is None


def test_build_map_with_serversidemap(tmp_path):
    fwl = tmp_path / "MyWorld.fwl"
    write_fwl(fwl, "MyWorld", WorldConfig(seed="SeedABC"), backup=False)
    (tmp_path / "MyWorld.db").write_bytes(_make_marker_bytes("portal_word", 1.0, 2.0))
    (tmp_path / f"MyWorld{wm.SERVERSIDEMAP_SUFFIX}").write_bytes(
        _make_serversidemap(
            pins=[("cobre", 50.0, 0.0, 60.0, 3, False)],
            explored_cells=[(0, 0)],
        )
    )
    result = wm.build_map("MyWorld", tmp_path)
    assert result["mod"]["serversidemap"] is True
    assert result["explored"]["available"] is True
    assert result["explored"]["cells"] == 1
    assert result["explored"]["image_url"] == "/api/map/MyWorld/fog.png"
    types = {m["type"] for m in result["markers"]}
    assert "icon3" in types
    assert "portal" in types


def test_render_fog_png_is_valid_png():
    map_size = 16
    explored = bytearray(map_size * map_size)
    for i in range(0, len(explored), 3):
        explored[i] = 1
    png = wm.render_fog_png(bytes(explored), map_size, out_size=64)
    assert png.startswith(b"\x89PNG\r\n\x1a\n")
    # Minimal structural check: IHDR + IDAT + IEND
    assert b"IHDR" in png and b"IDAT" in png and b"IEND" in png
    # zlib stream inside IDAT should decompress.
    idat_start = png.index(b"IDAT") + 4
    # Find IDAT length from chunk header (4 bytes before tag)
    length = struct.unpack(">I", png[idat_start - 8 : idat_start - 4])[0]
    zlib.decompress(png[idat_start : idat_start + length])


def test_render_fog_png_reveal_all_differs():
    map_size = 16
    explored = bytes(map_size * map_size)  # nothing explored
    fog = wm.render_fog_png(explored, map_size, out_size=64, reveal_all=False, seed="abc")
    full = wm.render_fog_png(explored, map_size, out_size=64, reveal_all=True, seed="abc")
    assert fog != full
    assert full.startswith(b"\x89PNG")


def test_render_base_map_png_is_deterministic():
    a = wm.render_base_map_png("seed-one", out_size=64)
    b = wm.render_base_map_png("seed-one", out_size=64)
    c = wm.render_base_map_png("seed-two", out_size=64)
    assert a == b
    assert a != c
    assert a.startswith(b"\x89PNG")


def test_build_fog_png(tmp_path):
    (tmp_path / f"W{wm.SERVERSIDEMAP_SUFFIX}").write_bytes(
        _make_serversidemap(explored_cells=[(2, 2), (3, 3)])
    )
    png = wm.build_fog_png("W", tmp_path, out_size=64)
    assert png and png.startswith(b"\x89PNG")
    revealed = wm.build_fog_png("W", tmp_path, out_size=64, reveal_all=True)
    assert revealed and revealed != png


def test_build_fog_png_without_serversidemap(tmp_path):
    """Map image must work without the ServerSideMap mod."""
    fog = wm.build_fog_png("Solo", tmp_path, out_size=64, reveal_all=False)
    full = wm.build_fog_png("Solo", tmp_path, out_size=64, reveal_all=True)
    assert fog.startswith(b"\x89PNG")
    assert full.startswith(b"\x89PNG")
    assert fog != full


def test_pin_display_name():
    assert wm.pin_display_name("$enemy_gdking") == "The Elder"
    assert wm.pin_display_name("casa") == "casa"
    assert wm.pin_display_name("") == "Pin"


def test_write_and_delete_serversidemap_pin(tmp_path):
    path = tmp_path / f"W{wm.SERVERSIDEMAP_SUFFIX}"
    original = _make_serversidemap(
        map_size=8,
        explored_cells=[(1, 1), (2, 2), (3, 3)],
        pins=[
            ("a", 10.0, 0.0, 20.0, 1, False),
            ("b", 30.0, 1.0, 40.0, 9, True),
            ("c", -5.0, 0.0, 7.0, 3, False),
        ],
    )
    path.write_bytes(original)
    before = wm.parse_serversidemap(path, include_explored=True)
    assert before is not None
    fog = before["explored"]

    refreshed = wm.delete_serversidemap_pin(tmp_path, "W", 1)
    assert len(refreshed["pins"]) == 2
    assert [p["tag"] for p in refreshed["pins"]] == ["a", "c"]
    assert [p["index"] for p in refreshed["pins"]] == [0, 1]

    after = wm.parse_serversidemap(path, include_explored=True)
    assert after is not None
    assert after["explored"] == fog
    assert after["explored_count"] == 3
    assert path.with_suffix(path.suffix + ".bak").read_bytes() == original


def test_delete_serversidemap_pin_errors(tmp_path):
    with pytest.raises(FileNotFoundError):
        wm.delete_serversidemap_pin(tmp_path, "Missing", 0)
    path = tmp_path / f"W{wm.SERVERSIDEMAP_SUFFIX}"
    path.write_bytes(_make_serversidemap(pins=[("only", 1.0, 0.0, 2.0, 1, False)]))
    with pytest.raises(IndexError):
        wm.delete_serversidemap_pin(tmp_path, "W", 5)


def test_serversidemap_dll_installed(tmp_path):
    plugins = tmp_path / "plugins"
    plugins.mkdir()
    assert wm.serversidemap_dll_installed(plugins) is False
    (plugins / "ServerSideMap.dll").write_bytes(b"x")
    assert wm.serversidemap_dll_installed(plugins) is True
    assert wm.serversidemap_dll_installed(tmp_path / "missing") is False


def test_build_map_serversidemap_dll_flag(tmp_path):
    plugins = tmp_path / "plugins"
    plugins.mkdir()
    (plugins / "ServerSideMap.dll").write_bytes(b"x")
    result = wm.build_map("Ghost", tmp_path, plugins_dirs=[plugins])
    assert result["mod"]["serversidemap"] is False
    assert result["mod"]["serversidemap_dll"] is True
