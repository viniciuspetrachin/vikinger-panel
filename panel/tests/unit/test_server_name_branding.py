"""Tests for server name branding suffix."""

import pytest

from server_name_branding import (
    SERVER_NAME_SUFFIX,
    apply_env_save,
    branding_enabled,
    effective_server_name,
    prepare_env_for_api,
    resolve_server_name_for_env,
    strip_server_name_branding,
)


def test_strip_and_apply_branding():
    assert strip_server_name_branding(f"MYVALHEIM{SERVER_NAME_SUFFIX}") == "MYVALHEIM"
    assert resolve_server_name_for_env("MYVALHEIM", branding_on=True) == f"MYVALHEIM{SERVER_NAME_SUFFIX}"
    assert resolve_server_name_for_env(f"MYVALHEIM{SERVER_NAME_SUFFIX}", branding_on=True) == f"MYVALHEIM{SERVER_NAME_SUFFIX}"


def test_branding_enabled_default():
    assert branding_enabled({}) is True
    assert branding_enabled({"SERVER_NAME_BRANDING": "off"}) is False


def test_apply_env_save_invisible_branding():
    result = apply_env_save({"SERVER_NAME": "MeuServidor"})
    assert result["SERVER_NAME"] == f"MeuServidor{SERVER_NAME_SUFFIX}"
    assert "SERVER_NAME_BRANDING" not in result


def test_apply_env_save_opt_out():
    result = apply_env_save({"SERVER_NAME": "MeuServidor", "SERVER_NAME_BRANDING": "off"})
    assert result["SERVER_NAME"] == "MeuServidor"
    assert result["SERVER_NAME_BRANDING"] == "off"


def test_apply_env_save_advanced_with_suffix():
    full = f"Custom{SERVER_NAME_SUFFIX}"
    result = apply_env_save({"SERVER_NAME": full})
    assert result["SERVER_NAME"] == full
    assert "SERVER_NAME_BRANDING" not in result


def test_prepare_env_for_api_strips_suffix_for_display():
    env = {"SERVER_NAME": f"MYVALHEIM{SERVER_NAME_SUFFIX}", "WORLD_NAME": "W1"}
    payload = prepare_env_for_api(env)
    assert payload["values"]["SERVER_NAME"] == "MYVALHEIM"
    assert payload["server_name_meta"]["branding_enabled"] is True
    assert payload["server_name_meta"]["effective_name"] == f"MYVALHEIM{SERVER_NAME_SUFFIX}"


def test_prepare_env_for_api_when_branding_off():
    env = {"SERVER_NAME": "Plain", "SERVER_NAME_BRANDING": "off"}
    payload = prepare_env_for_api(env)
    assert payload["values"]["SERVER_NAME"] == "Plain"
    assert payload["server_name_meta"]["branding_enabled"] is False


def test_strip_legacy_branding_suffix():
    assert strip_server_name_branding("MYVALHEIM - Powered by Vikinger Panel") == "MYVALHEIM"


def test_apply_env_save_colored_name():
    result = apply_env_save({"SERVER_NAME": "<color=red>Hot</color><color=blue>Server</color>"})
    assert result["SERVER_NAME"].startswith("<color=red>Hot</color>")
    assert result["SERVER_NAME"].endswith(" - Powered by VKP")


def test_apply_env_save_hex_two_colors_fails():
    with pytest.raises(ValueError, match="Hex color"):
        apply_env_save({"SERVER_NAME": "<color=#FFD700>A</color><color=#FFFFFF>B</color>"})


def test_effective_server_name():
    env = {"SERVER_NAME": "Base"}
    assert effective_server_name(env) == f"Base{SERVER_NAME_SUFFIX}"
    env_off = {"SERVER_NAME": "Plain", "SERVER_NAME_BRANDING": "off"}
    assert effective_server_name(env_off) == "Plain"
