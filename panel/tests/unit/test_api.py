"""Testes unitários cobrindo todas as rotas da API do painel."""

import io
import shutil
import time
import zipfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from fwl_io import WorldConfig, read_fwl, write_fwl

import main
from tests.unit.conftest import FakeCompleted, make_test_fwl

pytestmark = pytest.mark.unit


# ── Status & Server Control ──────────────────────────────────────────────────

def test_status(client):
    r = client.get("/api/status")
    assert r.status_code == 200
    body = r.json()
    assert body["container"] == "running"
    assert body["server"] == "running"
    assert body["config"]["world_name"] == "TestWorld"
    assert body["players_count"] == 1


def test_players(client):
    r = client.get("/api/players")
    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 1
    assert body["players"][0]["name"] == "TestPlayer"
    assert body["players"][0]["steam_id"] == "76561198273697711"
    assert body["online"] is True


def test_parse_players_negative_zdoid():
    logs = (
        "Got connection SteamID 76561198273697711\n"
        "Got character ZDOID from Exforgant : -337208827:1\n"
        "Got connection SteamID 76561198080651267\n"
        "Got character ZDOID from Marcelo : -661513034:1\n"
        "Connections 2 ZDOS:72459  sent:527 recv:40\n"
    )
    result = main.parse_players_from_logs(logs)
    assert result["count"] == 2
    assert result["online"] is True
    names = {p["name"] for p in result["players"]}
    assert names == {"Exforgant", "Marcelo"}
    steam_ids = {p["steam_id"] for p in result["players"]}
    assert steam_ids == {"76561198273697711", "76561198080651267"}


def test_parse_players_pending_connection_without_character():
    logs = (
        "Got connection SteamID 76561198273697711\n"
        "Connections 1 ZDOS:72459  sent:0 recv:0\n"
    )
    result = main.parse_players_from_logs(logs)
    assert result["count"] == 1
    assert result["players"][0]["steam_id"] == "76561198273697711"
    assert result["players"][0]["name"] == "76561198273697711"


def test_parse_players_closing_removes_player():
    logs = (
        "Got connection SteamID 76561198273697711\n"
        "Got character ZDOID from Exforgant : -337208827:1\n"
        "Closing socket 76561198273697711\n"
        "Connections 0 ZDOS:72459  sent:0 recv:0\n"
    )
    result = main.parse_players_from_logs(logs)
    assert result["count"] == 0
    assert result["players"] == []
    assert result["online"] is False


@pytest.mark.parametrize("action", ["start", "stop", "restart", "pause", "resume"])
def test_server_actions_valid(client, action):
    r = client.post(f"/api/server/{action}")
    assert r.status_code == 200
    assert r.json()["action"] == action


def test_server_action_invalid(client):
    r = client.post("/api/server/explode")
    assert r.status_code == 400


def test_server_backup_route(client):
    r = client.post("/api/server/backup")
    assert r.status_code == 200
    assert r.json()["ok"] is True


# ── Logs ─────────────────────────────────────────────────────────────────────

def test_logs_docker(client):
    r = client.get("/api/logs?source=docker")
    assert r.status_code == 200
    assert "TestPlayer" in r.json()["logs"]


def test_logs_bepinex(client):
    r = client.get("/api/logs?source=bepinex")
    assert r.status_code == 200
    assert "bepinex" in r.json()["logs"]


def test_logs_docker_sanitized(client, env_dir, monkeypatch):
    raw = (
        "Jul  7 00:45:17 supervisord: valheim-updater ^[[0m\n"
        "Jul  7 00:45:17 supervisord: valheim-updater  .d..t...... ./\n"
        "Jul  7 00:45:19 supervisord: valheim-updater  Loading Steam API...^[[0m\n"
        "Jul  7 00:45:19 supervisord: valheim-server  Got character ZDOID from TestPlayer : 1125091549:3\n"
    )

    def fake_docker(*args, **kwargs):
        if len(args) >= 2 and args[0] == "logs":
            return FakeCompleted(0, raw, "")
        return FakeCompleted(0, "ok", "")

    monkeypatch.setattr(main, "docker", fake_docker)

    def real_get_logs(lines=100):
        r = fake_docker("logs", main.CONTAINER_NAME, "--tail", str(lines))
        return main.clean_docker_logs(r.stdout + r.stderr)

    monkeypatch.setattr(main, "get_logs", real_get_logs)

    r = client.get("/api/logs?source=docker")
    assert r.status_code == 200
    body = r.json()["logs"]
    assert "supervisord:" not in body
    assert "\x1b" not in body
    assert "^[[0m" not in body
    assert ".d..t" not in body
    assert "Loading Steam API..." in body
    assert "World loaded" in body or "TestPlayer" in body
    assert "[valheim-server]" not in body


# ── Config / Env ─────────────────────────────────────────────────────────────

def test_get_env(client):
    r = client.get("/api/config/env")
    assert r.status_code == 200
    assert r.json()["values"]["WORLD_NAME"] == "TestWorld"


def test_put_env(client):
    r = client.put("/api/config/env", json={"values": {"SERVER_NAME": "Novo"}})
    assert r.status_code == 200
    assert r.json()["values"]["SERVER_NAME"] == "Novo"


def test_get_serverlists(client):
    r = client.get("/api/config/serverlists")
    assert r.status_code == 200
    assert "123" in r.json()["admin"]


def test_put_serverlist_valid(client):
    r = client.put("/api/config/serverlists/admin", json={"ids": ["999", "888"]})
    assert r.status_code == 200
    assert r.json()["ids"] == ["999", "888"]


def test_put_serverlist_invalid_kind(client):
    r = client.put("/api/config/serverlists/hackers", json={"ids": ["1"]})
    assert r.status_code == 400


# ── Console RCON ─────────────────────────────────────────────────────────────

def test_console_status_unavailable(client):
    r = client.get("/api/console/status")
    assert r.status_code == 200
    data = r.json()
    assert data["available"] is False
    assert data["plugin_installed"] is True
    assert data["mod_enabled"] is True
    assert data["configured"] is False


def test_console_status_available(rcon_ready, client):
    r = client.get("/api/console/status")
    assert r.status_code == 200
    data = r.json()
    assert data["available"] is True
    assert data["plugin_installed"] is True
    assert data["configured"] is True
    assert data["port"] == 2458


def test_console_command_empty(rcon_ready, client):
    r = client.post("/api/console/command", json={"command": "   "})
    assert r.status_code == 400


def test_console_command_ok(rcon_ready, client):
    r = client.post("/api/console/command", json={"command": "save"})
    assert r.status_code == 200
    assert r.json()["output"] == "mock: save"


def test_rcon_timeout_for_slow_commands(monkeypatch):
    monkeypatch.delenv("PANEL_RCON_TIMEOUT", raising=False)
    monkeypatch.delenv("PANEL_RCON_TIMEOUT_SLOW", raising=False)
    assert main._rcon_timeout_for("list") == 90.0
    assert main._rcon_timeout_for("save") == 15.0
    monkeypatch.setenv("PANEL_RCON_TIMEOUT_SLOW", "120")
    assert main._rcon_timeout_for("list") == 120.0


def test_player_action_invalid_steam_id(rcon_ready, client):
    r = client.post("/api/players/bad/action", json={"action": "kick"})
    assert r.status_code == 400


def test_player_action_invalid_action(rcon_ready, client):
    r = client.post("/api/players/76561198000000000/action", json={"action": "fly"})
    assert r.status_code == 400


def test_player_action_kick(rcon_ready, client):
    sid = "76561198000000000"
    r = client.post(f"/api/players/{sid}/action", json={"action": "kick"})
    assert r.status_code == 200
    assert r.json()["output"] == f"mock: kick {sid}"
    assert r.json()["synced"] is None


def test_player_action_ban_syncs_list(rcon_ready, client, env_dir):
    sid = "76561198000000000"
    r = client.post(f"/api/players/{sid}/action", json={"action": "ban"})
    assert r.status_code == 200
    assert sid in r.json()["synced"]["ids"]
    lists = client.get("/api/config/serverlists").json()
    assert sid in lists["banned"]


def test_player_action_promote_syncs_admin(rcon_ready, client):
    sid = "76561198273697711"
    r = client.post(f"/api/players/{sid}/action", json={"action": "promote"})
    assert r.status_code == 200
    assert sid in r.json()["synced"]["ids"]
    lists = client.get("/api/config/serverlists").json()
    assert sid in lists["admin"]


def test_player_action_rcon_unavailable(client, monkeypatch):
    monkeypatch.setattr(main, "container_running", lambda: False)
    r = client.post("/api/players/76561198000000000/action", json={"action": "kick"})
    assert r.status_code == 503


# ── Mods ─────────────────────────────────────────────────────────────────────

def test_list_mods_includes_bundled(client):
    r = client.get("/api/mods")
    assert r.status_code == 200
    names = [m["name"] for m in r.json()["mods"]]
    assert "ValheimRcon.dll" in names
    bundled = next(m for m in r.json()["mods"] if m["name"] == "ValheimRcon.dll")
    assert bundled["protected"] is True
    assert bundled["bundled"] is True


def test_delete_bundled_mod_forbidden(client):
    r = client.delete("/api/mods/ValheimRcon.dll")
    assert r.status_code == 403


def test_toggle_bundled_mod_allowed(client):
    r = client.post("/api/mods/ValheimRcon.dll/toggle", json={"enabled": False})
    assert r.status_code == 200
    assert r.json()["enabled"] is False
    mods = client.get("/api/mods").json()["mods"]
    bundled = next(m for m in mods if m["name"] == "ValheimRcon.dll")
    assert bundled["enabled"] is False


def test_apply_server_mode_vanilla_disables_all_mods(client, env_dir):
    (env_dir["plugins"] / "user.dll").write_text("x")
    (env_dir["plugins"] / "ValheimRcon.dll").write_text("x")
    result = main.apply_server_mode(False)
    assert result["bepinex"] is False
    assert result["mods_disabled"] >= 2
    assert not (env_dir["plugins"] / "user.dll").exists()
    assert (env_dir["plugins"] / "disabled" / "user.dll").exists()


def test_apply_server_mode_bepinex_enables_bundled_only(client, env_dir):
    disabled = env_dir["plugins"] / "disabled"
    disabled.mkdir(parents=True, exist_ok=True)
    for dll in list(env_dir["plugins"].glob("*.dll")):
        shutil.move(str(dll), str(disabled / dll.name))
    (disabled / "user.dll").write_text("x")
    result = main.apply_server_mode(True)
    assert result["bepinex"] is True
    assert "ValheimRcon.dll" in result["mods_enabled"]
    assert (env_dir["plugins"] / "ValheimRcon.dll").exists()
    assert not (env_dir["plugins"] / "user.dll").exists()
    assert (disabled / "user.dll").exists()


def test_ensure_rcon_config_generates_password(env_dir):
    from rcon_client import ensure_rcon_config, read_rcon_cfg_file, RCON_CFG_NAME

    result = ensure_rcon_config(cfg_dir=env_dir["bepinex"], server_port=2456)
    assert result["created"] is True
    assert result["password"]
    cfg = read_rcon_cfg_file(env_dir["bepinex"] / RCON_CFG_NAME)
    assert cfg["Password"] == result["password"]

    again = ensure_rcon_config(cfg_dir=env_dir["bepinex"], server_port=2456)
    assert again["created"] is False
    assert again["password"] is None


def test_ensure_rcon_config_patches_valheimrcon_format(env_dir):
    from rcon_client import ensure_rcon_config, read_rcon_cfg_file, RCON_CFG_NAME

    cfg_path = env_dir["bepinex"] / RCON_CFG_NAME
    cfg_path.write_text(
        "## Settings file was created by plugin Valheim Rcon v1.5.1\n"
        "[1. Rcon]\n"
        "Port = 2458\n"
        "Password = \n"
        "Whitelist IP mask = \n",
        encoding="utf-8",
    )
    result = ensure_rcon_config(cfg_dir=env_dir["bepinex"], server_port=2456)
    assert result["created"] is True
    text = cfg_path.read_text(encoding="utf-8")
    assert "[1. Rcon]" in text
    assert "Whitelist IP mask" in text
    cfg = read_rcon_cfg_file(cfg_path)
    assert cfg["Password"] == result["password"]


def test_maybe_ensure_rcon_on_startup(client, env_dir):
    cfg_path = env_dir["bepinex"] / "org.tristan.rcon.cfg"
    cfg_path.write_text("[1. Rcon]\nPort = 2458\nPassword = \n", encoding="utf-8")
    result = main.maybe_ensure_rcon_password()
    assert result["created"] is True
    assert "Password =" in cfg_path.read_text(encoding="utf-8")
    assert cfg_path.read_text(encoding="utf-8").split("Password =")[1].strip()


def test_upload_mod_dll_enabled(client, env_dir):
    r = client.post("/api/mods/upload", files={"file": ("cool.dll", b"MZbinary", "application/octet-stream")})
    assert r.status_code == 200
    assert "cool.dll" in r.json()["installed"]
    mods = client.get("/api/mods").json()["mods"]
    assert mods[0]["enabled"] is True


def test_upload_mod_zip(client):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("plugin/inside.dll", b"data")
    r = client.post("/api/mods/upload", files={"file": ("pack.zip", buf.getvalue(), "application/zip")})
    assert r.status_code == 200
    assert "inside.dll" in r.json()["installed"]


def test_upload_mod_zip_skips_macos_junk(client):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("plugin/._inside.dll", b"junk")
        zf.writestr("plugin/inside.dll", b"data")
    r = client.post("/api/mods/upload", files={"file": ("pack.zip", buf.getvalue(), "application/zip")})
    assert r.status_code == 200
    assert r.json()["installed"] == ["inside.dll"]


def test_upload_mod_invalid_ext(client):
    r = client.post("/api/mods/upload", files={"file": ("readme.txt", b"hi", "text/plain")})
    assert r.status_code == 400


def test_delete_mod_missing(client):
    r = client.delete("/api/mods/nope.dll")
    assert r.status_code == 404


def test_delete_mod_valid(client, env_dir):
    (env_dir["plugins"] / "target.dll").write_text("x")
    runtime = env_dir["data"] / "bepinex" / "BepInEx" / "plugins"
    (runtime / "target.dll").write_text("old")
    r = client.delete("/api/mods/target.dll")
    assert r.status_code == 200
    assert not (env_dir["plugins"] / "target.dll").exists()
    assert not (runtime / "target.dll").exists()


def test_sync_plugins_to_runtime_mirrors_and_deletes_orphans(env_dir):
    plugins = env_dir["plugins"]
    runtime = env_dir["data"] / "bepinex" / "BepInEx" / "plugins"
    (plugins / "keep.dll").write_text("keep")
    (plugins / "disabled").mkdir(exist_ok=True)
    (plugins / "disabled" / "off.dll").write_text("off")
    (runtime / "stale.dll").write_text("stale")

    main.sync_plugins_to_runtime()

    assert (runtime / "keep.dll").read_text() == "keep"
    assert (runtime / "disabled" / "off.dll").read_text() == "off"
    assert not (runtime / "stale.dll").exists()


def test_toggle_mod_disable(client, env_dir):
    (env_dir["plugins"] / "toggle.dll").write_text("x")
    disabled = env_dir["plugins"] / "disabled"
    r = client.post("/api/mods/toggle.dll/toggle", json={"enabled": False})
    assert r.status_code == 200
    assert not (env_dir["plugins"] / "toggle.dll").exists()
    assert (disabled / "toggle.dll").exists()
    mods = client.get("/api/mods").json()["mods"]
    toggle = next(m for m in mods if m["name"] == "toggle.dll")
    assert toggle["enabled"] is False


def test_toggle_mod_enable(client, env_dir):
    disabled = env_dir["plugins"] / "disabled"
    disabled.mkdir(parents=True, exist_ok=True)
    (disabled / "back.dll").write_text("x")
    r = client.post("/api/mods/back.dll/toggle", json={"enabled": True})
    assert r.status_code == 200
    assert (env_dir["plugins"] / "back.dll").exists()
    assert not (disabled / "back.dll").exists()


def test_toggle_mod_missing(client):
    r = client.post("/api/mods/nope.dll/toggle", json={"enabled": False})
    assert r.status_code == 404


def test_install_mod_url_invalid(client):
    r = client.post("/api/mods/install-url", json={"url": "not-a-real-url"})
    assert r.status_code == 400


def _mod_zip_bytes() -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("plugin/serverside.dll", b"data")
    return buf.getvalue()


def test_resolve_mod_download_url_ror2mm():
    url = "ror2mm://v1/install/thunderstore.io/mvp/Serverside_Simulations/1.1.9/"
    assert main.resolve_mod_download_url(url) == (
        "https://thunderstore.io/package/download/mvp/Serverside_Simulations/1.1.9/"
    )


def test_resolve_mod_download_url_thunderstore_page(monkeypatch):
    monkeypatch.setattr(
        main,
        "fetch_thunderstore_latest_download",
        lambda owner, name: f"https://example.test/{owner}/{name}.zip",
    )
    url = "https://thunderstore.io/c/valheim/p/mvp/Serverside_Simulations/"
    assert main.resolve_mod_download_url(url) == "https://example.test/mvp/Serverside_Simulations.zip"


def test_scrape_thunderstore_download_from_page(monkeypatch):
    html = '<a href="package/download/mvp/Serverside_Simulations/1.1.9/">Download</a>'
    monkeypatch.setattr(main, "fetch_url_bytes", lambda url: html.encode())
    assert main.scrape_thunderstore_download_from_page("mvp", "Serverside_Simulations") == (
        "https://thunderstore.io/package/download/mvp/Serverside_Simulations/1.1.9/"
    )


def test_ensure_plugins_writable_runs_fix_script(env_dir, monkeypatch):
    env_dir["plugins"].chmod(0o555)
    fix_script = env_dir["root"] / "scripts" / "fix-plugins-permissions.sh"
    fix_script.parent.mkdir(parents=True, exist_ok=True)
    fix_script.write_text("#!/bin/bash\n")
    fix_script.chmod(0o755)
    monkeypatch.setattr(main, "FIX_PLUGINS_SCRIPT", fix_script)

    def fake_run(cmd, **kwargs):
        env_dir["plugins"].chmod(0o755)
        return main.subprocess.CompletedProcess(cmd, 0)

    monkeypatch.setattr(main.subprocess, "run", fake_run)
    main.ensure_plugins_writable()
    assert env_dir["plugins"].stat().st_mode & 0o200


def test_install_mod_url_thunderstore_page(client, monkeypatch):
    zip_data = _mod_zip_bytes()
    monkeypatch.setattr(
        main,
        "resolve_mod_download_url",
        lambda url: "https://example.test/mod.zip",
    )
    monkeypatch.setattr(main, "download_mod_bytes", lambda url: zip_data)
    monkeypatch.setattr(
        main,
        "fetch_thunderstore_package_info",
        lambda owner, name: {
            "owner": owner,
            "name": name,
            "latest_version": "1.1.9",
            "download_url": "https://example.test/mod.zip",
        },
    )

    r = client.post(
        "/api/mods/install-url",
        json={"url": "https://thunderstore.io/c/valheim/p/mvp/Serverside_Simulations/"},
    )
    assert r.status_code == 200
    assert "serverside.dll" in r.json()["installed"]


def test_install_mod_url_ror2mm(client, monkeypatch):
    zip_data = _mod_zip_bytes()
    monkeypatch.setattr(
        main,
        "resolve_mod_download_url",
        lambda url: "https://example.test/mod.zip",
    )
    monkeypatch.setattr(main, "download_mod_bytes", lambda url: zip_data)

    r = client.post(
        "/api/mods/install-url",
        json={"url": "ror2mm://v1/install/thunderstore.io/mvp/Serverside_Simulations/1.1.9/"},
    )
    assert r.status_code == 200
    assert "serverside.dll" in r.json()["installed"]


def test_install_mod_url_registers_thunderstore(client, monkeypatch, env_dir):
    zip_data = _mod_zip_bytes()
    monkeypatch.setattr(
        main,
        "resolve_mod_download_url",
        lambda url: "https://thunderstore.io/package/download/mvp/Serverside_Simulations/1.1.9/",
    )
    monkeypatch.setattr(main, "download_mod_bytes", lambda url: zip_data)

    r = client.post(
        "/api/mods/install-url",
        json={"url": "https://thunderstore.io/c/valheim/p/mvp/Serverside_Simulations/"},
    )
    assert r.status_code == 200
    registry = main.read_mods_registry()
    assert any(p["id"] == "mvp/Serverside_Simulations" for p in registry["packages"])
    mods = client.get("/api/mods").json()["mods"]
    assert mods[0]["update_status"] in ("up_to_date", "unknown", "update_available")


def test_link_mod_thunderstore(client, env_dir, monkeypatch):
    (env_dir["plugins"] / "orphan.dll").write_text("x")
    monkeypatch.setattr(
        main,
        "fetch_thunderstore_package_info",
        lambda owner, name: {
            "owner": owner,
            "name": name,
            "latest_version": "1.1.9",
            "download_url": "https://example.test/mod.zip",
        },
    )
    r = client.post(
        "/api/mods/orphan.dll/link",
        json={"url": "https://thunderstore.io/c/valheim/p/mvp/Serverside_Simulations/"},
    )
    assert r.status_code == 200
    pkg = main.find_package_for_dll("orphan.dll")
    assert pkg is not None
    assert pkg["owner"] == "mvp"


def test_check_mod_update(client, env_dir, monkeypatch):
    (env_dir["plugins"] / "serverside.dll").write_text("x")
    main.register_mod_package("mvp", "Serverside_Simulations", "1.0.0", ["serverside.dll"], "http://test")
    monkeypatch.setattr(
        main,
        "fetch_thunderstore_package_info",
        lambda owner, name: {
            "owner": owner,
            "name": name,
            "latest_version": "2.0.0",
            "download_url": "https://example.test/mod.zip",
        },
    )
    r = client.post("/api/mods/serverside.dll/check-update")
    assert r.status_code == 200
    body = r.json()
    assert body["update_available"] is True
    assert body["latest_version"] == "2.0.0"


def test_fetch_thunderstore_package_info_experimental(monkeypatch):
    monkeypatch.setattr(
        main,
        "fetch_thunderstore_experimental_json",
        lambda owner, name: {
            "latest": {
                "version_number": "5.4.1602",
                "download_url": "https://thunderstore.io/package/download/Tekla/AutoRepair/5.4.1602/",
            },
        },
    )
    info = main.fetch_thunderstore_package_info("Tekla", "AutoRepair")
    assert info["latest_version"] == "5.4.1602"
    assert "AutoRepair" in info["download_url"]


def test_normalize_thunderstore_url_strips_query():
    url = "https://thunderstore.io/c/valheim/p/Tekla/AutoRepair?tab=versions"
    assert main.normalize_thunderstore_url(url) == (
        "https://thunderstore.io/c/valheim/p/Tekla/AutoRepair"
    )


def test_parse_gcdn_thunderstore_url(monkeypatch):
    monkeypatch.setattr(main, "thunderstore_package_exists", lambda owner, name: owner == "Tekla" and name == "AutoRepair")
    url = "https://gcdn.thunderstore.io/live/repository/packages/Tekla-AutoRepair-5.4.1602.zip"
    assert main.parse_gcdn_thunderstore_url(url) == ("Tekla", "AutoRepair", "5.4.1602")


def test_parse_gcdn_thunderstore_url_hyphenated_name(monkeypatch):
    def exists(owner, name):
        return owner == "BetterUI_ForeverMaintained" and name == "BetterUI_ForeverMaintained"

    monkeypatch.setattr(main, "thunderstore_package_exists", exists)
    url = "https://gcdn.thunderstore.io/live/repository/packages/BetterUI_ForeverMaintained-BetterUI_ForeverMaintained-2.5.9.zip"
    assert main.parse_gcdn_thunderstore_url(url) == (
        "BetterUI_ForeverMaintained",
        "BetterUI_ForeverMaintained",
        "2.5.9",
    )


def test_install_mod_url_gcdn_registers_thunderstore(client, monkeypatch, env_dir):
    zip_data = _mod_zip_bytes()
    gcdn_url = "https://gcdn.thunderstore.io/live/repository/packages/Tekla-AutoRepair-5.4.1602.zip"
    monkeypatch.setattr(main, "resolve_mod_download_url", lambda url: gcdn_url)
    monkeypatch.setattr(main, "download_mod_bytes", lambda url: zip_data)
    monkeypatch.setattr(
        main,
        "parse_gcdn_thunderstore_url",
        lambda url: ("Tekla", "AutoRepair", "5.4.1602"),
    )

    r = client.post("/api/mods/install-url", json={"url": gcdn_url})
    assert r.status_code == 200
    registry = main.read_mods_registry()
    assert any(p["id"] == "Tekla/AutoRepair" for p in registry["packages"])


def test_link_mod_thunderstore_page_url(client, env_dir, monkeypatch):
    (env_dir["plugins"] / "repair.dll").write_text("x")
    monkeypatch.setattr(
        main,
        "fetch_thunderstore_package_info",
        lambda owner, name: {
            "owner": owner,
            "name": name,
            "latest_version": "5.4.1602",
            "download_url": "https://example.test/mod.zip",
        },
    )
    r = client.post(
        "/api/mods/repair.dll/link",
        json={"url": "https://thunderstore.io/c/valheim/p/Tekla/AutoRepair"},
    )
    assert r.status_code == 200
    pkg = main.find_package_for_dll("repair.dll")
    assert pkg is not None
    assert pkg["owner"] == "Tekla"
    assert pkg["name"] == "AutoRepair"


def test_export_r2z(client, env_dir, monkeypatch):
    (env_dir["plugins"] / "serverside.dll").write_text("x")
    (env_dir["bepinex"] / "serverside.cfg").write_text("[General]\nkey=value\n")
    main.register_mod_package("mvp", "Serverside_Simulations", "1.1.9", ["serverside.dll"], "http://test")
    monkeypatch.setattr(main, "get_export_profile_name", lambda: "TestServer")

    r = client.get("/api/mods/export-r2z")
    assert r.status_code == 200
    assert "application/zip" in r.headers.get("content-type", "")
    with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
        assert "export.r2x" in zf.namelist()
        r2x = zf.read("export.r2x").decode()
        assert "profileName: TestServer" in r2x
        assert "mvp-Serverside_Simulations" in r2x
        assert "major: 1" in r2x
        assert "minor: 1" in r2x
        assert "patch: 9" in r2x
        config_files = [n for n in zf.namelist() if n.startswith("config/")]
        assert any("serverside.cfg" in n for n in config_files)


def test_export_r2x_matches_r2modman_reference_format():
    reference = Path("/home/vinicius/Valheim_1783466541661.r2z")
    if not reference.exists():
        return
    with zipfile.ZipFile(reference) as zf:
        ref_r2x = zf.read("export.r2x").decode()
    assert "version:" in ref_r2x
    assert "major:" in ref_r2x
    sample_mods = [
        {"name": "denikson-BepInExPack_Valheim", "version": "5.4.2333", "enabled": True},
        {"name": "Tekla-AutoRepair", "version": "5.4.1602", "enabled": True},
    ]
    generated = main.render_export_r2x("Valheim", sample_mods)
    for mod in sample_mods:
        major, minor, patch = main.parse_version_triplet(mod["version"])
        assert f"- name: {mod['name']}" in generated
        assert f"major: {major}" in generated
        assert f"minor: {minor}" in generated
        assert f"patch: {patch}" in generated


def test_export_code(client, env_dir, monkeypatch):
    (env_dir["plugins"] / "serverside.dll").write_text("x")
    main.register_mod_package("mvp", "Serverside_Simulations", "1.1.9", ["serverside.dll"], "http://test")
    monkeypatch.setattr(main, "get_export_profile_name", lambda: "TestServer")
    monkeypatch.setattr(main, "upload_r2modman_profile", lambda payload: "019f3ee0-d09e-2cf0-4008-0c0dee85e142")

    r = client.post("/api/mods/export-code")
    assert r.status_code == 200
    body = r.json()
    assert body["code"] == "019f3ee0-d09e-2cf0-4008-0c0dee85e142"
    assert body["mods_count"] == 1
    assert body["profile_name"] == "TestServer"


# ── Updates ──────────────────────────────────────────────────────────────────

def test_get_updates_config(client):
    r = client.get("/api/updates/config")
    assert r.status_code == 200
    body = r.json()
    assert "values" in body
    assert "bepinex" in body
    assert body["values"]["UPDATE_AUTO"] == "true"


def test_put_updates_config_disable_auto(client, env_dir):
    r = client.put("/api/updates/config", json={"values": {"UPDATE_AUTO": "false"}, "restart": False})
    assert r.status_code == 200
    assert main.read_env().get("UPDATE_CRON") == ""
    assert r.json()["values"]["UPDATE_AUTO"] == "false"


def test_read_game_version(client, env_dir):
    manifest_dir = env_dir["data"] / "dl" / "server" / "steamapps"
    manifest_dir.mkdir(parents=True, exist_ok=True)
    manifest_dir.joinpath("appmanifest_896660.acf").write_text(
        '"AppState"\n{\n\t"buildid"\t\t"12345"\n\t"LastUpdated"\t\t"1700000000"\n}\n'
    )
    info = main.read_game_version()
    assert info["buildid"] == "12345"
    assert info["last_updated"] is not None


def test_write_bepinex_compose(client, env_dir):
    main.write_bepinex_compose(False)
    text = env_dir["root"].joinpath("docker-compose.yml").read_text()
    assert 'BEPINEX: "false"' in text
    assert main.read_bepinex_compose() is False


def test_updates_check(client, monkeypatch):
    calls = []

    def fake_docker(*args, **kwargs):
        calls.append(args)
        return main.subprocess.CompletedProcess(args, 0, stdout="ok", stderr="")

    monkeypatch.setattr(main, "docker", fake_docker)
    r = client.post("/api/updates/check")
    assert r.status_code == 200
    assert calls
    assert "valheim-updater" in calls[0]


def test_compare_versions():
    assert main.compare_versions("1.0.0", "1.0.0") == 0
    assert main.compare_versions("1.0.0", "2.0.0") < 0
    assert main.compare_versions("2.0.0", "1.9.9") > 0


# ── Worlds ───────────────────────────────────────────────────────────────────

def test_list_worlds(client):
    r = client.get("/api/worlds")
    assert r.status_code == 200
    names = [w["name"] for w in r.json()["worlds"]]
    assert "TestWorld" in names


def test_create_world_pending(client, env_dir):
    r = client.post("/api/worlds/create?name=Novo")
    assert r.status_code == 200
    assert r.json()["world_name"] == "Novo"
    assert r.json()["activated"] is False
    assert main.read_env().get("WORLD_NAME") == "TestWorld"
    assert (env_dir["worlds"] / "Novo.fwl").is_file()
    listed = client.get("/api/worlds").json()["worlds"]
    novo = next(w for w in listed if w["name"] == "Novo")
    assert novo["has_fwl"] is True
    assert novo["has_db"] is False


def test_create_world_activate(client, env_dir):
    r = client.post("/api/worlds/create?name=Ativo&activate=true")
    assert r.status_code == 200
    assert main.read_env().get("WORLD_NAME") == "Ativo"


def test_create_world_duplicate(client, env_dir):
    (env_dir["worlds"] / "Dup.fwl").write_text("x")
    r = client.post("/api/worlds/create?name=Dup")
    assert r.status_code == 409


def test_create_world_invalid(client):
    r = client.post("/api/worlds/create?name=bad name!")
    assert r.status_code == 400


def test_switch_world_valid(client):
    r = client.post("/api/worlds/switch", json={"world_name": "TestWorld"})
    assert r.status_code == 200


def test_switch_world_pending(client, env_dir):
    client.post("/api/worlds/create?name=Pendente")
    r = client.post("/api/worlds/switch", json={"world_name": "Pendente"})
    assert r.status_code == 200
    assert main.read_env().get("WORLD_NAME") == "Pendente"


def test_list_worlds_active_without_fwl(client, env_dir, monkeypatch):
    monkeypatch.setattr(main, "get_container_world_name", lambda: "GhostWorld")
    env_dir["env_file"].write_text("SERVER_NAME=Test\nWORLD_NAME=GhostWorld\nSERVER_PORT=2456\n")
    r = client.get("/api/worlds")
    names = {w["name"]: w for w in r.json()["worlds"]}
    assert "GhostWorld" in names
    assert names["GhostWorld"]["active"] is True
    assert names["GhostWorld"]["running"] is True
    assert names["GhostWorld"]["pending"] is True


def test_reconcile_world_config_fixes_mismatch(client, env_dir, monkeypatch):
    env_dir["env_file"].write_text("SERVER_NAME=Test\nWORLD_NAME=TesteNovo\nSERVER_PORT=2456\n")
    compose_calls = []
    monkeypatch.setattr(main, "get_container_world_name", lambda: "TestWorld")
    monkeypatch.setattr(main, "docker_compose", lambda *a, **k: compose_calls.append(a) or FakeCompleted(0))

    r = client.get("/api/worlds")
    assert r.status_code == 200
    assert main.read_env().get("WORLD_NAME") == "TestWorld"
    assert r.json()["world_reconciled"]["reconciled"] is True
    assert r.json()["world_reconciled"]["from"] == "TesteNovo"
    assert r.json()["world_reconciled"]["to"] == "TestWorld"
    assert compose_calls == []


def test_switch_world_recreates_container(client, monkeypatch):
    compose_calls = []
    monkeypatch.setattr(
        main,
        "docker_compose",
        lambda *a, **k: compose_calls.append(a) or FakeCompleted(0),
    )
    r = client.post("/api/worlds/switch", json={"world_name": "TestWorld"})
    assert r.status_code == 200
    assert any("--force-recreate" in c for c in compose_calls)


def test_sync_pending_when_fwl_appears(client, env_dir):
    main.add_pending_world("Novo")
    make_test_fwl(env_dir["worlds"] / "Novo.fwl", "Novo")
    listed = client.get("/api/worlds").json()["worlds"]
    novo = next(w for w in listed if w["name"] == "Novo")
    assert novo["has_fwl"] is True
    assert not main.read_pending_worlds()


def test_status_shows_running_world(client):
    r = client.get("/api/status")
    assert r.status_code == 200
    data = r.json()
    assert data["running_world_name"] == "TestWorld"
    assert data["world_in_sync"] is True


def test_build_worlds_list_marks_running_as_active(client):
    r = client.get("/api/worlds")
    tw = next(w for w in r.json()["worlds"] if w["name"] == "TestWorld")
    assert tw["active"] is True
    assert tw["running"] is True
    assert tw["pending"] is False


def test_delete_pending_world(client, env_dir):
    client.post("/api/worlds/create?name=Tmp")
    r = client.delete("/api/worlds/Tmp")
    assert r.status_code == 200
    names = [w["name"] for w in client.get("/api/worlds").json()["worlds"]]
    assert "Tmp" not in names
    assert not (env_dir["worlds"] / "Tmp.fwl").exists()


def test_get_world_config(client):
    r = client.get("/api/worlds/TestWorld/config")
    assert r.status_code == 200
    body = r.json()
    assert body["name"] == "TestWorld"
    assert body["meta"]["has_fwl"] is True
    assert "config" in body
    assert "summary" in body
    assert "inferred_preset" in body
    assert "effective" in body
    assert "flags" in body
    assert "modifier_strings" in body
    assert body["inferred_preset"] == "normal"


def test_get_world_config_missing(client):
    r = client.get("/api/worlds/Nope/config")
    assert r.status_code == 404


def test_all_listed_worlds_get_config_ok(client):
    worlds = client.get("/api/worlds").json()["worlds"]
    assert worlds
    for w in worlds:
        r = client.get(f"/api/worlds/{w['name']}/config")
        assert r.status_code == 200, f"config failed for {w['name']}: {r.text}"


def test_get_world_config_active_without_fwl(client, env_dir, monkeypatch):
    monkeypatch.setattr(main, "get_container_world_name", lambda: "GhostWorld")
    env_dir["env_file"].write_text("SERVER_NAME=Test\nWORLD_NAME=GhostWorld\nSERVER_PORT=2456\n")
    r = client.get("/api/worlds/GhostWorld/config")
    assert r.status_code == 200
    body = r.json()
    assert body["name"] == "GhostWorld"
    assert body["meta"]["has_fwl"] is False


def test_put_world_config(client, env_dir, monkeypatch):
    backup_dir = env_dir["fwl_backups"]
    monkeypatch.setattr(main, "FWL_BACKUP_DIR", backup_dir)
    r = client.put(
        "/api/worlds/TestWorld/config",
        json={"config": {"preset": "hard", "portals": "", "combat": "", "deathpenalty": "", "resources": "", "raids": ""}},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["summary"]["combat"] == "hard"
    assert body["inferred_preset"] == "hard"
    assert body["effective"]["combat"] == "hard"
    assert body["modifier_strings"]
    meta = read_fwl(env_dir["worlds"] / "TestWorld.fwl")
    assert meta.config.combat == "hard"
    assert (backup_dir / "TestWorld.fwl.bak").is_file()


def test_put_world_config_permission_denied(client, monkeypatch):
    monkeypatch.setattr(main, "container_running", lambda: False)

    def _deny(*args, **kwargs):
        raise PermissionError(13, "Permission denied")

    monkeypatch.setattr(main, "write_fwl", _deny)
    r = client.put(
        "/api/worlds/TestWorld/config",
        json={"config": {"preset": "hard", "portals": "", "combat": "", "deathpenalty": "", "resources": "", "raids": ""}},
    )
    assert r.status_code == 403
    assert "fix-worlds-permissions" in r.json()["detail"]


def test_put_world_config_via_docker_fallback(client, env_dir, monkeypatch):
    calls: list[tuple] = []

    def _deny_write(*args, **kwargs):
        path = args[0]
        if "world_fwl_staging" in str(path):
            return write_fwl(*args, **kwargs)
        raise PermissionError(13, "Permission denied")

    def _fake_docker(*args, **kwargs):
        calls.append(args)
        return FakeCompleted(0, "", "")

    monkeypatch.setattr(main, "write_fwl", _deny_write)
    monkeypatch.setattr(main, "container_running", lambda: True)
    monkeypatch.setattr(main, "docker", _fake_docker)
    r = client.put(
        "/api/worlds/TestWorld/config",
        json={"config": {"preset": "casual", "portals": "", "combat": "", "deathpenalty": "", "resources": "", "raids": ""}},
    )
    assert r.status_code == 200
    assert calls
    assert calls[0][0] == "cp"
    assert r.json()["inferred_preset"] == "casual"


def test_get_world_config_inferred_casual(client, env_dir):
    write_fwl(env_dir["worlds"] / "CasualWorld.fwl", "CasualWorld", WorldConfig(preset="casual"), backup=False)
    r = client.get("/api/worlds/CasualWorld/config")
    assert r.status_code == 200
    body = r.json()
    assert body["inferred_preset"] == "casual"
    assert body["effective"]["portals"] == "casual"
    assert body["effective"]["raids"] == "none"


def test_create_world_with_config(client, env_dir):
    r = client.post(
        "/api/worlds/create?name=CfgWorld&activate=false",
        json={"seed": "abc123", "config": {"preset": "casual"}},
    )
    assert r.status_code == 200
    assert (env_dir["worlds"] / "CfgWorld.fwl").is_file()
    meta = read_fwl(env_dir["worlds"] / "CfgWorld.fwl")
    assert meta.seed_name == "abc123"
    assert meta.config.preset == "casual" or meta.config.portals == "casual"


def test_list_worlds_includes_config_summary(client):
    client.put(
        "/api/worlds/TestWorld/config",
        json={"config": {"preset": "hard", "portals": "veryhard", "combat": "", "deathpenalty": "", "resources": "", "raids": ""}},
    )
    tw = next(w for w in client.get("/api/worlds").json()["worlds"] if w["name"] == "TestWorld")
    assert tw.get("config_summary")
    assert tw["config_summary"]["portals"] == "veryhard"


def test_switch_world_missing(client):
    r = client.post("/api/worlds/switch", json={"world_name": "Ghost"})
    assert r.status_code == 404


def test_switch_world_invalid(client):
    r = client.post("/api/worlds/switch", json={"world_name": "../evil"})
    assert r.status_code == 400


def test_delete_world_active_blocked(client):
    r = client.delete("/api/worlds/TestWorld")
    assert r.status_code == 400


def test_delete_world_valid(client, env_dir):
    make_test_fwl(env_dir["worlds"] / "Old.fwl", "Old")
    (env_dir["worlds"] / "Old.db").write_text("x")
    r = client.delete("/api/worlds/Old")
    assert r.status_code == 200
    assert set(r.json()["deleted"]) == {"Old.fwl", "Old.db"}


def test_delete_world_missing(client):
    r = client.delete("/api/worlds/Nope")
    assert r.status_code == 404


# ── Files ────────────────────────────────────────────────────────────────────

def test_file_tree(client):
    r = client.get("/api/files/tree?scope=config")
    assert r.status_code == 200
    assert isinstance(r.json()["tree"], list)


def test_file_tree_root_scope_rejected(client):
    r = client.get("/api/files/tree?scope=root")
    assert r.status_code == 400


def test_file_read_write(client):
    client.put("/api/files/write?path=config/note.txt", json={"content": "hello"})
    r = client.get("/api/files/read?path=config/note.txt")
    assert r.status_code == 200
    assert r.json()["content"] == "hello"


def test_file_read_missing(client):
    r = client.get("/api/files/read?path=config/ghost.txt")
    assert r.status_code == 404


def test_try_backup_world_fwl(env_dir):
    main.ensure_panel_data_dirs()
    src = env_dir["worlds"] / "TestWorld.fwl"
    assert main._try_backup_world_fwl(src, "TestWorld") is True
    assert (env_dir["fwl_backups"] / "TestWorld.fwl.bak").is_file()


def test_file_read_traversal_blocked(client):
    r = client.get("/api/files/read?path=../../etc/passwd")
    assert r.status_code in (400, 403, 404)


def test_file_read_via_config_symlink(tmp_path, monkeypatch):
    """config/ symlinkado para fora de ROOT (setup Docker real) deve permitir leitura."""
    root = tmp_path / "panel"
    external = tmp_path / "external-config"
    external.mkdir(parents=True)
    (external / "mod.cfg").write_text("[General]\nEnabled = true\n")
    root.mkdir()
    (root / "config").symlink_to(external)
    (root / "data").mkdir()

    monkeypatch.setattr(main, "ROOT", root)
    monkeypatch.setattr(main, "CONFIG_DIR", root / "config")
    monkeypatch.setattr(main, "DATA_DIR", root / "data")

    target = main.safe_path("config/mod.cfg")
    assert target.read_text() == "[General]\nEnabled = true\n"

    with TestClient(main.app) as c:
        r = c.get("/api/files/read?path=config/mod.cfg")
        assert r.status_code == 200
        assert "Enabled = true" in r.json()["content"]


def test_file_write_binary_blocked(client):
    r = client.put("/api/files/write?path=config/x.db", json={"content": "nope"})
    assert r.status_code == 400


def test_file_download(client):
    client.put("/api/files/write?path=config/dl.txt", json={"content": "abc"})
    r = client.get("/api/files/download?path=config/dl.txt")
    assert r.status_code == 200
    assert r.content == b"abc"


def test_file_delete_valid(client):
    client.put("/api/files/write?path=config/temp.txt", json={"content": "x"})
    r = client.delete("/api/files/delete?path=config/temp.txt")
    assert r.status_code == 200


def test_file_delete_protected(client):
    r = client.delete("/api/files/delete?path=.env")
    assert r.status_code == 403


# ── BepInEx configs ──────────────────────────────────────────────────────────

def test_bepinex_configs(client):
    r = client.get("/api/bepinex/configs")
    assert r.status_code == 200
    names = [c["name"] for c in r.json()["configs"]]
    assert "some.mod.cfg" in names


# ── Backups ──────────────────────────────────────────────────────────────────

def test_backups_list(client):
    r = client.get("/api/backups")
    assert r.status_code == 200
    data = r.json()
    assert "config" in data
    assert "state" in data
    assert "active" in data["state"]


def test_backup_config_get(client):
    r = client.get("/api/backups/config")
    assert r.status_code == 200
    assert "defaults" in r.json()


def test_backup_config_put_valid(client):
    r = client.put("/api/backups/config", json={"values": {"BACKUPS_MAX_AGE": "10"}})
    assert r.status_code == 200


def test_backup_config_put_invalid_age(client):
    r = client.put("/api/backups/config", json={"values": {"BACKUPS_MAX_AGE": "0"}})
    assert r.status_code == 400


@pytest.mark.parametrize("btype", ["world", "full", "configs"])
def test_backup_create(client, env_dir, btype):
    r = client.post("/api/backups/create", json={"type": btype})
    assert r.status_code == 200
    name = r.json()["name"]
    assert name.startswith(f"manual-{btype}-")
    assert (env_dir["backups"] / name).exists()


def test_backup_create_invalid_type(client):
    r = client.post("/api/backups/create", json={"type": "banana"})
    assert r.status_code == 400


def test_backup_trigger(client):
    r = client.post("/api/backups/trigger")
    assert r.status_code == 200


def test_backup_delete_valid(client, env_dir):
    target = env_dir["backups"] / "manual-world-x.zip"
    target.write_text("zipdata")
    r = client.delete("/api/backups/manual-world-x.zip")
    assert r.status_code == 200
    assert not target.exists()


def test_backup_delete_invalid_name(client):
    r = client.delete("/api/backups/x..y")
    assert r.status_code == 400


def test_backup_delete_missing(client):
    r = client.delete("/api/backups/ghost.zip")
    assert r.status_code == 404


def test_backup_download(client, env_dir):
    target = env_dir["backups"] / "manual-full-y.zip"
    target.write_bytes(b"PK\x03\x04")
    r = client.get("/api/backups/manual-full-y.zip/download")
    assert r.status_code == 200
    assert r.content == b"PK\x03\x04"


def _write_world_zip(path: Path, prefix: str = "worlds") -> None:
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(f"{prefix}/TestWorld.fwl", "restored fwl")
        zf.writestr(f"{prefix}/TestWorld.db", b"restored db")


def test_backup_restore_worlds_format(client, env_dir, monkeypatch):
    worlds = env_dir["worlds"]
    make_test_fwl(worlds / "TestWorld.fwl", "TestWorld")
    (worlds / "TestWorld.db").write_bytes(b"old db")

    backup = env_dir["backups"] / "worlds-20250708-120000.zip"
    _write_world_zip(backup, "worlds")

    monkeypatch.setattr(main, "stop_valheim_container", lambda: FakeCompleted(0))
    monkeypatch.setattr(main, "restart_valheim_container", lambda: FakeCompleted(0))

    r = client.post("/api/backups/worlds-20250708-120000.zip/restore")
    assert r.status_code == 200
    assert r.json()["active"] == "worlds-20250708-120000.zip"
    assert (worlds / "TestWorld.fwl").read_text() == "restored fwl"
    assert (worlds / "TestWorld.db").read_bytes() == b"restored db"
    state = main.read_backup_state()
    assert state["active"] == "worlds-20250708-120000.zip"
    assert state["undo"] and state["undo"].startswith("checkpoint-")


def test_backup_restore_manual_world_format(client, env_dir, monkeypatch):
    worlds = env_dir["worlds"]
    make_test_fwl(worlds / "TestWorld.fwl", "TestWorld")
    (worlds / "TestWorld.db").write_bytes(b"old db")

    backup = env_dir["backups"] / "manual-world-20250708.zip"
    _write_world_zip(backup, "worlds_local")

    monkeypatch.setattr(main, "stop_valheim_container", lambda: FakeCompleted(0))
    monkeypatch.setattr(main, "restart_valheim_container", lambda: FakeCompleted(0))

    r = client.post("/api/backups/manual-world-20250708.zip/restore")
    assert r.status_code == 200
    assert (worlds / "TestWorld.db").read_bytes() == b"restored db"


def test_backup_restore_rejects_traversal(client, env_dir):
    backup = env_dir["backups"] / "evil.zip"
    with zipfile.ZipFile(backup, "w") as zf:
        zf.writestr("../evil.txt", "bad")
    r = client.post("/api/backups/evil.zip/restore")
    assert r.status_code == 400


def test_backup_restore_latest(client, env_dir, monkeypatch):
    import os

    worlds = env_dir["worlds"]
    make_test_fwl(worlds / "TestWorld.fwl", "TestWorld")
    (worlds / "TestWorld.db").write_bytes(b"old")

    older = env_dir["backups"] / "worlds-20250701-120000.zip"
    newer = env_dir["backups"] / "worlds-20250708-120000.zip"
    _write_world_zip(older, "worlds")
    with zipfile.ZipFile(newer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("worlds/TestWorld.fwl", "newest fwl")
        zf.writestr("worlds/TestWorld.db", b"newest db")
    os.utime(older, (1_700_000_000, 1_700_000_000))
    os.utime(newer, (1_800_000_000, 1_800_000_000))

    monkeypatch.setattr(main, "stop_valheim_container", lambda: FakeCompleted(0))
    monkeypatch.setattr(main, "restart_valheim_container", lambda: FakeCompleted(0))

    r = client.post("/api/backups/restore-latest")
    assert r.status_code == 200
    assert r.json()["active"] == newer.name
    assert (worlds / "TestWorld.fwl").read_text() == "newest fwl"


def test_backup_restore_undo(client, env_dir, monkeypatch):
    worlds = env_dir["worlds"]
    make_test_fwl(worlds / "TestWorld.fwl", "TestWorld")
    (worlds / "TestWorld.db").write_bytes(b"v1")

    target = env_dir["backups"] / "worlds-20250701-120000.zip"
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("worlds/TestWorld.fwl", "old backup fwl")
        zf.writestr("worlds/TestWorld.db", b"old backup db")

    monkeypatch.setattr(main, "stop_valheim_container", lambda: FakeCompleted(0))
    monkeypatch.setattr(main, "restart_valheim_container", lambda: FakeCompleted(0))

    r1 = client.post("/api/backups/worlds-20250701-120000.zip/restore")
    assert r1.status_code == 200
    assert (worlds / "TestWorld.db").read_bytes() == b"old backup db"

    r2 = client.post("/api/backups/restore-undo")
    assert r2.status_code == 200
    assert (worlds / "TestWorld.db").read_bytes() == b"v1"


def test_backup_config_put_restarts(client, monkeypatch):
    called = {"n": 0}
    monkeypatch.setattr(main, "restart_valheim_container", lambda: (called.__setitem__("n", called["n"] + 1) or FakeCompleted(0)))
    r = client.put("/api/backups/config", json={"values": {"BACKUPS_MAX_AGE": "10"}})
    assert r.status_code == 200
    assert called["n"] == 1
    assert r.json().get("restarted") is True


def test_classify_backup():
    assert main.classify_backup("worlds-20250708.zip") == "auto"
    assert main.classify_backup("manual-world-x.zip") == "manual-world"
    assert main.classify_backup("checkpoint-20250708.zip") == "checkpoint"


def _write_mods_fixture(env_dir) -> None:
    plugins = env_dir["plugins"]
    (plugins / "AlphaMod.dll").write_bytes(b"mod-a")
    (plugins / "disabled").mkdir(exist_ok=True)
    (plugins / "disabled" / "BetaMod.dll").write_bytes(b"mod-b")
    registry = {
        "packages": [{
            "id": "Author/AlphaMod",
            "owner": "Author",
            "name": "AlphaMod",
            "version": "1.2.3",
            "dlls": ["AlphaMod.dll"],
            "source_url": "https://thunderstore.io/package/Author/AlphaMod/1.2.3/",
            "installed_at": "2026-01-01T00:00:00Z",
            "latest_version": "1.2.3",
            "update_status": "up_to_date",
        }],
    }
    env_dir["panel_data"].joinpath("mods-registry.json").write_text(
        __import__("json").dumps(registry, indent=2),
        encoding="utf-8",
    )


def test_build_backup_manifest_with_mods(env_dir):
    _write_mods_fixture(env_dir)
    manifest = main.build_backup_manifest("manual-full", ["bepinex/plugins/AlphaMod.dll"])
    assert manifest["mods"]["total"] >= 2
    assert manifest["mods"]["enabled"] >= 1
    assert manifest["world_name"] == "TestWorld"
    alpha = next(m for m in manifest["mods"]["items"] if m["name"] == "AlphaMod.dll")
    assert alpha["version"] == "1.2.3"
    assert alpha["package_id"] == "Author/AlphaMod"


def test_backup_create_full_generates_manifest_and_sidecar(client, env_dir):
    _write_mods_fixture(env_dir)
    r = client.post("/api/backups/create", json={"type": "full"})
    assert r.status_code == 200
    name = r.json()["name"]
    zip_path = env_dir["backups"] / name
    sidecar = env_dir["backups"] / f"{name}.manifest.json"
    assert sidecar.is_file()
    with zipfile.ZipFile(zip_path, "r") as zf:
        assert main.BACKUP_MANIFEST_FILENAME in zf.namelist()
        assert "panel-data/mods-registry.json" in zf.namelist()
    manifest = __import__("json").loads(sidecar.read_text(encoding="utf-8"))
    assert manifest["mods"]["total"] >= 2


def test_backups_list_includes_mods_count(client, env_dir):
    _write_mods_fixture(env_dir)
    client.post("/api/backups/create", json={"type": "full"})
    r = client.get("/api/backups")
    assert r.status_code == 200
    full = next(b for b in r.json()["backups"] if b["kind"] == "manual-full")
    assert full["mods_count"] >= 2
    assert full["world_name"] == "TestWorld"
    assert full["has_manifest"] is True


def test_backup_details_endpoint(client, env_dir):
    _write_mods_fixture(env_dir)
    created = client.post("/api/backups/create", json={"type": "full"}).json()
    name = created["name"]
    r = client.get(f"/api/backups/{name}/details")
    assert r.status_code == 200
    data = r.json()
    assert data["mods_count"] >= 2
    assert len(data["manifest"]["mods"]["items"]) >= 2
    assert data["manifest"]["contents"]["includes_mods_dlls"] is True


def test_backup_details_inferred_from_legacy_zip(client, env_dir):
    backup = env_dir["backups"] / "manual-full-legacy.zip"
    with zipfile.ZipFile(backup, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("bepinex/plugins/LegacyMod.dll", b"x")
        zf.writestr("worlds_local/TestWorld.fwl", "fwl")
    r = client.get("/api/backups/manual-full-legacy.zip/details")
    assert r.status_code == 200
    data = r.json()
    assert data["manifest_inferred"] is True
    assert data["mods_count"] == 1
    assert data["manifest"]["mods"]["items"][0]["name"] == "LegacyMod.dll"
    assert data["manifest"]["mods"]["items"][0]["version"] is None


def test_backup_restore_ignores_manifest_and_restores_registry(client, env_dir, monkeypatch):
    _write_mods_fixture(env_dir)
    registry_path = env_dir["panel_data"] / "mods-registry.json"
    created = client.post("/api/backups/create", json={"type": "full"}).json()
    name = created["name"]

    registry_path.write_text('{"packages": []}', encoding="utf-8")
    (env_dir["worlds"] / "TestWorld.db").write_bytes(b"changed")

    monkeypatch.setattr(main, "stop_valheim_container", lambda: FakeCompleted(0))
    monkeypatch.setattr(main, "restart_valheim_container", lambda: FakeCompleted(0))

    r = client.post(f"/api/backups/{name}/restore")
    assert r.status_code == 200
    restored = __import__("json").loads(registry_path.read_text(encoding="utf-8"))
    assert restored["packages"][0]["id"] == "Author/AlphaMod"


def test_backup_delete_removes_sidecar(client, env_dir):
    _write_mods_fixture(env_dir)
    created = client.post("/api/backups/create", json={"type": "world"}).json()
    name = created["name"]
    sidecar = env_dir["backups"] / f"{name}.manifest.json"
    assert sidecar.is_file()
    r = client.delete(f"/api/backups/{name}")
    assert r.status_code == 200
    assert not sidecar.is_file()


# ── Audit ────────────────────────────────────────────────────────────────────

def test_audit_records_mutations(client):
    client.post("/api/server/restart")
    r = client.get("/api/audit")
    assert r.status_code == 200
    entries = r.json()["entries"]
    assert any(e["path"] == "/api/server/restart" and e["method"] == "POST" for e in entries)


def test_audit_records_errors(client):
    client.post("/api/server/explode")  # 400
    r = client.get("/api/audit")
    entries = r.json()["entries"]
    bad = [e for e in entries if e["path"] == "/api/server/explode"]
    assert bad and bad[0]["status"] == 400
    assert bad[0]["error"]


def test_audit_download_empty(client):
    r = client.get("/api/audit/download")
    assert r.status_code == 404


def test_audit_download_after_action(client):
    client.post("/api/server/start")
    r = client.get("/api/audit/download")
    assert r.status_code == 200
    assert b"/api/server/start" in r.content


def test_audit_sanitizes_sensitive_query(client):
    client.put("/api/files/write?path=config/a.txt&password=secret123", json={"content": "x", "server_pass": "abc"})
    r = client.get("/api/audit")
    entries = r.json()["entries"]
    write_entries = [e for e in entries if e["path"] == "/api/files/write"]
    assert write_entries
    assert write_entries[0]["params"].get("password") == "***"
    assert write_entries[0]["request_body"]["server_pass"] == "***"
    assert "request_body" in write_entries[0]
    assert "response_body" in write_entries[0]


# ── Metrics & Resources ──────────────────────────────────────────────────────

def test_normalize_valheim_cpu(monkeypatch):
    monkeypatch.setattr(main, "get_cpu_count", lambda: 4)
    assert main.normalize_valheim_cpu(10.15) == 10.2
    assert main.normalize_valheim_cpu(25.5) == 25.5
    assert main.normalize_valheim_cpu(115.0) == 28.8
    assert main.normalize_valheim_cpu(400.0) == 100.0


def test_read_container_net_bytes(monkeypatch):
    sample = (
        "Inter-|   Receive                                                |  Transmit\n"
        " face |bytes    packets errs drop fifo frame compressed multicast|bytes    packets errs drop fifo colls carrier compressed\n"
        "    lo: 1000   10    0    0    0     0          0         0  1000   10    0    0    0     0       0          0\n"
        "  eth0: 5000   50    0    0    0     0          0         0  9000   90    0    0    0     0       0          0\n"
    )

    def fake_read_text(self, encoding="utf-8", errors=None):
        if str(self).endswith("/net/dev"):
            return sample
        return main.Path.read_text(self, encoding=encoding, errors=errors or "strict")

    monkeypatch.setattr(main.Path, "read_text", fake_read_text)
    rx, tx = main.read_container_net_bytes(12345)
    assert rx == 5000
    assert tx == 9000


def test_metrics(client, monkeypatch):
    main._metrics_prev = None
    monkeypatch.setattr(main, "get_container_metrics_raw", lambda: {
        "running": True,
        "cpu_percent": 25.5,
        "memory_used_bytes": 512 * 1024 * 1024,
        "memory_limit_bytes": 8 * 1024 * 1024 * 1024,
        "memory_percent": 6.25,
        "net_rx_bytes": 1024 * 1024,
        "net_tx_bytes": 2048 * 1024,
        "block_read_bytes": 0,
        "block_write_bytes": 1024 * 1024,
    })
    monkeypatch.setattr(main, "get_valheim_disk_usage", lambda: {
        "config_bytes": 1000,
        "data_bytes": 5000,
        "total_bytes": 6000,
    })
    monkeypatch.setattr(main, "read_memory_limit_gb", lambda: None)

    r = client.get("/api/metrics")
    assert r.status_code == 200
    body = r.json()
    assert body["running"] is True
    assert body["cpu"]["raw_percent"] == 25.5
    assert body["cpu"]["percent"] == 25.5
    assert body["memory"]["used_bytes"] == 512 * 1024 * 1024
    assert body["disk"]["total_bytes"] == 6000
    assert "rx_bps" in body["network"]
    assert "read_bps" in body["block_io"]


def test_metrics_legacy_cpu(client, monkeypatch):
    main._metrics_prev = None
    monkeypatch.setattr(main, "get_container_metrics_raw", lambda: {
        "running": True,
        "cpu_percent": 115.0,
        "memory_used_bytes": 100,
        "memory_limit_bytes": 1000,
        "memory_percent": 10.0,
        "net_rx_bytes": 0,
        "net_tx_bytes": 0,
        "block_read_bytes": 0,
        "block_write_bytes": 0,
    })
    monkeypatch.setattr(main, "get_valheim_disk_usage", lambda: {
        "config_bytes": 0, "data_bytes": 0, "total_bytes": 0,
    })
    monkeypatch.setattr(main, "read_memory_limit_gb", lambda: None)
    monkeypatch.setattr(main, "get_cpu_count", lambda: 4)

    r = client.get("/api/metrics")
    body = r.json()
    assert body["cpu"]["percent"] == 28.8
    assert body["cpu"]["raw_percent"] == 115.0


def test_metrics_rates(client, monkeypatch):
    main._metrics_prev = {
        "ts": time.time() - 2,
        "raw": {
            "net_rx_bytes": 1000,
            "net_tx_bytes": 2000,
            "block_read_bytes": 0,
            "block_write_bytes": 500,
        },
    }
    monkeypatch.setattr(main, "get_container_metrics_raw", lambda: {
        "running": True,
        "cpu_percent": 10.0,
        "memory_used_bytes": 100,
        "memory_limit_bytes": 1000,
        "memory_percent": 10.0,
        "net_rx_bytes": 3000,
        "net_tx_bytes": 6000,
        "block_read_bytes": 0,
        "block_write_bytes": 1500,
    })
    monkeypatch.setattr(main, "get_valheim_disk_usage", lambda: {
        "config_bytes": 0, "data_bytes": 0, "total_bytes": 0,
    })
    monkeypatch.setattr(main, "read_memory_limit_gb", lambda: None)

    r = client.get("/api/metrics")
    body = r.json()
    assert 990 <= body["network"]["rx_bps"] <= 1010
    assert 1990 <= body["network"]["tx_bps"] <= 2010
    assert 490 <= body["block_io"]["write_bps"] <= 510


def test_get_memory_limit(client):
    r = client.get("/api/resources/memory")
    assert r.status_code == 200
    body = r.json()
    assert body["unlimited"] is True
    assert body["gb"] is None
    assert body["min_gb"] == 1
    assert body["max_gb"] == 28


def test_set_memory_limit(client, env_dir):
    r = client.put("/api/resources/memory", json={"gb": 4, "apply": False})
    assert r.status_code == 200
    assert r.json()["gb"] == 4
    text = env_dir["root"].joinpath("docker-compose.yml").read_text()
    assert "mem_limit: 4g" in text
    assert "memswap_limit: 4g" in text

    r2 = client.get("/api/resources/memory")
    assert r2.json()["gb"] == 4
    assert r2.json()["unlimited"] is False


def test_set_memory_limit_remove(client, env_dir):
    client.put("/api/resources/memory", json={"gb": 6, "apply": False})
    r = client.put("/api/resources/memory", json={"gb": None, "apply": False})
    assert r.status_code == 200
    assert r.json()["unlimited"] is True
    text = env_dir["root"].joinpath("docker-compose.yml").read_text()
    assert "mem_limit" not in text


def test_set_memory_limit_invalid(client):
    r = client.put("/api/resources/memory", json={"gb": 0})
    assert r.status_code == 400


def test_metrics_light(client, monkeypatch):
    main._metrics_prev = None
    main._disk_usage_cache = None
    monkeypatch.setattr(main, "get_container_metrics_raw", lambda: {
        "running": True,
        "cpu_percent": 10.0,
        "memory_used_bytes": 100,
        "memory_limit_bytes": 1000,
        "memory_percent": 10.0,
        "net_rx_bytes": 0,
        "net_tx_bytes": 0,
        "block_read_bytes": 0,
        "block_write_bytes": 0,
    })
    monkeypatch.setattr(main, "read_memory_limit_gb", lambda: None)
    called = {"full": 0, "cached": 0}

    def fake_disk(force_refresh=False):
        called["full"] += 1
        return {
            "config_bytes": 1, "data_bytes": 2, "total_bytes": 3,
            "game_bytes": 0, "mods_bytes": 0, "worlds_bytes": 0, "backups_bytes": 0,
        }

    def fake_cached():
        called["cached"] += 1
        return None

    monkeypatch.setattr(main, "get_valheim_disk_usage", fake_disk)
    monkeypatch.setattr(main, "get_valheim_disk_usage_cached", fake_cached)

    r = client.get("/api/metrics?light=1")
    assert r.status_code == 200
    assert r.json()["disk"]["total_bytes"] == 3
    assert called["full"] == 1
    assert called["cached"] == 1


def test_metrics_light_cached(client, monkeypatch):
    main._metrics_prev = None
    main._disk_usage_cache = None
    monkeypatch.setattr(main, "get_container_metrics_raw", lambda: {
        "running": True,
        "cpu_percent": 10.0,
        "memory_used_bytes": 100,
        "memory_limit_bytes": 1000,
        "memory_percent": 10.0,
        "net_rx_bytes": 0,
        "net_tx_bytes": 0,
        "block_read_bytes": 0,
        "block_write_bytes": 0,
    })
    monkeypatch.setattr(main, "read_memory_limit_gb", lambda: None)
    called = {"full": 0}

    def fake_disk(force_refresh=False):
        called["full"] += 1
        return {
            "config_bytes": 10, "data_bytes": 20, "total_bytes": 30,
            "game_bytes": 5, "mods_bytes": 3, "worlds_bytes": 2, "backups_bytes": 1,
        }

    monkeypatch.setattr(main, "get_valheim_disk_usage", fake_disk)
    main._disk_usage_cache = {
        "config_bytes": 10, "data_bytes": 20, "total_bytes": 30,
        "game_bytes": 5, "mods_bytes": 3, "worlds_bytes": 2, "backups_bytes": 1,
    }

    r = client.get("/api/metrics?light=1")
    assert r.status_code == 200
    assert r.json()["disk"]["total_bytes"] == 30
    assert r.json()["disk"]["game_bytes"] == 5
    assert called["full"] == 0


def test_get_valheim_disk_usage_breakdown(env_dir, monkeypatch):
    main._disk_usage_cache = None
    sizes = {
        env_dir["config"]: 1000,
        env_dir["data"]: 5000,
        env_dir["fwl_backups"]: 200,
        env_dir["data"] / "dl": 4000,
        env_dir["plugins"]: 300,
        env_dir["data"] / "bepinex" / "BepInEx" / "plugins": 150,
        env_dir["worlds"]: 450,
        env_dir["backups"]: 100,
    }

    def fake_dir_size(path):
        return sizes.get(path, 0)

    monkeypatch.setattr(main, "dir_size_bytes", fake_dir_size)
    result = main.get_valheim_disk_usage(force_refresh=True)
    assert result["game_bytes"] == 4000
    assert result["mods_bytes"] == 450
    assert result["worlds_bytes"] == 450
    assert result["backups_bytes"] == 300
    assert result["total_bytes"] == 6200


def test_get_capacity(client):
    r = client.get("/api/config/capacity")
    assert r.status_code == 200
    body = r.json()
    assert body["max_players"] == 10
    assert body["max_players_cap"] == 10
    assert body["memory_unlimited"] is True
    assert len(body["suggestions"]) >= 4
    assert body["suggested_ram_gb"] >= 2


def test_set_max_players_vanilla(client, env_dir):
    r = client.put("/api/config/capacity", json={"max_players": 8})
    assert r.status_code == 200
    assert r.json()["max_players"] == 8
    from dotenv import dotenv_values
    env = dotenv_values(env_dir["root"].joinpath(".env"))
    assert env.get("MAX_PLAYERS") == "8"


def test_set_max_players_above_vanilla_without_mod(client):
    r = client.put("/api/config/capacity", json={"max_players": 15})
    assert r.status_code == 400


def test_set_capacity_memory_slider_unlimited(client, env_dir, monkeypatch):
    monkeypatch.setattr(main, "recreate_container", lambda: FakeCompleted(0))
    monkeypatch.setattr(main, "get_container_metrics_raw", lambda: {
        "memory_used_bytes": 100,
    })
    client.put("/api/config/capacity", json={"memory_gb": 6, "apply_memory": True})
    r = client.put("/api/config/capacity", json={"memory_gb": main.MEMORY_UNLIMITED_SLIDER, "apply_memory": True})
    assert r.status_code == 200
    assert r.json()["memory_unlimited"] is True
    text = env_dir["root"].joinpath("docker-compose.yml").read_text()
    assert "mem_limit" not in text


def test_parse_docker_size():
    assert main.parse_docker_size("1GiB") == 1024 ** 3
    assert main.parse_docker_size("512MiB") == 512 * 1024 ** 2
    assert main.parse_docker_size("248kB") == 248 * 1000


def test_parse_io_pair():
    rx, tx = main.parse_io_pair("248kB / 251kB")
    assert rx == 248 * 1000
    assert tx == 251 * 1000


# ── Setup (primeiro acesso) ───────────────────────────────────────────────────

def test_setup_status_migration_existing_install(client):
    r = client.get("/api/setup/status")
    assert r.status_code == 200
    body = r.json()
    assert body["completed"] is True
    assert body["needs_wizard"] is False
    assert body["mode"] in ("vanilla", "bepinex")


def test_setup_status_needs_wizard(fresh_client):
    r = fresh_client.get("/api/setup/status")
    assert r.status_code == 200
    body = r.json()
    assert body["needs_wizard"] is True
    assert body["completed"] is False


def test_setup_complete_vanilla_with_admin(fresh_client, fresh_env_dir):
    r = fresh_client.post("/api/setup/complete", json={
        "mode": "vanilla",
        "admin_steam_id": "76561198000000000",
        "world_name": "NovoMundo",
        "activate_world": True,
    })
    assert r.status_code == 200
    body = r.json()
    assert body["mode"] == "vanilla"
    assert body["admin_configured"] is True
    assert body["world_name"] == "NovoMundo"
    assert body["world_activated"] is True
    assert body["rcon_password"] is None
    assert main.read_bepinex_compose() is False
    admin = (fresh_env_dir["config"] / "adminlist.txt").read_text()
    assert "76561198000000000" in admin
    status = fresh_client.get("/api/setup/status").json()
    assert status["completed"] is True
    assert status["needs_wizard"] is False


def test_setup_complete_bepinex_with_rcon(fresh_client, fresh_env_dir):
    bundled_src = Path(__file__).resolve().parents[2] / "bundled-mods" / "ValheimRcon.dll"
    if bundled_src.exists():
        shutil.copy2(bundled_src, fresh_env_dir["plugins"] / "ValheimRcon.dll")
    r = fresh_client.post("/api/setup/complete", json={"mode": "bepinex"})
    assert r.status_code == 200
    body = r.json()
    assert body["mode"] == "bepinex"
    assert body["rcon_password"]
    assert main.read_bepinex_compose() is True
    assert (fresh_env_dir["plugins"] / "ValheimRcon.dll").exists()
    cfg = (fresh_env_dir["bepinex"] / "org.tristan.rcon.cfg").read_text()
    assert body["rcon_password"] in cfg
