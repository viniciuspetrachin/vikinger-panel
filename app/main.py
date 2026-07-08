#!/usr/bin/env python3
"""Valheim Server Management Panel - API Backend"""

import base64
import io
import json
import logging
import os
import re
import shutil
import subprocess
import time
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from dotenv import dotenv_values, set_key
from fastapi import FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from fwl_io import WorldConfig, WorldMeta, config_summary_from_meta, read_fwl, world_config_details, write_fwl
from log_utils import clean_docker_logs
from version import __version__, version_info

logger = logging.getLogger("valheim-panel")
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
WORLDS_DIR = CONFIG_DIR / "worlds_local"
WORLDS_PENDING_FILE = CONFIG_DIR / "worlds_pending.json"
WORLDS_CONFIG_FILE = CONFIG_DIR / "worlds_config.json"
BACKUPS_DIR = CONFIG_DIR / "backups"
ENV_FILE = ROOT / ".env"
COMPOSE_FILE = ROOT / "docker-compose.yml"
CONTAINER_NAME = "valheim-server"
COMPOSE_SERVICE = "valheim"
MEMORY_MIN_GB = 1
MEMORY_MAX_GB = 28
ALLOWED_EXTENSIONS = {".cfg", ".txt", ".json", ".md", ".env", ".yml", ".yaml", ".ini", ".log", ".sh", ".xml", ".prefs"}

_metrics_prev: Optional[dict] = None
_mod_update_cache: dict[str, tuple[float, dict]] = {}
MOD_UPDATE_CACHE_TTL = 300

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
APP_MANIFEST_PATH = DATA_DIR / "dl" / "server" / "steamapps" / "appmanifest_896660.acf"
AUDIT_FILE = LOGS_DIR / "audit.jsonl"
AUDIT_MAX_BYTES = 5 * 1024 * 1024
AUDIT_BODY_MAX = 8192
AUDIT_SENSITIVE = ("pass", "secret", "token", "key")

app = FastAPI(title="Valheim Panel", version=__version__)

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


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    logger.exception("Erro não tratado: %s", exc)
    return JSONResponse(status_code=500, content={"detail": str(exc)})


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


def read_audit(lines: int = 200) -> list[dict]:
    entries: list[dict] = []
    if not AUDIT_FILE.exists():
        return entries
    try:
        raw = AUDIT_FILE.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return entries
    for line in raw[-lines:]:
        line = line.strip()
        if not line:
            continue
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    entries.reverse()  # mais recentes primeiro
    return entries


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
        raise HTTPException(504, f"Comando expirou após {timeout}s: {' '.join(cmd)}") from e


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
    """Raízes permitidas após resolve() — inclui config/data symlinkados fora de ROOT."""
    roots: list[Path] = [ROOT.resolve()]
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
        raise HTTPException(400, "Caminho inválido")
    logical = ROOT / rel if rel else ROOT
    if not _path_is_under(logical, ROOT):
        raise HTTPException(403, "Acesso negado")
    target = logical.resolve()
    if not any(_path_is_under(target, root) for root in _allowed_path_roots()):
        raise HTTPException(403, "Acesso negado")
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


def container_running() -> bool:
    r = docker("inspect", "-f", "{{.State.Running}}", CONTAINER_NAME)
    return r.returncode == 0 and r.stdout.strip() == "true"


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


def get_valheim_disk_usage() -> dict:
    config_bytes = dir_size_bytes(CONFIG_DIR)
    data_bytes = dir_size_bytes(DATA_DIR)
    return {
        "config_bytes": config_bytes,
        "data_bytes": data_bytes,
        "total_bytes": config_bytes + data_bytes,
    }


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


def read_memory_limit_gb() -> Optional[int]:
    if not COMPOSE_FILE.exists():
        return None
    text = COMPOSE_FILE.read_text(encoding="utf-8")
    m = re.search(r"^\s*mem_limit:\s*(\d+)\s*[gG]\s*$", text, re.MULTILINE)
    return int(m.group(1)) if m else None


def write_memory_limit_gb(gb: Optional[int]) -> None:
    if not COMPOSE_FILE.exists():
        raise HTTPException(404, "docker-compose.yml não encontrado")

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
        raise HTTPException(404, "docker-compose.yml não encontrado")
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
        raise HTTPException(400, "Container não está rodando")
    r = docker("exec", CONTAINER_NAME, "supervisorctl", "signal", "HUP", "valheim-updater")
    output = (r.stdout + r.stderr).strip()
    if r.returncode != 0:
        raise HTTPException(500, output or "Falha ao solicitar verificação de atualização")
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


def enrich_mod_entry(entry: dict) -> dict:
    pkg = find_package_for_dll(entry["name"])
    if not pkg:
        entry.update({
            "package_id": None,
            "installed_version": None,
            "latest_version": None,
            "update_available": False,
            "update_status": "unknown",
        })
        return entry
    entry.update({
        "package_id": pkg.get("id"),
        "installed_version": pkg.get("version"),
        "latest_version": pkg.get("latest_version") or pkg.get("version"),
        "update_available": pkg.get("update_status") == "update_available",
        "update_status": pkg.get("update_status", "unknown"),
    })
    return entry


def list_mods_enriched() -> list[dict]:
    return [enrich_mod_entry(m) for m in list_mods_data()]


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


def file_tree(base: Path, prefix: str = "") -> list[dict]:
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
            items.append({"name": entry.name, "path": rel, "type": "broken", "error": "link quebrado"})
            continue
        if is_dir:
            items.append({"name": entry.name, "path": rel, "type": "dir", "children": file_tree(entry, rel)})
        else:
            try:
                stat = entry.stat()
            except OSError:
                items.append({"name": entry.name, "path": rel, "type": "broken", "error": "link quebrado"})
                continue
            items.append({
                "name": entry.name,
                "path": rel,
                "type": "file",
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })
    return items


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
        raise HTTPException(400, f"Falha ao consultar Thunderstore: {e}") from e


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
        raise HTTPException(400, f"Pacote Thunderstore sem versões: {owner}/{name}")
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
        raise HTTPException(400, f"Falha ao baixar: {e}") from e


def scrape_thunderstore_download_from_page(owner: str, name: str) -> str:
    page_url = f"https://thunderstore.io/c/{THUNDERSTORE_COMMUNITY}/p/{owner}/{name}/"
    html = fetch_url_bytes(page_url).decode("utf-8", errors="replace")
    match = THUNDERSTORE_PAGE_DOWNLOAD_RE.search(html)
    if not match:
        raise HTTPException(400, f"Download não encontrado na página Thunderstore: {owner}/{name}")
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
        raise HTTPException(400, "URL vazia")

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
            "URL inválida. Use um link http(s) do Thunderstore, CDN ou r2modman.",
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
            "Sem permissão para escrever em config/bepinex/plugins. "
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
                "A URL aponta para uma página web, não para um ZIP. "
                "Use o link de download do Thunderstore ou a página do pacote.",
            ) from e
        raise HTTPException(400, "Arquivo ZIP inválido") from e
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
                    f"Sem permissão para gravar {out.name}. "
                    f"Execute: sudo {FIX_PLUGINS_SCRIPT}",
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


def list_backups() -> list[dict]:
    items = []
    if not BACKUPS_DIR.exists():
        return items
    now = time.time()
    for b in sorted(BACKUPS_DIR.iterdir(), reverse=True):
        try:
            if b.is_file():
                stat = b.stat()
                size = stat.st_size
            elif b.is_dir():
                stat = b.stat()
                size = dir_size(b)
            else:
                continue
            age_days = round((now - stat.st_mtime) / 86400, 1)
            items.append({
                "name": b.name,
                "size": size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "age_days": age_days,
            })
        except OSError:
            continue
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
            deleted.append(b.name)
        except OSError as e:
            logger.warning("Falha ao apagar backup %s: %s", b.name, e)
    return deleted


def trigger_backup() -> str:
    if not container_running():
        raise HTTPException(400, "Container não está rodando")
    r = docker("exec", CONTAINER_NAME, "supervisorctl", "signal", "HUP", "valheim-backup")
    output = (r.stdout + r.stderr).strip()
    if r.returncode != 0:
        raise HTTPException(500, output or "Falha ao solicitar backup")
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
            raise HTTPException(400, "Nenhum mundo ativo definido (WORLD_NAME)")
        entries = []
        for ext in (".fwl", ".db"):
            src = WORLDS_DIR / f"{world}{ext}"
            if src.exists():
                entries.append((src, f"worlds_local/{world}{ext}"))
        if not entries:
            raise HTTPException(404, f"Arquivos do mundo '{world}' não encontrados")
        return entries

    if backup_type == "full":
        entries = []
        if WORLDS_DIR.exists():
            entries.append((WORLDS_DIR, "worlds_local"))
        if BEPINEX_CFG_DIR.exists():
            entries.append((BEPINEX_CFG_DIR, "bepinex"))
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

    raise HTTPException(400, f"Tipo de backup inválido: {backup_type}")


def create_manual_backup(backup_type: str) -> str:
    if backup_type not in BACKUP_TYPES:
        raise HTTPException(400, f"Tipo de backup inválido: {backup_type}")
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
        raise HTTPException(400, "Nada para incluir no backup")
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
            "Sem permissão para gravar o mundo. Rode o painel via Docker (recomendado) "
            "ou execute no host: sudo "
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
        raise HTTPException(500, r.stderr or r.stdout or "Erro ao copiar .fwl para o container")
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
        raise HTTPException(400, "Nome inválido")
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
_RE_CHARACTER = re.compile(r"Got character ZDOID from (.+?) : (\d+):(\d+)")
_RE_CLOSING = re.compile(r"Closing socket (\d+)")
_RE_CONNECTIONS = re.compile(r"Connections (\d+) ZDOS:")


def parse_players_from_logs(log_text: str) -> dict:
    steam_to_name: dict[str, str] = {}
    active_steam: set[str] = set()
    last_connection: Optional[str] = None
    last_count = 0

    for line in log_text.splitlines():
        m = _RE_CONNECTIONS.search(line)
        if m:
            last_count = int(m.group(1))

        m = _RE_CONNECTION.search(line)
        if m:
            last_connection = m.group(1)
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
            last_connection = None
            continue

        m = _RE_CLOSING.search(line)
        if m:
            active_steam.discard(m.group(1))
            last_connection = None

    players = [
        {"name": steam_to_name.get(sid, sid), "steam_id": sid}
        for sid in sorted(active_steam)
    ]
    count = len(players) if players else last_count
    return {"count": count, "players": players, "online": count > 0}


def get_players_info() -> dict:
    if not container_running():
        return {"count": 0, "players": [], "online": False}
    logs = get_logs(3000)
    return parse_players_from_logs(logs)


def _mod_cfg_for_dll(dll_stem: str, cfg_map: dict[str, str]) -> Optional[str]:
    for stem, fname in cfg_map.items():
        if stem in dll_stem.lower() or dll_stem.lower() in stem:
            return fname
    return None


def _collect_mod_entry(dll: Path, enabled: bool, cfg_map: dict[str, str]) -> dict:
    stat = dll.stat()
    return {
        "name": dll.name,
        "enabled": enabled,
        "size": stat.st_size,
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        "config": _mod_cfg_for_dll(dll.stem, cfg_map),
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
    return read_env().get("SERVER_NAME", "").strip() or "Valheim"


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
        raise ValueError(f"Versão inválida para export r2modman: {version}")
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
        raise HTTPException(400, f"Falha ao publicar perfil r2modman: {e}") from e
    code = data.get("key")
    if not code:
        raise HTTPException(400, "Resposta inválida ao publicar perfil r2modman")
    return code


def list_mods_data() -> list[dict]:
    mods: list[dict] = []
    cfg_map = {f.stem.lower(): f.name for f in BEPINEX_CFG_DIR.glob("*.cfg") if f.name != "BepInEx.cfg"}
    if PLUGINS_DIR.exists():
        for dll in sorted(PLUGINS_DIR.glob("*.dll")):
            mods.append(_collect_mod_entry(dll, True, cfg_map))
    if PLUGINS_DISABLED_DIR.exists():
        for dll in sorted(PLUGINS_DISABLED_DIR.glob("*.dll")):
            mods.append(_collect_mod_entry(dll, False, cfg_map))
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


class FileContent(BaseModel):
    content: str


class ModUrlInstall(BaseModel):
    url: str
    name: Optional[str] = None


class BackupConfigUpdate(BaseModel):
    values: dict[str, str]
    restart: bool = False


class BackupCreate(BaseModel):
    type: str


class ModToggle(BaseModel):
    enabled: bool


class MemoryLimitUpdate(BaseModel):
    gb: Optional[int] = None
    apply: bool = True


class UpdateConfigUpdate(BaseModel):
    values: dict[str, str] = {}
    bepinex: Optional[bool] = None
    restart: bool = False


class ModLink(BaseModel):
    url: str


# ── Version ──────────────────────────────────────────────────────────────────

@app.get("/api/version")
def api_version():
    return version_info()


# ── Status & Server Control ──────────────────────────────────────────────────

@app.get("/api/status")
def api_status():
    env = read_env()
    sup = supervisor_status()
    players = get_players_info()
    worlds, active, running, reconciled = build_worlds_list()
    configured = env.get("WORLD_NAME", "").strip()
    return {
        "container": "running" if container_running() else "stopped",
        "server": server_process_status(),
        "supervisor": sup,
        "config": {
            "server_name": env.get("SERVER_NAME", ""),
            "world_name": active or configured,
            "server_port": env.get("SERVER_PORT", "2456"),
            "server_public": env.get("SERVER_PUBLIC", "true"),
            "server_args": env.get("SERVER_ARGS", ""),
        },
        "running_world_name": running,
        "world_in_sync": not running or running == (active or configured),
        "world_reconciled": reconciled,
        "mods_count": len(list_mods_data()),
        "worlds_count": len(worlds),
        "players_count": players["count"],
        "capabilities": {
            "world_config": True,
        },
    }


@app.get("/api/players")
def api_players():
    return get_players_info()


@app.get("/api/metrics")
def api_metrics():
    global _metrics_prev
    now = time.time()
    raw = get_container_metrics_raw()
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

    valheim_raw = raw["cpu_percent"]
    valheim_pct = normalize_valheim_cpu(valheim_raw)

    return {
        "running": raw["running"],
        "cpu": {
            "percent": valheim_pct,
            "raw_percent": round(valheim_raw, 1),
        },
        "memory": {
            "used_bytes": memory_used,
            "limit_bytes": memory_limit_bytes,
            "limit_gb": compose_limit_gb,
            "unlimited": compose_limit_gb is None and raw["memory_limit_bytes"] == memory_limit_bytes,
            "percent": round(memory_pct, 1),
        },
        "disk": disk,
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
    }


@app.get("/api/resources/memory")
def api_get_memory_limit():
    gb = read_memory_limit_gb()
    raw = get_container_metrics_raw()
    return {
        "gb": gb,
        "unlimited": gb is None,
        "memory_used_bytes": raw["memory_used_bytes"],
        "min_gb": MEMORY_MIN_GB,
        "max_gb": MEMORY_MAX_GB,
    }


@app.put("/api/resources/memory")
def api_set_memory_limit(body: MemoryLimitUpdate):
    if body.gb is not None and (body.gb < MEMORY_MIN_GB or body.gb > MEMORY_MAX_GB):
        raise HTTPException(
            400,
            f"Limite deve estar entre {MEMORY_MIN_GB} e {MEMORY_MAX_GB} GB, ou null para sem limite",
        )

    raw = get_container_metrics_raw()
    warning = None
    if body.gb is not None and raw["memory_used_bytes"] > body.gb * 1024**3 * 0.85:
        warning = (
            f"Uso atual ({raw['memory_used_bytes'] // (1024**2)} MB) está próximo ou acima "
            f"do limite solicitado ({body.gb} GB). O container pode ser encerrado pelo Docker."
        )

    write_memory_limit_gb(body.gb)

    if body.apply:
        r = recreate_container()
        if r.returncode != 0:
            raise HTTPException(500, r.stderr or r.stdout or "Erro ao recriar container")

    return {
        "ok": True,
        "gb": body.gb,
        "unlimited": body.gb is None,
        "warning": warning,
        "message": "Limite de RAM atualizado. Container recriado." if body.apply else "Limite salvo no compose.",
    }


@app.post("/api/server/backup")
def api_server_backup():
    output = trigger_backup()
    return {"ok": True, "message": "Backup solicitado", "output": output}


@app.post("/api/server/{action}")
def api_server_action(action: str):
    actions = {
        "start": start_valheim_container,
        "stop": stop_valheim_container,
        "restart": restart_valheim_container,
        "pause": lambda: docker("exec", CONTAINER_NAME, "supervisorctl", "stop", "valheim-server"),
        "resume": lambda: docker("exec", CONTAINER_NAME, "supervisorctl", "start", "valheim-server"),
    }
    if action not in actions:
        raise HTTPException(400, f"Ação inválida: {action}")

    if action in ("pause", "resume") and not container_running():
        raise HTTPException(400, "Container não está rodando")

    r = actions[action]()
    if r.returncode != 0:
        raise HTTPException(500, r.stderr or r.stdout or "Erro ao executar ação")
    return {"ok": True, "action": action, "output": (r.stdout + r.stderr).strip()}


@app.get("/api/logs")
def api_logs(lines: int = Query(150, ge=10, le=2000), source: str = "docker"):
    if source == "bepinex":
        return {"logs": bepinex_log(lines)}
    return {"logs": get_logs(lines)}


# ── Config / Env ─────────────────────────────────────────────────────────────

@app.get("/api/config/env")
def api_get_env():
    return {"values": read_env()}


@app.put("/api/config/env")
def api_put_env(body: EnvUpdate):
    write_env(body.values)
    return {"ok": True, "values": read_env()}


@app.get("/api/config/serverlists")
def api_get_serverlists():
    return list_serverlists()


@app.put("/api/config/serverlists/{kind}")
def api_put_serverlist(kind: str, body: ServerListUpdate):
    if kind not in ("admin", "banned", "permitted"):
        raise HTTPException(400, "Tipo inválido")
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
            raise HTTPException(400, "Nenhum .dll encontrado no ZIP")
        return {"ok": True, "installed": installed}

    if filename.lower().endswith(".dll"):
        dest = PLUGINS_DIR / Path(filename).name
        try:
            dest.write_bytes(data)
        except PermissionError as e:
            raise HTTPException(
                500,
                f"Sem permissão para gravar {dest.name}. "
                f"Execute: sudo {FIX_PLUGINS_SCRIPT}",
            ) from e
        return {"ok": True, "installed": [dest.name]}

    raise HTTPException(400, "Envie um arquivo .zip ou .dll")


@app.post("/api/mods/install-url")
async def api_install_mod_url(body: ModUrlInstall):
    ensure_plugins_writable()
    normalized = normalize_thunderstore_url(body.url)
    download_url = resolve_mod_download_url(body.url)
    data = download_mod_bytes(download_url)

    installed = extract_dlls_from_zip(data, PLUGINS_DIR)
    if not installed:
        raise HTTPException(400, "Nenhum .dll encontrado no pacote")

    ref = resolve_thunderstore_ref(body.url, download_url)
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

    return {"ok": True, "installed": installed}


@app.delete("/api/mods/{name}")
def api_delete_mod(name: str):
    if ".." in name or "/" in name:
        raise HTTPException(400, "Nome inválido")
    found = find_mod(name)
    if not found:
        raise HTTPException(404, "Mod não encontrado")
    path, _ = found
    path.unlink()
    remove_runtime_plugin(name)
    remove_dll_from_registry(name)
    return {"ok": True, "deleted": name}


@app.post("/api/mods/{name}/toggle")
def api_toggle_mod(name: str, body: ModToggle):
    if ".." in name or "/" in name:
        raise HTTPException(400, "Nome inválido")
    found = find_mod(name)
    if not found:
        raise HTTPException(404, "Mod não encontrado")
    path, currently_enabled = found
    if currently_enabled == body.enabled:
        return {
            "ok": True,
            "name": name,
            "enabled": body.enabled,
            "message": "Sem alteração",
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
        "message": "Mod atualizado. Reinicie o servidor para aplicar.",
    }


@app.post("/api/mods/{name}/link")
def api_link_mod(name: str, body: ModLink):
    if ".." in name or "/" in name:
        raise HTTPException(400, "Nome inválido")
    if not find_mod(name):
        raise HTTPException(404, "Mod não encontrado")

    normalized = normalize_thunderstore_url(body.url)
    ref = resolve_thunderstore_ref(body.url, normalized)
    if not ref:
        raise HTTPException(400, "URL Thunderstore inválida")

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
        raise HTTPException(400, "Nome inválido")
    pkg = find_package_for_dll(name)
    if not pkg:
        raise HTTPException(404, "Mod sem vínculo Thunderstore. Use Vincular Thunderstore.")
    result = check_mod_update_for_package(pkg, use_cache=False)
    return {"ok": True, "name": name, **result}


@app.post("/api/mods/{name}/update")
def api_update_mod(name: str):
    if ".." in name or "/" in name:
        raise HTTPException(400, "Nome inválido")
    pkg = find_package_for_dll(name)
    if not pkg:
        raise HTTPException(404, "Mod sem vínculo Thunderstore")

    check = check_mod_update_for_package(pkg, use_cache=False)
    if not check.get("update_available"):
        return {"ok": True, "updated": False, "message": "Mod já está na versão mais recente"}

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
        raise HTTPException(400, "Nenhum .dll encontrado no pacote atualizado")

    latest = check.get("latest_version") or pkg.get("version") or ""
    register_mod_package(
        pkg["owner"],
        pkg["name"],
        latest,
        installed,
        pkg.get("source_url") or "",
    )
    return {
        "ok": True,
        "updated": True,
        "installed": installed,
        "version": latest,
        "message": "Mod atualizado. Reinicie o servidor para aplicar.",
    }


# ── Worlds ───────────────────────────────────────────────────────────────────

@app.get("/api/worlds")
def api_list_worlds():
    worlds, active, running, reconciled = build_worlds_list()
    return {"worlds": worlds, "active": active, "running": running, "world_reconciled": reconciled}


@app.post("/api/worlds/switch")
def api_switch_world(body: WorldSwitch):
    name = validate_world_name(body.world_name)
    if name not in collect_known_world_names(reconcile=False):
        raise HTTPException(404, f"Mundo '{name}' não encontrado")
    write_env({"WORLD_NAME": name})
    remove_pending_world(name)
    if container_running():
        r = recreate_container()
        if r.returncode != 0:
            raise HTTPException(500, r.stderr or r.stdout or "Erro ao recriar container")
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
        raise HTTPException(409, "Mundo já existe")
    env = read_env()
    if env.get("WORLD_NAME", "").strip() == name:
        raise HTTPException(409, "Mundo já está ativo")
    pending = read_pending_worlds()
    if name in pending:
        raise HTTPException(409, "Mundo já registrado como pendente")

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
                raise HTTPException(500, r.stderr or r.stdout or "Erro ao recriar container")
        return {
            "ok": True,
            "world_name": name,
            "activated": True,
            "message": "Mundo criado e ativado",
        }

    add_pending_world(name)
    return {
        "ok": True,
        "world_name": name,
        "activated": False,
        "message": "Mundo registrado com configurações. Ative quando quiser.",
    }


@app.get("/api/worlds/{name}/config")
def api_get_world_config(name: str):
    name = validate_world_name(name)
    if not world_known(name):
        raise HTTPException(404, "Mundo não encontrado")
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
        raise HTTPException(404, "Mundo não encontrado")

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
            raise HTTPException(500, r.stderr or r.stdout or "Erro ao reiniciar container")

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
        raise HTTPException(400, "Não é possível apagar o mundo ativo")
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
        raise HTTPException(404, "Mundo não encontrado")
    return {"ok": True, "deleted": deleted}


# ── Files ────────────────────────────────────────────────────────────────────

@app.get("/api/files/tree")
def api_file_tree(scope: str = "config"):
    scopes = {
        "config": CONFIG_DIR,
        "data": ROOT / "data",
        "root": ROOT,
    }
    base = scopes.get(scope, CONFIG_DIR)
    rel_prefix = {"config": "config", "data": "data", "root": ""}[scope]
    return {"tree": file_tree(base, rel_prefix)}


@app.get("/api/files/read")
def api_read_file(path: str):
    target = safe_path(path)
    if not target.is_file():
        raise HTTPException(404, "Arquivo não encontrado")
    if target.suffix.lower() in (".db", ".fwl", ".zip"):
        raise HTTPException(400, "Arquivo binário — use download")
    content = target.read_text(errors="replace")
    return {"path": path, "content": content, "size": target.stat().st_size}


@app.put("/api/files/write")
def api_write_file(path: str, body: FileContent):
    target = safe_path(path)
    if target.suffix.lower() in (".db", ".fwl"):
        raise HTTPException(400, "Não é possível editar arquivos binários")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(body.content)
    return {"ok": True, "path": path}


@app.get("/api/files/download")
def api_download_file(path: str):
    target = safe_path(path)
    if not target.is_file():
        raise HTTPException(404, "Arquivo não encontrado")
    return FileResponse(target, filename=target.name)


@app.delete("/api/files/delete")
def api_delete_file(path: str):
    target = safe_path(path)
    if not target.exists():
        raise HTTPException(404, "Não encontrado")
    protected = {ENV_FILE.resolve(), COMPOSE_FILE.resolve()}
    if target.resolve() in protected:
        raise HTTPException(403, "Arquivo protegido")
    if target.is_dir():
        shutil.rmtree(target)
    else:
        target.unlink()
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
    if body.bepinex is not None:
        current = read_bepinex_compose()
        if current != body.bepinex:
            write_bepinex_compose(body.bepinex)
            bepinex_changed = True

    if body.values:
        allowed = {k: v for k, v in body.values.items() if k in ("UPDATE_AUTO", "UPDATE_IF_IDLE", "UPDATE_CRON")}
        write_update_config(allowed)

    if body.restart or bepinex_changed:
        r = recreate_container()
        if r.returncode != 0:
            raise HTTPException(500, r.stderr or r.stdout or "Erro ao recriar container")

    return {
        "ok": True,
        "values": update_config(),
        "bepinex": read_bepinex_compose(),
        "recreated": body.restart or bepinex_changed,
    }


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
    return {"ok": True, "message": "Verificação de atualização solicitada", "output": output}


# ── Backups ──────────────────────────────────────────────────────────────────

@app.get("/api/backups")
def api_list_backups():
    purge_old_backups()
    return {"backups": list_backups(), "config": backup_config()}


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
            raise HTTPException(400, "BACKUPS_MAX_AGE deve ser um número >= 1") from e
    write_env(allowed)
    purge_old_backups()
    if body.restart and container_running():
        r = restart_valheim_container()
        if r.returncode != 0:
            raise HTTPException(500, r.stderr or r.stdout or "Erro ao reiniciar container")
    return {"ok": True, "values": backup_config(), "purged": True}


@app.post("/api/backups/trigger")
def api_trigger_backup():
    output = trigger_backup()
    return {"ok": True, "message": "Backup solicitado", "output": output}


@app.post("/api/backups/create")
def api_create_backup(body: BackupCreate):
    name = create_manual_backup(body.type)
    return {"ok": True, "name": name, "type": body.type}


@app.delete("/api/backups/{name}")
def api_delete_backup(name: str):
    if ".." in name or "/" in name or "\\" in name:
        raise HTTPException(400, "Nome inválido")
    target = BACKUPS_DIR / name
    if not target.exists() or not str(target.resolve()).startswith(str(BACKUPS_DIR.resolve())):
        raise HTTPException(404, "Backup não encontrado")
    try:
        if target.is_dir():
            shutil.rmtree(target)
        else:
            target.unlink()
    except OSError as e:
        raise HTTPException(500, f"Falha ao apagar: {e}") from e
    return {"ok": True, "deleted": name}


@app.get("/api/backups/{name}/download")
def api_download_backup(name: str):
    if ".." in name or "/" in name or "\\" in name:
        raise HTTPException(400, "Nome inválido")
    target = BACKUPS_DIR / name
    if not target.is_file() or not str(target.resolve()).startswith(str(BACKUPS_DIR.resolve())):
        raise HTTPException(404, "Backup não encontrado")
    return FileResponse(target, filename=target.name)


# ── Audit ────────────────────────────────────────────────────────────────────

@app.get("/api/audit")
def api_get_audit(lines: int = Query(200, ge=1, le=5000)):
    return {"entries": read_audit(lines)}


@app.get("/api/audit/download")
def api_download_audit():
    if not AUDIT_FILE.exists():
        raise HTTPException(404, "Nenhum log de auditoria encontrado")
    return FileResponse(AUDIT_FILE, filename="audit.jsonl", media_type="application/x-ndjson")


# ── Static Frontend ──────────────────────────────────────────────────────────

STATIC_DIR = Path(__file__).parent / "static"
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
