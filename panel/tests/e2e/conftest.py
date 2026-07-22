"""Fixtures E2E: sobe um painel hermético (docker falso) ou usa PANEL_URL externo."""

import json
import os
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

import pytest
from playwright.sync_api import Page

PANEL_DIR = Path(__file__).resolve().parents[2]
REPO_ROOT = PANEL_DIR.parent
sys.path.insert(0, str(PANEL_DIR))
from fwl_io import WorldConfig, write_fwl  # noqa: E402


def _load_repo_dotenv() -> None:
    """Load repo ``.env`` into ``os.environ`` without overriding existing vars."""
    env_path = REPO_ROOT / ".env"
    if not env_path.is_file():
        return
    try:
        from dotenv import dotenv_values
    except Exception:
        return
    for key, value in (dotenv_values(env_path) or {}).items():
        if key and value is not None and key not in os.environ:
            os.environ[key] = value


_load_repo_dotenv()


@pytest.fixture(scope="session")
def discord_test_webhook() -> str:
    """Real Discord test webhook from ``DISCORD_TEST_WEBHOOK_URL`` (.env).

    Skips delivery tests when unset so CI/local runs do not require Discord.
    """
    url = (os.environ.get("DISCORD_TEST_WEBHOOK_URL") or "").strip().strip("'\"")
    if not url:
        pytest.skip("DISCORD_TEST_WEBHOOK_URL not set (add it to repo .env for Discord e2e)")
    if "discord.com/api/webhooks/" not in url and "discordapp.com/api/webhooks/" not in url:
        pytest.fail("DISCORD_TEST_WEBHOOK_URL does not look like a Discord webhook URL")
    return url


@pytest.fixture(autouse=True)
def force_en_locale(page: Page):
    """E2E tests assume en-US strings."""
    page.add_init_script(
        "localStorage.setItem('vikinger-panel-locale', 'en-US');"
    )


@pytest.fixture(autouse=True)
def track_api_errors(page: Page):
    """Falha o teste se qualquer chamada /api retornar 5xx."""
    errors: list[str] = []
    page.on(
        "response",
        lambda resp: errors.append(f"{resp.status} {resp.url}")
        if "/api/" in resp.url and resp.status >= 500
        else None,
    )
    page._api_errors = errors  # type: ignore[attr-defined]
    yield
    assert not page._api_errors, f"Erros 5xx na API: {page._api_errors}"  # type: ignore[attr-defined]

FAKE_DOCKER = """#!/usr/bin/env python3
import sys
import time
args = sys.argv[1:]
w = sys.stdout.write
if not args:
    sys.exit(0)
cmd = args[0]
if cmd == "inspect":
    fmt = args[2] if len(args) > 2 else ""
    if "Pid" in fmt:
        w("12345\\n")
    else:
        w("true\\n")
elif cmd == "logs":
    w("Jul  7 00:45:17 supervisord: valheim-updater ^[[0m\\n")
    w("Jul  7 00:45:17 supervisord: valheim-updater  .d..t...... ./\\n")
    w("Jul  7 00:45:19 supervisord: valheim-server  World loaded: TestWorld\\n")
    w("Jul  7 00:45:19 supervisord: valheim-server  Game server connected\\n")
    w("Jul  7 00:45:19 supervisord: valheim-server  Listening on 2456\\n")
    w("Jul  7 00:45:20 supervisord: valheim-server  Got connection SteamID 76561198273697711\\n")
    w("Jul  7 00:45:20 supervisord: valheim-server  Got character ZDOID from TestPlayer : 1125091549:3\\n")
    w("Jul  7 00:45:21 supervisord: valheim-server  Connections 1 ZDOS:19178  sent:0 recv:91\\n")
    w("Jul  7 00:45:22 supervisord: valheim-server  Command completed: globalKeys\\n")
    w("Jul  7 00:45:22 supervisord: valheim-server  Global Keys:\\n")
    w("Jul  7 00:45:22 supervisord: valheim-server  playerdamage 85\\n")
    w("Jul  7 00:45:23 supervisord: valheim-server  76561198273697711/TestPlayer (100, 200, 10): say hello\\n")
    for i in range(2, 42):
        w(f"Jul  7 00:45:2{i % 10} supervisord: valheim-server  Connections {i} ZDOS:19178  sent:0 recv:91\\n")
elif cmd == "stats":
    import json
    w(json.dumps({
        "CPUPerc": "12.50%",
        "MemUsage": "512MiB / 8GiB",
        "MemPerc": "6.25%",
        "NetIO": "1024kB / 2048kB",
        "BlockIO": "0B / 1MB",
    }) + "\\n")
elif cmd == "compose":
    # Simula latência em ações de ciclo de vida para testar loadings/anti-duplo-clique.
    if any(a in args for a in ("up", "restart", "stop", "force-recreate")):
        time.sleep(2.5)
    w("ok\\n")
elif cmd == "exec":
    if "printenv" in args and "WORLD_NAME" in args:
        w("TestWorld\\n")
    elif "cat" in args:
        w("running\\n")
    elif "status" in args:
        w("valheim-server RUNNING pid 1, uptime 0:10:00\\n")
        w("valheim-backup RUNNING pid 2, uptime 0:10:00\\n")
    else:
        w("ok\\n")
else:
    w("ok\\n")
sys.exit(0)
"""


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _seed_root(root: Path) -> None:
    config = root / "config"
    worlds = config / "worlds_local"
    bepinex = config / "bepinex"
    plugins = bepinex / "plugins"
    backups = config / "backups"
    for d in (worlds, plugins, backups, root / "data"):
        d.mkdir(parents=True, exist_ok=True)
    (root / ".env").write_text("SERVER_NAME=TestPanel\nWORLD_NAME=TestWorld\nSERVER_PORT=2456\nSERVER_PUBLIC=true\n")
    (root / "docker-compose.yml").write_text(
        "services:\n  valheim:\n    image: test\n    container_name: valheim-server\n    stop_grace_period: 120s\n"
        "    environment:\n      BEPINEX: \"true\"\n"
    )
    write_fwl(worlds / "TestWorld.fwl", "TestWorld", WorldConfig(), backup=False)
    (worlds / "TestWorld.db").write_text("db")
    (bepinex / "sample.mod.cfg").write_text("[General]\nEnabled = true\n")
    (config / "adminlist.txt").write_text("// admins\n76561198000000000\n")
    (bepinex / "org.tristan.rcon.cfg").write_text("[General]\nPort = 2458\nPassword = e2e-rcon-secret\n")
    panel_data = root / "panel-data"
    panel_data.mkdir(parents=True, exist_ok=True)
    (panel_data / "setup.json").write_text(
        json.dumps({"completed": True, "mode": "bepinex", "migrated": True}, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def _wait_up(url: str, timeout: float = 30.0) -> None:
    deadline = time.time() + timeout
    last = None
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as r:
                if r.status == 200:
                    return
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(0.3)
    raise RuntimeError(f"Painel não subiu em {timeout}s: {last}")


@pytest.fixture(scope="session")
def browser_context_args():
    return {"ignore_https_errors": True}


@pytest.fixture(scope="session")
def base_url(tmp_path_factory):
    external = os.environ.get("PANEL_URL")
    if external:
        yield external
        return

    root = tmp_path_factory.mktemp("panel_root")
    _seed_root(root)

    bindir = tmp_path_factory.mktemp("fakebin")
    docker_stub = bindir / "docker"
    docker_stub.write_text(FAKE_DOCKER)
    docker_stub.chmod(0o755)

    port = _free_port()
    env = os.environ.copy()
    env["VALHEIM_PANEL_ROOT"] = str(root)
    env["VIKINGER_TEST_RCON"] = "1"
    env["PATH"] = f"{bindir}:{env.get('PATH', '')}"

    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", str(port)],
        cwd=str(PANEL_DIR),
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    url = f"http://127.0.0.1:{port}"
    try:
        _wait_up(url + "/api/status")
        yield url
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
