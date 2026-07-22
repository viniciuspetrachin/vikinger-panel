#!/usr/bin/env python3
"""Valheim Server Management Panel - API Backend"""

import asyncio
import base64
import io
import ipaddress
import json
import logging
import os
import re
import shutil
import socket
import subprocess
import threading
import time
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from dotenv import dotenv_values, set_key
from fastapi import FastAPI, File, HTTPException, Query, Request, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import auto_messages
from fwl_io import WorldConfig, WorldMeta, config_summary_from_meta, read_fwl, world_config_details, write_fwl
from log_utils import apply_log_filters, clean_docker_logs
from rcon_client import (
    RconError,
    STEAM_ID_RE,
    BUNDLED_MODS,
    RCON_PLUGIN_NAME,
    ensure_bundled_mods,
    ensure_rcon_config,
    execute_rcon,
    get_rcon_config,
    is_mod_enabled,
    is_plugin_installed,
    is_protected_mod,
)
from version import __version__, version_info
from panel_update import check_panel_update, start_panel_update
from server_name_branding import (
    apply_env_save,
    effective_server_name,
    prepare_env_for_api,
    server_name_meta,
    strip_server_name_branding,
)
import storage_limits
from bepinex_cfg import (
    apply_setting_values,
    build_cfg_index,
    find_orphaned_configs,
    find_plugin_for_cfg,
    is_bepinex_plugin_cfg_path,
    match_dll_to_cfg,
    parse_bepinex_cfg,
    PROTECTED_CFG_NAMES,
)

# ── Redesign foundation modules ──────────────────────────────────────────────
import db as panel_db
import docker_metrics
import metrics_history
import world_map
import alerts as panel_alerts
import player_tracker
import scheduler as panel_scheduler
from ws_live import LiveHub, run_live_loop

logger = logging.getLogger("vikinger-panel")
logging.basicConfig(level=logging.INFO)

ROOT = Path(os.environ.get("VALHEIM_PANEL_ROOT", Path(__file__).resolve().parent.parent)).resolve()
PANEL_DIR = Path(__file__).resolve().parent
PANEL_DATA_DIR = ROOT / "panel-data"
FWL_BACKUP_DIR = PANEL_DATA_DIR / "world_fwl_backups"
FWL_STAGING_DIR = PANEL_DATA_DIR / "world_fwl_staging"
CONFIG_DIR = ROOT / "config"
DATA_DIR = ROOT / "data"
PLUGINS_DIR = CONFIG_DIR / "bepinex" / "plugins"
PLUGINS_DISABLED_DIR = PLUGINS_DIR / "disabled"
RUNTIME_PLUGINS_DIR = DATA_DIR / "bepinex" / "BepInEx" / "plugins"
RUNTIME_PLUGINS_DISABLED_DIR = RUNTIME_PLUGINS_DIR / "disabled"
FIX_PLUGINS_SCRIPT = ROOT / "scripts" / "fix-plugins-permissions.sh"
BEPINEX_CFG_DIR = CONFIG_DIR / "bepinex"
BUNDLED_MODS_DIR = PANEL_DIR / "bundled-mods"
WORLDS_DIR = CONFIG_DIR / "worlds_local"
WORLDS_PENDING_FILE = CONFIG_DIR / "worlds_pending.json"
WORLDS_CONFIG_FILE = CONFIG_DIR / "worlds_config.json"
BACKUPS_DIR = CONFIG_DIR / "backups"
BACKUP_STATE_FILE = PANEL_DATA_DIR / "backup_state.json"
ENV_FILE = ROOT / ".env"
COMPOSE_FILE = ROOT / "docker-compose.yml"
CONTAINER_NAME = "valheim-server"
COMPOSE_SERVICE = "valheim"
MEMORY_MIN_GB = 1
MEMORY_MAX_GB = 28
MEMORY_UNLIMITED_SLIDER = 29
VANILLA_MAX_PLAYERS = 10
DISK_USAGE_CACHE_TTL = 60
CONTAINER_CACHE_TTL = 1.5
PLAYERS_CACHE_TTL = 1.5
LIVE_SNAPSHOT_INTERVAL = 1.5
FILE_TREE_CACHE_TTL = 8.0

ALLOWED_EXTENSIONS = {".cfg", ".txt", ".json", ".md", ".env", ".yml", ".yaml", ".ini", ".log", ".sh", ".xml", ".prefs"}

_metrics_prev: Optional[dict] = None
_disk_usage_cache: Optional[dict] = None
_disk_usage_cache_ts: float = 0.0
_mod_update_cache: dict[str, tuple[float, dict]] = {}
MOD_UPDATE_CACHE_TTL = 300

_container_running_cache: Optional[bool] = None
_container_running_cache_ts: float = 0.0
_players_info_cache: Optional[dict] = None
_players_info_cache_ts: float = 0.0
_live_snapshot: Optional[dict] = None
_live_snapshot_lock = threading.Lock()
_file_tree_cache: dict[str, tuple[float, list]] = {}

_SIZE_UNIT = {
    "B": 1,
    "kB": 1000,
    "KB": 1000,
    "KiB": 1024,
    "MB": 1000**2,
    "MiB": 1024**2,
    "GB": 1000**3,
    "GiB": 1024**3,
    "TB": 1000**4,
    "TiB": 1024**4,
}

LOGS_DIR = PANEL_DATA_DIR / "logs"
MODS_REGISTRY_FILE = PANEL_DATA_DIR / "mods-registry.json"
AUTO_MESSAGES_FILE = PANEL_DATA_DIR / "auto-messages.json"
PLAYERS_SEEN_FILE = PANEL_DATA_DIR / "players-seen.json"
UNLINKABLE_DLLS = frozenset({"YamlDotNetDetector.dll"})
SETUP_FILE = PANEL_DATA_DIR / "setup.json"
APP_MANIFEST_PATH = DATA_DIR / "dl" / "server" / "steamapps" / "appmanifest_896660.acf"
AUDIT_FILE = LOGS_DIR / "audit.jsonl"
AUDIT_MAX_BYTES = 5 * 1024 * 1024
AUDIT_BODY_MAX = 8192
AUDIT_SENSITIVE = ("pass", "secret", "token", "key")

app = FastAPI(title="Vikinger Panel", version=__version__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def ensure_panel_data_dirs() -> None:
    """Garante diretórios graváveis do painel (backups .fwl, staging, auditoria)."""
    for d in (PANEL_DATA_DIR, FWL_BACKUP_DIR, FWL_STAGING_DIR, LOGS_DIR):
        try:
            d.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            logger.warning("Não foi possível criar %s: %s", d, e)


@app.on_event("startup")
def _on_startup() -> None:
    ensure_panel_data_dirs()
    try:
        panel_db.init_db()
    except Exception as e:
        logger.warning("Não foi possível inicializar o banco do painel: %s", e)
    configure_storage_limits()
    configure_auto_messages()
    try:
        panel_scheduler_instance.configure(read_schedule_config())
        panel_scheduler_instance.start()
    except Exception as e:
        logger.warning("Não foi possível iniciar o agendador: %s", e)
    try:
        copied = ensure_bundled_mods(
            bundled_dir=BUNDLED_MODS_DIR,
            plugins_dir=PLUGINS_DIR,
            disabled_dir=PLUGINS_DISABLED_DIR,
        )
        if copied:
            logger.info("Mods embarcados instalados/atualizados: %s", ", ".join(copied))
            sync_plugins_to_runtime()
    except OSError as e:
        logger.warning("Não foi possível instalar mods embarcados: %s", e)
    try:
        maybe_ensure_rcon_password()
    except OSError as e:
        logger.warning("Não foi possível garantir senha RCON: %s", e)
    auto_messages.start_worker()


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    logger.exception("Erro não tratado: %s", exc)
    return JSONResponse(status_code=500, content={"detail": str(exc)})


def configure_storage_limits() -> None:
    storage_limits.configure(
        limits_file=PANEL_DATA_DIR / "storage_limits.json",
        backups_dir=BACKUPS_DIR,
        fwl_backup_dir=FWL_BACKUP_DIR,
        logs_dir=LOGS_DIR,
        audit_file=AUDIT_FILE,
        get_protected_backups=get_protected_backups,
        write_audit=write_audit,
        dir_size_bytes=dir_size_bytes,
    )


def _auto_messages_context() -> dict:
    env = read_env()
    worlds, active, _running, _reconciled = build_worlds_list()
    configured = env.get("WORLD_NAME", "").strip()
    mods = list_mods_data()
    return {
        "server_name": effective_server_name(env),
        "world_name": active or configured,
        "server_port": env.get("SERVER_PORT", "2456"),
        "max_players": str(read_max_players()["max_players"]),
        "server_public": env.get("SERVER_PUBLIC", "true"),
        "mods_count": str(len(mods)),
        "mods_enabled": str(sum(1 for m in mods if m.get("enabled"))),
    }


def _auto_messages_rcon_available() -> bool:
    if not container_running():
        return False
    if not is_plugin_installed(PLUGINS_DIR, PLUGINS_DISABLED_DIR):
        return False
    if not is_mod_enabled(PLUGINS_DIR, PLUGINS_DISABLED_DIR):
        return False
    return _rcon_settings() is not None


def configure_auto_messages() -> None:
    auto_messages.configure(
        messages_file=AUTO_MESSAGES_FILE,
        players_seen_file=PLAYERS_SEEN_FILE,
        get_context=_auto_messages_context,
        get_players=get_players_info,
        send_rcon=_run_rcon,
        rcon_available=_auto_messages_rcon_available,
        container_running=container_running,
    )


def get_protected_backups() -> set[str]:
    state = read_backup_state()
    protected = set()
    for key in ("active", "undo"):
        name = state.get(key)
        if name:
            protected.add(name)
    return protected


def get_storage_monitor_usage() -> dict:
    return {
        "game": {"used_bytes": dir_size_bytes(DATA_DIR / "dl"), "label": "game"},
        "mods": {
            "used_bytes": dir_size_bytes(PLUGINS_DIR) + dir_size_bytes(RUNTIME_PLUGINS_DIR),
            "label": "mods",
        },
        "worlds": {"used_bytes": dir_size_bytes(WORLDS_DIR), "label": "worlds"},
    }


def run_backup_retention() -> None:
    purge_old_backups()
    max_count = int(backup_config().get("BACKUPS_MAX_COUNT", "0") or "0")
    if max_count > 0:
        _purge_backups_by_count(max_count)
    storage_limits.enforce_storage_limit("backups")


# ── Audit log ────────────────────────────────────────────────────────────────

def _sanitize_value(key: str, value):
    if any(s in key.lower() for s in AUDIT_SENSITIVE):
        return "***"
    if isinstance(value, dict):
        return {k: _sanitize_value(k, v) for k, v in value.items()}
    if isinstance(value, list):
        return [_sanitize_value(key, item) for item in value]
    return value


def _sanitize_params(params: dict) -> dict:
    return {k: _sanitize_value(k, v) for k, v in params.items()}


def _parse_audit_body(raw: bytes) -> Optional[dict | str]:
    if not raw:
        return None
    text = raw.decode(errors="replace")
    if len(text) > AUDIT_BODY_MAX:
        text = text[:AUDIT_BODY_MAX] + "…"
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return _sanitize_params(parsed)
        return parsed
    except json.JSONDecodeError:
        return text


def _rotate_audit() -> None:
    try:
        if AUDIT_FILE.exists() and AUDIT_FILE.stat().st_size > AUDIT_MAX_BYTES:
            AUDIT_FILE.replace(AUDIT_FILE.with_suffix(".jsonl.1"))
    except OSError as e:
        logger.warning("Falha ao rotacionar audit log: %s", e)


def write_audit(entry: dict) -> None:
    try:
        LOGS_DIR.mkdir(parents=True, exist_ok=True)
        _rotate_audit()
        with AUDIT_FILE.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except OSError as e:
        logger.warning("Falha ao gravar audit log: %s", e)


AUDIT_PAGE_SIZES = frozenset({10, 25, 50})


def _load_audit_entries() -> list[dict]:
    entries: list[dict] = []
    if not AUDIT_FILE.exists():
        return entries
    try:
        raw = AUDIT_FILE.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return entries
    for line in raw:
        line = line.strip()
        if not line:
            continue
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    entries.reverse()  # mais recentes primeiro
    return entries


def read_audit_paginated(page: int = 1, page_size: int = 10) -> dict:
    all_entries = _load_audit_entries()
    total = len(all_entries)
    total_pages = max(1, (total + page_size - 1) // page_size) if total else 1
    page = min(max(1, page), total_pages)
    start = (page - 1) * page_size
    return {
        "entries": all_entries[start : start + page_size],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    method = request.method
    path = request.url.path
    should_log = method in ("POST", "PUT", "DELETE") and path.startswith("/api/") and not path.startswith("/api/audit")

    if not should_log:
        return await call_next(request)

    request_body_bytes = await request.body()

    async def receive():
        return {"type": "http.request", "body": request_body_bytes, "more_body": False}

    request = Request(request.scope, receive)

    start = time.monotonic()
    response = await call_next(request)
    duration_ms = round((time.monotonic() - start) * 1000, 1)

    body = b""
    async for chunk in response.body_iterator:
        body += chunk

    error = None
    response_body = _parse_audit_body(body)
    if response.status_code >= 400:
        try:
            error = json.loads(body).get("detail")
        except (json.JSONDecodeError, AttributeError):
            error = body.decode(errors="replace")[:300] or None

    write_audit({
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "method": method,
        "path": path,
        "params": _sanitize_params(dict(request.query_params)),
        "request_body": _parse_audit_body(request_body_bytes),
        "response_body": response_body,
        "status": response.status_code,
        "duration_ms": duration_ms,
        "error": error,
    })

    return Response(
        content=body,
        status_code=response.status_code,
        headers=dict(response.headers),
        media_type=response.media_type,
    )


# ── Helpers ──────────────────────────────────────────────────────────────────

def run(cmd: list[str], timeout: int = 120) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout, cwd=str(ROOT)
        )
    except subprocess.TimeoutExpired as e:
        raise HTTPException(504, f"Command timed out after {timeout}s: {' '.join(cmd)}") from e


def docker(*args: str, timeout: int = 120) -> subprocess.CompletedProcess:
    return run(["docker"] + list(args), timeout=timeout)


def _compose_cmd(*args: str) -> list[str]:
    """Prefixo compose: prefere docker-compose (v1) quando o plugin v2 não existe."""
    compose_bin = shutil.which("docker-compose")
    if compose_bin:
        return [compose_bin, "-f", str(COMPOSE_FILE), *args]
    return ["docker", "compose", "-f", str(COMPOSE_FILE), *args]


def docker_compose(*args: str, timeout: int = 180) -> subprocess.CompletedProcess:
    return run(_compose_cmd(*args), timeout=timeout)


def container_exists() -> bool:
    return docker("inspect", CONTAINER_NAME, timeout=5).returncode == 0


def start_valheim_container() -> subprocess.CompletedProcess:
    if container_exists():
        return docker("start", CONTAINER_NAME)
    return docker_compose("up", "-d", COMPOSE_SERVICE)


def stop_valheim_container() -> subprocess.CompletedProcess:
    if container_exists():
        return docker("stop", CONTAINER_NAME)
    return subprocess.CompletedProcess(args=[], returncode=0, stdout="", stderr="")


def restart_valheim_container() -> subprocess.CompletedProcess:
    sync_plugins_to_runtime()
    if container_exists():
        return docker("restart", CONTAINER_NAME)
    return docker_compose("up", "-d", COMPOSE_SERVICE)


def recreate_container() -> subprocess.CompletedProcess:
    return docker_compose("up", "-d", "--force-recreate", COMPOSE_SERVICE)


def _allowed_path_roots() -> tuple[Path, ...]:
    """Raízes permitidas para a API de arquivos — só config/ e data/ (symlinks incluídos)."""
    roots: list[Path] = []
    for d in (CONFIG_DIR, DATA_DIR):
        try:
            if d.exists() or d.is_symlink():
                roots.append(d.resolve())
        except OSError:
            pass
    # dedupe preservando ordem
    seen: set[str] = set()
    unique: list[Path] = []
    for r in roots:
        key = str(r)
        if key not in seen:
            seen.add(key)
            unique.append(r)
    return tuple(unique)


def _path_is_under(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def safe_path(relative: str) -> Path:
    """Resolve a relative path and ensure it stays inside allowed roots."""
    rel = relative.lstrip("/").replace("\\", "/")
    if ".." in rel.split("/"):
        raise HTTPException(400, "Invalid path")
    top = rel.split("/")[0] if rel else ""
    if top not in ("config", "data"):
        raise HTTPException(403, "Access denied")
    logical = ROOT / rel if rel else ROOT
    if not _path_is_under(logical, ROOT):
        raise HTTPException(403, "Access denied")
    target = logical.resolve()
    if not any(_path_is_under(target, root) for root in _allowed_path_roots()):
        raise HTTPException(403, "Access denied")
    return target


def read_env() -> dict[str, str]:
    if not ENV_FILE.exists():
        return {}
    return {k: v for k, v in dotenv_values(ENV_FILE).items() if v is not None}


def write_env(updates: dict[str, str]) -> None:
    ENV_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not ENV_FILE.exists():
        ENV_FILE.touch()
    for key, value in updates.items():
        set_key(str(ENV_FILE), key, value)


def container_running(force_refresh: bool = False) -> bool:
    global _container_running_cache, _container_running_cache_ts
    now = time.time()
    if (
        not force_refresh
        and _container_running_cache is not None
        and now - _container_running_cache_ts < CONTAINER_CACHE_TTL
    ):
        return _container_running_cache
    r = docker("inspect", "-f", "{{.State.Running}}", CONTAINER_NAME)
    result = r.returncode == 0 and r.stdout.strip() == "true"
    _container_running_cache = result
    _container_running_cache_ts = now
    return result


def supervisor_status() -> dict[str, str]:
    if not container_running():
        return {}
    r = docker("exec", CONTAINER_NAME, "supervisorctl", "status")
    if not r.stdout.strip():
        return {}
    result = {}
    for line in r.stdout.strip().splitlines():
        parts = line.split()
        if len(parts) >= 2:
            result[parts[0]] = parts[1]
    return result


def server_process_status() -> str:
    if not container_running():
        return "offline"
    r = docker("exec", CONTAINER_NAME, "cat", "/var/run/valheim/valheim-server.status")
    if r.returncode == 0:
        return r.stdout.strip() or "unknown"
    sup = supervisor_status()
    vs = sup.get("valheim-server", "UNKNOWN")
    if vs == "RUNNING":
        return "running"
    if vs == "STOPPED":
        return "stopped"
    return vs.lower()


def parse_docker_size(value: str) -> int:
    """Converte tamanhos do docker stats (ex.: 1.098GiB) para bytes."""
    value = value.strip()
    if not value:
        return 0
    m = re.match(r"^([\d.]+)\s*([A-Za-z]+)$", value)
    if not m:
        return 0
    num, unit = float(m.group(1)), m.group(2)
    mult = _SIZE_UNIT.get(unit, 1)
    return int(num * mult)


def parse_io_pair(raw: str) -> tuple[int, int]:
    """Parse pares rx/tx ou read/write do docker stats."""
    parts = [p.strip() for p in raw.split("/")]
    if len(parts) != 2:
        return 0, 0
    return parse_docker_size(parts[0]), parse_docker_size(parts[1])


def parse_mem_usage(raw: str) -> tuple[int, int]:
    parts = [p.strip() for p in raw.split("/")]
    if len(parts) != 2:
        return 0, 0
    return parse_docker_size(parts[0]), parse_docker_size(parts[1])


def dir_size_bytes(path: Path) -> int:
    if not path.is_dir():
        return 0
    r = run(["du", "-sb", str(path)], timeout=30)
    if r.returncode != 0 or not r.stdout.strip():
        return 0
    return int(r.stdout.split()[0])


def get_valheim_disk_usage(force_refresh: bool = False) -> dict:
    global _disk_usage_cache, _disk_usage_cache_ts
    now = time.time()
    if (
        not force_refresh
        and _disk_usage_cache is not None
        and now - _disk_usage_cache_ts < DISK_USAGE_CACHE_TTL
    ):
        return _disk_usage_cache
    config_bytes = dir_size_bytes(CONFIG_DIR)
    data_bytes = dir_size_bytes(DATA_DIR)
    fwl_backup_bytes = dir_size_bytes(FWL_BACKUP_DIR)
    game_bytes = dir_size_bytes(DATA_DIR / "dl")
    mods_bytes = dir_size_bytes(PLUGINS_DIR) + dir_size_bytes(RUNTIME_PLUGINS_DIR)
    worlds_bytes = dir_size_bytes(WORLDS_DIR)
    backups_bytes = dir_size_bytes(BACKUPS_DIR) + fwl_backup_bytes
    result = {
        "config_bytes": config_bytes,
        "data_bytes": data_bytes,
        "game_bytes": game_bytes,
        "mods_bytes": mods_bytes,
        "worlds_bytes": worlds_bytes,
        "backups_bytes": backups_bytes,
        "total_bytes": config_bytes + data_bytes + fwl_backup_bytes,
    }
    _disk_usage_cache = result
    _disk_usage_cache_ts = now
    return result


def get_valheim_disk_usage_cached() -> Optional[dict]:
    """Retorna último valor conhecido de disco sem recalcular (stale-while-revalidate)."""
    return _disk_usage_cache


def get_cpu_count() -> int:
    return os.cpu_count() or 1


def get_container_pid() -> Optional[int]:
    r = docker("inspect", "-f", "{{.State.Pid}}", CONTAINER_NAME, timeout=5)
    if r.returncode != 0 or not r.stdout.strip():
        return None
    try:
        pid = int(r.stdout.strip())
    except ValueError:
        return None
    return pid if pid > 0 else None


def read_container_net_bytes(pid: int) -> tuple[int, int]:
    """Contadores rx/tx do namespace de rede do container via /proc/{pid}/net/dev."""
    path = Path(f"/proc/{pid}/net/dev")
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return 0, 0
    rx_total = tx_total = 0
    for line in lines[2:]:
        if ":" not in line:
            continue
        iface, rest = line.split(":", 1)
        if iface.strip() == "lo":
            continue
        parts = rest.split()
        if len(parts) < 9:
            continue
        rx_total += int(parts[0])
        tx_total += int(parts[8])
    return rx_total, tx_total


def normalize_valheim_cpu(docker_percent: float) -> float:
    """CPUPerc do docker stats já é % do host; só normaliza se >100 (formato legado multi-core)."""
    if docker_percent > 100.0:
        count = get_cpu_count()
        return round(min(docker_percent / count, 100.0), 1)
    return round(min(docker_percent, 100.0), 1)


def get_container_metrics_raw() -> dict:
    """Snapshot bruto do container (sem taxas)."""
    empty = {
        "running": False,
        "cpu_percent": 0.0,
        "memory_used_bytes": 0,
        "memory_limit_bytes": 0,
        "memory_percent": 0.0,
        "net_rx_bytes": 0,
        "net_tx_bytes": 0,
        "block_read_bytes": 0,
        "block_write_bytes": 0,
    }
    if not container_running():
        return empty

    r = docker("stats", CONTAINER_NAME, "--no-stream", "--format", "{{json .}}", timeout=10)
    if r.returncode != 0 or not r.stdout.strip():
        return empty

    try:
        stats = json.loads(r.stdout.strip())
    except json.JSONDecodeError:
        return empty

    mem_used, mem_limit = parse_mem_usage(stats.get("MemUsage", ""))
    pid = get_container_pid()
    net_rx, net_tx = read_container_net_bytes(pid) if pid else (0, 0)
    if net_rx == 0 and net_tx == 0:
        # Fallback: dentro de um container o /proc/<pid_host> pode não ser acessível.
        # Usa o contador NetIO do docker stats (menos preciso, mas resiliente).
        net_rx, net_tx = parse_io_pair(stats.get("NetIO", ""))
    block_read, block_write = parse_io_pair(stats.get("BlockIO", ""))
    cpu_str = stats.get("CPUPerc", "0%").replace("%", "").strip()
    try:
        cpu_percent = float(cpu_str)
    except ValueError:
        cpu_percent = 0.0

    mem_pct_str = stats.get("MemPerc", "0%").replace("%", "").strip()
    try:
        memory_percent = float(mem_pct_str)
    except ValueError:
        memory_percent = (mem_used / mem_limit * 100) if mem_limit else 0.0

    return {
        "running": True,
        "cpu_percent": cpu_percent,
        "memory_used_bytes": mem_used,
        "memory_limit_bytes": mem_limit,
        "memory_percent": memory_percent,
        "net_rx_bytes": net_rx,
        "net_tx_bytes": net_tx,
        "block_read_bytes": block_read,
        "block_write_bytes": block_write,
    }


def compute_rates(current: dict, previous: dict, dt: float) -> dict:
    if dt <= 0:
        return {"rx_bps": 0, "tx_bps": 0, "disk_read_bps": 0, "disk_write_bps": 0}

    def rate(cur_key: str, prev_key: str) -> int:
        delta = current.get(cur_key, 0) - previous.get(prev_key, 0)
        if delta < 0:
            delta = 0
        return int(delta / dt)

    return {
        "rx_bps": rate("net_rx_bytes", "net_rx_bytes"),
        "tx_bps": rate("net_tx_bytes", "net_tx_bytes"),
        "disk_read_bps": rate("block_read_bytes", "block_read_bytes"),
        "disk_write_bps": rate("block_write_bytes", "block_write_bytes"),
    }


# ── CPU normalization + panel/aggregate metrics ──────────────────────────────
PANEL_CONTAINER_NAME = "vikinger-panel"
_cpu_smoother = docker_metrics.SampleSmoother(window=5)


def cpu_block(container_key: str, host_percent: float, n_cpus: int) -> dict:
    """Expose host %, of-limit % (host/n_cpus, capped 100) and a smoothed value.

    ``percent`` (kept for backward-compat with the UI) is the *smoothed
    of-limit* figure — stable 0-100 that fixes the wild 80%->0% flicker.
    """
    norm = docker_metrics.normalize_cpu(host_percent, n_cpus)
    smoothed = _cpu_smoother.add(container_key, norm["cpu_percent_of_limit"])
    return {
        "percent": round(smoothed, 1),
        "raw_percent": norm["cpu_percent_host"],
        "percent_host": norm["cpu_percent_host"],
        "percent_of_limit": norm["cpu_percent_of_limit"],
        "percent_smoothed": round(smoothed, 1),
    }


def panel_container_metrics() -> dict:
    """Metrics for the panel's own container (vikinger-panel)."""
    try:
        m = docker_metrics.stats_for_container(
            PANEL_CONTAINER_NAME, docker_fn=docker, n_cpus=get_cpu_count()
        )
    except Exception:  # pragma: no cover - defensive
        m = None
    return m or docker_metrics._empty_metrics()


def read_memory_limit_gb() -> Optional[int]:
    if not COMPOSE_FILE.exists():
        return None
    text = COMPOSE_FILE.read_text(encoding="utf-8")
    m = re.search(r"^\s*mem_limit:\s*(\d+)\s*[gG]\s*$", text, re.MULTILINE)
    return int(m.group(1)) if m else None


def write_memory_limit_gb(gb: Optional[int]) -> None:
    if not COMPOSE_FILE.exists():
        raise HTTPException(404, "docker-compose.yml not found")

    text = COMPOSE_FILE.read_text(encoding="utf-8")
    text = re.sub(r"^\s*mem_limit:.*\n", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*memswap_limit:.*\n", "", text, flags=re.MULTILINE)

    if gb is not None:
        insert = f"    mem_limit: {gb}g\n    memswap_limit: {gb}g\n"
        if re.search(r"^\s*stop_grace_period:", text, re.MULTILINE):
            text = re.sub(
                r"(^\s*stop_grace_period:.*\n)",
                rf"\1{insert}",
                text,
                count=1,
                flags=re.MULTILINE,
            )
        else:
            text = re.sub(
                r"(^\s*container_name:\s*valheim-server\n)",
                rf"\1{insert}",
                text,
                count=1,
                flags=re.MULTILINE,
            )

    COMPOSE_FILE.write_text(text, encoding="utf-8")


VALHEIM_PLUS_CFG = BEPINEX_CFG_DIR / "valheim_plus.cfg"
MAX_PLAYER_COUNT_CFG = BEPINEX_CFG_DIR / "Azumatt.MaxPlayerCount.cfg"

RAM_SUGGESTIONS = [
    {"players_min": 1, "players_max": 2, "ram_gb": 2, "notes": "New world ~1.8–2.4 GB (Valheim wiki)"},
    {"players_min": 3, "players_max": 5, "ram_gb": 4, "notes": "Small vanilla group"},
    {"players_min": 6, "players_max": 10, "ram_gb": 8, "notes": "Vanilla cap (10 players)"},
    {"players_min": 11, "players_max": 20, "ram_gb": 12, "notes": "Requires mod; +1–2 GB with crossplay"},
    {"players_min": 21, "players_max": 999, "ram_gb": 16, "notes": "High lag risk; not recommended"},
]


def suggested_ram_gb_for_players(count: int) -> int:
    for row in RAM_SUGGESTIONS:
        if row["players_min"] <= count <= row["players_max"]:
            return row["ram_gb"]
    return RAM_SUGGESTIONS[-1]["ram_gb"]


def _cfg_section_enabled(text: str, section: str) -> bool:
    m = re.search(
        rf"^\[{re.escape(section)}\]\s*$([\s\S]*?)(?=^\[|\Z)",
        text,
        re.MULTILINE,
    )
    if not m:
        return False
    block = m.group(1)
    em = re.search(r"^\s*enabled\s*=\s*(\w+)", block, re.MULTILINE | re.IGNORECASE)
    return em is not None and em.group(1).lower() in ("true", "1", "yes")


def _read_cfg_key(text: str, key: str, section: Optional[str] = None) -> Optional[str]:
    if section:
        m = re.search(
            rf"^\[{re.escape(section)}\]\s*$([\s\S]*?)(?=^\[|\Z)",
            text,
            re.MULTILINE,
        )
        if not m:
            return None
        scope = m.group(1)
    else:
        scope = text
    km = re.search(rf"^\s*{re.escape(key)}\s*=\s*(\S+)", scope, re.MULTILINE | re.IGNORECASE)
    return km.group(1) if km else None


def _write_cfg_key(text: str, section: str, key: str, value: str, enable_section: bool = False) -> str:
    sec_re = rf"^\[{re.escape(section)}\]\s*$"
    if re.search(sec_re, text, re.MULTILINE):
        block_m = re.search(
            rf"({sec_re})([\s\S]*?)(?=^\[|\Z)",
            text,
            re.MULTILINE,
        )
        assert block_m
        header, block = block_m.group(1), block_m.group(2)
        if enable_section and not re.search(r"^\s*enabled\s*=", block, re.MULTILINE | re.IGNORECASE):
            block = "\nenabled=true" + block
        elif enable_section:
            block = re.sub(
                r"^\s*enabled\s*=\s*\S+",
                "enabled=true",
                block,
                count=1,
                flags=re.MULTILINE | re.IGNORECASE,
            )
        if re.search(rf"^\s*{re.escape(key)}\s*=", block, re.MULTILINE | re.IGNORECASE):
            block = re.sub(
                rf"^\s*{re.escape(key)}\s*=\s*\S+",
                f"{key}={value}",
                block,
                count=1,
                flags=re.MULTILINE | re.IGNORECASE,
            )
        else:
            block = block.rstrip() + f"\n{key}={value}\n"
        return text[: block_m.start()] + header + block + text[block_m.end() :]
    insert = f"\n[{section}]\n"
    if enable_section:
        insert += "enabled=true\n"
    insert += f"{key}={value}\n"
    return text.rstrip() + insert


def detect_player_mod() -> dict:
    """Detecta mod que permite >10 jogadores."""
    if MAX_PLAYER_COUNT_CFG.exists():
        return {"source": "MaxPlayerCount", "cap": 64, "cfg": MAX_PLAYER_COUNT_CFG}
    if VALHEIM_PLUS_CFG.exists():
        return {"source": "ValheimPlus", "cap": 64, "cfg": VALHEIM_PLUS_CFG}
    if PLUGINS_DIR.exists():
        for dll in PLUGINS_DIR.glob("*.dll"):
            low = dll.name.lower()
            if "maxplayercount" in low:
                return {"source": "MaxPlayerCount", "cap": 64, "cfg": MAX_PLAYER_COUNT_CFG}
            if "valheimplus" in low or "valheim_plus" in low:
                return {"source": "ValheimPlus", "cap": 64, "cfg": VALHEIM_PLUS_CFG}
    return {"source": None, "cap": VANILLA_MAX_PLAYERS, "cfg": None}


def read_max_players() -> dict:
    mod = detect_player_mod()
    env = read_env()
    env_val = env.get("MAX_PLAYERS", "").strip()
    count = VANILLA_MAX_PLAYERS
    if env_val.isdigit():
        count = int(env_val)
    cfg_path = mod.get("cfg")
    if cfg_path and Path(cfg_path).exists():
        text = Path(cfg_path).read_text(encoding="utf-8", errors="replace")
        if mod["source"] == "ValheimPlus":
            raw = _read_cfg_key(text, "maxPlayers", "Server")
        else:
            raw = _read_cfg_key(text, "maxPlayers") or _read_cfg_key(text, "MaxPlayers")
        if raw and raw.isdigit():
            count = int(raw)
    count = max(1, min(count, mod["cap"]))
    return {
        "max_players": count,
        "max_players_cap": mod["cap"],
        "mod_source": mod["source"],
        "requires_mod": count > VANILLA_MAX_PLAYERS,
    }


def write_max_players(count: int) -> dict:
    if count < 1:
        raise HTTPException(400, "Player limit must be at least 1")
    mod = detect_player_mod()
    if count > VANILLA_MAX_PLAYERS and not mod["source"]:
        raise HTTPException(
            400,
            "Above 10 players requires Valheim Plus or the MaxPlayerCount mod (BepInEx).",
        )
    if count > mod["cap"]:
        raise HTTPException(400, f"Maximum allowed limit: {mod['cap']} players")

    write_env({"MAX_PLAYERS": str(count)})

    cfg_path = mod.get("cfg")
    if mod["source"] == "ValheimPlus":
        path = VALHEIM_PLUS_CFG
        text = path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""
        text = _write_cfg_key(text, "Server", "maxPlayers", str(count), enable_section=True)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    elif mod["source"] == "MaxPlayerCount":
        path = MAX_PLAYER_COUNT_CFG
        text = path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""
        text = _write_cfg_key(text, "General", "maxPlayers", str(count))
        if "maxPlayers" not in text and "MaxPlayers" not in text:
            text = _write_cfg_key(text, "General", "MaxPlayers", str(count))
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")

    return read_max_players()


def capacity_ram_warning(memory_gb: Optional[int], max_players: int) -> Optional[str]:
    suggested = suggested_ram_gb_for_players(max_players)
    if memory_gb is None:
        return None
    if memory_gb < suggested:
        return (
            f"For {max_players} player(s), at least {suggested} GB of RAM is recommended "
            f"(configured: {memory_gb} GB)."
        )
    return None


def build_capacity_response() -> dict:
    gb = read_memory_limit_gb()
    players = read_max_players()
    suggested = suggested_ram_gb_for_players(players["max_players"])
    warning = capacity_ram_warning(gb, players["max_players"])
    env = read_env()
    crossplay = "-crossplay" in env.get("SERVER_ARGS", "").lower()
    if crossplay and players["max_players"] >= 6:
        suggested = min(MEMORY_MAX_GB, suggested + 2)
    return {
        "memory_gb": gb,
        "memory_unlimited": gb is None,
        "memory_min_gb": MEMORY_MIN_GB,
        "memory_max_gb": MEMORY_MAX_GB,
        "memory_slider_max": MEMORY_UNLIMITED_SLIDER,
        "max_players": players["max_players"],
        "max_players_cap": players["max_players_cap"],
        "mod_source": players["mod_source"],
        "requires_mod": players["requires_mod"],
        "suggested_ram_gb": suggested,
        "warning": warning,
        "suggestions": RAM_SUGGESTIONS,
        "crossplay": crossplay,
    }


UPDATE_DEFAULT_CRON = "*/15 * * * *"
UPDATE_ENV_KEYS = ("UPDATE_CRON", "UPDATE_IF_IDLE")
UPDATE_DEFAULTS = {
    "UPDATE_CRON": UPDATE_DEFAULT_CRON,
    "UPDATE_IF_IDLE": "true",
}


def update_config() -> dict[str, str]:
    env = read_env()
    cron = env.get("UPDATE_CRON", UPDATE_DEFAULT_CRON)
    auto = bool(cron.strip()) if cron is not None else True
    return {
        "UPDATE_AUTO": "true" if auto else "false",
        "UPDATE_IF_IDLE": env.get("UPDATE_IF_IDLE", UPDATE_DEFAULTS["UPDATE_IF_IDLE"]),
        "UPDATE_CRON": cron.strip() if cron and cron.strip() else UPDATE_DEFAULT_CRON,
    }


def write_update_config(values: dict[str, str]) -> None:
    updates: dict[str, str] = {}
    auto = values.get("UPDATE_AUTO", "true").lower() in ("true", "1", "yes")
    if auto:
        updates["UPDATE_CRON"] = values.get("UPDATE_CRON", UPDATE_DEFAULT_CRON).strip() or UPDATE_DEFAULT_CRON
    else:
        updates["UPDATE_CRON"] = ""
    if "UPDATE_IF_IDLE" in values:
        updates["UPDATE_IF_IDLE"] = values["UPDATE_IF_IDLE"]
    write_env(updates)


def read_bepinex_compose() -> bool:
    if not COMPOSE_FILE.exists():
        return False
    text = COMPOSE_FILE.read_text(encoding="utf-8")
    match = re.search(r'^\s*BEPINEX:\s*["\']?(true|false)["\']?\s*$', text, re.MULTILINE | re.IGNORECASE)
    return match.group(1).lower() == "true" if match else False


def write_bepinex_compose(enabled: bool) -> None:
    if not COMPOSE_FILE.exists():
        raise HTTPException(404, "docker-compose.yml not found")
    val = "true" if enabled else "false"
    text = COMPOSE_FILE.read_text(encoding="utf-8")
    if re.search(r"^\s*BEPINEX:", text, re.MULTILINE):
        text = re.sub(
            r'^\s*BEPINEX:.*$',
            f'      BEPINEX: "{val}"',
            text,
            count=1,
            flags=re.MULTILINE,
        )
    else:
        text = re.sub(
            r"(^\s*environment:\s*\n)",
            rf'\1      BEPINEX: "{val}"\n',
            text,
            count=1,
            flags=re.MULTILINE,
        )
    COMPOSE_FILE.write_text(text, encoding="utf-8")


def _set_mod_enabled(name: str, enabled: bool) -> bool:
    """Move mod entre plugins/ e plugins/disabled/. Retorna True se houve alteração."""
    found = find_mod(name)
    if not found:
        return False
    path, currently_enabled = found
    if currently_enabled == enabled:
        return False
    dest_dir = PLUGINS_DIR if enabled else PLUGINS_DISABLED_DIR
    dest_dir.mkdir(parents=True, exist_ok=True)
    shutil.move(str(path), str(dest_dir / name))
    return True


def _disable_all_mods() -> int:
    """Desabilita todas as DLLs em plugins/."""
    ensure_plugins_writable()
    PLUGINS_DISABLED_DIR.mkdir(parents=True, exist_ok=True)
    count = 0
    if PLUGINS_DIR.exists():
        for dll in list(PLUGINS_DIR.glob("*.dll")):
            shutil.move(str(dll), str(PLUGINS_DISABLED_DIR / dll.name))
            count += 1
    return count


def _enable_bundled_mods() -> list[str]:
    """Habilita apenas mods embarcados (ValheimRcon)."""
    ensure_plugins_writable()
    PLUGINS_DISABLED_DIR.mkdir(parents=True, exist_ok=True)
    enabled: list[str] = []
    for dll_name in BUNDLED_MODS:
        src = BUNDLED_MODS_DIR / dll_name
        if not src.exists() and not find_mod(dll_name):
            continue
        if _set_mod_enabled(dll_name, True):
            enabled.append(dll_name)
        elif not find_mod(dll_name) and src.exists():
            shutil.copy2(src, PLUGINS_DIR / dll_name)
            enabled.append(dll_name)
    return enabled


def apply_server_mode(bepinex: bool) -> dict:
    """Aplica modo vanilla (BepInEx off, todos mods disabled) ou modded (BepInEx on, bundled on)."""
    if read_bepinex_compose() != bepinex:
        write_bepinex_compose(bepinex)

    rcon_result = {"created": False, "password": None}
    if bepinex:
        mods_enabled = _enable_bundled_mods()
        mods_disabled = 0
        env = read_env()
        server_port = int(env.get("SERVER_PORT", "2456") or 2456)
        rcon_result = ensure_rcon_config(cfg_dir=BEPINEX_CFG_DIR, server_port=server_port)
    else:
        mods_enabled = []
        mods_disabled = _disable_all_mods()

    sync_plugins_to_runtime()
    return {
        "bepinex": bepinex,
        "mods_disabled": mods_disabled,
        "mods_enabled": mods_enabled,
        "rcon": rcon_result,
    }


def read_setup() -> dict:
    if not SETUP_FILE.exists():
        return {}
    try:
        return json.loads(SETUP_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def write_setup(data: dict) -> None:
    PANEL_DATA_DIR.mkdir(parents=True, exist_ok=True)
    SETUP_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _has_worlds() -> bool:
    if not WORLDS_DIR.exists():
        return False
    return any(WORLDS_DIR.glob("*.fwl"))


def migrate_setup_if_needed() -> dict:
    """Marca setup como concluído em instalações existentes (mundos já criados)."""
    setup = read_setup()
    if setup.get("completed"):
        return setup
    if _has_worlds():
        mode = "bepinex" if read_bepinex_compose() else "vanilla"
        setup = {
            "completed": True,
            "mode": mode,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "migrated": True,
        }
        write_setup(setup)
        if mode == "bepinex":
            maybe_ensure_rcon_password()
    return setup


def maybe_ensure_rcon_password() -> dict:
    """Gera senha RCON automaticamente quando BepInEx e ValheimRcon estão ativos."""
    if not read_bepinex_compose():
        return {"created": False, "password": None}
    if not is_mod_enabled(PLUGINS_DIR, PLUGINS_DISABLED_DIR):
        return {"created": False, "password": None}
    env = read_env()
    server_port = int(env.get("SERVER_PORT", "2456") or 2456)
    result = ensure_rcon_config(cfg_dir=BEPINEX_CFG_DIR, server_port=server_port)
    if result.get("created"):
        logger.info("Senha RCON gerada automaticamente em %s", BEPINEX_CFG_DIR / "org.tristan.rcon.cfg")
    return result


def read_game_version() -> dict:
    if not APP_MANIFEST_PATH.exists():
        return {"buildid": None, "last_updated": None}
    content = APP_MANIFEST_PATH.read_text(encoding="utf-8", errors="replace")
    buildid = None
    last_updated_ts = None
    for line in content.splitlines():
        if '"buildid"' in line:
            match = re.search(r'"buildid"\s+"(\d+)"', line)
            if match:
                buildid = match.group(1)
        if '"LastUpdated"' in line:
            match = re.search(r'"LastUpdated"\s+"(\d+)"', line)
            if match:
                last_updated_ts = int(match.group(1))
    return {
        "buildid": buildid,
        "last_updated": datetime.fromtimestamp(last_updated_ts).isoformat() if last_updated_ts else None,
    }


def trigger_game_update_check() -> str:
    if not container_running():
        raise HTTPException(400, "Container is not running")
    r = docker("exec", CONTAINER_NAME, "supervisorctl", "signal", "HUP", "valheim-updater")
    output = (r.stdout + r.stderr).strip()
    if r.returncode != 0:
        raise HTTPException(500, output or "Failed to request update check")
    return output


def read_mods_registry() -> dict:
    if not MODS_REGISTRY_FILE.exists():
        return {"packages": []}
    try:
        data = json.loads(MODS_REGISTRY_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {"packages": []}
    if not isinstance(data.get("packages"), list):
        return {"packages": []}
    return data


def write_mods_registry(data: dict) -> None:
    ensure_panel_data_dirs()
    MODS_REGISTRY_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def normalize_thunderstore_url(url: str) -> str:
    raw = url.strip().split("#", 1)[0].split("?", 1)[0].strip()
    return raw


def parse_thunderstore_package_ref(url: str) -> tuple[str, str, Optional[str]] | None:
    raw = normalize_thunderstore_url(url)
    ror2mm = ROR2MM_RE.match(raw)
    if ror2mm:
        return ror2mm.group("owner"), ror2mm.group("name"), ror2mm.group("version")
    page = THUNDERSTORE_PAGE_RE.match(raw)
    if page:
        return page.group("owner"), page.group("name"), None
    download = THUNDERSTORE_DOWNLOAD_RE.match(raw)
    if download:
        return download.group("owner"), download.group("name"), download.group("version")
    gcdn = parse_gcdn_thunderstore_url(raw)
    if gcdn:
        return gcdn
    return None


def parse_thunderstore_from_download_url(url: str) -> tuple[str, str, Optional[str]] | None:
    raw = normalize_thunderstore_url(url)
    download = THUNDERSTORE_DOWNLOAD_RE.match(raw)
    if download:
        return download.group("owner"), download.group("name"), download.group("version")
    return parse_gcdn_thunderstore_url(raw)


def compare_versions(installed: str, latest: str) -> int:
    if installed == latest:
        return 0

    def parts(v: str) -> list:
        return [int(x) if x.isdigit() else x.lower() for x in re.split(r"[.\-_]", v) if x]

    a, b = parts(installed), parts(latest)
    for i in range(max(len(a), len(b))):
        pa = a[i] if i < len(a) else 0
        pb = b[i] if i < len(b) else 0
        if pa == pb:
            continue
        if isinstance(pa, int) and isinstance(pb, int):
            return -1 if pa < pb else 1
        sa, sb = str(pa), str(pb)
        if sa == sb:
            continue
        return -1 if sa < sb else 1
    return 0


def register_mod_package(
    owner: str,
    name: str,
    version: str,
    dlls: list[str],
    source_url: str,
) -> None:
    registry = read_mods_registry()
    package_id = f"{owner}/{name}"
    packages = registry.get("packages", [])
    entry = {
        "id": package_id,
        "owner": owner,
        "name": name,
        "version": version,
        "dlls": sorted(set(dlls)),
        "source_url": source_url,
        "installed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "latest_version": version,
        "update_status": "up_to_date",
    }
    replaced = False
    for idx, pkg in enumerate(packages):
        if pkg.get("id") == package_id:
            packages[idx] = entry
            replaced = True
            break
    if not replaced:
        packages.append(entry)
    registry["packages"] = packages
    write_mods_registry(registry)


def find_package_for_dll(dll_name: str) -> dict | None:
    for pkg in read_mods_registry().get("packages", []):
        if dll_name in (pkg.get("dlls") or []):
            return pkg
    return None


def remove_dll_from_registry(dll_name: str) -> None:
    registry = read_mods_registry()
    packages = registry.get("packages", [])
    changed = False
    for pkg in packages:
        dlls = pkg.get("dlls") or []
        if dll_name in dlls:
            pkg["dlls"] = [d for d in dlls if d != dll_name]
            changed = True
    registry["packages"] = [p for p in packages if p.get("dlls")]
    if changed:
        write_mods_registry(registry)


def check_mod_update_for_package(pkg: dict, use_cache: bool = True) -> dict:
    owner = pkg.get("owner", "")
    name = pkg.get("name", "")
    cache_key = f"{owner}/{name}"
    if use_cache and cache_key in _mod_update_cache:
        cached_at, cached = _mod_update_cache[cache_key]
        if time.time() - cached_at < MOD_UPDATE_CACHE_TTL:
            return cached

    try:
        info = fetch_thunderstore_package_info(owner, name)
    except HTTPException:
        result = {
            "update_status": "error",
            "installed_version": pkg.get("version"),
            "latest_version": pkg.get("latest_version"),
            "update_available": False,
        }
        _mod_update_cache[cache_key] = (time.time(), result)
        return result

    installed = pkg.get("version") or ""
    latest = info.get("latest_version") or ""
    cmp = compare_versions(installed, latest) if installed and latest else (0 if installed == latest else -1)
    update_available = cmp < 0
    status = "update_available" if update_available else "up_to_date"
    result = {
        "update_status": status,
        "installed_version": installed,
        "latest_version": latest,
        "update_available": update_available,
        "download_url": info.get("download_url"),
    }
    _mod_update_cache[cache_key] = (time.time(), result)

    registry = read_mods_registry()
    for item in registry.get("packages", []):
        if item.get("id") == pkg.get("id"):
            item["latest_version"] = latest
            item["update_status"] = status
    write_mods_registry(registry)
    return result


def is_unlinkable_mod(name: str) -> bool:
    return name in UNLINKABLE_DLLS


def enrich_mod_entry(entry: dict) -> dict:
    pkg = find_package_for_dll(entry["name"])
    if not pkg:
        unlinkable = is_unlinkable_mod(entry["name"])
        entry.update({
            "package_id": None,
            "installed_version": None,
            "latest_version": None,
            "update_available": False,
            "update_status": "dependency" if unlinkable else "unknown",
            "linkable": not unlinkable,
        })
        return entry
    entry.update({
        "package_id": pkg.get("id"),
        "installed_version": pkg.get("version"),
        "latest_version": pkg.get("latest_version") or pkg.get("version"),
        "update_available": pkg.get("update_status") == "update_available",
        "update_status": pkg.get("update_status", "unknown"),
        "linkable": True,
    })
    return entry


def list_mods_enriched() -> list[dict]:
    return [enrich_mod_entry(m) for m in list_mods_data()]


def apply_mod_package_update(pkg: dict) -> dict:
    check = check_mod_update_for_package(pkg, use_cache=False)
    if not check.get("update_available"):
        return {
            "package_id": pkg.get("id"),
            "updated": False,
            "message": "Mod is already on the latest version",
        }

    download_url = check.get("download_url")
    if not download_url:
        info = fetch_thunderstore_package_info(pkg["owner"], pkg["name"])
        download_url = info["download_url"]

    ensure_plugins_writable()
    data = download_mod_bytes(download_url)
    for dll in pkg.get("dlls") or []:
        for enabled in (True, False):
            path = mod_path(dll, enabled)
            if path.exists():
                path.unlink()

    installed = extract_dlls_from_zip(data, PLUGINS_DIR)
    if not installed:
        raise HTTPException(400, "No .dll found in the updated package")

    latest = check.get("latest_version") or pkg.get("version") or ""
    register_mod_package(
        pkg["owner"],
        pkg["name"],
        latest,
        installed,
        pkg.get("source_url") or "",
    )
    package_id = pkg.get("id") or f"{pkg.get('owner')}/{pkg.get('name')}"
    dispatch_alert("mod_updated", {"mod": package_id, "version": latest})
    return {
        "package_id": package_id,
        "updated": True,
        "installed": installed,
        "version": latest,
        "message": "Mod updated. Restart the server to apply.",
    }


def check_all_mod_updates() -> dict:
    packages = read_mods_registry().get("packages", [])
    if not packages:
        return {
            "ok": True,
            "checked": 0,
            "updates_available": 0,
            "up_to_date": 0,
            "errors": 0,
            "results": [],
            "message": "No linked Thunderstore packages",
        }

    results: list[dict] = []
    updates_available = 0
    up_to_date = 0
    errors = 0
    for pkg in packages:
        result = check_mod_update_for_package(pkg, use_cache=False)
        status = result.get("update_status")
        if status == "error":
            errors += 1
        elif result.get("update_available"):
            updates_available += 1
        else:
            up_to_date += 1
        results.append({
            "package_id": pkg.get("id"),
            **result,
        })

    return {
        "ok": True,
        "checked": len(packages),
        "updates_available": updates_available,
        "up_to_date": up_to_date,
        "errors": errors,
        "results": results,
    }


def update_all_mod_packages() -> dict:
    packages = read_mods_registry().get("packages", [])
    if not packages:
        return {
            "ok": True,
            "updated": 0,
            "failed": 0,
            "skipped": 0,
            "results": [],
            "message": "No linked Thunderstore packages",
        }

    results: list[dict] = []
    updated = 0
    failed = 0
    skipped = 0
    for pkg in packages:
        package_id = pkg.get("id")
        try:
            check = check_mod_update_for_package(pkg, use_cache=False)
            if not check.get("update_available"):
                skipped += 1
                results.append({
                    "package_id": package_id,
                    "updated": False,
                    "message": "Already on the latest version",
                })
                continue
            result = apply_mod_package_update(pkg)
            if result.get("updated"):
                updated += 1
            else:
                skipped += 1
            results.append(result)
        except HTTPException as exc:
            failed += 1
            results.append({
                "package_id": package_id,
                "updated": False,
                "error": exc.detail,
            })
        except Exception as exc:
            failed += 1
            results.append({
                "package_id": package_id,
                "updated": False,
                "error": str(exc),
            })

    return {
        "ok": True,
        "updated": updated,
        "failed": failed,
        "skipped": skipped,
        "results": results,
    }


def get_logs(lines: int = 100) -> str:
    r = docker("logs", CONTAINER_NAME, "--tail", str(lines))
    return clean_docker_logs(r.stdout + r.stderr)


def bepinex_log(lines: int = 80) -> str:
    log_path = ROOT / "data" / "bepinex" / "BepInEx" / "LogOutput.log"
    if not log_path.exists():
        return ""
    content = log_path.read_text(errors="replace")
    return "\n".join(content.splitlines()[-lines:])


def list_serverlists() -> dict[str, list[str]]:
    lists = {}
    for kind in ("admin", "banned", "permitted"):
        path = CONFIG_DIR / f"{kind}list.txt"
        ids = []
        if path.exists():
            for line in path.read_text(errors="replace").splitlines():
                line = line.strip()
                if line and not line.startswith("//"):
                    ids.append(line)
        lists[kind] = ids
    return lists


def write_serverlist(kind: str, ids: list[str]) -> None:
    path = CONFIG_DIR / f"{kind}list.txt"
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    lines = [f"// List {kind} players ID  ONE per line"]
    lines.extend(i.strip() for i in ids if i.strip())
    path.write_text("\n".join(lines) + "\n")


def mutate_serverlist(kind: str, steam_id: str, add: bool) -> list[str]:
    """Adiciona ou remove um Steam ID de uma lista e persiste no disco."""
    sid = steam_id.strip()
    lists = list_serverlists()
    ids = list(lists.get(kind, []))
    if add:
        if sid not in ids:
            ids.append(sid)
    else:
        ids = [i for i in ids if i != sid]
    write_serverlist(kind, ids)
    return ids


def _rcon_settings() -> Optional[dict]:
    return get_rcon_config(
        bepinex_cfg_dir=BEPINEX_CFG_DIR,
        env_file=ENV_FILE,
        read_env_fn=read_env,
    )


def _require_rcon() -> dict:
    if not container_running():
        raise HTTPException(503, "Valheim container is not running")
    if not is_plugin_installed(PLUGINS_DIR, PLUGINS_DISABLED_DIR):
        raise HTTPException(
            503,
            "ValheimRcon not found — restart the panel to reinstall the bundled mod",
        )
    if not is_mod_enabled(PLUGINS_DIR, PLUGINS_DISABLED_DIR):
        raise HTTPException(
            503,
            "ValheimRcon is disabled — enable the bundled mod in the Mods & Configs tab",
        )
    cfg = _rcon_settings()
    if not cfg:
        raise HTTPException(
            503,
            "RCON not configured — set the password in config/bepinex/org.tristan.rcon.cfg",
        )
    return cfg


_SLOW_RCON_COMMANDS = frozenset({
    "list",
    "globalkeys",
    "players",
    "banlist",
    "adminlist",
    "permitted",
    "findobjects",
    "findobjectsnear",
    "findplayer",
    "serverstats",
    "logs",
})


def _rcon_timeout_for(command: str) -> float:
    default = float(os.environ.get("PANEL_RCON_TIMEOUT", "15"))
    slow = float(os.environ.get("PANEL_RCON_TIMEOUT_SLOW", "90"))
    token = command.strip().split(maxsplit=1)[0].lower() if command.strip() else ""
    if token in _SLOW_RCON_COMMANDS:
        return slow
    return default


def _run_rcon(command: str) -> str:
    if os.environ.get("VIKINGER_TEST_RCON"):
        return f"ok: {command.strip()}"
    try:
        return execute_rcon(
            command,
            plugins_dir=PLUGINS_DIR,
            disabled_dir=PLUGINS_DISABLED_DIR,
            bepinex_cfg_dir=BEPINEX_CFG_DIR,
            env_file=ENV_FILE,
            read_env_fn=read_env,
            timeout=_rcon_timeout_for(command),
        )
    except RconError as e:
        raise HTTPException(503, str(e)) from e


_PLAYER_RCON_ACTIONS = {
    "kick": lambda sid: f"kick {sid}",
    "ban": lambda sid: f"banSteamId {sid}",
    "unban": lambda sid: f"unban {sid}",
    "promote": lambda sid: f"addAdmin {sid}",
    "demote": lambda sid: f"removeAdmin {sid}",
}

_PLAYER_LIST_SYNC = {
    "ban": ("banned", True),
    "unban": ("banned", False),
    "promote": ("admin", True),
    "demote": ("admin", False),
}


def file_tree(base: Path, prefix: str = "", depth: Optional[int] = None) -> list[dict]:
    """Build a file tree. depth=None walks fully; depth=0 is one level (lazy dirs)."""
    items = []
    if not base.exists():
        return items
    try:
        entries = sorted(base.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower()))
    except OSError:
        return items
    for entry in entries:
        rel = f"{prefix}/{entry.name}" if prefix else entry.name
        try:
            is_dir = entry.is_dir()
        except OSError:
            items.append({"name": entry.name, "path": rel, "type": "broken", "error": "broken symlink"})
            continue
        if is_dir:
            if depth is not None and depth <= 0:
                items.append({
                    "name": entry.name,
                    "path": rel,
                    "type": "dir",
                    "children": [],
                    "lazy": True,
                })
            else:
                child_depth = None if depth is None else depth - 1
                items.append({
                    "name": entry.name,
                    "path": rel,
                    "type": "dir",
                    "children": file_tree(entry, rel, depth=child_depth),
                })
        else:
            try:
                stat = entry.stat()
            except OSError:
                items.append({"name": entry.name, "path": rel, "type": "broken", "error": "broken symlink"})
                continue
            items.append({
                "name": entry.name,
                "path": rel,
                "type": "file",
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })
    return items


def _invalidate_file_tree_cache(scope: Optional[str] = None) -> None:
    if scope is None:
        _file_tree_cache.clear()
        return
    prefix = f"{scope}:"
    for key in list(_file_tree_cache):
        if key.startswith(prefix):
            del _file_tree_cache[key]


def _file_tree_cache_key(scope: str, path: str, depth: Optional[int]) -> str:
    return f"{scope}:{path}:{depth if depth is not None else 'full'}"


def _get_cached_file_tree(scope: str, path: str, depth: Optional[int], builder) -> list:
    key = _file_tree_cache_key(scope, path, depth)
    now = time.time()
    cached = _file_tree_cache.get(key)
    if cached and now - cached[0] < FILE_TREE_CACHE_TTL:
        return cached[1]
    tree = builder()
    _file_tree_cache[key] = (now, tree)
    return tree


THUNDERSTORE_COMMUNITY = "valheim"
THUNDERSTORE_PAGE_RE = re.compile(
    r"^https?://(?:[a-z0-9-]+\.)?thunderstore\.io/(?:c/valheim/)?p/(?P<owner>[^/]+)/(?P<name>[^/]+)/?$",
    re.IGNORECASE,
)
THUNDERSTORE_DOWNLOAD_RE = re.compile(
    r"^https?://(?:[a-z0-9-]+\.)?thunderstore\.io/package/download/"
    r"(?P<owner>[^/]+)/(?P<name>[^/]+)(?:/(?P<version>[^/]+)/?)?$",
    re.IGNORECASE,
)
ROR2MM_RE = re.compile(
    r"^ror2mm://v1/install/thunderstore\.io/(?P<owner>[^/]+)/(?P<name>[^/]+)/(?P<version>[^/]+)/?$",
    re.IGNORECASE,
)
THUNDERSTORE_PAGE_DOWNLOAD_RE = re.compile(
    r"package/download/(?P<owner>[^/\"\\]+)/(?P<name>[^/\"\\]+)/(?P<version>[^/\"\\]+)/?",
    re.IGNORECASE,
)
GCdn_THUNDERSTORE_RE = re.compile(
    r"^https?://gcdn\.thunderstore\.io/live/repository/packages/(?P<filename>[^/]+)\.zip/?$",
    re.IGNORECASE,
)
GCDN_VERSION_SUFFIX_RE = re.compile(r"^(?P<prefix>.+)-(?P<version>\d+(?:\.\d+)+)$")

_thunderstore_exists_cache: dict[str, bool] = {}


def thunderstore_experimental_package_url(owner: str, name: str) -> str:
    return f"https://thunderstore.io/api/experimental/package/{owner}/{name}/"


def fetch_thunderstore_experimental_json(owner: str, name: str) -> dict:
    import urllib.request

    api_url = thunderstore_experimental_package_url(owner, name)
    req = urllib.request.Request(
        api_url,
        headers={"User-Agent": "ValheimPanel/1.0", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except Exception as e:
        raise HTTPException(400, f"Failed to query Thunderstore: {e}") from e


def thunderstore_package_exists(owner: str, name: str) -> bool:
    cache_key = f"{owner}/{name}"
    if cache_key in _thunderstore_exists_cache:
        return _thunderstore_exists_cache[cache_key]
    try:
        fetch_thunderstore_experimental_json(owner, name)
        _thunderstore_exists_cache[cache_key] = True
        return True
    except HTTPException:
        _thunderstore_exists_cache[cache_key] = False
        return False


def parse_gcdn_thunderstore_url(url: str) -> tuple[str, str, str] | None:
    raw = normalize_thunderstore_url(url)
    match = GCdn_THUNDERSTORE_RE.match(raw)
    if not match:
        return None
    stem_match = GCDN_VERSION_SUFFIX_RE.match(match.group("filename"))
    if not stem_match:
        return None
    prefix = stem_match.group("prefix")
    version = stem_match.group("version")
    parts = prefix.split("-")
    if len(parts) < 2:
        return None
    for i in range(1, len(parts)):
        owner = "-".join(parts[:i])
        pkg_name = "-".join(parts[i:])
        if owner and pkg_name and thunderstore_package_exists(owner, pkg_name):
            return owner, pkg_name, version
    return parts[0], "-".join(parts[1:]), version


def fetch_thunderstore_package_info(owner: str, name: str) -> dict:
    data = fetch_thunderstore_experimental_json(owner, name)
    latest = data.get("latest") or {}
    version = latest.get("version_number") or ""
    if not version:
        raise HTTPException(400, f"Thunderstore package has no versions: {owner}/{name}")
    return {
        "owner": owner,
        "name": name,
        "latest_version": version,
        "download_url": latest.get("download_url") or thunderstore_download_url(owner, name, version),
    }


def thunderstore_download_url(owner: str, name: str, version: str) -> str:
    return f"https://thunderstore.io/package/download/{owner}/{name}/{version}/"


def fetch_url_bytes(url: str) -> bytes:
    import urllib.request

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ValheimPanel/1.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.read()
    except Exception as e:
        raise HTTPException(400, f"Download failed: {e}") from e


def scrape_thunderstore_download_from_page(owner: str, name: str) -> str:
    page_url = f"https://thunderstore.io/c/{THUNDERSTORE_COMMUNITY}/p/{owner}/{name}/"
    html = fetch_url_bytes(page_url).decode("utf-8", errors="replace")
    match = THUNDERSTORE_PAGE_DOWNLOAD_RE.search(html)
    if not match:
        raise HTTPException(400, f"Download not found on Thunderstore page: {owner}/{name}")
    return thunderstore_download_url(match.group("owner"), match.group("name"), match.group("version"))


def fetch_thunderstore_latest_download(owner: str, name: str) -> str:
    try:
        info = fetch_thunderstore_package_info(owner, name)
        if info.get("download_url"):
            return info["download_url"]
    except HTTPException:
        pass

    return scrape_thunderstore_download_from_page(owner, name)


def resolve_mod_download_url(url: str) -> str:
    raw = normalize_thunderstore_url(url)
    if not raw:
        raise HTTPException(400, "Empty URL")

    ror2mm = ROR2MM_RE.match(raw)
    if ror2mm:
        return thunderstore_download_url(
            ror2mm.group("owner"), ror2mm.group("name"), ror2mm.group("version"),
        )

    page = THUNDERSTORE_PAGE_RE.match(raw)
    if page:
        return fetch_thunderstore_latest_download(page.group("owner"), page.group("name"))

    download = THUNDERSTORE_DOWNLOAD_RE.match(raw)
    if download and not download.group("version"):
        return fetch_thunderstore_latest_download(download.group("owner"), download.group("name"))

    if not raw.startswith(("http://", "https://")):
        raise HTTPException(
            400,
            "Invalid URL. Use an http(s) link from Thunderstore, CDN, or r2modman.",
        )

    return raw


def download_mod_bytes(url: str) -> bytes:
    return fetch_url_bytes(url)


def ensure_plugins_writable() -> None:
    PLUGINS_DIR.mkdir(parents=True, exist_ok=True)

    def writable() -> bool:
        probe = PLUGINS_DIR / ".write_probe"
        try:
            probe.write_text("")
            probe.unlink()
            return True
        except OSError:
            return False

    if not writable() and FIX_PLUGINS_SCRIPT.exists():
        try:
            subprocess.run(
                ["sudo", "-n", str(FIX_PLUGINS_SCRIPT)],
                check=True,
                capture_output=True,
                timeout=10,
            )
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
            pass

    if not writable():
        raise HTTPException(
            500,
            "No permission to write to config/bepinex/plugins. "
            f"Execute: sudo {FIX_PLUGINS_SCRIPT}",
        )

    PLUGINS_DISABLED_DIR.mkdir(parents=True, exist_ok=True)


def remove_runtime_plugin(name: str) -> None:
    for directory in (RUNTIME_PLUGINS_DIR, RUNTIME_PLUGINS_DISABLED_DIR):
        path = directory / name
        if path.exists():
            path.unlink()


def sync_plugins_to_runtime() -> None:
    """Espelha config/bepinex/plugins no diretório que o container realmente carrega."""
    if not PLUGINS_DIR.exists():
        return
    RUNTIME_PLUGINS_DIR.mkdir(parents=True, exist_ok=True)

    for src_path in PLUGINS_DIR.rglob("*"):
        rel = src_path.relative_to(PLUGINS_DIR)
        dest_path = RUNTIME_PLUGINS_DIR / rel
        if src_path.is_dir():
            dest_path.mkdir(parents=True, exist_ok=True)
        else:
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_path, dest_path)

    for dest_path in list(RUNTIME_PLUGINS_DIR.rglob("*")):
        rel = dest_path.relative_to(RUNTIME_PLUGINS_DIR)
        if not (PLUGINS_DIR / rel).exists():
            if dest_path.is_file() or dest_path.is_symlink():
                dest_path.unlink()

    for dest_path in sorted(RUNTIME_PLUGINS_DIR.rglob("*"), key=lambda p: len(p.parts), reverse=True):
        if dest_path.is_dir() and not any(dest_path.iterdir()):
            dest_path.rmdir()


def extract_dlls_from_zip(data: bytes, dest: Path) -> list[str]:
    ensure_plugins_writable()
    dest.mkdir(parents=True, exist_ok=True)
    installed = []
    try:
        zf = zipfile.ZipFile(io.BytesIO(data))
    except zipfile.BadZipFile as e:
        head = data.lstrip()[:20].lower()
        if head.startswith(b"<!doctype") or head.startswith(b"<html"):
            raise HTTPException(
                400,
                "The URL points to a web page, not a ZIP file. "
                "Use the Thunderstore download link or the package page.",
            ) from e
        raise HTTPException(400, "Invalid ZIP file") from e
    with zf:
        for info in zf.infolist():
            if not info.filename.endswith(".dll"):
                continue
            name = Path(info.filename.replace("\\", "/")).name
            if name.startswith("._") or name.startswith("."):
                continue
            out = dest / name
            try:
                out.write_bytes(zf.read(info.filename))
            except PermissionError as e:
                raise HTTPException(
                    500,
                    f"No permission to write {out.name}. "
                    f"Run: sudo {FIX_PLUGINS_SCRIPT}",
                ) from e
            installed.append(name)
    return installed


BACKUP_ENV_KEYS = (
    "BACKUPS", "BACKUPS_CRON", "BACKUPS_MAX_AGE", "BACKUPS_MAX_COUNT", "BACKUPS_IF_IDLE",
)
BACKUP_DEFAULTS = {
    "BACKUPS": "true",
    "BACKUPS_CRON": "0 * * * *",
    "BACKUPS_MAX_AGE": "30",
    "BACKUPS_MAX_COUNT": "0",
    "BACKUPS_IF_IDLE": "true",
}


def backup_config() -> dict[str, str]:
    env = read_env()
    return {k: env.get(k, BACKUP_DEFAULTS[k]) for k in BACKUP_ENV_KEYS}


def dir_size(path: Path) -> int:
    total = 0
    try:
        for f in path.rglob("*"):
            if f.is_file():
                try:
                    total += f.stat().st_size
                except OSError:
                    pass
    except OSError:
        pass
    return total


BACKUP_KIND_LABELS = {
    "auto": "Automatic",
    "manual-world": "Manual — world",
    "manual-full": "Manual — full",
    "manual-configs": "Manual — configs",
    "checkpoint": "Checkpoint",
    "unknown": "Unknown",
}

BACKUP_LIST_NAMES = ("adminlist.txt", "bannedlist.txt", "permittedlist.txt")
BACKUP_MANIFEST_FILENAME = "vikinger-manifest.json"
BACKUP_METADATA_ARCNAMES = frozenset({BACKUP_MANIFEST_FILENAME})


def read_backup_state() -> dict:
    empty = {"active": None, "restored_at": None, "undo": None, "undo_of": None}
    if not BACKUP_STATE_FILE.exists():
        return empty
    try:
        data = json.loads(BACKUP_STATE_FILE.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            return empty
        return {
            "active": data.get("active"),
            "restored_at": data.get("restored_at"),
            "undo": data.get("undo"),
            "undo_of": data.get("undo_of"),
        }
    except (OSError, json.JSONDecodeError):
        return empty


def write_backup_state(*, active: str | None, undo: str | None = None, undo_of: str | None = None) -> None:
    state = {
        "active": active,
        "restored_at": datetime.now(timezone.utc).isoformat() if active else None,
        "undo": undo,
        "undo_of": undo_of,
    }
    try:
        PANEL_DATA_DIR.mkdir(parents=True, exist_ok=True)
        BACKUP_STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    except OSError as e:
        logger.warning("Falha ao gravar backup_state.json: %s", e)


def classify_backup(name: str) -> str:
    if not name.endswith(".zip"):
        return "unknown"
    if name.startswith("checkpoint-"):
        return "checkpoint"
    if name.startswith("manual-world-"):
        return "manual-world"
    if name.startswith("manual-full-"):
        return "manual-full"
    if name.startswith("manual-configs-"):
        return "manual-configs"
    if name.startswith("worlds-"):
        return "auto"
    return "unknown"


def validate_backup_name(name: str) -> Path:
    if ".." in name or "/" in name or "\\" in name:
        raise HTTPException(400, "Invalid name")
    target = BACKUPS_DIR / name
    if not target.is_file() or not str(target.resolve()).startswith(str(BACKUPS_DIR.resolve())):
        raise HTTPException(404, "Backup not found")
    return target


def _is_backup_metadata_arcname(arcname: str) -> bool:
    arc = arcname.replace("\\", "/").lstrip("/")
    return arc in BACKUP_METADATA_ARCNAMES


def backup_sidecar_path(zip_name: str) -> Path:
    return BACKUPS_DIR / f"{zip_name}.manifest.json"


def read_backup_sidecar(zip_name: str) -> dict | None:
    path = backup_sidecar_path(zip_name)
    if not path.is_file():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else None
    except (OSError, json.JSONDecodeError):
        return None


def write_backup_sidecar(zip_name: str, manifest: dict) -> None:
    BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
    backup_sidecar_path(zip_name).write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def read_manifest_from_zip(zip_path: Path) -> dict | None:
    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            if BACKUP_MANIFEST_FILENAME not in zf.namelist():
                return None
            raw = zf.read(BACKUP_MANIFEST_FILENAME).decode("utf-8")
            data = json.loads(raw)
            return data if isinstance(data, dict) else None
    except (OSError, zipfile.BadZipFile, json.JSONDecodeError, UnicodeDecodeError):
        return None


def _zip_arcnames(zip_path: Path) -> list[str]:
    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            return [
                info.filename
                for info in zf.infolist()
                if not info.is_dir() and not _is_backup_metadata_arcname(info.filename)
            ]
    except (OSError, zipfile.BadZipFile):
        return []


def _manifest_contents_from_arcs(arcnames: list[str], backup_kind: str) -> dict:
    world_files: list[str] = []
    has_env = False
    has_adminlist = False
    has_bannedlist = False
    has_permittedlist = False
    dll_count = 0
    for arc in arcnames:
        norm = arc.replace("\\", "/")
        base = norm.split("/")[-1]
        if base.endswith((".fwl", ".db")):
            world_files.append(base)
        if norm == ".env" or base == ".env":
            has_env = True
        if base == "adminlist.txt":
            has_adminlist = True
        if base == "bannedlist.txt":
            has_bannedlist = True
        if base == "permittedlist.txt":
            has_permittedlist = True
        lower = norm.lower()
        if lower.endswith(".dll") and "/plugins/" in lower:
            dll_count += 1
    includes_mods_dlls = backup_kind == "manual-full" or dll_count > 0
    includes_worlds = backup_kind in ("auto", "manual-world", "manual-full", "checkpoint") or bool(world_files)
    includes_env = backup_kind in ("manual-full", "manual-configs") or has_env
    return {
        "includes_mods_dlls": includes_mods_dlls,
        "includes_worlds": includes_worlds,
        "includes_env": includes_env,
        "has_adminlist": has_adminlist,
        "has_bannedlist": has_bannedlist,
        "has_permittedlist": has_permittedlist,
        "world_files": sorted(set(world_files)),
        "file_count": len(arcnames),
    }


def build_backup_manifest(backup_kind: str, zip_names: list[str] | None = None) -> dict:
    env = read_env()
    world_name = env.get("WORLD_NAME", "").strip() or None
    game = read_game_version()
    mods_data = list_mods_enriched()
    mod_items = []
    for mod in mods_data:
        version = mod.get("installed_version") or mod.get("bundled_version")
        mod_items.append({
            "name": mod["name"],
            "enabled": mod.get("enabled", True),
            "package_id": mod.get("package_id"),
            "version": version,
            "bundled": mod.get("bundled", False),
        })
    enabled = sum(1 for mod in mod_items if mod["enabled"])
    arcnames = zip_names or []
    contents = _manifest_contents_from_arcs(arcnames, backup_kind)
    return {
        "schema_version": 1,
        "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "backup_kind": backup_kind,
        "world_name": world_name,
        "game": game,
        "mods": {
            "total": len(mod_items),
            "enabled": enabled,
            "disabled": len(mod_items) - enabled,
            "items": mod_items,
        },
        "contents": contents,
        "mods_registry_snapshot": read_mods_registry(),
        "inferred": False,
    }


def infer_backup_manifest_from_zip(zip_path: Path, backup_kind: str) -> dict:
    arcnames = _zip_arcnames(zip_path)
    mod_items = []
    for arc in arcnames:
        norm = arc.replace("\\", "/")
        lower = norm.lower()
        if not lower.endswith(".dll") or "/plugins/" not in lower:
            continue
        enabled = "/plugins/disabled/" not in lower
        mod_items.append({
            "name": Path(norm).name,
            "enabled": enabled,
            "package_id": None,
            "version": None,
            "bundled": False,
        })
    mod_items.sort(key=lambda item: item["name"].lower())
    enabled = sum(1 for mod in mod_items if mod["enabled"])
    contents = _manifest_contents_from_arcs(arcnames, backup_kind)
    return {
        "schema_version": 1,
        "created_at": datetime.fromtimestamp(zip_path.stat().st_mtime, tz=timezone.utc)
        .isoformat()
        .replace("+00:00", "Z"),
        "backup_kind": backup_kind,
        "world_name": None,
        "game": {"buildid": None, "last_updated": None},
        "mods": {
            "total": len(mod_items),
            "enabled": enabled,
            "disabled": len(mod_items) - enabled,
            "items": mod_items,
        },
        "contents": contents,
        "mods_registry_snapshot": {"packages": []},
        "inferred": True,
    }


def summary_fields_from_manifest(manifest: dict) -> dict:
    mods = manifest.get("mods") or {}
    contents = manifest.get("contents") or {}
    game = manifest.get("game") or {}
    items = mods.get("items") or []
    mod_names: list[str] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        name = (item.get("name") or "").strip()
        package_id = (item.get("package_id") or "").strip()
        if name:
            mod_names.append(name)
        if package_id and package_id not in mod_names:
            mod_names.append(package_id)
    display_name = manifest.get("display_name")
    if isinstance(display_name, str):
        display_name = display_name.strip() or None
    else:
        display_name = None
    return {
        "mods_count": mods.get("total"),
        "mods_enabled_count": mods.get("enabled"),
        "mod_names": mod_names,
        "display_name": display_name,
        "world_name": manifest.get("world_name"),
        "game_buildid": game.get("buildid"),
        "has_manifest": not manifest.get("inferred", False),
        "manifest_inferred": bool(manifest.get("inferred", False)),
        "includes_mods_dlls": bool(contents.get("includes_mods_dlls")),
    }


def set_backup_display_name(name: str, display_name: str | None) -> dict:
    """Define ou limpa o nome amigável do backup no sidecar (ZIP permanece igual)."""
    target = validate_backup_name(name)
    kind = classify_backup(name)
    manifest = ensure_backup_manifest(target, kind)
    cleaned = (display_name or "").strip()
    if cleaned:
        if len(cleaned) > 120:
            raise HTTPException(400, "display_name must be at most 120 characters")
        manifest["display_name"] = cleaned
    else:
        manifest.pop("display_name", None)
    write_backup_sidecar(name, manifest)
    return {
        "ok": True,
        "name": name,
        "display_name": manifest.get("display_name"),
        **summary_fields_from_manifest(manifest),
    }


def ensure_backup_manifest(zip_path: Path, backup_kind: str) -> dict:
    name = zip_path.name
    sidecar = read_backup_sidecar(name)
    if sidecar:
        return sidecar
    embedded = read_manifest_from_zip(zip_path)
    if embedded:
        write_backup_sidecar(name, embedded)
        return embedded
    if backup_kind == "manual-full":
        manifest = infer_backup_manifest_from_zip(zip_path, backup_kind)
    else:
        manifest = build_backup_manifest(backup_kind, _zip_arcnames(zip_path))
        manifest["inferred"] = True
    write_backup_sidecar(name, manifest)
    return manifest


def attach_backup_manifest(zip_path: Path, backup_kind: str) -> dict:
    manifest = build_backup_manifest(backup_kind, _zip_arcnames(zip_path))
    try:
        with zipfile.ZipFile(zip_path, "a", zipfile.ZIP_DEFLATED) as zf:
            if BACKUP_MANIFEST_FILENAME not in zf.namelist():
                zf.writestr(
                    BACKUP_MANIFEST_FILENAME,
                    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                )
    except (OSError, zipfile.BadZipFile) as e:
        logger.warning("Falha ao embutir manifest em %s: %s", zip_path.name, e)
    write_backup_sidecar(zip_path.name, manifest)
    return manifest


def get_backup_details(name: str) -> dict:
    target = validate_backup_name(name)
    kind = classify_backup(name)
    manifest = ensure_backup_manifest(target, kind)
    stat = target.stat()
    return {
        "name": name,
        "kind": kind,
        "label": BACKUP_KIND_LABELS.get(kind, kind),
        "size": stat.st_size,
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        "modified_display": datetime.fromtimestamp(stat.st_mtime).strftime("%d/%m/%Y %H:%M"),
        "files": _zip_arcnames(target),
        "manifest": manifest,
        **summary_fields_from_manifest(manifest),
    }


def finalize_recent_auto_backup_manifests(before_mtime: float) -> list[str]:
    """Após trigger automático, grava manifest nos ZIPs novos sem sidecar."""
    if not BACKUPS_DIR.exists():
        return []
    finalized = []
    for path in BACKUPS_DIR.iterdir():
        if not path.is_file() or not path.name.endswith(".zip"):
            continue
        if classify_backup(path.name) != "auto":
            continue
        if read_backup_sidecar(path.name):
            continue
        try:
            if path.stat().st_mtime <= before_mtime:
                continue
        except OSError:
            continue
        attach_backup_manifest(path, "auto")
        finalized.append(path.name)
    return finalized


def _normalize_backup_arcname(arcname: str) -> str:
    """Normalize ZIP entry paths from panel and Valheim-container backups.

    Manual panel zips use ``worlds_local/...``. Automatic backups from
    ``lloesche/valheim-server`` nest under ``config/worlds_local/...`` and may
    include sidecars such as ``.fwl.old`` / ``.db.old``.
    """
    arc = arcname.replace("\\", "/").lstrip("/")
    while arc.startswith("./"):
        arc = arc[2:]
    # Container auto-backups zip from /config (or include a config/ prefix).
    if arc == "config" or arc.startswith("config/"):
        arc = arc[len("config") :].lstrip("/")
    return arc


def _resolve_backup_entry(arcname: str) -> tuple[Path, str]:
    arc = _normalize_backup_arcname(arcname)
    if not arc or ".." in arc.split("/"):
        raise ValueError(f"Invalid path: {arcname}")
    if _is_backup_metadata_arcname(arc):
        raise ValueError(f"Entry not allowed: {arcname}")
    parts = arc.split("/")
    if len(parts) == 1:
        if parts[0] in BACKUP_LIST_NAMES:
            return CONFIG_DIR, parts[0]
        if parts[0] == ".env":
            return ENV_FILE.parent, ".env"
        raise ValueError(f"Entry not allowed: {arcname}")
    root, rest = parts[0], "/".join(parts[1:])
    if not rest:
        raise ValueError(f"Entry not allowed: {arcname}")
    if root in ("worlds", "worlds_local"):
        return WORLDS_DIR, rest
    if root == "bepinex":
        return BEPINEX_CFG_DIR, rest
    if root == "panel-data":
        return PANEL_DATA_DIR, rest
    raise ValueError(f"Entry not allowed: {arcname}")


def inspect_backup_zip(zip_path: Path) -> list[str]:
    """Valida entradas do ZIP. Retorna lista de nomes de arquivos restauráveis."""
    names: list[str] = []
    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            for info in zf.infolist():
                if info.is_dir() or _is_backup_metadata_arcname(info.filename):
                    continue
                _resolve_backup_entry(info.filename)
                names.append(info.filename)
    except zipfile.BadZipFile as e:
        raise HTTPException(400, "Invalid ZIP file") from e
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    if not names:
        raise HTTPException(400, "Empty backup or no restorable files")
    return names


def extract_backup_zip(zip_path: Path) -> bool:
    """Extrai backup. Retorna True se .env foi restaurado."""
    env_restored = False
    with zipfile.ZipFile(zip_path, "r") as zf:
        for info in zf.infolist():
            if info.is_dir() or _is_backup_metadata_arcname(info.filename):
                continue
            dest_dir, rel = _resolve_backup_entry(info.filename)
            if rel == ".env":
                env_restored = True
            dest = dest_dir / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(info) as src, open(dest, "wb") as dst:
                shutil.copyfileobj(src, dst)
    return env_restored


def create_restore_checkpoint() -> str | None:
    """Cria checkpoint do estado atual antes de um restore."""
    try:
        entries = backup_entries("world")
    except HTTPException:
        if WORLDS_DIR.exists() and any(WORLDS_DIR.iterdir()):
            entries = [(WORLDS_DIR, "worlds_local")]
        else:
            return None
    ts = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    name = f"checkpoint-{ts}.zip"
    out = BACKUPS_DIR / name
    count = zip_paths(entries, out)
    if count == 0:
        try:
            out.unlink()
        except OSError:
            pass
        return None
    attach_backup_manifest(out, "checkpoint")
    return name


def restore_backup(name: str) -> dict:
    target = validate_backup_name(name)
    inspect_backup_zip(target)

    checkpoint = create_restore_checkpoint()
    prev_state = read_backup_state()

    stop_valheim_container()
    try:
        env_restored = extract_backup_zip(target)
    except Exception:
        if container_exists():
            restart_valheim_container()
        raise

    write_backup_state(active=name, undo=checkpoint, undo_of=prev_state.get("active"))

    if env_restored:
        r = recreate_container()
    else:
        r = restart_valheim_container()
    if r.returncode != 0:
        raise HTTPException(500, r.stderr or r.stdout or "Failed to restart container")

    return {"ok": True, "active": name, "undo": checkpoint, "restarted": True}


def latest_restorable_backup() -> str | None:
    if not BACKUPS_DIR.exists():
        return None
    candidates: list[tuple[float, str]] = []
    for b in BACKUPS_DIR.iterdir():
        if not b.is_file() or not b.name.endswith(".zip"):
            continue
        if classify_backup(b.name) == "checkpoint":
            continue
        try:
            candidates.append((b.stat().st_mtime, b.name))
        except OSError:
            continue
    if not candidates:
        return None
    candidates.sort(reverse=True)
    return candidates[0][1]


def list_backups() -> list[dict]:
    items = []
    if not BACKUPS_DIR.exists():
        return items
    now = time.time()
    state = read_backup_state()
    active = state.get("active")
    for b in BACKUPS_DIR.iterdir():
        try:
            if not b.is_file() or not b.name.endswith(".zip"):
                continue
            stat = b.stat()
            size = stat.st_size
            kind = classify_backup(b.name)
            age_days = round((now - stat.st_mtime) / 86400, 1)
            item = {
                "name": b.name,
                "size": size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "modified_display": datetime.fromtimestamp(stat.st_mtime).strftime("%d/%m/%Y %H:%M"),
                "age_days": age_days,
                "kind": kind,
                "label": BACKUP_KIND_LABELS.get(kind, kind),
                "is_checkpoint": kind == "checkpoint",
                "is_active": False,
                "is_latest": False,
            }
            try:
                item.update(summary_fields_from_manifest(ensure_backup_manifest(b, kind)))
            except (OSError, zipfile.BadZipFile):
                item.update({
                    "mods_count": None,
                    "mods_enabled_count": None,
                    "mod_names": [],
                    "display_name": None,
                    "world_name": None,
                    "game_buildid": None,
                    "has_manifest": False,
                    "manifest_inferred": False,
                    "includes_mods_dlls": False,
                })
            items.append(item)
        except OSError:
            continue
    items.sort(key=lambda x: x["modified"], reverse=True)
    restorable = [i for i in items if not i["is_checkpoint"]]
    latest_name = restorable[0]["name"] if restorable else None
    for item in items:
        item["is_active"] = item["name"] == active
        item["is_latest"] = item["name"] == latest_name
    return items


def purge_old_backups(max_age_days: int | None = None) -> list[str]:
    if max_age_days is None:
        max_age_days = int(backup_config().get("BACKUPS_MAX_AGE", "30"))
    if not BACKUPS_DIR.exists():
        return []
    cutoff = time.time() - max_age_days * 86400
    deleted = []
    for b in BACKUPS_DIR.iterdir():
        try:
            if b.stat().st_mtime >= cutoff:
                continue
            if b.is_dir():
                shutil.rmtree(b)
            else:
                b.unlink()
            sidecar = backup_sidecar_path(b.name)
            if sidecar.is_file():
                sidecar.unlink()
            deleted.append(b.name)
        except OSError as e:
            logger.warning("Falha ao apagar backup %s: %s", b.name, e)
    return deleted


def _purge_backups_by_count(max_count: int) -> list[str]:
    if max_count <= 0 or not BACKUPS_DIR.exists():
        return []
    protected = get_protected_backups()
    zips: list[tuple[float, Path]] = []
    for item in BACKUPS_DIR.iterdir():
        if not item.is_file() or not item.name.endswith(".zip"):
            continue
        if item.name in protected:
            continue
        try:
            zips.append((item.stat().st_mtime, item))
        except OSError:
            continue
    zips.sort(key=lambda x: x[0], reverse=True)
    if len(zips) <= max_count:
        return []
    deleted = []
    for _, path in zips[max_count:]:
        if storage_limits.delete_backup_zip(path) > 0:
            deleted.append(path.name)
    return deleted


def trigger_backup() -> str:
    if not container_running():
        raise HTTPException(400, "Container is not running")
    r = docker("exec", CONTAINER_NAME, "supervisorctl", "signal", "HUP", "valheim-backup")
    output = (r.stdout + r.stderr).strip()
    if r.returncode != 0:
        raise HTTPException(500, output or "Failed to request backup")
    return output


BACKUP_TYPES = ("world", "full", "configs")


def zip_paths(entries: list[tuple[Path, str]], out: Path) -> int:
    """Zip a list of (source, archive_name) into out. Returns file count."""
    count = 0
    out.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
        for src, arc in entries:
            if src.is_dir():
                for f in sorted(src.rglob("*")):
                    if f.is_file():
                        zf.write(f, f"{arc}/{f.relative_to(src)}")
                        count += 1
            elif src.is_file():
                zf.write(src, arc)
                count += 1
    return count


def backup_entries(backup_type: str) -> list[tuple[Path, str]]:
    serverlists = [
        (CONFIG_DIR / f"{kind}list.txt", f"{kind}list.txt")
        for kind in ("admin", "banned", "permitted")
        if (CONFIG_DIR / f"{kind}list.txt").exists()
    ]
    env_entry = [(ENV_FILE, ".env")] if ENV_FILE.exists() else []

    if backup_type == "world":
        world = read_env().get("WORLD_NAME", "").strip()
        if not world:
            raise HTTPException(400, "No active world defined (WORLD_NAME)")
        entries = []
        for ext in (".fwl", ".db"):
            src = WORLDS_DIR / f"{world}{ext}"
            if src.exists():
                entries.append((src, f"worlds_local/{world}{ext}"))
        if not entries:
            raise HTTPException(404, f"World files for '{world}' not found")
        return entries

    if backup_type == "full":
        entries = []
        if WORLDS_DIR.exists():
            entries.append((WORLDS_DIR, "worlds_local"))
        if BEPINEX_CFG_DIR.exists():
            entries.append((BEPINEX_CFG_DIR, "bepinex"))
        if MODS_REGISTRY_FILE.exists():
            entries.append((MODS_REGISTRY_FILE, "panel-data/mods-registry.json"))
        entries.extend(serverlists)
        entries.extend(env_entry)
        return entries

    if backup_type == "configs":
        entries = [
            (cfg, f"bepinex/{cfg.name}")
            for cfg in sorted(BEPINEX_CFG_DIR.glob("*.cfg"))
        ] if BEPINEX_CFG_DIR.exists() else []
        entries.extend(serverlists)
        entries.extend(env_entry)
        return entries

    raise HTTPException(400, f"Invalid backup type: {backup_type}")


def create_manual_backup(backup_type: str) -> str:
    if backup_type not in BACKUP_TYPES:
        raise HTTPException(400, f"Invalid backup type: {backup_type}")
    entries = backup_entries(backup_type)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    name = f"manual-{backup_type}-{ts}.zip"
    out = BACKUPS_DIR / name
    count = zip_paths(entries, out)
    if count == 0:
        try:
            out.unlink()
        except OSError:
            pass
        raise HTTPException(400, "Nothing to include in the backup")
    attach_backup_manifest(out, f"manual-{backup_type}")
    run_backup_retention()
    return name


# ── Worlds pending registry ────────────────────────────────────────────────────

def read_pending_worlds() -> list[str]:
    if not WORLDS_PENDING_FILE.exists():
        return []
    try:
        data = json.loads(WORLDS_PENDING_FILE.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return [str(n).strip() for n in data if str(n).strip()]
    except (OSError, json.JSONDecodeError):
        pass
    return []


def write_pending_worlds(names: list[str]) -> None:
    unique = sorted(set(n.strip() for n in names if n.strip()))
    if not unique:
        if WORLDS_PENDING_FILE.exists():
            try:
                WORLDS_PENDING_FILE.unlink()
            except OSError as e:
                logger.warning("Falha ao remover worlds_pending.json: %s", e)
        return
    try:
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        WORLDS_PENDING_FILE.write_text(json.dumps(unique, ensure_ascii=False, indent=2), encoding="utf-8")
    except OSError as e:
        logger.warning("Falha ao gravar worlds_pending.json: %s", e)


def add_pending_world(name: str) -> None:
    pending = read_pending_worlds()
    if name not in pending:
        pending.append(name)
        write_pending_worlds(pending)


def remove_pending_world(name: str) -> None:
    pending = read_pending_worlds()
    if name not in pending:
        return
    write_pending_worlds([n for n in pending if n != name])


def read_worlds_config_store() -> dict[str, dict]:
    if not WORLDS_CONFIG_FILE.exists():
        return {}
    try:
        data = json.loads(WORLDS_CONFIG_FILE.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return {str(k): v for k, v in data.items() if isinstance(v, dict)}
    except (OSError, json.JSONDecodeError):
        pass
    return {}


def write_worlds_config_store(store: dict[str, dict]) -> None:
    if not store:
        if WORLDS_CONFIG_FILE.exists():
            try:
                WORLDS_CONFIG_FILE.unlink()
            except OSError as e:
                logger.warning("Falha ao remover worlds_config.json: %s", e)
        return
    try:
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        WORLDS_CONFIG_FILE.write_text(
            json.dumps(store, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except OSError as e:
        logger.warning("Falha ao gravar worlds_config.json: %s", e)


def get_stored_world_config(name: str) -> WorldConfig:
    raw = read_worlds_config_store().get(name, {})
    return WorldConfig.from_dict(raw)


def set_stored_world_config(name: str, config: WorldConfig) -> None:
    store = read_worlds_config_store()
    store[name] = config.to_dict()
    write_worlds_config_store(store)


def fwl_backup_path(name: str) -> Path:
    return FWL_BACKUP_DIR / f"{name}.fwl.bak"


def _try_backup_world_fwl(source: Path, name: str) -> bool:
    """Copia .fwl atual para backup local; falha silenciosa se diretório não for gravável."""
    if not source.exists():
        return True
    dest = fwl_backup_path(name)
    try:
        ensure_panel_data_dirs()
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, dest)
        return True
    except OSError as e:
        logger.warning("Backup do .fwl ignorado (%s): %s", dest, e)
        return False


def write_world_fwl(
    path: Path,
    name: str,
    config: WorldConfig,
    *,
    seed_name: Optional[str] = None,
    uid: Optional[int] = None,
    backup: bool = True,
) -> WorldMeta:
    """Grava .fwl com backup em diretório do painel; usa docker cp se o host não puder escrever."""
    if backup:
        _try_backup_world_fwl(path, name)
    try:
        return write_fwl(
            path,
            name,
            config,
            seed_name=seed_name,
            uid=uid,
            backup=False,
        )
    except (PermissionError, OSError) as e:
        if isinstance(e, OSError) and e.errno != 13:
            raise
        if container_running():
            return _write_world_fwl_via_docker(
                path,
                name,
                config,
                seed_name=seed_name,
                uid=uid,
                backup=backup,
            )
        raise HTTPException(
            403,
            "No permission to write the world. Run the panel via Docker (recommended) "
            "or on the host run: sudo "
            f"{ROOT / 'scripts' / 'fix-worlds-permissions.sh'}",
        ) from e


def _write_world_fwl_via_docker(
    path: Path,
    name: str,
    config: WorldConfig,
    *,
    seed_name: Optional[str] = None,
    uid: Optional[int] = None,
    backup: bool,
) -> WorldMeta:
    """Fallback: grava em staging local e copia para o volume via docker cp (root no container)."""
    if backup:
        _try_backup_world_fwl(path, name)

    staging_dir = FWL_STAGING_DIR
    staging_dir.mkdir(parents=True, exist_ok=True)
    staging = staging_dir / f"{name}.fwl"
    write_fwl(
        staging,
        name,
        config,
        seed_name=seed_name,
        uid=uid,
        backup=False,
    )
    container_dest = f"{CONTAINER_NAME}:/config/worlds_local/{name}.fwl"
    r = docker("cp", str(staging), container_dest, timeout=60)
    staging.unlink(missing_ok=True)
    if r.returncode != 0:
        raise HTTPException(500, r.stderr or r.stdout or "Failed to copy .fwl to the container")
    return read_fwl(path)


def remove_stored_world_config(name: str) -> None:
    store = read_worlds_config_store()
    if name in store:
        del store[name]
        write_worlds_config_store(store)


def collect_known_world_names(*, reconcile: bool = False) -> set[str]:
    """Nomes de mundos conhecidos — mesma base usada na listagem e em /config."""
    if reconcile:
        reconcile_world_config()
    sync_pending_worlds()

    env = read_env()
    configured = env.get("WORLD_NAME", "").strip()
    running = get_container_world_name()
    active = running if running else configured

    names: set[str] = set()
    if WORLDS_DIR.exists():
        for fwl in WORLDS_DIR.glob("*.fwl"):
            stem = fwl.stem
            if "_backup" not in stem:
                names.add(stem)
    names.update(read_pending_worlds())
    if active:
        names.add(active)
    return names


def world_known(name: str) -> bool:
    return name in collect_known_world_names(reconcile=False)


def read_world_meta(name: str):
    fwl = WORLDS_DIR / f"{name}.fwl"
    if not fwl.is_file():
        return None
    try:
        return read_fwl(fwl)
    except (OSError, ValueError) as e:
        logger.warning("Falha ao ler .fwl de %s: %s", name, e)
        return None


def world_config_for_name(name: str) -> tuple[dict, list[str], bool]:
    """Retorna (config_dict, warnings, has_fwl)."""
    meta = read_world_meta(name)
    if meta:
        return meta.config.to_dict(), meta.warnings, True
    stored = get_stored_world_config(name)
    return stored.to_dict(), [], False


def validate_world_name(name: str) -> str:
    name = name.strip()
    if not name or re.search(r"[^\w\-]", name):
        raise HTTPException(400, "Invalid name")
    return name


def get_container_world_name() -> str:
    if not container_running():
        return ""
    r = docker("exec", CONTAINER_NAME, "printenv", "WORLD_NAME")
    return r.stdout.strip() if r.returncode == 0 else ""


def sync_pending_worlds() -> None:
    pending = read_pending_worlds()
    if not pending or not WORLDS_DIR.exists():
        return
    existing = {
        fwl.stem
        for fwl in WORLDS_DIR.glob("*.fwl")
        if "_backup" not in fwl.stem
    }
    updated = [n for n in pending if n not in existing]
    if len(updated) != len(pending):
        write_pending_worlds(updated)


def reconcile_world_config() -> dict:
    """Alinha .env ao mundo que o container está executando (preserva progresso)."""
    configured = read_env().get("WORLD_NAME", "").strip()
    running = get_container_world_name()
    if running and configured and running != configured:
        write_env({"WORLD_NAME": running})
        if (WORLDS_DIR / f"{running}.fwl").exists():
            remove_pending_world(running)
        logger.info("WORLD_NAME reconciliado: %s → %s", configured, running)
        return {"reconciled": True, "from": configured, "to": running}
    return {"reconciled": False}


def build_worlds_list(reconcile: bool = True) -> tuple[list[dict], str, str, dict]:
    reconciled = reconcile_world_config() if reconcile else {"reconciled": False}
    sync_pending_worlds()

    env = read_env()
    configured = env.get("WORLD_NAME", "").strip()
    running = get_container_world_name()
    active = running if running else configured
    pending_names = set(read_pending_worlds())
    by_name: dict[str, dict] = {}

    if WORLDS_DIR.exists():
        for fwl in sorted(WORLDS_DIR.glob("*.fwl")):
            name = fwl.stem
            if "_backup" in name:
                continue
            db = WORLDS_DIR / f"{name}.db"
            stat = fwl.stat()
            meta = read_world_meta(name)
            entry = {
                "name": name,
                "active": name == active,
                "running": name == running,
                "pending": False,
                "has_db": db.exists(),
                "has_fwl": True,
                "db_size": db.stat().st_size if db.exists() else 0,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            }
            if meta:
                entry["seed"] = meta.seed_name
                entry["config_summary"] = config_summary_from_meta(meta)
            by_name[name] = entry
            pending_names.discard(name)

    for name in sorted(pending_names):
        if name in by_name:
            continue
        stored_cfg = get_stored_world_config(name)
        by_name[name] = {
            "name": name,
            "active": name == active,
            "running": name == running,
            "pending": True,
            "has_db": False,
            "has_fwl": (WORLDS_DIR / f"{name}.fwl").exists(),
            "db_size": 0,
            "modified": None,
            "config_summary": stored_cfg.summary() if not (WORLDS_DIR / f"{name}.fwl").exists() else config_summary_from_meta(read_world_meta(name)),
        }

    if active and active not in by_name:
        by_name[active] = {
            "name": active,
            "active": True,
            "running": active == running,
            "pending": True,
            "has_db": False,
            "has_fwl": (WORLDS_DIR / f"{active}.fwl").exists(),
            "db_size": 0,
            "modified": None,
            "config_summary": get_stored_world_config(active).summary(),
        }

    worlds = sorted(by_name.values(), key=lambda w: w["name"].lower())
    return worlds, active, running, reconciled


# ── Player tracking from logs ────────────────────────────────────────────────

_RE_CONNECTION = re.compile(r"Got connection SteamID (\d+)")
_RE_CHARACTER = re.compile(r"Got character ZDOID from (.+?) : (-?\d+):(\d+)")
_RE_CLOSING = re.compile(r"Closing socket (\d+)")
_RE_CONNECTIONS = re.compile(r"Connections (\d+) ZDOS:")


def parse_players_from_logs(log_text: str) -> dict:
    steam_to_name: dict[str, str] = {}
    active_steam: set[str] = set()
    pending_steam: set[str] = set()
    last_connection: Optional[str] = None
    last_count = 0

    for line in log_text.splitlines():
        m = _RE_CONNECTIONS.search(line)
        if m:
            last_count = int(m.group(1))

        m = _RE_CONNECTION.search(line)
        if m:
            steam_id = m.group(1)
            last_connection = steam_id
            pending_steam.add(steam_id)
            continue

        m = _RE_CHARACTER.search(line)
        if m:
            name = m.group(1).strip()
            if m.group(2) == "0" and m.group(3) == "0":
                continue
            steam_id = last_connection
            if steam_id:
                steam_to_name[steam_id] = name
                active_steam.add(steam_id)
                pending_steam.discard(steam_id)
            last_connection = None
            continue

        m = _RE_CLOSING.search(line)
        if m:
            sid = m.group(1)
            active_steam.discard(sid)
            pending_steam.discard(sid)
            if last_connection == sid:
                last_connection = None

    for sid in pending_steam:
        if sid not in active_steam:
            active_steam.add(sid)

    players = [
        {"name": steam_to_name.get(sid, sid), "steam_id": sid}
        for sid in sorted(active_steam)
    ]
    count = len(players) if players else last_count
    return {"count": count, "players": players, "online": count > 0}


def get_players_info(force_refresh: bool = False) -> dict:
    global _players_info_cache, _players_info_cache_ts
    now = time.time()
    if (
        not force_refresh
        and _players_info_cache is not None
        and now - _players_info_cache_ts < PLAYERS_CACHE_TTL
    ):
        return dict(_players_info_cache)
    if not container_running():
        result = {"count": 0, "players": [], "online": False}
    else:
        logs = get_logs(3000)
        result = parse_players_from_logs(logs)
    _players_info_cache = result
    _players_info_cache_ts = now
    return dict(result)


def _collect_mod_entry(dll: Path, enabled: bool, cfg_index: list) -> dict:
    stat = dll.stat()
    bundled = is_protected_mod(dll.name)
    meta = BUNDLED_MODS.get(dll.name, {})
    return {
        "name": dll.name,
        "enabled": enabled,
        "size": stat.st_size,
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        "config": match_dll_to_cfg(dll.stem, cfg_index),
        "bundled": bundled,
        "protected": bundled,
        "label": meta.get("label"),
        "bundled_version": meta.get("version"),
        "description": meta.get("description"),
    }


def resolve_thunderstore_ref(
    url: str,
    download_url: str | None = None,
) -> tuple[str, str, Optional[str]] | None:
    normalized = normalize_thunderstore_url(url)
    ref = parse_thunderstore_package_ref(normalized)
    if ref:
        return ref
    for candidate in (download_url, normalized):
        if not candidate:
            continue
        ref = parse_thunderstore_from_download_url(candidate)
        if ref:
            return ref
        gcdn = parse_gcdn_thunderstore_url(candidate)
        if gcdn:
            return gcdn
    return None


R2MODMAN_PROFILE_CREATE_URL = "https://thunderstore.io/api/experimental/legacyprofile/create/"
R2MODMAN_CONFIG_EXTENSIONS = {".txt", ".json", ".yml", ".yaml", ".ini"}


def get_export_profile_name() -> str:
    env = read_env()
    return strip_server_name_branding(effective_server_name(env)) or "Valheim"


def build_r2modman_export_mods() -> tuple[list[dict], int]:
    registry = read_mods_registry()
    mod_states = {m["name"]: m["enabled"] for m in list_mods_data()}
    exported: list[dict] = []
    linked_dlls: set[str] = set()
    for pkg in registry.get("packages", []):
        owner = pkg.get("owner", "")
        name = pkg.get("name", "")
        version = pkg.get("version", "")
        if not owner or not name or not version:
            continue
        dlls = pkg.get("dlls") or []
        linked_dlls.update(dlls)
        enabled = any(mod_states.get(dll, True) for dll in dlls)
        exported.append({
            "name": f"{owner}-{name}",
            "version": version,
            "enabled": enabled,
        })
    skipped = sum(1 for m in list_mods_data() if m["name"] not in linked_dlls)
    return exported, skipped


def parse_version_triplet(version: str) -> tuple[int, int, int]:
    parts = version.split(".")
    if len(parts) < 3:
        raise ValueError(f"Invalid version for r2modman export: {version}")
    return int(parts[0]), int(parts[1]), int(parts[2])


def render_export_r2x(profile_name: str, mods: list[dict]) -> str:
    lines = [f"profileName: {profile_name}", "mods:"]
    for mod in mods:
        major, minor, patch = parse_version_triplet(mod["version"])
        lines.append(f"- name: {mod['name']}")
        lines.append("  version:")
        lines.append(f"    major: {major}")
        lines.append(f"    minor: {minor}")
        lines.append(f"    patch: {patch}")
        lines.append(f"  enabled: {str(mod['enabled']).lower()}")
    return "\n".join(lines) + "\n"


def build_r2modman_zip_bytes() -> tuple[bytes, str, int, int]:
    profile_name = get_export_profile_name()
    mods, skipped = build_r2modman_export_mods()
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("export.r2x", render_export_r2x(profile_name, mods))
        if BEPINEX_CFG_DIR.exists():
            for cfg in sorted(BEPINEX_CFG_DIR.iterdir()):
                if not cfg.is_file():
                    continue
                if cfg.name == "BepInEx.cfg":
                    continue
                if cfg.suffix == ".cfg" or cfg.suffix in R2MODMAN_CONFIG_EXTENSIONS:
                    zf.write(cfg, f"config/{cfg.name}")
    return buf.getvalue(), profile_name, len(mods), skipped


def upload_r2modman_profile(payload: str) -> str:
    import urllib.request

    req = urllib.request.Request(
        R2MODMAN_PROFILE_CREATE_URL,
        data=payload.encode("utf-8"),
        headers={
            "User-Agent": "ValheimPanel/1.0",
            "Content-Type": "application/octet-stream",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        raise HTTPException(400, f"Failed to publish r2modman profile: {e}") from e
    code = data.get("key")
    if not code:
        raise HTTPException(400, "Invalid response when publishing r2modman profile")
    return code


def list_mods_data() -> list[dict]:
    mods: list[dict] = []
    cfg_index = build_cfg_index(BEPINEX_CFG_DIR)
    if PLUGINS_DIR.exists():
        for dll in sorted(PLUGINS_DIR.glob("*.dll")):
            mods.append(_collect_mod_entry(dll, True, cfg_index))
    if PLUGINS_DISABLED_DIR.exists():
        for dll in sorted(PLUGINS_DISABLED_DIR.glob("*.dll")):
            mods.append(_collect_mod_entry(dll, False, cfg_index))
    return mods


def mod_path(name: str, enabled: bool) -> Path:
    base = PLUGINS_DIR if enabled else PLUGINS_DISABLED_DIR
    return base / name


def find_mod(name: str) -> tuple[Path, bool] | None:
    for enabled in (True, False):
        path = mod_path(name, enabled)
        if path.exists():
            return path, enabled
    return None


# ── Models ───────────────────────────────────────────────────────────────────

class EnvUpdate(BaseModel):
    values: dict[str, str]


class WorldSwitch(BaseModel):
    world_name: str


class WorldConfigUpdate(BaseModel):
    config: dict
    restart: bool = False


class WorldCreateBody(BaseModel):
    seed: Optional[str] = None
    config: Optional[dict] = None


class ServerListUpdate(BaseModel):
    ids: list[str]


class ConsoleCommand(BaseModel):
    command: str


class AutoMessagesSettings(BaseModel):
    enabled: bool


class AutoMessageCreate(BaseModel):
    name: str = "Message"
    text: str
    enabled: bool = True
    channel: str = "say"
    trigger: str = "interval"
    interval_seconds: Optional[int] = 1800
    run_at: Optional[str] = None
    daily_time: Optional[str] = None
    only_when_players_online: bool = True


class AutoMessageUpdate(BaseModel):
    name: Optional[str] = None
    text: Optional[str] = None
    enabled: Optional[bool] = None
    channel: Optional[str] = None
    trigger: Optional[str] = None
    interval_seconds: Optional[int] = None
    run_at: Optional[str] = None
    daily_time: Optional[str] = None
    only_when_players_online: Optional[bool] = None


class AutoMessagePreview(BaseModel):
    text: str
    player_name: Optional[str] = None
    player_steam_id: Optional[str] = None


class PlayerActionBody(BaseModel):
    action: str


class FileContent(BaseModel):
    content: str


class BepinexCfgApply(BaseModel):
    path: str
    updates: list[dict]


class BepinexCfgParseBody(BaseModel):
    path: str
    content: Optional[str] = None


class OrphanedCfgDelete(BaseModel):
    names: Optional[list[str]] = None


class ModUrlInstall(BaseModel):
    url: str
    name: Optional[str] = None


class BackupConfigUpdate(BaseModel):
    values: dict[str, str]
    restart: bool = False


class BackupCreate(BaseModel):
    type: str


class BackupRename(BaseModel):
    display_name: Optional[str] = None


class StorageLimitsUpdate(BaseModel):
    backups: Optional[dict] = None
    fwl_backups: Optional[dict] = None
    logs: Optional[dict] = None


class StorageEnforceRequest(BaseModel):
    category: Optional[str] = None


class PurgeAllBackupsRequest(BaseModel):
    confirm: bool = False


class ModToggle(BaseModel):
    enabled: bool


class MemoryLimitUpdate(BaseModel):
    gb: Optional[int] = None
    apply: bool = True


class CapacityUpdate(BaseModel):
    memory_gb: Optional[int] = None
    max_players: Optional[int] = None
    apply_memory: bool = False


class UpdateConfigUpdate(BaseModel):
    values: dict[str, str] = {}
    bepinex: Optional[bool] = None
    restart: bool = False


class SetupComplete(BaseModel):
    mode: str
    admin_steam_id: Optional[str] = None
    world_name: Optional[str] = None
    activate_world: bool = False


class ModLink(BaseModel):
    url: str


class PanelUpdateBody(BaseModel):
    version: str = ""


# ── Version ──────────────────────────────────────────────────────────────────

@app.get("/api/version")
def api_version():
    return version_info()


@app.get("/api/panel/update/check")
def api_panel_update_check(force: bool = Query(False)):
    return check_panel_update(COMPOSE_FILE, force=force)


@app.post("/api/panel/update")
def api_panel_update(body: PanelUpdateBody | None = None):
    target = (body.version if body else "") or ""
    try:
        return start_panel_update(ROOT, target)
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(400, str(exc)) from exc


# ── Status & Server Control ──────────────────────────────────────────────────

def get_container_uptime() -> tuple[Optional[float], str]:
    """Return (uptime_seconds, human) for the valheim container, or (None, '')."""
    r = docker("inspect", "-f", "{{.State.StartedAt}}", CONTAINER_NAME, timeout=5)
    if r.returncode != 0 or not r.stdout.strip():
        return None, ""
    started = r.stdout.strip()
    try:
        # Docker emits RFC3339 with nanoseconds; trim to microseconds for fromisoformat.
        cleaned = re.sub(r"(\.\d{6})\d*Z?$", r"\1", started).replace("Z", "+00:00")
        dt = datetime.fromisoformat(cleaned)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        secs = (datetime.now(timezone.utc) - dt).total_seconds()
    except (ValueError, TypeError):
        return None, ""
    if secs < 0:
        secs = 0.0
    days, rem = divmod(int(secs), 86400)
    hours, rem = divmod(rem, 3600)
    minutes, _ = divmod(rem, 60)
    if days:
        human = f"{days}d {hours}h"
    elif hours:
        human = f"{hours}h {minutes}m"
    else:
        human = f"{minutes}m"
    return secs, human


def _count_worlds_fast() -> int:
    if not WORLDS_DIR.exists():
        return 0
    return sum(1 for fwl in WORLDS_DIR.glob("*.fwl") if "_backup" not in fwl.stem)


def _count_mods_fast() -> int:
    count = 0
    if PLUGINS_DIR.exists():
        count += sum(1 for _ in PLUGINS_DIR.glob("*.dll"))
    disabled = PLUGINS_DIR / "disabled"
    if disabled.exists():
        count += sum(1 for _ in disabled.glob("*.dll"))
    return count


def _compute_status() -> dict:
    """Build dashboard status without full worlds reconcile (hot path)."""
    env = read_env()
    is_running = container_running()
    players = get_players_info()
    configured = env.get("WORLD_NAME", "").strip()
    running = get_container_world_name() if is_running else ""
    active = running if running else configured
    uptime_secs, uptime_display = get_container_uptime()
    return {
        "container": "running" if is_running else "stopped",
        "server": server_process_status(),
        "uptime_seconds": uptime_secs,
        "uptime_display": uptime_display,
        "supervisor": supervisor_status() if is_running else {},
        "config": {
            "server_name": effective_server_name(env),
            "server_name_display": strip_server_name_branding(env.get("SERVER_NAME", ""))
            if server_name_meta(env)["branding_enabled"]
            else (env.get("SERVER_NAME") or "").strip(),
            "world_name": active or configured,
            "server_port": env.get("SERVER_PORT", "2456"),
            "server_public": env.get("SERVER_PUBLIC", "true"),
            "server_args": env.get("SERVER_ARGS", ""),
        },
        "running_world_name": running,
        "world_in_sync": not running or running == (active or configured),
        "world_reconciled": {"reconciled": False},
        "mods_count": _count_mods_fast(),
        "worlds_count": _count_worlds_fast(),
        "players_count": players["count"],
        "capabilities": {
            "world_config": True,
        },
    }


def _refresh_live_snapshot() -> dict:
    """Recompute status+players and store as the shared live snapshot."""
    global _live_snapshot
    status = _compute_status()
    players = players_with_sessions()
    status = dict(status)
    status["players_count"] = players.get("count", status.get("players_count", 0))
    snap = {"ts": time.time(), "status": status, "players": players}
    with _live_snapshot_lock:
        _live_snapshot = snap
    return snap


def get_live_snapshot(force_refresh: bool = False) -> dict:
    """Return last-known status/players; compute once if empty or forced."""
    with _live_snapshot_lock:
        snap = _live_snapshot
    if force_refresh or snap is None:
        return _refresh_live_snapshot()
    return snap


def clear_live_caches() -> None:
    """Reset short-lived caches (used by tests)."""
    global _container_running_cache, _container_running_cache_ts
    global _players_info_cache, _players_info_cache_ts, _live_snapshot
    global _lan_ip_cache, _lan_ip_cache_ts, _public_ip_cache, _public_ip_cache_ts
    _container_running_cache = None
    _container_running_cache_ts = 0.0
    _players_info_cache = None
    _players_info_cache_ts = 0.0
    _lan_ip_cache = None
    _lan_ip_cache_ts = 0.0
    _public_ip_cache = None
    _public_ip_cache_ts = 0.0
    with _live_snapshot_lock:
        _live_snapshot = None
    _file_tree_cache.clear()


_lan_ip_cache: Optional[str] = None
_lan_ip_cache_ts: float = 0.0
_public_ip_cache: Optional[str] = None
_public_ip_cache_ts: float = 0.0
_LAN_IP_CACHE_TTL = 300.0
_PUBLIC_IP_CACHE_TTL = 600.0
_IP_MISS_TTL = 30.0
_DOCKER_BRIDGE_NET = ipaddress.ip_network("172.16.0.0/12")
_PUBLIC_IP_URLS = (
    "https://api.ipify.org",
    "https://ifconfig.me/ip",
    "https://icanhazip.com",
)


def _is_usable_ip(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return False
    return not (
        addr.is_loopback
        or addr.is_link_local
        or addr.is_multicast
        or addr.is_unspecified
        or addr.is_reserved
    )


def _is_docker_bridge_ip(ip: str) -> bool:
    try:
        return ipaddress.ip_address(ip) in _DOCKER_BRIDGE_NET
    except ValueError:
        return False


def _is_public_wan_ip(ip: str) -> bool:
    """True for a globally routable address (not RFC1918 / loopback / link-local)."""
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return False
    return _is_usable_ip(ip) and not addr.is_private


def _lan_ip_via_socket() -> Optional[str]:
    """Best-effort LAN IP from the process network namespace."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            ip = sock.getsockname()[0]
    except OSError:
        return None
    return ip if _is_usable_ip(ip) else None


def _lan_ip_via_host_network() -> Optional[str]:
    """Resolve host LAN IP from inside Docker via a short-lived host-network probe."""
    image = (os.environ.get("PANEL_IMAGE") or "vikinger-panel:latest").strip()
    probe = (
        "import socket;"
        "s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM);"
        "s.connect(('8.8.8.8',80));"
        "print(s.getsockname()[0], end='');"
        "s.close()"
    )
    try:
        result = docker(
            "run",
            "--rm",
            "--network",
            "host",
            "--entrypoint",
            "python3",
            image,
            "-c",
            probe,
            timeout=20,
        )
    except HTTPException:
        return None
    if result.returncode != 0:
        return None
    ip = (result.stdout or "").strip().splitlines()[-1].strip() if result.stdout else ""
    if _is_usable_ip(ip) and not _is_docker_bridge_ip(ip):
        return ip
    return None


def detect_lan_ip(force: bool = False) -> Optional[str]:
    """Return the host LAN IP suitable for sharing the Valheim join address."""
    global _lan_ip_cache, _lan_ip_cache_ts
    now = time.time()
    if not force and _lan_ip_cache is not None:
        ttl = _LAN_IP_CACHE_TTL if _lan_ip_cache else _IP_MISS_TTL
        if (now - _lan_ip_cache_ts) < ttl:
            return _lan_ip_cache or None

    env_ip = (os.environ.get("PANEL_HOST_LAN_IP") or "").strip()
    if env_ip and _is_usable_ip(env_ip):
        _lan_ip_cache, _lan_ip_cache_ts = env_ip, now
        return env_ip

    socket_ip = _lan_ip_via_socket()
    if socket_ip and not _is_docker_bridge_ip(socket_ip):
        _lan_ip_cache, _lan_ip_cache_ts = socket_ip, now
        return socket_ip

    host_ip = _lan_ip_via_host_network()
    if host_ip:
        _lan_ip_cache, _lan_ip_cache_ts = host_ip, now
        return host_ip

    _lan_ip_cache, _lan_ip_cache_ts = "", now
    return None


def _fetch_public_ip() -> Optional[str]:
    """Ask public echo services for the WAN IP seen from this host."""
    try:
        import httpx
    except ImportError:  # pragma: no cover
        return None
    headers = {"User-Agent": "VikingerPanel/1.0", "Accept": "text/plain"}
    try:
        with httpx.Client(timeout=4.0, follow_redirects=True, headers=headers) as client:
            for url in _PUBLIC_IP_URLS:
                try:
                    resp = client.get(url)
                    if resp.status_code != 200:
                        continue
                    ip = (resp.text or "").strip().split()[0]
                    if _is_public_wan_ip(ip):
                        return ip
                except Exception:  # noqa: BLE001 — try next provider
                    continue
    except Exception:  # noqa: BLE001
        return None
    return None


def detect_public_ip(force: bool = False) -> Optional[str]:
    """Return the public (internet) IP for friends joining from outside the LAN."""
    global _public_ip_cache, _public_ip_cache_ts
    now = time.time()
    if not force and _public_ip_cache is not None:
        ttl = _PUBLIC_IP_CACHE_TTL if _public_ip_cache else _IP_MISS_TTL
        if (now - _public_ip_cache_ts) < ttl:
            return _public_ip_cache or None

    env_ip = (os.environ.get("PANEL_PUBLIC_IP") or "").strip()
    if env_ip and _is_public_wan_ip(env_ip):
        _public_ip_cache, _public_ip_cache_ts = env_ip, now
        return env_ip

    fetched = _fetch_public_ip()
    if fetched:
        _public_ip_cache, _public_ip_cache_ts = fetched, now
        return fetched

    _public_ip_cache, _public_ip_cache_ts = "", now
    return None


def network_info() -> dict:
    env = read_env()
    server_port = str(env.get("SERVER_PORT") or "2456")
    panel_port = str(os.environ.get("PANEL_PORT") or "8080")
    lan_ip = detect_lan_ip()
    public_ip = detect_public_ip()
    return {
        "lan_ip": lan_ip,
        "public_ip": public_ip,
        "server_port": server_port,
        "panel_port": panel_port,
        "lan_connect": f"{lan_ip}:{server_port}" if lan_ip else None,
        "public_connect": f"{public_ip}:{server_port}" if public_ip else None,
    }


@app.get("/api/status")
def api_status():
    return get_live_snapshot()["status"]


@app.get("/api/network")
def api_network():
    """Local + internet join addresses for the Overview 'How to connect' block."""
    return network_info()


def players_with_sessions() -> dict:
    """Players info enriched with session_seconds/ping/biome from player_tracker."""
    info = get_players_info()
    try:
        merged = player_tracker.merge_players(info.get("players", []), [])
        player_tracker.update_sessions(panel_db.get_db_path(), merged)
        info["players"] = merged
    except Exception:  # pragma: no cover - session tracking is best-effort
        pass
    return info


@app.get("/api/players")
def api_players():
    return get_live_snapshot()["players"]


@app.get("/api/metrics")
def api_metrics(light: bool = Query(False)):
    global _metrics_prev
    now = time.time()
    raw = get_container_metrics_raw()
    if light:
        disk = get_valheim_disk_usage_cached()
        if disk is None:
            disk = get_valheim_disk_usage()
    else:
        disk = get_valheim_disk_usage()
    compose_limit_gb = read_memory_limit_gb()

    rates = {"rx_bps": 0, "tx_bps": 0, "disk_read_bps": 0, "disk_write_bps": 0}
    if _metrics_prev is not None:
        dt = now - _metrics_prev.get("ts", now)
        rates = compute_rates(raw, _metrics_prev.get("raw", {}), dt)

    _metrics_prev = {"ts": now, "raw": raw}

    memory_limit_bytes = raw["memory_limit_bytes"]
    if compose_limit_gb is not None:
        memory_limit_bytes = compose_limit_gb * 1024**3

    memory_used = raw["memory_used_bytes"]
    memory_pct = (memory_used / memory_limit_bytes * 100) if memory_limit_bytes else raw["memory_percent"]

    n_cpus = get_cpu_count()
    valheim_raw = raw["cpu_percent"]
    cpu = cpu_block("valheim-server", valheim_raw, n_cpus)

    panel_m = panel_container_metrics()
    panel_cpu = cpu_block("vikinger-panel", panel_m["cpu_percent_host"], n_cpus)
    server_view = {
        "cpu_percent_host": cpu["percent_host"],
        "cpu_percent_of_limit": cpu["percent_of_limit"],
        "memory_used_bytes": memory_used,
        "memory_limit_bytes": memory_limit_bytes,
    }
    agg = docker_metrics.aggregate([
        {
            "running": raw["running"],
            "cpu_percent_host": cpu["percent_host"],
            "cpu_percent_of_limit": cpu["percent_of_limit"],
            "memory_used_bytes": memory_used,
            "memory_limit_bytes": memory_limit_bytes,
            "net_rx_bytes": raw["net_rx_bytes"],
            "net_tx_bytes": raw["net_tx_bytes"],
            "block_read_bytes": raw["block_read_bytes"],
            "block_write_bytes": raw["block_write_bytes"],
        },
        panel_m,
    ])

    payload = {
        "running": raw["running"],
        "cpu": cpu,
        "cpu_count": n_cpus,
        "memory": {
            "used_bytes": memory_used,
            "limit_bytes": memory_limit_bytes,
            "limit_gb": compose_limit_gb,
            "unlimited": compose_limit_gb is None and raw["memory_limit_bytes"] == memory_limit_bytes,
            "percent": round(memory_pct, 1),
        },
        "disk": {**disk, "limits": storage_limits.disk_limits_summary()},
        "network": {
            "rx_bytes_total": raw["net_rx_bytes"],
            "tx_bytes_total": raw["net_tx_bytes"],
            "rx_bps": rates["rx_bps"],
            "tx_bps": rates["tx_bps"],
        },
        "block_io": {
            "read_bytes_total": raw["block_read_bytes"],
            "write_bytes_total": raw["block_write_bytes"],
            "read_bps": rates["disk_read_bps"],
            "write_bps": rates["disk_write_bps"],
        },
        "panel": {
            "running": panel_m["running"],
            "cpu": panel_cpu,
            "memory": {
                "used_bytes": panel_m["memory_used_bytes"],
                "limit_bytes": panel_m["memory_limit_bytes"],
                "percent": round(panel_m["memory_percent"], 1),
            },
        },
        "aggregate": {
            "cpu_percent_host": agg["cpu_percent_host"],
            "cpu_percent_of_limit": agg["cpu_percent_of_limit"],
            "memory_used_bytes": agg["memory_used_bytes"],
            "memory_limit_bytes": agg["memory_limit_bytes"],
            "memory_percent": agg["memory_percent"],
        },
    }
    _record_metrics_history(payload, rates)
    return payload


def _record_metrics_history(payload: dict, rates: dict) -> None:
    """Persist a metrics sample per container (best-effort, non-fatal)."""
    try:
        now = time.time()
        players = 0
        try:
            players = get_players_info().get("count", 0)
        except Exception:
            players = 0
        metrics_history.record_sample(
            panel_db.get_db_path(),
            "valheim-server",
            {
                "cpu_percent_host": payload["cpu"]["percent_host"],
                "cpu_percent_of_limit": payload["cpu"]["percent_of_limit"],
                "memory_used_bytes": payload["memory"]["used_bytes"],
                "memory_limit_bytes": payload["memory"]["limit_bytes"],
                "memory_percent": payload["memory"]["percent"],
                "net_rx_bps": rates["rx_bps"],
                "net_tx_bps": rates["tx_bps"],
            },
            ts=now,
            players=players,
        )
        metrics_history.record_sample(
            panel_db.get_db_path(),
            "vikinger-panel",
            {
                "cpu_percent_host": payload["panel"]["cpu"]["percent_host"],
                "cpu_percent_of_limit": payload["panel"]["cpu"]["percent_of_limit"],
                "memory_used_bytes": payload["panel"]["memory"]["used_bytes"],
                "memory_limit_bytes": payload["panel"]["memory"]["limit_bytes"],
                "memory_percent": payload["panel"]["memory"]["percent"],
                "net_rx_bps": 0,
                "net_tx_bps": 0,
            },
            ts=now,
            players=None,
        )
    except Exception:  # pragma: no cover - history is best-effort
        pass


@app.get("/api/resources/memory")
def api_get_memory_limit():
    gb = read_memory_limit_gb()
    return {
        "gb": gb,
        "unlimited": gb is None,
        "min_gb": MEMORY_MIN_GB,
        "max_gb": MEMORY_MAX_GB,
        "slider_max": MEMORY_UNLIMITED_SLIDER,
    }


@app.put("/api/resources/memory")
def api_set_memory_limit(body: MemoryLimitUpdate):
    if body.gb is not None and (body.gb < MEMORY_MIN_GB or body.gb > MEMORY_MAX_GB):
        raise HTTPException(
            400,
            f"Limit must be between {MEMORY_MIN_GB} and {MEMORY_MAX_GB} GB, or null for unlimited",
        )

    raw = get_container_metrics_raw()
    warning = None
    if body.gb is not None and raw["memory_used_bytes"] > body.gb * 1024**3 * 0.85:
        warning = (
            f"Current usage ({raw['memory_used_bytes'] // (1024**2)} MB) is close to or above "
            f"the requested limit ({body.gb} GB). Docker may kill the container."
        )

    write_memory_limit_gb(body.gb)

    if body.apply:
        r = recreate_container()
        if r.returncode != 0:
            raise HTTPException(500, r.stderr or r.stdout or "Failed to recreate container")

    return {
        "ok": True,
        "gb": body.gb,
        "unlimited": body.gb is None,
        "warning": warning,
        "message": "RAM limit updated. Container recreated." if body.apply else "Limit saved to compose.",
    }


@app.get("/api/config/capacity")
def api_get_capacity():
    return build_capacity_response()


@app.put("/api/config/capacity")
def api_set_capacity(body: CapacityUpdate):
    result = build_capacity_response()
    memory_warning = None

    if body.memory_gb is not None or body.apply_memory:
        gb = body.memory_gb
        if gb is not None and gb == MEMORY_UNLIMITED_SLIDER:
            gb = None
        if gb is not None and (gb < MEMORY_MIN_GB or gb > MEMORY_MAX_GB):
            raise HTTPException(
                400,
                f"Limit must be between {MEMORY_MIN_GB} and {MEMORY_MAX_GB} GB, or {MEMORY_UNLIMITED_SLIDER} for unlimited",
            )
        if body.apply_memory:
            raw = get_container_metrics_raw()
            if gb is not None and raw["memory_used_bytes"] > gb * 1024**3 * 0.85:
                memory_warning = (
                    f"Current usage ({raw['memory_used_bytes'] // (1024 ** 2)} MB) is close to or above "
                    f"the requested limit ({gb} GB). Docker may kill the container."
                )
            write_memory_limit_gb(gb)
            r = recreate_container()
            if r.returncode != 0:
                raise HTTPException(500, r.stderr or r.stdout or "Failed to recreate container")

    if body.max_players is not None:
        write_max_players(body.max_players)

    result = build_capacity_response()
    if memory_warning:
        result["memory_warning"] = memory_warning
    if body.apply_memory:
        result["message"] = "RAM limit updated. Container recreated."
    elif body.max_players is not None:
        result["message"] = "Player limit updated."
    return result


@app.post("/api/server/backup")
def api_server_backup():
    try:
        output = trigger_backup()
    except Exception as e:
        dispatch_alert("backup_fail", {"error": str(getattr(e, "detail", None) or e)})
        raise
    dispatch_alert("backup_ok", {})
    return {"ok": True, "message": "Backup requested", "output": output}


@app.post("/api/server/{action}")
def api_server_action(action: str):
    actions = {
        "start": start_valheim_container,
        "stop": stop_valheim_container,
        "restart": restart_valheim_container,
        "recreate": recreate_container,
        "pause": lambda: docker("exec", CONTAINER_NAME, "supervisorctl", "stop", "valheim-server"),
        "resume": lambda: docker("exec", CONTAINER_NAME, "supervisorctl", "start", "valheim-server"),
    }
    if action not in actions:
        raise HTTPException(400, f"Invalid action: {action}")

    if action in ("pause", "resume") and not container_running():
        raise HTTPException(400, "Container is not running")

    alert_by_action = {
        "start": "server_starting",
        "stop": "server_stopping",
        "restart": "server_restarting",
        "recreate": "server_restarting",
    }
    alert_event = alert_by_action.get(action)
    if alert_event:
        dispatch_alert(alert_event, {})
    if action in ("start",):
        _mark_pending_ready("start")
    elif action in ("restart", "recreate"):
        _mark_pending_ready("restart")
    elif action == "stop":
        _clear_pending_ready()

    r = actions[action]()
    if r.returncode != 0:
        raise HTTPException(500, r.stderr or r.stdout or "Failed to execute action")
    return {"ok": True, "action": action, "output": (r.stdout + r.stderr).strip()}


@app.get("/api/logs")
def api_logs(
    lines: int = Query(150, ge=10, le=2000),
    source: str = "docker",
    hide_noise: bool = Query(False),
    category: str = Query("all"),
    search: str = Query(""),
):
    if source == "bepinex":
        raw = bepinex_log(lines)
    else:
        raw = get_logs(lines)
    filtered, line_count, filtered_count = apply_log_filters(
        raw,
        hide_noise=hide_noise,
        category=category,
        search=search,
    )
    return {
        "logs": filtered,
        "line_count": line_count,
        "filtered_count": filtered_count,
    }


# ── Console RCON ─────────────────────────────────────────────────────────────

@app.get("/api/console/status")
def api_console_status():
    maybe_ensure_rcon_password()
    plugin_installed = is_plugin_installed(PLUGINS_DIR, PLUGINS_DISABLED_DIR)
    mod_enabled = is_mod_enabled(PLUGINS_DIR, PLUGINS_DISABLED_DIR)
    bepinex = read_bepinex_compose()
    cfg = _rcon_settings()
    configured = cfg is not None and mod_enabled
    running = container_running()
    return {
        "available": plugin_installed and mod_enabled and configured and running,
        "plugin_installed": plugin_installed,
        "mod_enabled": mod_enabled,
        "configured": configured,
        "bepinex_enabled": bepinex,
        "container_running": running,
        "host": cfg["host"] if cfg else None,
        "port": cfg["port"] if cfg else None,
    }


@app.post("/api/console/command")
def api_console_command(body: ConsoleCommand):
    command = body.command.strip()
    if not command:
        raise HTTPException(400, "Empty command")
    _require_rcon()
    output = _run_rcon(command)
    return {"ok": True, "command": command, "output": output}


@app.post("/api/players/{steam_id}/action")
def api_player_action(steam_id: str, body: PlayerActionBody):
    sid = steam_id.strip()
    if not STEAM_ID_RE.match(sid):
        raise HTTPException(400, "Invalid Steam ID (expected 17 digits)")

    action = body.action.strip().lower()
    if action not in _PLAYER_RCON_ACTIONS:
        raise HTTPException(400, f"Invalid action: {action}")

    _require_rcon()
    rcon_cmd = _PLAYER_RCON_ACTIONS[action](sid)
    output = _run_rcon(rcon_cmd)

    synced: Optional[dict] = None
    if action in _PLAYER_LIST_SYNC:
        kind, add = _PLAYER_LIST_SYNC[action]
        ids = mutate_serverlist(kind, sid, add)
        synced = {"kind": kind, "ids": ids}

    if action == "kick":
        dispatch_alert("player_kick", {"player": _alert_player_label(sid)})
    elif action == "ban":
        dispatch_alert("player_ban", {"player": _alert_player_label(sid)})

    return {"ok": True, "action": action, "steam_id": sid, "output": output, "synced": synced}


# ── Config / Env ─────────────────────────────────────────────────────────────

@app.get("/api/config/env")
def api_get_env():
    return prepare_env_for_api(read_env())


@app.put("/api/config/env")
def api_put_env(body: EnvUpdate):
    try:
        normalized = apply_env_save(body.values)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    write_env(normalized)
    result = prepare_env_for_api(read_env())
    return {"ok": True, **result}


@app.get("/api/config/serverlists")
def api_get_serverlists():
    return list_serverlists()


@app.put("/api/config/serverlists/{kind}")
def api_put_serverlist(kind: str, body: ServerListUpdate):
    if kind not in ("admin", "banned", "permitted"):
        raise HTTPException(400, "Invalid type")
    write_serverlist(kind, body.ids)
    if container_running():
        docker("exec", CONTAINER_NAME, "supervisorctl", "restart", "valheim-server")
    return {"ok": True, "ids": body.ids}


# ── Mods ─────────────────────────────────────────────────────────────────────

@app.get("/api/mods")
def api_list_mods():
    return {"mods": list_mods_enriched()}


@app.get("/api/mods/export-r2z")
def api_export_r2z():
    data, profile_name, mods_count, skipped = build_r2modman_zip_bytes()
    timestamp = int(time.time() * 1000)
    safe_name = re.sub(r"[^\w\-]+", "_", profile_name).strip("_") or "Valheim"
    filename = f"{safe_name}_{timestamp}.r2z"
    return Response(
        content=data,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.post("/api/mods/export-code")
def api_export_code():
    data, profile_name, mods_count, skipped = build_r2modman_zip_bytes()
    payload = "#r2modman\n" + base64.b64encode(data).decode("ascii")
    code = upload_r2modman_profile(payload)
    return {
        "ok": True,
        "code": code,
        "profile_name": profile_name,
        "mods_count": mods_count,
        "skipped": skipped,
    }


@app.post("/api/mods/upload")
async def api_upload_mod(file: UploadFile = File(...)):
    ensure_plugins_writable()
    data = await file.read()
    filename = file.filename or "mod"

    if filename.lower().endswith(".zip"):
        installed = extract_dlls_from_zip(data, PLUGINS_DIR)
        if not installed:
            raise HTTPException(400, "No .dll found in the ZIP")
        for dll in installed:
            dispatch_alert("mod_added", {"mod": dll, "version": ""})
        return {"ok": True, "installed": installed}

    if filename.lower().endswith(".dll"):
        dest = PLUGINS_DIR / Path(filename).name
        try:
            dest.write_bytes(data)
        except PermissionError as e:
            raise HTTPException(
                500,
                f"No permission to write {dest.name}. "
                f"Run: sudo {FIX_PLUGINS_SCRIPT}",
            ) from e
        dispatch_alert("mod_added", {"mod": dest.name, "version": ""})
        return {"ok": True, "installed": [dest.name]}

    raise HTTPException(400, "Upload a .zip or .dll file")


@app.post("/api/mods/install-url")
async def api_install_mod_url(body: ModUrlInstall):
    ensure_plugins_writable()
    normalized = normalize_thunderstore_url(body.url)
    download_url = resolve_mod_download_url(body.url)
    data = download_mod_bytes(download_url)

    installed = extract_dlls_from_zip(data, PLUGINS_DIR)
    if not installed:
        raise HTTPException(400, "No .dll found in the package")

    ref = resolve_thunderstore_ref(body.url, download_url)
    mod_label = ", ".join(installed)
    version = ""
    if ref:
        owner, name, version = ref
        if not version:
            dl_ref = parse_thunderstore_from_download_url(download_url) or parse_gcdn_thunderstore_url(download_url)
            if dl_ref and dl_ref[0] == owner and dl_ref[1] == name and dl_ref[2]:
                version = dl_ref[2]
        if not version:
            info = fetch_thunderstore_package_info(owner, name)
            version = info["latest_version"]
        source_url = normalized if THUNDERSTORE_PAGE_RE.match(normalized) else body.url.strip()
        register_mod_package(owner, name, version, installed, source_url)
        mod_label = f"{owner}-{name}"

    dispatch_alert("mod_added", {"mod": mod_label, "version": version or ""})
    return {"ok": True, "installed": installed}


@app.delete("/api/mods/{name}")
def api_delete_mod(name: str):
    if ".." in name or "/" in name:
        raise HTTPException(400, "Invalid name")
    if is_protected_mod(name):
        raise HTTPException(403, "This mod is bundled with the panel and cannot be removed")
    found = find_mod(name)
    if not found:
        raise HTTPException(404, "Mod not found")
    path, _ = found
    path.unlink()
    remove_runtime_plugin(name)
    remove_dll_from_registry(name)
    dispatch_alert("mod_removed", {"mod": name})
    return {"ok": True, "deleted": name}


@app.post("/api/mods/{name}/toggle")
def api_toggle_mod(name: str, body: ModToggle):
    if ".." in name or "/" in name:
        raise HTTPException(400, "Invalid name")
    found = find_mod(name)
    if not found:
        raise HTTPException(404, "Mod not found")
    path, currently_enabled = found
    if currently_enabled == body.enabled:
        return {
            "ok": True,
            "name": name,
            "enabled": body.enabled,
            "message": "No changes",
        }
    dest_dir = PLUGINS_DIR if body.enabled else PLUGINS_DISABLED_DIR
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / name
    shutil.move(str(path), str(dest))
    sync_plugins_to_runtime()
    return {
        "ok": True,
        "name": name,
        "enabled": body.enabled,
        "message": "Mod updated. Restart the server to apply.",
    }


@app.post("/api/mods/{name}/link")
def api_link_mod(name: str, body: ModLink):
    if ".." in name or "/" in name:
        raise HTTPException(400, "Invalid name")
    if is_unlinkable_mod(name):
        raise HTTPException(400, "This DLL is a BepInEx dependency and cannot be linked to Thunderstore")
    if not find_mod(name):
        raise HTTPException(404, "Mod not found")

    normalized = normalize_thunderstore_url(body.url)
    ref = resolve_thunderstore_ref(body.url, normalized)
    if not ref:
        raise HTTPException(400, "Invalid Thunderstore URL")

    owner, pkg_name, version = ref
    if not version:
        dl_ref = parse_thunderstore_from_download_url(normalized) or parse_gcdn_thunderstore_url(normalized)
        if dl_ref and dl_ref[2]:
            version = dl_ref[2]
    if not version:
        info = fetch_thunderstore_package_info(owner, pkg_name)
        version = info["latest_version"]

    pkg = find_package_for_dll(name)
    dlls = sorted(set((pkg or {}).get("dlls") or []) | {name})
    source_url = normalized if THUNDERSTORE_PAGE_RE.match(normalized) else body.url.strip()
    register_mod_package(owner, pkg_name, version, dlls, source_url)
    return {"ok": True, "package_id": f"{owner}/{pkg_name}", "version": version}


@app.post("/api/mods/{name}/check-update")
def api_check_mod_update(name: str):
    if ".." in name or "/" in name:
        raise HTTPException(400, "Invalid name")
    pkg = find_package_for_dll(name)
    if not pkg:
        raise HTTPException(404, "Mod has no Thunderstore link. Use Link Thunderstore.")
    result = check_mod_update_for_package(pkg, use_cache=False)
    return {"ok": True, "name": name, **result}


@app.post("/api/mods/{name}/update")
def api_update_mod(name: str):
    if ".." in name or "/" in name:
        raise HTTPException(400, "Invalid name")
    pkg = find_package_for_dll(name)
    if not pkg:
        raise HTTPException(404, "Mod has no Thunderstore link")

    result = apply_mod_package_update(pkg)
    return {"ok": True, **result}


@app.post("/api/mods/check-updates")
def api_check_all_mod_updates():
    return check_all_mod_updates()


@app.post("/api/mods/update-all")
def api_update_all_mods():
    return update_all_mod_packages()


# ── Worlds ───────────────────────────────────────────────────────────────────

@app.get("/api/worlds")
def api_list_worlds():
    worlds, active, running, reconciled = build_worlds_list()
    return {"worlds": worlds, "active": active, "running": running, "world_reconciled": reconciled}


@app.post("/api/worlds/switch")
def api_switch_world(body: WorldSwitch):
    name = validate_world_name(body.world_name)
    if name not in collect_known_world_names(reconcile=False):
        raise HTTPException(404, f"World '{name}' not found")
    write_env({"WORLD_NAME": name})
    remove_pending_world(name)
    if container_running():
        r = recreate_container()
        if r.returncode != 0:
            raise HTTPException(500, r.stderr or r.stdout or "Failed to recreate container")
    return {"ok": True, "world_name": name}


@app.post("/api/worlds/create")
def api_create_world(
    name: str = Query(...),
    activate: bool = Query(False),
    body: Optional[WorldCreateBody] = None,
):
    name = validate_world_name(name)
    fwl = WORLDS_DIR / f"{name}.fwl"
    if fwl.exists():
        raise HTTPException(409, "World already exists")
    env = read_env()
    if env.get("WORLD_NAME", "").strip() == name:
        raise HTTPException(409, "World is already active")
    pending = read_pending_worlds()
    if name in pending:
        raise HTTPException(409, "World already registered as pending")

    config = WorldConfig.from_dict(body.config) if body and body.config else WorldConfig()
    if body and body.seed:
        config.seed = body.seed.strip() or None
    if config.to_dict() != WorldConfig().to_dict() or config.seed:
        set_stored_world_config(name, config)

    WORLDS_DIR.mkdir(parents=True, exist_ok=True)
    write_world_fwl(fwl, name, config, backup=False)

    if activate:
        write_env({"WORLD_NAME": name})
        remove_pending_world(name)
        if container_running():
            r = recreate_container()
            if r.returncode != 0:
                raise HTTPException(500, r.stderr or r.stdout or "Failed to recreate container")
        return {
            "ok": True,
            "world_name": name,
            "activated": True,
            "message": "World created and activated",
        }

    add_pending_world(name)
    return {
        "ok": True,
        "world_name": name,
        "activated": False,
        "message": "World registered with settings. Activate when ready.",
    }


@app.get("/api/worlds/{name}/config")
def api_get_world_config(name: str):
    name = validate_world_name(name)
    if not world_known(name):
        raise HTTPException(404, "World not found")
    meta = read_world_meta(name)
    stored = get_stored_world_config(name)
    details = world_config_details(meta, stored=stored)
    _, warnings, has_fwl = world_config_for_name(name)
    running = get_container_world_name()
    env = read_env()
    active = running or env.get("WORLD_NAME", "").strip()
    return {
        "name": name,
        "config": details["config"],
        "inferred_preset": details["inferred_preset"],
        "effective": details["effective"],
        "flags": details["flags"],
        "modifier_strings": details["modifier_strings"],
        "summary": details["effective"],
        "meta": {
            "seed": meta.seed_name if meta else details["config"].get("seed"),
            "uid": meta.uid if meta else None,
            "world_version": meta.world_version if meta else None,
            "has_fwl": has_fwl,
            "has_db": (WORLDS_DIR / f"{name}.db").exists(),
        },
        "editable": True,
        "warnings": warnings,
        "requires_restart": has_fwl and name == active and container_running(),
        "running": name == running,
        "active": name == active,
    }


@app.put("/api/worlds/{name}/config")
def api_put_world_config(name: str, body: WorldConfigUpdate):
    name = validate_world_name(name)
    if not world_known(name):
        raise HTTPException(404, "World not found")

    config = WorldConfig.from_dict(body.config)
    fwl = WORLDS_DIR / f"{name}.fwl"
    set_stored_world_config(name, config)

    if fwl.exists():
        meta = read_fwl(fwl)
        write_world_fwl(
            fwl,
            name,
            config,
            seed_name=meta.seed_name,
            uid=meta.uid,
            backup=True,
        )
    else:
        WORLDS_DIR.mkdir(parents=True, exist_ok=True)
        write_world_fwl(fwl, name, config, backup=False)

    running = get_container_world_name()
    env = read_env()
    active = running or env.get("WORLD_NAME", "").strip()
    requires_restart = name == active and container_running()

    if body.restart and requires_restart:
        r = restart_valheim_container()
        if r.returncode != 0:
            raise HTTPException(500, r.stderr or r.stdout or "Failed to restart container")

    meta_after = read_fwl(fwl)
    details = world_config_details(meta_after, stored=config)

    return {
        "ok": True,
        "name": name,
        "config": details["config"],
        "inferred_preset": details["inferred_preset"],
        "effective": details["effective"],
        "flags": details["flags"],
        "modifier_strings": details["modifier_strings"],
        "summary": details["effective"],
        "requires_restart": requires_restart and not body.restart,
        "restarted": body.restart and requires_restart,
    }


@app.delete("/api/worlds/{name}")
def api_delete_world(name: str):
    name = validate_world_name(name)
    env = read_env()
    if env.get("WORLD_NAME") == name:
        raise HTTPException(400, "Cannot delete the active world")
    deleted = []
    for ext in (".fwl", ".db", ".fwl.bak"):
        path = WORLDS_DIR / f"{name}{ext}"
        if path.exists():
            path.unlink()
            deleted.append(path.name)
    backup = fwl_backup_path(name)
    if backup.exists():
        backup.unlink()
        deleted.append(backup.name)
    pending = read_pending_worlds()
    if name in pending:
        remove_pending_world(name)
        deleted.append(name)
    remove_stored_world_config(name)
    if not deleted:
        raise HTTPException(404, "World not found")
    return {"ok": True, "deleted": deleted}


# ── Files ────────────────────────────────────────────────────────────────────

@app.get("/api/files/tree")
def api_file_tree(
    scope: str = "config",
    path: Optional[str] = Query(None),
    depth: Optional[int] = Query(None),
):
    scopes = {
        "config": CONFIG_DIR,
        "data": DATA_DIR,
    }
    if scope not in scopes:
        raise HTTPException(400, "Invalid scope — use config or data")
    base = scopes[scope]
    # config stays fully expanded (small); data defaults to one level (lazy).
    if depth is None:
        depth = None if scope == "config" else 0
    if path:
        if not path.startswith(f"{scope}/") and path != scope:
            raise HTTPException(400, "path must be under the requested scope")
        target = safe_path(path)
        if not target.is_dir():
            raise HTTPException(404, "Directory not found")
        rel_prefix = path.rstrip("/")

        def build():
            return file_tree(target, rel_prefix, depth=0)

        tree = _get_cached_file_tree(scope, path, 0, build)
        return {"tree": tree, "path": path, "lazy": True}

    def build_root():
        return file_tree(base, scope, depth=depth)

    tree = _get_cached_file_tree(scope, "", depth, build_root)
    return {"tree": tree, "lazy": depth is not None}


@app.get("/api/files/read")
def api_read_file(path: str):
    target = safe_path(path)
    if not target.is_file():
        raise HTTPException(404, "File not found")
    if target.suffix.lower() in (".db", ".fwl", ".zip"):
        raise HTTPException(400, "Binary file — use download")
    content = target.read_text(errors="replace")
    return {"path": path, "content": content, "size": target.stat().st_size}


@app.put("/api/files/write")
def api_write_file(path: str, body: FileContent):
    target = safe_path(path)
    if target.suffix.lower() in (".db", ".fwl"):
        raise HTTPException(400, "Cannot edit binary files")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(body.content)
    scope = path.split("/", 1)[0] if "/" in path else path
    _invalidate_file_tree_cache(scope if scope in ("config", "data") else None)
    return {"ok": True, "path": path}


@app.get("/api/files/download")
def api_download_file(path: str):
    target = safe_path(path)
    if not target.is_file():
        raise HTTPException(404, "File not found")
    return FileResponse(target, filename=target.name)


def _protected_file_paths() -> set[Path]:
    return {ENV_FILE.resolve(), COMPOSE_FILE.resolve()}


def _is_protected_file(target: Path, path: str) -> bool:
    if target.resolve() in _protected_file_paths():
        return True
    norm = path.replace("\\", "/")
    if norm.startswith("config/bepinex/"):
        name = norm.rsplit("/", 1)[-1]
        if name in PROTECTED_CFG_NAMES or name.lower() in {n.lower() for n in PROTECTED_CFG_NAMES}:
            return True
    return False


@app.get("/api/files/delete-info")
def api_file_delete_info(path: str):
    target = safe_path(path)
    if not target.exists():
        raise HTTPException(404, "Not found")
    if _is_protected_file(target, path):
        raise HTTPException(403, "Protected file")
    norm_path = path.replace("\\", "/")
    is_cfg = is_bepinex_plugin_cfg_path(norm_path)
    plugin = None
    if is_cfg and target.is_file():
        plugin = find_plugin_for_cfg(
            target.name, BEPINEX_CFG_DIR, PLUGINS_DIR, PLUGINS_DISABLED_DIR
        )
    running = container_running()
    active_plugin = bool(plugin and plugin.get("enabled"))
    return {
        "path": path,
        "name": target.name,
        "is_bepinex_cfg": is_cfg,
        "plugin": plugin,
        "server_running": running,
        "will_recreate_cfg": bool(is_cfg and active_plugin and running),
    }


@app.delete("/api/files/delete")
def api_delete_file(path: str):
    target = safe_path(path)
    if not target.exists():
        raise HTTPException(404, "Not found")
    if _is_protected_file(target, path):
        raise HTTPException(403, "Protected file")
    if target.is_dir():
        shutil.rmtree(target)
    else:
        target.unlink()
    scope = path.split("/", 1)[0] if "/" in path else path
    _invalidate_file_tree_cache(scope if scope in ("config", "data") else None)
    return {"ok": True}


# ── BepInEx Configs ──────────────────────────────────────────────────────────

@app.get("/api/bepinex/configs")
def api_bepinex_configs():
    configs = []
    if BEPINEX_CFG_DIR.exists():
        for cfg in sorted(BEPINEX_CFG_DIR.glob("*.cfg")):
            stat = cfg.stat()
            configs.append({
                "name": cfg.name,
                "path": f"config/bepinex/{cfg.name}",
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })
    return {"configs": configs}


@app.get("/api/bepinex/configs/parse")
def api_bepinex_config_parse_get(path: str = Query(...)):
    return _parse_bepinex_config(path)


@app.post("/api/bepinex/configs/parse")
def api_bepinex_config_parse_post(body: BepinexCfgParseBody):
    return _parse_bepinex_config(body.path, body.content)


def _parse_bepinex_config(path: str, content: Optional[str] = None) -> dict:
    if not is_bepinex_plugin_cfg_path(path):
        raise HTTPException(400, "Not a BepInEx plugin config file")
    target = safe_path(path)
    if content is None:
        if not target.is_file():
            raise HTTPException(404, "File not found")
        text = target.read_text(encoding="utf-8", errors="replace")
    else:
        text = content
    doc = parse_bepinex_cfg(text)
    return {
        "path": path,
        "raw": text,
        "document": doc.to_dict(),
        "structured": doc.structured,
    }


@app.put("/api/bepinex/configs/apply")
def api_bepinex_config_apply(body: BepinexCfgApply):
    path = body.path
    if not is_bepinex_plugin_cfg_path(path):
        raise HTTPException(400, "Not a BepInEx plugin config file")
    target = safe_path(path)
    if not target.is_file():
        raise HTTPException(404, "File not found")
    text = target.read_text(encoding="utf-8", errors="replace")
    updated = apply_setting_values(text, body.updates)
    target.write_text(updated, encoding="utf-8")
    return {"ok": True, "path": path, "content": updated}


@app.get("/api/bepinex/orphaned-configs")
def api_bepinex_orphaned_configs():
    orphaned = find_orphaned_configs(BEPINEX_CFG_DIR, PLUGINS_DIR, PLUGINS_DISABLED_DIR)
    return {"configs": orphaned, "count": len(orphaned)}


@app.delete("/api/bepinex/orphaned-configs")
def api_bepinex_delete_orphaned_configs(body: OrphanedCfgDelete):
    orphaned = find_orphaned_configs(BEPINEX_CFG_DIR, PLUGINS_DIR, PLUGINS_DISABLED_DIR)
    allowed = {c["name"] for c in orphaned}
    if body.names:
        to_delete = [n for n in body.names if n in allowed]
    else:
        to_delete = sorted(allowed)
    deleted: list[str] = []
    for name in to_delete:
        if name in PROTECTED_CFG_NAMES:
            continue
        target = BEPINEX_CFG_DIR / name
        if target.is_file():
            target.unlink()
            deleted.append(name)
    return {"ok": True, "deleted": deleted, "count": len(deleted)}


# ── Updates (game + BepInEx mode) ────────────────────────────────────────────

@app.get("/api/updates/config")
def api_get_updates_config():
    cfg = update_config()
    bepinex = read_bepinex_compose()
    game = read_game_version()
    mods_count = len(list_mods_data())
    suggest_disable_auto = mods_count > 0 and cfg.get("UPDATE_AUTO") == "true"
    return {
        "values": cfg,
        "defaults": {**UPDATE_DEFAULTS, "UPDATE_AUTO": "true"},
        "bepinex": bepinex,
        "modded": bepinex,
        "game_version": game,
        "mods_count": mods_count,
        "suggest_disable_auto": suggest_disable_auto,
    }


@app.put("/api/updates/config")
def api_put_updates_config(body: UpdateConfigUpdate):
    bepinex_changed = False
    mode_result = None
    if body.bepinex is not None:
        current = read_bepinex_compose()
        if current != body.bepinex:
            mode_result = apply_server_mode(body.bepinex)
            bepinex_changed = True

    if body.values:
        allowed = {k: v for k, v in body.values.items() if k in ("UPDATE_AUTO", "UPDATE_IF_IDLE", "UPDATE_CRON")}
        write_update_config(allowed)

    if body.restart or bepinex_changed:
        r = recreate_container()
        if r.returncode != 0:
            raise HTTPException(500, r.stderr or r.stdout or "Failed to recreate container")

    response = {
        "ok": True,
        "values": update_config(),
        "bepinex": read_bepinex_compose(),
        "recreated": body.restart or bepinex_changed,
    }
    if mode_result:
        response["mode_result"] = mode_result
    return response


@app.get("/api/updates/status")
def api_updates_status():
    sup = supervisor_status()
    mods_count = len(list_mods_data())
    bepinex = read_bepinex_compose()
    cfg = update_config()
    return {
        "game_version": read_game_version(),
        "updater_state": sup.get("valheim-updater", "UNKNOWN"),
        "auto_updates": cfg.get("UPDATE_AUTO") == "true",
        "update_if_idle": cfg.get("UPDATE_IF_IDLE") == "true",
        "bepinex_enabled": bepinex,
        "mods_count": mods_count,
        "mods_warning": mods_count > 0 or bepinex,
    }


@app.post("/api/updates/check")
def api_updates_check():
    output = trigger_game_update_check()
    return {"ok": True, "message": "Update check requested", "output": output}


# ── Setup (primeiro acesso) ───────────────────────────────────────────────────

@app.get("/api/setup/status")
def api_setup_status():
    setup = migrate_setup_if_needed()
    needs_wizard = not setup.get("completed") and not _has_worlds()
    return {
        "completed": bool(setup.get("completed")),
        "mode": setup.get("mode"),
        "needs_wizard": needs_wizard,
    }


@app.post("/api/setup/complete")
def api_setup_complete(body: SetupComplete):
    if body.mode not in ("vanilla", "bepinex"):
        raise HTTPException(400, "Invalid mode — use 'vanilla' or 'bepinex'")

    bepinex = body.mode == "bepinex"
    mode_result = apply_server_mode(bepinex)

    admin_configured = False
    if not bepinex and body.admin_steam_id:
        sid = body.admin_steam_id.strip()
        if not STEAM_ID_RE.match(sid):
            raise HTTPException(400, "Invalid Steam ID (17 digits)")
        write_serverlist("admin", [sid])
        admin_configured = True

    world_name = None
    world_activated = False
    if body.world_name and body.world_name.strip():
        world_name = validate_world_name(body.world_name.strip())
        fwl = WORLDS_DIR / f"{world_name}.fwl"
        if fwl.exists():
            raise HTTPException(409, "World already exists")
        WORLDS_DIR.mkdir(parents=True, exist_ok=True)
        write_world_fwl(fwl, world_name, WorldConfig(), backup=False)
        if body.activate_world:
            write_env({"WORLD_NAME": world_name})
            remove_pending_world(world_name)
            world_activated = True
        else:
            add_pending_world(world_name)

    write_setup({
        "completed": True,
        "mode": body.mode,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    })

    r = recreate_container()
    if r.returncode != 0:
        raise HTTPException(500, r.stderr or r.stdout or "Failed to recreate container")

    rcon_password = None
    if mode_result.get("rcon", {}).get("created"):
        rcon_password = mode_result["rcon"].get("password")

    return {
        "ok": True,
        "mode": body.mode,
        "bepinex": bepinex,
        "admin_configured": admin_configured,
        "world_name": world_name,
        "world_activated": world_activated,
        "rcon_password": rcon_password,
        "mode_result": mode_result,
        "recreated": True,
    }


# ── Backups ──────────────────────────────────────────────────────────────────

@app.get("/api/backups")
def api_list_backups():
    run_backup_retention()
    return {"backups": list_backups(), "config": backup_config(), "state": read_backup_state()}


@app.get("/api/backups/config")
def api_get_backup_config():
    return {"values": backup_config(), "defaults": BACKUP_DEFAULTS}


@app.put("/api/backups/config")
def api_put_backup_config(body: BackupConfigUpdate):
    allowed = {k: v for k, v in body.values.items() if k in BACKUP_ENV_KEYS}
    if "BACKUPS_MAX_AGE" in allowed:
        try:
            age = int(allowed["BACKUPS_MAX_AGE"])
            if age < 1:
                raise ValueError
        except ValueError as e:
            raise HTTPException(400, "BACKUPS_MAX_AGE must be a number >= 1") from e
    write_env(allowed)
    run_backup_retention()
    if container_exists():
        r = restart_valheim_container()
        if r.returncode != 0:
            raise HTTPException(500, r.stderr or r.stdout or "Failed to restart container")
    return {"ok": True, "values": backup_config(), "purged": True, "restarted": container_exists()}


@app.post("/api/backups/trigger")
def api_trigger_backup():
    before_mtime = time.time()
    output = trigger_backup()
    time.sleep(3)
    manifested = finalize_recent_auto_backup_manifests(before_mtime)
    run_backup_retention()
    return {
        "ok": True,
        "message": "Backup requested",
        "output": output,
        "manifested": manifested,
    }


@app.post("/api/backups/create")
def api_create_backup(body: BackupCreate):
    name = create_manual_backup(body.type)
    return {"ok": True, "name": name, "type": body.type}


@app.post("/api/backups/restore-latest")
def api_restore_latest_backup():
    name = latest_restorable_backup()
    if not name:
        raise HTTPException(404, "No restorable backup found")
    result = restore_backup(name)
    return result


@app.post("/api/backups/restore-undo")
def api_restore_undo_backup():
    state = read_backup_state()
    undo = state.get("undo")
    if not undo:
        raise HTTPException(404, "No undo checkpoint available")
    result = restore_backup(undo)
    return result


@app.post("/api/backups/{name}/restore")
def api_restore_backup(name: str):
    result = restore_backup(name)
    return result


@app.get("/api/backups/{name}/details")
def api_backup_details(name: str):
    return get_backup_details(name)


@app.put("/api/backups/{name}/rename")
def api_rename_backup(name: str, body: BackupRename):
    return set_backup_display_name(name, body.display_name)


@app.delete("/api/backups/{name}")
def api_delete_backup(name: str):
    if ".." in name or "/" in name or "\\" in name:
        raise HTTPException(400, "Invalid name")
    target = BACKUPS_DIR / name
    if not target.exists() or not str(target.resolve()).startswith(str(BACKUPS_DIR.resolve())):
        raise HTTPException(404, "Backup not found")
    try:
        if target.is_dir():
            shutil.rmtree(target)
        else:
            target.unlink()
        sidecar = backup_sidecar_path(name)
        if sidecar.is_file():
            sidecar.unlink()
    except OSError as e:
        raise HTTPException(500, f"Failed to delete: {e}") from e
    return {"ok": True, "deleted": name}


@app.get("/api/backups/{name}/download")
def api_download_backup(name: str):
    if ".." in name or "/" in name or "\\" in name:
        raise HTTPException(400, "Invalid name")
    target = BACKUPS_DIR / name
    if not target.is_file() or not str(target.resolve()).startswith(str(BACKUPS_DIR.resolve())):
        raise HTTPException(404, "Backup not found")
    return FileResponse(target, filename=target.name)


# ── Storage limits ───────────────────────────────────────────────────────────

@app.get("/api/storage")
def api_get_storage():
    configure_storage_limits()
    return storage_limits.storage_overview(get_storage_monitor_usage())


@app.put("/api/storage/limits")
def api_put_storage_limits(body: StorageLimitsUpdate):
    configure_storage_limits()
    current = storage_limits.read_storage_limits()
    payload = dict(current)
    for key in storage_limits.CATEGORIES:
        raw = getattr(body, key, None)
        if raw is not None:
            payload[key] = raw
    limits = storage_limits.write_storage_limits(payload)
    enforced = storage_limits.enforce_all_storage_limits()
    return {"ok": True, "limits": limits, "enforced": enforced}


@app.post("/api/storage/enforce")
def api_enforce_storage(body: StorageEnforceRequest):
    configure_storage_limits()
    if body.category:
        if body.category not in storage_limits.CATEGORIES:
            raise HTTPException(400, f"Invalid category: {body.category}")
        enforced = {body.category: storage_limits.enforce_storage_limit(body.category)}
    else:
        enforced = storage_limits.enforce_all_storage_limits()
    return {"ok": True, "enforced": enforced}


@app.post("/api/backups/purge-all")
def api_purge_all_backups(body: PurgeAllBackupsRequest):
    if not body.confirm:
        raise HTTPException(400, "confirm=true is required")
    configure_storage_limits()
    result = storage_limits.purge_all_backups()
    return {"ok": True, **result}


# ── Auto messages ────────────────────────────────────────────────────────────

@app.get("/api/auto-messages")
def api_list_auto_messages():
    configure_auto_messages()
    data = auto_messages.list_messages()
    return {
        **data,
        "rcon_available": _auto_messages_rcon_available(),
    }


@app.put("/api/auto-messages/settings")
def api_auto_messages_settings(body: AutoMessagesSettings):
    configure_auto_messages()
    store = auto_messages.update_settings(enabled=body.enabled)
    return {"ok": True, "enabled": store["enabled"], "messages": store["messages"]}


@app.post("/api/auto-messages")
def api_create_auto_message(body: AutoMessageCreate):
    configure_auto_messages()
    try:
        msg = auto_messages.create_message(body.model_dump())
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    return {"ok": True, "message": msg}


@app.put("/api/auto-messages/{msg_id}")
def api_update_auto_message(msg_id: str, body: AutoMessageUpdate):
    configure_auto_messages()
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    try:
        msg = auto_messages.update_message(msg_id, payload)
    except KeyError:
        raise HTTPException(404, "Message not found") from None
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    return {"ok": True, "message": msg}


@app.delete("/api/auto-messages/{msg_id}")
def api_delete_auto_message(msg_id: str):
    configure_auto_messages()
    try:
        auto_messages.delete_message(msg_id)
    except KeyError:
        raise HTTPException(404, "Message not found") from None
    return {"ok": True}


@app.post("/api/auto-messages/{msg_id}/send")
def api_send_auto_message(msg_id: str):
    configure_auto_messages()
    msg = auto_messages.get_message(msg_id)
    if not msg:
        raise HTTPException(404, "Message not found")
    _require_rcon()
    try:
        result = auto_messages.send_message_now(msg, mark=True)
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except RuntimeError as e:
        raise HTTPException(503, str(e)) from e
    return result


@app.post("/api/auto-messages/preview")
def api_preview_auto_message(body: AutoMessagePreview):
    configure_auto_messages()
    players = get_players_info()
    base = _auto_messages_context()
    player = None
    if body.player_name or body.player_steam_id:
        player = {
            "name": body.player_name or "Player",
            "steam_id": body.player_steam_id or "76561198000000000",
        }
    ctx = auto_messages.build_tag_context(base=base, players=players, player=player)
    rendered = auto_messages.render_template(body.text, ctx)
    return {"ok": True, "rendered": rendered, "context": ctx}


# ── Audit ────────────────────────────────────────────────────────────────────

@app.get("/api/audit")
def api_get_audit(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    if page_size not in AUDIT_PAGE_SIZES:
        raise HTTPException(400, f"page_size must be one of {sorted(AUDIT_PAGE_SIZES)}")
    return read_audit_paginated(page, page_size)


@app.get("/api/audit/download")
def api_download_audit():
    if not AUDIT_FILE.exists():
        raise HTTPException(404, "No audit log found")
    return FileResponse(AUDIT_FILE, filename="audit.jsonl", media_type="application/x-ndjson")


# ── Metrics history / live / map / alerts / schedule ─────────────────────────

_live_hub = LiveHub()

ALERTS_SETTING_KEY = "alerts_config"
SCHEDULE_SETTING_KEY = "schedule_config"

DEFAULT_ALERTS_CONFIG = {
    "events": {
        "server_down": False,
        "server_up": False,
        "server_starting": False,
        "server_stopping": False,
        "server_restarting": False,
        "server_high_load": False,
        "player_join": False,
        "player_leave": False,
        "player_first_join": False,
        "player_kick": False,
        "player_ban": False,
        "player_death": False,
        "player_pvp_kill": False,
        "boss_defeated": False,
        "raid_started": False,
        "backup_scheduled_warning": False,
        "restart_scheduled_warning": False,
        "player_chat": False,
        "mod_added": False,
        "mod_updated": False,
        "mod_removed": False,
        "backup_ok": False,
        "backup_fail": False,
    },
    "discord": {"enabled": False, "webhook_url": ""},
    "telegram": {"enabled": False, "bot_token": "", "chat_id": ""},
    "chat_bridge": {"enabled": False, "prefix": "@discord"},
}

DEFAULT_SCHEDULE_CONFIG = {
    "restart": {"enabled": False, "cron": "0 5 * * *"},
    "backup": {"enabled": False, "cron": "0 4 * * *"},
    "mod_update": {"enabled": False, "cron": "0 3 * * 0"},
}


def read_alerts_config() -> dict:
    try:
        cfg = panel_db.get_setting(ALERTS_SETTING_KEY, None)
    except Exception:
        cfg = None
    if not isinstance(cfg, dict):
        return json.loads(json.dumps(DEFAULT_ALERTS_CONFIG))
    merged = json.loads(json.dumps(DEFAULT_ALERTS_CONFIG))
    for section, val in cfg.items():
        if isinstance(val, dict) and isinstance(merged.get(section), dict):
            merged[section].update(val)
        else:
            merged[section] = val
    return merged


def _alerts_config_public(cfg: dict) -> dict:
    """Redact secrets before returning config to the client."""
    pub = json.loads(json.dumps(cfg))
    if pub.get("discord", {}).get("webhook_url"):
        pub["discord"]["webhook_url_set"] = True
        pub["discord"]["webhook_url"] = ""
    if pub.get("telegram", {}).get("bot_token"):
        pub["telegram"]["bot_token_set"] = True
        pub["telegram"]["bot_token"] = ""
    return pub


def read_schedule_config() -> dict:
    try:
        cfg = panel_db.get_setting(SCHEDULE_SETTING_KEY, None)
    except Exception:
        cfg = None
    merged = json.loads(json.dumps(DEFAULT_SCHEDULE_CONFIG))
    if isinstance(cfg, dict):
        for job, val in cfg.items():
            if job in merged and isinstance(val, dict):
                merged[job].update(val)
    return merged


def dispatch_alert(event_type: str, ctx: dict | None = None) -> None:
    """Fire a configured alert (best-effort, never raises)."""
    try:
        cfg = read_alerts_config()
        panel_alerts.dispatch(cfg, event_type, ctx or {})
    except Exception:  # pragma: no cover - alerts are best-effort
        logger.debug("alert dispatch failed for %s", event_type, exc_info=True)


# Scheduler wiring (callables reference existing panel operations).
def _mark_pending_ready(kind: str) -> None:
    """Remember that we expect the game world to become ready after start/restart."""
    _alert_state["pending_ready"] = kind
    _alert_state["pending_ready_since"] = time.time()
    _alert_state["high_load"] = False


def _clear_pending_ready() -> None:
    _alert_state["pending_ready"] = None
    _alert_state["pending_ready_since"] = None


def _scheduled_restart():
    dispatch_alert("server_restarting", {})
    _mark_pending_ready("restart")
    return restart_valheim_container()


def _scheduled_backup():
    try:
        result = trigger_backup()
        dispatch_alert("backup_ok", {})
        return result
    except Exception as e:
        dispatch_alert("backup_fail", {"error": str(e)})
        raise


def _scheduled_mod_update():
    return update_all_mod_packages()


# ── Alert event detection (transition-based, opt-in) ─────────────────────────
# Wait for the character name to appear in logs (or fall back to players-seen cache).
JOIN_NAME_WAIT_SECONDS = 45.0
PENDING_READY_TIMEOUT_SECONDS = 180.0
WORLD_LOADED_MARKER = "World loaded"
GLOBAL_KEYS_POLL_SECONDS = 60.0
SCHEDULED_JOB_WARNING_MINUTES = 5

_alert_state: dict = {
    "container": None,
    "players": set(),
    "player_names": {},
    "pending_joins": {},  # steam_id -> unix ts when join was first seen
    "high_load": False,
    "init": False,
    "pending_ready": None,  # "start" | "restart" | None
    "pending_ready_since": None,
    "chat_seen": set(),  # recent line hashes for chat bridge dedupe
    "game_log_seen": set(),  # death/pvp dedupe
    "global_keys": set(),
    "global_keys_init": False,
    "last_global_keys_poll": 0.0,
    "scheduled_warnings": set(),
    "pending_first_joins": set(),
}


def _alerts_active(cfg: dict) -> bool:
    events = cfg.get("events", {})
    channels = cfg.get("discord", {}).get("enabled") or cfg.get("telegram", {}).get("enabled")
    bridge = (cfg.get("chat_bridge") or {}).get("enabled")
    return bool(channels) and (any(events.values()) or bool(bridge))


def _remember_player_names(players: list[dict]) -> dict[str, str]:
    """Persist real character names into players-seen.json; return live map."""
    names: dict[str, str] = {}
    for p in players:
        sid = str(p.get("steam_id") or "").strip()
        if not sid:
            continue
        live = str(p.get("name") or "").strip() or sid
        names[sid] = live
        if not auto_messages.is_placeholder_player_name(sid, live):
            try:
                auto_messages.mark_player_seen(sid, live)
            except Exception:
                pass
    return names


def _alert_player_label(steam_id: str, live_names: dict[str, str] | None = None) -> str:
    live = (live_names or {}).get(steam_id)
    try:
        return auto_messages.resolve_player_name(steam_id, live)
    except Exception:
        return live or steam_id


def _flush_pending_join(
    cfg: dict,
    steam_id: str,
    live_names: dict[str, str],
    *,
    force: bool = False,
) -> bool:
    """Dispatch a pending join when the name is known or wait timed out."""
    pending = _alert_state.setdefault("pending_joins", {})
    since = pending.get(steam_id)
    if since is None:
        return False
    label = _alert_player_label(steam_id, live_names)
    waited = time.time() - float(since)
    if force or label != steam_id or waited >= JOIN_NAME_WAIT_SECONDS:
        events = cfg.get("events") or {}
        pending_first = _alert_state.setdefault("pending_first_joins", set())
        if events.get("player_first_join") and steam_id in pending_first:
            panel_alerts.dispatch(cfg, "player_first_join", {"player": label})
            pending_first.discard(steam_id)
        if events.get("player_join"):
            panel_alerts.dispatch(cfg, "player_join", {"player": label})
        pending.pop(steam_id, None)
        return True
    return False


def _logs_indicate_world_ready() -> bool:
    """True when recent docker/BepInEx logs show the world finished loading."""
    try:
        logs = get_logs(200)
        if WORLD_LOADED_MARKER in logs:
            return True
    except Exception:
        pass
    try:
        bepinex = bepinex_log(200)
        if WORLD_LOADED_MARKER in bepinex:
            return True
    except Exception:
        pass
    return False


def _collect_alert_log_text(lines: int = 120) -> str:
    parts: list[str] = []
    try:
        parts.append(get_logs(lines) or "")
    except Exception:
        pass
    try:
        parts.append(bepinex_log(lines) or "")
    except Exception:
        pass
    return "\n".join(parts)


def _scan_and_dispatch_chat_bridge(cfg: dict) -> None:
    """Parse recent logs for chat lines with the configured prefix and notify."""
    bridge = cfg.get("chat_bridge") or {}
    events = cfg.get("events") or {}
    if not (bridge.get("enabled") or events.get("player_chat")):
        return
    prefix = (bridge.get("prefix") or panel_alerts.DEFAULT_CHAT_PREFIX).strip()
    if not prefix:
        prefix = panel_alerts.DEFAULT_CHAT_PREFIX
    text = _collect_alert_log_text(150)
    if not text.strip():
        return
    seen = _alert_state.setdefault("chat_seen", set())
    matches = panel_alerts.extract_prefixed_chat(text, prefix=prefix)
    for item in matches:
        digest = hash(panel_alerts.chat_bridge_fingerprint(item))
        if digest in seen:
            continue
        seen.add(digest)
        panel_alerts.dispatch(
            cfg,
            "player_chat",
            {"player": item["player"], "text": item["text"]},
        )
    # Bound memory: keep only the newest hashes.
    if len(seen) > 400:
        _alert_state["chat_seen"] = set(list(seen)[-200:])


def _rcon_available_for_alerts() -> bool:
    return _auto_messages_rcon_available()


def _game_log_digest(kind: str, item: dict) -> int:
    return hash(panel_alerts.game_log_fingerprint(kind, item))


def _scan_and_dispatch_game_events(cfg: dict) -> None:
    """Parse recent logs for player deaths, PvP kill-feed lines, and raids."""
    events = cfg.get("events") or {}
    watch_death = events.get("player_death")
    watch_pvp = events.get("player_pvp_kill")
    watch_raid = events.get("raid_started")
    if not (watch_death or watch_pvp or watch_raid):
        return
    text = _collect_alert_log_text(150)
    if not text.strip():
        return
    seen = _alert_state.setdefault("game_log_seen", set())
    pvp_victims: set[str] = set()
    if watch_pvp:
        for item in panel_alerts.extract_pvp_kills(text):
            digest = _game_log_digest("player_pvp_kill", item)
            if digest in seen:
                continue
            seen.add(digest)
            pvp_victims.add(item["victim"].lower())
            panel_alerts.dispatch(
                cfg,
                "player_pvp_kill",
                {"killer": item["killer"], "victim": item["victim"]},
            )
    death_fps_this_scan: set[str] = set()
    if watch_death:
        for item in panel_alerts.extract_player_deaths(text):
            if item["player"].lower() in pvp_victims:
                continue
            fp = panel_alerts.game_log_fingerprint("player_death", item)
            if fp in death_fps_this_scan:
                continue
            digest = _game_log_digest("player_death", item)
            if digest in seen:
                continue
            death_fps_this_scan.add(fp)
            seen.add(digest)
            panel_alerts.dispatch(cfg, "player_death", {"player": item["player"]})
    if watch_raid:
        for item in panel_alerts.extract_random_events(text):
            digest = _game_log_digest("raid_started", item)
            if digest in seen:
                continue
            seen.add(digest)
            event_key = item["event"]
            panel_alerts.dispatch(
                cfg,
                "raid_started",
                {
                    "raid": panel_alerts.raid_label_for_key(event_key),
                    "event": event_key,
                },
            )
    if len(seen) > 400:
        _alert_state["game_log_seen"] = set(list(seen)[-200:])


def _poll_boss_defeated(cfg: dict) -> None:
    """Detect new defeated_* global keys via RCON (seed on first poll)."""
    events = cfg.get("events") or {}
    if not events.get("boss_defeated"):
        return
    if not container_running() or not _rcon_available_for_alerts():
        return
    now = time.time()
    last = float(_alert_state.get("last_global_keys_poll") or 0.0)
    if now - last < GLOBAL_KEYS_POLL_SECONDS:
        return
    _alert_state["last_global_keys_poll"] = now
    try:
        output = _run_rcon("globalKeys")
    except Exception:
        logger.debug("boss globalKeys poll failed", exc_info=True)
        return
    current = panel_alerts.parse_global_boss_keys(output)
    known = set(_alert_state.get("global_keys") or set())
    if not _alert_state.get("global_keys_init"):
        _alert_state["global_keys"] = current
        _alert_state["global_keys_init"] = True
        return
    for key in sorted(current - known):
        panel_alerts.dispatch(
            cfg,
            "boss_defeated",
            {"boss": panel_alerts.boss_label_for_key(key), "key": key},
        )
    _alert_state["global_keys"] = current


def _backups_enabled_in_container() -> bool:
    val = (backup_config().get("BACKUPS") or "true").strip().lower()
    return val in ("true", "1", "yes", "on")


def _scheduled_job_next_run(job: str, cron: str) -> float | None:
    """Return the next fire time for a panel schedule job or raw cron."""
    if not cron:
        return None
    status = panel_scheduler_instance.get_status().get(job) or {}
    next_run = status.get("next_run")
    if next_run is not None:
        return float(next_run)
    return panel_scheduler.next_cron_fire(cron)


def _check_scheduled_job_warnings(cfg: dict) -> None:
    """Warn shortly before scheduled backup/restart jobs (panel or container cron)."""
    events = cfg.get("events") or {}
    if not (events.get("backup_scheduled_warning") or events.get("restart_scheduled_warning")):
        return
    now = time.time()
    window = SCHEDULED_JOB_WARNING_MINUTES * 60
    sent = _alert_state.setdefault("scheduled_warnings", set())
    targets: list[tuple[str, str, float | None]] = []

    if events.get("backup_scheduled_warning"):
        schedule = read_schedule_config().get("backup") or {}
        if schedule.get("enabled") and schedule.get("cron"):
            targets.append((
                "backup",
                "backup_scheduled_warning",
                _scheduled_job_next_run("backup", str(schedule["cron"])),
            ))
        if _backups_enabled_in_container():
            bcron = (backup_config().get("BACKUPS_CRON") or "").strip()
            if bcron:
                targets.append((
                    "world_backup",
                    "backup_scheduled_warning",
                    panel_scheduler.next_cron_fire(bcron, after=now),
                ))

    if events.get("restart_scheduled_warning"):
        schedule = read_schedule_config().get("restart") or {}
        if schedule.get("enabled") and schedule.get("cron"):
            targets.append((
                "restart",
                "restart_scheduled_warning",
                _scheduled_job_next_run("restart", str(schedule["cron"])),
            ))

    for job_key, event_type, next_run in targets:
        if next_run is None:
            continue
        seconds_until = float(next_run) - now
        if seconds_until <= 0 or seconds_until > window:
            continue
        dedupe_key = f"{job_key}|{int(next_run)}"
        if dedupe_key in sent:
            continue
        sent.add(dedupe_key)
        minutes = max(1, int((seconds_until + 30) // 60))
        panel_alerts.dispatch(
            cfg,
            event_type,
            {"job": job_key, "minutes": minutes},
        )

    if len(sent) > 100:
        _alert_state["scheduled_warnings"] = set(list(sent)[-50:])


def _maybe_dispatch_server_ready(cfg: dict, running: bool) -> None:
    """Emit server_up when an intentional start/restart finishes (world ready)."""
    pending = _alert_state.get("pending_ready")
    if not pending:
        return
    since = float(_alert_state.get("pending_ready_since") or 0.0)
    timed_out = since > 0 and (time.time() - since) >= PENDING_READY_TIMEOUT_SECONDS
    if not running:
        if timed_out:
            _clear_pending_ready()
        return
    ready = _logs_indicate_world_ready() or timed_out
    if not ready:
        return
    panel_alerts.dispatch(cfg, "server_up", {})
    _clear_pending_ready()


def _check_and_dispatch_alerts(cfg: dict) -> None:
    """Detect state transitions and fire configured alerts (best-effort)."""
    events = cfg.get("events", {})
    running = container_running()
    prev = _alert_state
    intentional = prev.get("pending_ready") in ("start", "restart")

    if prev["container"] is not None:
        if prev["container"] and not running:
            # Skip transient offline noise during intentional restart.
            if not (intentional and prev.get("pending_ready") == "restart"):
                if events.get("server_down"):
                    panel_alerts.dispatch(cfg, "server_down", {})
        elif not prev["container"] and running and not intentional:
            # Unplanned recovery (crash bounce) — still notify when paired.
            panel_alerts.dispatch(cfg, "server_up", {})
    prev["container"] = running

    _maybe_dispatch_server_ready(cfg, running)

    watch_players = (
        events.get("player_join")
        or events.get("player_leave")
        or events.get("player_first_join")
    )
    pending = prev.setdefault("pending_joins", {})
    if not running:
        # Drop player snapshot on stop so a restart does not emit mass leave alerts.
        # Flush pending joins with best-effort names before clearing.
        if events.get("player_join") or events.get("player_first_join"):
            for sid in list(pending):
                _flush_pending_join(cfg, sid, prev.get("player_names") or {}, force=True)
        prev["players"] = set()
        prev["player_names"] = {}
        pending.clear()
        prev["pending_first_joins"] = set()
    elif watch_players:
        try:
            info = get_players_info()
            players = info.get("players") or []
            current = {str(p["steam_id"]) for p in players if p.get("steam_id")}
            seen_before = auto_messages.read_players_seen()
            names = _remember_player_names(players)
        except Exception:
            current = set()
            names = {}
            seen_before = {}

        if prev["init"]:
            known_names = prev.get("player_names") or {}
            if events.get("player_join") or events.get("player_first_join"):
                for sid in current - prev["players"]:
                    is_first = sid not in seen_before
                    label = _alert_player_label(sid, names)
                    if label != sid:
                        if events.get("player_first_join") and is_first:
                            panel_alerts.dispatch(cfg, "player_first_join", {"player": label})
                        if events.get("player_join"):
                            panel_alerts.dispatch(cfg, "player_join", {"player": label})
                        pending.pop(sid, None)
                        _alert_state.setdefault("pending_first_joins", set()).discard(sid)
                    else:
                        pending.setdefault(sid, time.time())
                        if is_first:
                            _alert_state.setdefault("pending_first_joins", set()).add(sid)
                # Name may appear a few seconds after Got connection SteamID.
                for sid in list(pending):
                    if sid in current:
                        _flush_pending_join(cfg, sid, names)
                    else:
                        # Left before we could name them — still announce the join.
                        _flush_pending_join(cfg, sid, known_names, force=True)
            if events.get("player_leave"):
                for sid in prev["players"] - current:
                    pending.pop(sid, None)
                    _alert_state.setdefault("pending_first_joins", set()).discard(sid)
                    panel_alerts.dispatch(
                        cfg,
                        "player_leave",
                        {"player": _alert_player_label(sid, known_names)},
                    )
        known = prev.get("player_names") or {}
        prev["player_names"] = {
            sid: names.get(sid) or known.get(sid) or sid for sid in current
        }
        prev["players"] = current

    startup_in_progress = prev.get("pending_ready") in ("start", "restart")
    if events.get("server_high_load") and running and not startup_in_progress:
        try:
            metrics = get_container_metrics_raw()
            cpu = float(normalize_valheim_cpu(metrics.get("cpu_percent") or 0.0))
            mem = float(metrics.get("memory_percent") or 0.0)
        except Exception:
            cpu = 0.0
            mem = 0.0
        over = max(cpu, mem) >= panel_alerts.HIGH_LOAD_THRESHOLD
        cleared = max(cpu, mem) < panel_alerts.HIGH_LOAD_CLEAR_THRESHOLD
        if over and not prev.get("high_load"):
            kind = "CPU" if cpu >= mem else "RAM"
            panel_alerts.dispatch(
                cfg,
                "server_high_load",
                {"cpu_percent": cpu, "memory_percent": mem, "load_kind": kind},
            )
            prev["high_load"] = True
        elif cleared:
            prev["high_load"] = False

    try:
        _scan_and_dispatch_chat_bridge(cfg)
    except Exception:
        logger.debug("chat bridge scan failed", exc_info=True)

    try:
        _scan_and_dispatch_game_events(cfg)
    except Exception:
        logger.debug("game event scan failed", exc_info=True)

    try:
        _poll_boss_defeated(cfg)
    except Exception:
        logger.debug("boss defeated poll failed", exc_info=True)

    try:
        _check_scheduled_job_warnings(cfg)
    except Exception:
        logger.debug("scheduled job warning check failed", exc_info=True)

    prev["init"] = True


async def _alert_monitor_loop() -> None:
    """Poll for alert-worthy transitions. Cheap no-op while alerts are disabled."""
    while True:
        try:
            cfg = read_alerts_config()
            if _alerts_active(cfg):
                await asyncio.to_thread(_check_and_dispatch_alerts, cfg)
        except Exception:  # pragma: no cover - defensive
            pass
        await asyncio.sleep(15.0)


panel_scheduler_instance = panel_scheduler.PanelScheduler(
    restart_fn=_scheduled_restart,
    backup_fn=_scheduled_backup,
    mod_update_fn=_scheduled_mod_update,
)


@app.get("/api/metrics/history")
def api_metrics_history(
    range: str = Query("1h"),
    container: str = Query("valheim-server"),
):
    if range not in metrics_history.RANGE_SECONDS:
        raise HTTPException(400, f"range must be one of {sorted(metrics_history.RANGE_SECONDS)}")
    if container not in ("valheim-server", "vikinger-panel"):
        raise HTTPException(400, "invalid container")
    try:
        rows = metrics_history.query_history(panel_db.get_db_path(), container, range)
    except Exception:
        rows = []
    return {"range": range, "container": container, "samples": rows}


def _map_plugins_dirs() -> list:
    return [PLUGINS_DIR, PLUGINS_DISABLED_DIR]


@app.get("/api/map/{world}")
def api_map(world: str):
    name = validate_world_name(world)
    try:
        return world_map.build_map(
            name, WORLDS_DIR, DATA_DIR, plugins_dirs=_map_plugins_dirs()
        )
    except Exception:
        logger.debug("map build failed for %s", name, exc_info=True)
        return {
            "world": name,
            "seed": "",
            "markers": [],
            "bounds": {},
            "explored": {
                "available": False,
                "map_size": 0,
                "cells": 0,
                "total": 0,
                "image_url": f"/api/map/{name}/fog.png",
            },
            "mod": {
                "serversidemap": False,
                "serversidemap_dll": world_map.serversidemap_dll_installed(
                    *_map_plugins_dirs()
                ),
            },
        }


@app.delete("/api/map/{world}/pins/{index}")
def api_map_delete_pin(world: str, index: int):
    """Delete a shared ServerSideMap pin by file index."""
    name = validate_world_name(world)
    if index < 0:
        raise HTTPException(400, "Invalid pin index")
    try:
        world_map.delete_serversidemap_pin(WORLDS_DIR, name, index)
    except FileNotFoundError:
        raise HTTPException(404, "ServerSideMap data not found for this world")
    except IndexError:
        raise HTTPException(404, "Pin not found")
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    except Exception:
        logger.exception("map pin delete failed for %s index=%s", name, index)
        raise HTTPException(500, "Failed to delete pin")

    payload = world_map.build_map(
        name, WORLDS_DIR, DATA_DIR, plugins_dirs=_map_plugins_dirs()
    )
    return {
        "ok": True,
        "markers": payload.get("markers") or [],
        "mod": payload.get("mod") or {},
        "explored": payload.get("explored") or {},
        "needs_restart": container_running(),
    }


@app.get("/api/map/{world}/fog.png")
def api_map_fog(world: str, reveal: bool = Query(False)):
    """PNG background for the Map tab.

    Always available (seed-tinted base disc). ``reveal=true`` shows the full
    disc; ``reveal=false`` applies ServerSideMap fog when the mod file exists,
    otherwise the disc stays fully fogged. ServerSideMap is optional.
    """
    name = validate_world_name(world)
    try:
        png = world_map.build_fog_png(name, WORLDS_DIR, out_size=1024, reveal_all=reveal)
    except Exception:
        logger.debug("map fog render failed for %s", name, exc_info=True)
        png = None
    if not png:
        raise HTTPException(500, "Failed to render map image")
    return Response(
        content=png,
        media_type="image/png",
        headers={"Cache-Control": "no-cache"},
    )


@app.get("/api/alerts")
def api_get_alerts():
    return _alerts_config_public(read_alerts_config())


class AlertsConfigUpdate(BaseModel):
    events: Optional[dict] = None
    discord: Optional[dict] = None
    telegram: Optional[dict] = None
    chat_bridge: Optional[dict] = None


class AlertsTestRequest(BaseModel):
    """Optional unsaved channel overrides for Send test (secrets from the form)."""
    discord: Optional[dict] = None
    telegram: Optional[dict] = None


@app.put("/api/alerts")
def api_put_alerts(body: AlertsConfigUpdate):
    cfg = read_alerts_config()
    incoming = body.model_dump(exclude_none=True)
    for section, val in incoming.items():
        if not isinstance(val, dict):
            continue
        # Preserve stored secrets when the client sends an empty value.
        if section in ("discord", "telegram"):
            for secret_key in ("webhook_url", "bot_token"):
                if secret_key in val and val[secret_key] == "":
                    val.pop(secret_key)
        cfg.setdefault(section, {})
        if isinstance(cfg[section], dict):
            cfg[section].update(val)
        else:
            cfg[section] = val
    panel_db.set_setting(ALERTS_SETTING_KEY, cfg)
    return _alerts_config_public(cfg)


def _merge_alerts_test_overrides(cfg: dict, body: AlertsTestRequest | None) -> dict:
    """Overlay form values onto saved config so test works before Save."""
    merged = json.loads(json.dumps(cfg))
    if not body:
        return merged
    if body.discord:
        disc = merged.setdefault("discord", {})
        url = (body.discord.get("webhook_url") or "").strip()
        if url:
            disc["webhook_url"] = url
    if body.telegram:
        tg = merged.setdefault("telegram", {})
        token = (body.telegram.get("bot_token") or "").strip()
        chat_id = (body.telegram.get("chat_id") or "").strip()
        if token:
            tg["bot_token"] = token
        if chat_id:
            tg["chat_id"] = chat_id
    return merged


@app.post("/api/alerts/test")
def api_test_alerts(body: AlertsTestRequest | None = None):
    cfg = _merge_alerts_test_overrides(read_alerts_config(), body)
    try:
        result = panel_alerts.test_channels(cfg)
    except Exception as e:
        raise HTTPException(500, f"Alert test failed: {e}") from e

    attempted = [v for v in result.values() if v is not None]
    if not attempted:
        raise HTTPException(
            400,
            "No channel configured. Paste a Discord webhook URL (or Telegram credentials) and try again.",
        )
    if not any(attempted):
        raise HTTPException(502, "Failed to deliver the test notification. Check the webhook URL and try again.")
    return {"ok": True, "result": result}


@app.get("/api/schedule")
def api_get_schedule():
    cfg = read_schedule_config()
    try:
        status = panel_scheduler_instance.get_status()
    except Exception:
        status = {}
    return {"config": cfg, "status": status}


class ScheduleConfigUpdate(BaseModel):
    restart: Optional[dict] = None
    backup: Optional[dict] = None
    mod_update: Optional[dict] = None


@app.put("/api/schedule")
def api_put_schedule(body: ScheduleConfigUpdate):
    cfg = read_schedule_config()
    incoming = body.model_dump(exclude_none=True)
    for job, val in incoming.items():
        if job in cfg and isinstance(val, dict):
            cron = val.get("cron")
            if cron is not None and not panel_scheduler.validate_cron(cron):
                raise HTTPException(400, f"Invalid cron for {job}: {cron}")
            cfg[job].update(val)
    panel_db.set_setting(SCHEDULE_SETTING_KEY, cfg)
    try:
        panel_scheduler_instance.configure(cfg)
    except Exception:
        logger.debug("scheduler reconfigure failed", exc_info=True)
    return {"config": cfg, "status": panel_scheduler_instance.get_status()}


async def _build_live_payload() -> dict:
    """Payload pushed over /ws/live: status + metrics + players from shared snapshot."""
    try:
        snap = await asyncio.to_thread(get_live_snapshot)
        status = snap.get("status") or {}
        players = snap.get("players") or {"count": 0, "players": [], "online": False}
    except Exception:
        status = {}
        players = {"count": 0, "players": [], "online": False}
    try:
        metrics = await asyncio.to_thread(api_metrics, True)
    except Exception:
        metrics = {}
    return {
        "ts": time.time(),
        "status": status,
        "metrics": metrics,
        "players": players,
    }


async def _live_snapshot_loop() -> None:
    """Keep the shared status/players snapshot warm even without WS clients."""
    if os.environ.get("VIKINGER_DISABLE_LIVE_SNAPSHOT") == "1":
        return
    while True:
        try:
            await asyncio.to_thread(_refresh_live_snapshot)
        except Exception:  # pragma: no cover - defensive
            pass
        await asyncio.sleep(LIVE_SNAPSHOT_INTERVAL)


async def _live_broadcast_loop() -> None:
    """Single shared loop: builds the payload once and fans it out to clients.

    Only does work while at least one client is connected, so it adds no docker
    overhead on an idle panel beyond the always-on snapshot loop.
    """
    while True:
        try:
            if _live_hub.count() > 0:
                payload = await _build_live_payload()
                await _live_hub.broadcast(payload)
        except Exception:  # pragma: no cover - defensive
            pass
        await asyncio.sleep(2.0)


@app.on_event("startup")
async def _on_async_startup() -> None:
    asyncio.ensure_future(_live_snapshot_loop())
    asyncio.ensure_future(_live_broadcast_loop())
    asyncio.ensure_future(_alert_monitor_loop())
    # Warm disk + snapshot in background so the first dashboard paint is fast.
    def _warmup():
        try:
            get_valheim_disk_usage()
        except Exception:
            pass
        try:
            _refresh_live_snapshot()
        except Exception:
            pass

    threading.Thread(target=_warmup, name="panel-warmup", daemon=True).start()


@app.websocket("/ws/live")
async def ws_live(websocket: WebSocket):
    await websocket.accept()
    await _live_hub.register(websocket)
    try:
        await websocket.send_json(await _build_live_payload())
        while True:
            # Keep the socket open; we don't expect client messages.
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        await _live_hub.unregister(websocket)


# ── Static Frontend ──────────────────────────────────────────────────────────

STATIC_DIR = Path(__file__).parent / "static"
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
