"""Fixtures para testes unitários do painel (TestClient + mocks de docker/dirs)."""

import subprocess
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import main  # noqa: E402
from fwl_io import WorldConfig, write_fwl  # noqa: E402


def make_test_fwl(path: Path, name: str) -> None:
    write_fwl(path, name, WorldConfig(), backup=False)


class FakeCompleted:
    def __init__(self, returncode: int = 0, stdout: str = "", stderr: str = ""):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


@pytest.fixture
def env_dir(tmp_path, monkeypatch):
    """Cria uma árvore de diretórios isolada e aponta os globals de main para ela."""
    root = tmp_path
    config = root / "config"
    plugins = config / "bepinex" / "plugins"
    bepinex = config / "bepinex"
    worlds = config / "worlds_local"
    backups = config / "backups"
    data = root / "data"
    panel_data = root / "panel-data"
    logs = panel_data / "logs"
    fwl_backups = panel_data / "world_fwl_backups"

    for d in (plugins, bepinex, worlds, backups, data, panel_data, fwl_backups, logs):
        d.mkdir(parents=True, exist_ok=True)

    env_file = root / ".env"
    env_file.write_text("SERVER_NAME=Test\nWORLD_NAME=TestWorld\nSERVER_PORT=2456\n")
    compose = root / "docker-compose.yml"
    compose.write_text(
        "services:\n  valheim:\n    image: test\n    container_name: valheim-server\n"
        "    stop_grace_period: 120s\n    environment:\n      BEPINEX: \"true\"\n"
    )

    make_test_fwl(worlds / "TestWorld.fwl", "TestWorld")
    (worlds / "TestWorld.db").write_text("db")
    (bepinex / "some.mod.cfg").write_text("[General]\nEnabled = true\n")
    (config / "adminlist.txt").write_text("// admins\n123\n")

    monkeypatch.setattr(main, "ROOT", root)
    monkeypatch.setattr(main, "PANEL_DATA_DIR", panel_data)
    monkeypatch.setattr(main, "FWL_BACKUP_DIR", fwl_backups)
    monkeypatch.setattr(main, "FWL_STAGING_DIR", panel_data / "world_fwl_staging")
    monkeypatch.setattr(main, "CONFIG_DIR", config)
    monkeypatch.setattr(main, "DATA_DIR", data)
    runtime_plugins = data / "bepinex" / "BepInEx" / "plugins"
    runtime_plugins.mkdir(parents=True, exist_ok=True)

    monkeypatch.setattr(main, "PLUGINS_DIR", plugins)
    monkeypatch.setattr(main, "PLUGINS_DISABLED_DIR", plugins / "disabled")
    monkeypatch.setattr(main, "RUNTIME_PLUGINS_DIR", runtime_plugins)
    monkeypatch.setattr(main, "RUNTIME_PLUGINS_DISABLED_DIR", runtime_plugins / "disabled")
    monkeypatch.setattr(main, "BEPINEX_CFG_DIR", bepinex)
    monkeypatch.setattr(main, "WORLDS_DIR", worlds)
    monkeypatch.setattr(main, "WORLDS_PENDING_FILE", config / "worlds_pending.json")
    monkeypatch.setattr(main, "WORLDS_CONFIG_FILE", config / "worlds_config.json")
    monkeypatch.setattr(main, "BACKUPS_DIR", backups)
    monkeypatch.setattr(main, "ENV_FILE", env_file)
    monkeypatch.setattr(main, "COMPOSE_FILE", compose)
    monkeypatch.setattr(main, "LOGS_DIR", logs)
    monkeypatch.setattr(main, "AUDIT_FILE", logs / "audit.jsonl")
    monkeypatch.setattr(main, "MODS_REGISTRY_FILE", panel_data / "mods-registry.json")
    monkeypatch.setattr(main, "APP_MANIFEST_PATH", data / "dl" / "server" / "steamapps" / "appmanifest_896660.acf")

    monkeypatch.setattr(main, "container_running", lambda: True)
    monkeypatch.setattr(main, "get_container_world_name", lambda: "TestWorld")
    monkeypatch.setattr(main, "supervisor_status", lambda: {"valheim-server": "RUNNING"})
    monkeypatch.setattr(main, "server_process_status", lambda: "running")
    monkeypatch.setattr(main, "docker", lambda *a, **k: FakeCompleted(0, "ok", ""))
    monkeypatch.setattr(main, "docker_compose", lambda *a, **k: FakeCompleted(0, "ok", ""))
    monkeypatch.setattr(main, "get_logs", lambda lines=100: (
        "Got connection SteamID 76561198273697711\n"
        "Got character ZDOID from TestPlayer : 1125091549:3\n"
        "Connections 1 ZDOS:19178  sent:0 recv:91\n"
    ))
    monkeypatch.setattr(main, "bepinex_log", lambda lines=80: "bepinex log line\n")

    return {
        "root": root, "config": config, "plugins": plugins, "bepinex": bepinex,
        "worlds": worlds, "backups": backups, "data": data, "env_file": env_file,
        "panel_data": panel_data, "fwl_backups": fwl_backups,
    }


@pytest.fixture
def client(env_dir):
    with TestClient(main.app) as c:
        yield c
