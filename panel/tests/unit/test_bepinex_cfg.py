"""Tests for BepInEx .cfg parsing and mod↔config matching."""

from pathlib import Path

from bepinex_cfg import (
    apply_setting_values,
    build_cfg_index,
    find_orphaned_configs,
    match_dll_to_cfg,
    normalize_id,
    parse_bepinex_cfg,
)

SAMPLE_CFG = """## Settings file was created by plugin CartographySkill v3.1.1
## Plugin GUID: advize.CartographySkill

[General]

## Enable or disable the mod
# Setting type: Boolean
# Default value: true
Enabled = true

## Amount to increase base explore radius by per skill level.
# Setting type: Single
# Default value: 1
RadiusIncreasePerLevel = 1.25
"""


def test_normalize_id():
    assert normalize_id("Advize_CartographySkill") == "advizecartographyskill"
    assert normalize_id("advize.CartographySkill") == "advizecartographyskill"


def test_parse_bepinex_cfg_structured():
    doc = parse_bepinex_cfg(SAMPLE_CFG)
    assert doc.structured is True
    assert doc.plugin_guid == "advize.CartographySkill"
    assert len(doc.sections) == 1
    sec = doc.sections[0]
    assert sec.name == "General"
    assert len(sec.settings) == 2
    enabled = sec.settings[0]
    assert enabled.key == "Enabled"
    assert enabled.value == "true"
    assert enabled.label == "Enable or disable the mod"
    assert enabled.setting_type == "Boolean"
    assert enabled.default_value == "true"


def test_apply_setting_values():
    updated = apply_setting_values(
        SAMPLE_CFG,
        [{"section": "General", "key": "Enabled", "value": "false"}],
    )
    assert "Enabled = false" in updated
    assert "Enabled = true" not in updated


def test_match_dll_to_cfg_by_guid(env_dir):
    bepinex: Path = env_dir["bepinex"]
    (bepinex / "advize.CartographySkill.cfg").write_text(SAMPLE_CFG)
    index = build_cfg_index(bepinex)
    assert match_dll_to_cfg("Advize_CartographySkill", index) == "advize.CartographySkill.cfg"


def test_match_dll_to_cfg_serverside(env_dir):
    bepinex: Path = env_dir["bepinex"]
    (bepinex / "MVP.Valheim_Serverside_Simulations.cfg").write_text(
        "## Plugin GUID: MVP.Valheim_Serverside_Simulations\n[General]\nEnabled = true\n"
    )
    index = build_cfg_index(bepinex)
    assert match_dll_to_cfg("Serverside_Simulations", index) == "MVP.Valheim_Serverside_Simulations.cfg"


def test_find_orphaned_configs(env_dir):
    bepinex: Path = env_dir["bepinex"]
    plugins: Path = env_dir["plugins"]
    (bepinex / "orphan.mod.cfg").write_text("[General]\nEnabled = true\n")
    (plugins / "active.dll").write_bytes(b"dll")
    orphaned = find_orphaned_configs(bepinex, plugins, plugins / "disabled")
    names = {c["name"] for c in orphaned}
    assert "orphan.mod.cfg" in names


def test_list_mods_links_config(client, env_dir):
    bepinex: Path = env_dir["bepinex"]
    plugins: Path = env_dir["plugins"]
    (bepinex / "advize.CartographySkill.cfg").write_text(SAMPLE_CFG)
    (plugins / "Advize_CartographySkill.dll").write_bytes(b"dll")
    r = client.get("/api/mods")
    mods = {m["name"]: m for m in r.json()["mods"]}
    assert mods["Advize_CartographySkill.dll"]["config"] == "advize.CartographySkill.cfg"


def test_orphaned_configs_api(client, env_dir):
    bepinex: Path = env_dir["bepinex"]
    (bepinex / "leftover.cfg").write_text("[General]\nEnabled = true\n")
    r = client.get("/api/bepinex/orphaned-configs")
    assert r.status_code == 200
    assert r.json()["count"] >= 1


def test_delete_orphaned_configs(client, env_dir):
    bepinex: Path = env_dir["bepinex"]
    path = bepinex / "to-delete.cfg"
    path.write_text("[General]\nEnabled = true\n")
    r = client.request("DELETE", "/api/bepinex/orphaned-configs", json={})
    assert r.status_code == 200
    assert "to-delete.cfg" in r.json()["deleted"]
    assert not path.exists()
