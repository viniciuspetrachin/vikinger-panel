"""Testes do módulo world_map (seed + byte-scan heurístico)."""

import struct

import pytest

import world_map as wm
from fwl_io import WorldConfig, write_fwl

pytestmark = pytest.mark.unit


def _make_marker_bytes(tag: str, x: float, z: float) -> bytes:
    return tag.encode("ascii") + struct.pack("<ff", x, z)


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


def test_build_map_missing_files(tmp_path):
    result = wm.build_map("Ghost", tmp_path)
    assert result["world"] == "Ghost"
    assert result["seed"] is None
    assert result["markers"] == []
