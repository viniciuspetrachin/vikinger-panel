"""Testes do módulo fwl_io."""

from pathlib import Path

import pytest

from fwl_io import (
    WorldConfig,
    build_modifier_strings,
    infer_preset,
    parse_modifiers,
    read_fwl,
    stable_hash,
    world_config_details,
    write_fwl,
)

pytestmark = pytest.mark.unit


def test_stable_hash_deterministic():
    assert stable_hash("TestSeed") == stable_hash("TestSeed")
    assert stable_hash("A") != stable_hash("B")


def test_build_modifier_strings_normal_empty():
    assert build_modifier_strings(WorldConfig(preset="normal")) == []


def test_build_modifier_strings_casual():
    strings = build_modifier_strings(WorldConfig(preset="casual"))
    assert "teleportall" in strings
    assert any(":" in s for s in strings)


def test_parse_modifiers_from_summary_line():
    strings = build_modifier_strings(WorldConfig(preset="hard", portals="hard"))
    config = parse_modifiers(strings)
    assert config.portals == "hard"


def test_fwl_roundtrip(tmp_path: Path):
    fwl = tmp_path / "Round.fwl"
    cfg = WorldConfig(preset="normal", combat="hard", portals="casual")
    write_fwl(fwl, "Round", cfg, backup=False)
    meta = read_fwl(fwl)
    assert meta.name == "Round"
    assert meta.seed_name
    assert meta.uid
    assert meta.config.combat == "hard"
    assert meta.config.portals == "casual"


def test_fwl_backup_on_rewrite(tmp_path: Path):
    fwl = tmp_path / "Bak.fwl"
    write_fwl(fwl, "Bak", WorldConfig(preset="normal"), backup=False)
    write_fwl(fwl, "Bak", WorldConfig(preset="hard"), backup=True)
    assert (tmp_path / "Bak.fwl.bak").is_file()
    meta = read_fwl(fwl)
    assert meta.config.combat == "hard"


def test_world_config_summary():
    s = WorldConfig(preset="casual", portals="").summary()
    assert s["preset"] == "casual"
    assert s["portals"] == "casual"


@pytest.mark.parametrize("preset", ["easy", "hard", "hardcore", "casual", "hammer", "immersive", "normal"])
def test_infer_preset_roundtrip(preset: str):
    strings = build_modifier_strings(WorldConfig(preset=preset))
    config = parse_modifiers(strings)
    assert infer_preset(config, strings) == preset


def test_infer_preset_empty_is_normal():
    assert infer_preset(WorldConfig(), []) == "normal"


def test_infer_preset_custom_combat_only():
    strings = build_modifier_strings(WorldConfig(combat="hard"))
    config = parse_modifiers(strings)
    assert infer_preset(config, strings) == ""


def test_infer_preset_uses_explicit_preset():
    assert infer_preset(WorldConfig(preset="casual"), []) == "casual"


def test_world_config_details(tmp_path: Path):
    fwl = tmp_path / "Det.fwl"
    write_fwl(fwl, "Det", WorldConfig(preset="hardcore"), backup=False)
    meta = read_fwl(fwl)
    details = world_config_details(meta)
    assert details["inferred_preset"] == "hardcore"
    assert details["effective"]["combat"] == "veryhard"
    assert details["modifier_strings"]
    assert "nomap" in details["flags"] or details["flags"].get("nomap")


def test_parse_death_flags_hardcore():
    strings = build_modifier_strings(WorldConfig(preset="hardcore"))
    config = parse_modifiers(strings)
    assert config.deathpenalty == "hardcore"
    assert config.nomap is True
