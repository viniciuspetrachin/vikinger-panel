"""Cliente Source RCON para ValheimRcon (BepInEx)."""

from __future__ import annotations

import logging
import os
import re
import secrets
import shutil
import socket
import struct
from pathlib import Path
from typing import Callable, Optional

logger = logging.getLogger("vikinger-panel")

SERVERDATA_AUTH = 3
SERVERDATA_AUTH_RESPONSE = 2
SERVERDATA_EXECCOMMAND = 2
SERVERDATA_RESPONSE_VALUE = 0

RCON_PLUGIN_NAME = "ValheimRcon.dll"
RCON_CFG_NAME = "org.tristan.rcon.cfg"
INSECURE_PASSWORDS = frozenset({"", "changeme", "password", "123456", "admin"})

BUNDLED_MODS: dict[str, dict] = {
    RCON_PLUGIN_NAME: {
        "label": "ValheimRcon",
        "version": "1.5.1",
        "description": "RCON console and moderation (kick, ban, admin) — bundled with the panel",
    },
}


def is_protected_mod(name: str) -> bool:
    return name in BUNDLED_MODS


def is_mod_enabled(plugins_dir: Path, disabled_dir: Path, name: str = RCON_PLUGIN_NAME) -> bool:
    return (plugins_dir / name).exists()


def ensure_bundled_mods(*, bundled_dir: Path, plugins_dir: Path, disabled_dir: Path) -> list[str]:
    """Garante mods embarcados instalados/atualizados sem alterar enabled/disabled."""
    installed: list[str] = []
    plugins_dir.mkdir(parents=True, exist_ok=True)
    disabled_dir.mkdir(parents=True, exist_ok=True)

    for dll_name in BUNDLED_MODS:
        src = bundled_dir / dll_name
        if not src.exists():
            logger.warning("Mod embarcado ausente: %s", src)
            continue

        enabled_path = plugins_dir / dll_name
        disabled_path = disabled_dir / dll_name
        if enabled_path.exists():
            dest = enabled_path
        elif disabled_path.exists():
            dest = disabled_path
        else:
            dest = enabled_path

        needs_copy = (
            not dest.exists()
            or src.stat().st_size != dest.stat().st_size
            or src.stat().st_mtime > dest.stat().st_mtime
        )
        if needs_copy:
            shutil.copy2(src, dest)
            installed.append(dll_name)

    return installed


def _write_rcon_password(cfg_path: Path, password: str, port: int | None = None) -> None:
    """Atualiza Password (e opcionalmente Port) preservando o formato do cfg do ValheimRcon."""
    if cfg_path.exists():
        text = cfg_path.read_text(encoding="utf-8", errors="replace")
    else:
        text = ""

    if not text.strip():
        use_port = port if port is not None else 2458
        cfg_path.parent.mkdir(parents=True, exist_ok=True)
        cfg_path.write_text(f"[General]\nPort = {use_port}\nPassword = {password}\n", encoding="utf-8")
        return

    if re.search(r"^Password\s*=", text, re.MULTILINE):
        text = re.sub(r"^Password\s*=.*$", f"Password = {password}", text, count=1, flags=re.MULTILINE)
    else:
        text = text.rstrip() + f"\nPassword = {password}\n"

    if port is not None and re.search(r"^Port\s*=", text, re.MULTILINE):
        text = re.sub(r"^Port\s*=.*$", f"Port = {port}", text, count=1, flags=re.MULTILINE)

    cfg_path.write_text(text, encoding="utf-8")


def ensure_rcon_config(*, cfg_dir: Path, server_port: int = 2456) -> dict:
    """Gera senha RCON forte se ausente ou insegura. Retorna password só quando recém-criada."""
    cfg_path = cfg_dir / RCON_CFG_NAME
    existing = read_rcon_cfg_file(cfg_path) if cfg_path.exists() else {}
    password = existing.get("Password", existing.get("password", ""))

    if password and password not in INSECURE_PASSWORDS:
        return {"created": False, "password": None}

    password = secrets.token_urlsafe(24)
    port = server_port + 2
    port_raw = existing.get("Port", existing.get("port", ""))
    if port_raw:
        try:
            port = int(port_raw)
        except ValueError:
            pass

    cfg_dir.mkdir(parents=True, exist_ok=True)
    _write_rcon_password(cfg_path, password, port)
    return {"created": True, "password": password}


class RconError(Exception):
    """Erro de comunicação ou autenticação RCON."""


def _parse_bepinex_cfg(text: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("//"):
            continue
        if "=" in line:
            key, _, val = line.partition("=")
            values[key.strip()] = val.strip().strip('"').strip("'")
    return values


def read_rcon_cfg_file(cfg_path: Path) -> dict[str, str]:
    if not cfg_path.exists():
        return {}
    return _parse_bepinex_cfg(cfg_path.read_text(errors="replace"))


def get_rcon_config(
    *,
    bepinex_cfg_dir: Path,
    env_file: Path,
    read_env_fn: Callable[[], dict[str, str]],
) -> Optional[dict]:
    """Retorna host/port/password ou None se config incompleta."""
    env_vals = read_env_fn()
    host = os.environ.get("PANEL_RCON_HOST") or env_vals.get("PANEL_RCON_HOST") or "valheim"

    port_raw = os.environ.get("PANEL_RCON_PORT") or env_vals.get("PANEL_RCON_PORT", "")
    password = os.environ.get("PANEL_RCON_PASSWORD") or env_vals.get("PANEL_RCON_PASSWORD", "")

    cfg = read_rcon_cfg_file(bepinex_cfg_dir / RCON_CFG_NAME)
    if not password:
        password = cfg.get("Password", cfg.get("password", ""))
    if not port_raw:
        port_raw = cfg.get("Port", cfg.get("port", ""))

    server_port = int(env_vals.get("SERVER_PORT", "2456") or 2456)
    try:
        port = int(port_raw) if port_raw else server_port + 2
    except ValueError:
        port = server_port + 2

    if not password or password in INSECURE_PASSWORDS:
        return None

    return {"host": host, "port": port, "password": password}


def is_plugin_installed(plugins_dir: Path, disabled_dir: Path | None = None) -> bool:
    if (plugins_dir / RCON_PLUGIN_NAME).exists():
        return True
    if disabled_dir and (disabled_dir / RCON_PLUGIN_NAME).exists():
        return True
    return False


def is_rcon_configured(
    *,
    plugins_dir: Path,
    disabled_dir: Path,
    bepinex_cfg_dir: Path,
    env_file: Path,
    read_env_fn: Callable[[], dict[str, str]],
) -> bool:
    if not is_mod_enabled(plugins_dir, disabled_dir):
        return False
    return get_rcon_config(
        bepinex_cfg_dir=bepinex_cfg_dir,
        env_file=env_file,
        read_env_fn=read_env_fn,
    ) is not None


def _pack_packet(req_id: int, req_type: int, body: str) -> bytes:
    payload = struct.pack("<ii", req_id, req_type) + body.encode("utf-8") + b"\x00\x00"
    return struct.pack("<i", len(payload)) + payload


def _recv_exact(sock: socket.socket, size: int) -> bytes:
    chunks: list[bytes] = []
    remaining = size
    while remaining > 0:
        chunk = sock.recv(remaining)
        if not chunk:
            raise RconError("RCON connection closed unexpectedly")
        chunks.append(chunk)
        remaining -= len(chunk)
    return b"".join(chunks)


def _recv_packet(sock: socket.socket) -> tuple[int, int, str]:
    raw_size = _recv_exact(sock, 4)
    size = struct.unpack("<i", raw_size)[0]
    if size < 10:
        raise RconError("Invalid RCON packet")
    data = _recv_exact(sock, size)
    req_id, req_type = struct.unpack("<ii", data[:8])
    body = data[8:-2].decode("utf-8", errors="replace")
    return req_id, req_type, body


def _read_command_response(
    sock: socket.socket,
    cmd_id: int,
    *,
    response_timeout: float,
    idle_timeout: float = 1.5,
) -> str:
    """Lê resposta RCON (Source ou ValheimRcon).

    ValheimRcon usa PacketType.Command (2) com requestId espelhado — não
    SERVERDATA_RESPONSE_VALUE (0) do protocolo Valve.
    """
    parts: list[str] = []
    got_any = False

    while True:
        try:
            sock.settimeout(idle_timeout if got_any else response_timeout)
            resp_id, resp_type, body = _recv_packet(sock)
        except socket.timeout:
            if got_any:
                break
            raise

        if resp_type == 4:
            continue
        if resp_type not in (SERVERDATA_RESPONSE_VALUE, SERVERDATA_EXECCOMMAND):
            continue

        got_any = True
        if body:
            parts.append(body)
        if resp_id == -1:
            break
        # ValheimRcon: resposta única em PacketType.Command (2) com mesmo requestId.
        if resp_type == SERVERDATA_EXECCOMMAND and resp_id == cmd_id:
            break
        # Source RCON: múltiplos pacotes tipo 0; terminador vazio com mesmo id.
        if resp_type == SERVERDATA_RESPONSE_VALUE and resp_id == cmd_id and not body:
            break

    return "\n".join(parts).strip() or "(no response)"


def rcon_command(
    command: str,
    *,
    host: str,
    port: int,
    password: str,
    connect_timeout: float = 10.0,
    response_timeout: float = 15.0,
    idle_timeout: float = 1.5,
) -> str:
    command = command.strip()
    if not command:
        raise RconError("Empty command")

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    authenticated = False
    try:
        sock.settimeout(connect_timeout)
        sock.connect((host, port))

        auth_id = 1
        sock.sendall(_pack_packet(auth_id, SERVERDATA_AUTH, password))
        sock.settimeout(response_timeout)
        while True:
            resp_id, resp_type, body = _recv_packet(sock)
            if resp_type == 4:
                continue
            if resp_type == SERVERDATA_RESPONSE_VALUE and not body:
                continue
            if resp_type == SERVERDATA_AUTH_RESPONSE or (
                resp_type == SERVERDATA_EXECCOMMAND and body and resp_id != -1
            ):
                if resp_id == -1:
                    raise RconError("RCON authentication failed — check the password")
                authenticated = True
                break
            raise RconError("RCON authentication failed — unexpected server response")

        cmd_id = 2
        sock.sendall(_pack_packet(cmd_id, SERVERDATA_EXECCOMMAND, command))
        return _read_command_response(
            sock,
            cmd_id,
            response_timeout=response_timeout,
            idle_timeout=idle_timeout,
        )
    except socket.timeout as e:
        if authenticated:
            raise RconError(
                "Timeout waiting for RCON response — commands like list can be slow; "
                "try again or wait for the server to finish processing"
            ) from e
        raise RconError(
            "Timeout connecting to RCON — is the server running with ValheimRcon?"
        ) from e
    except OSError as e:
        raise RconError(f"Could not connect to RCON ({host}:{port}): {e}") from e
    finally:
        sock.close()


def execute_rcon(
    command: str,
    *,
    plugins_dir: Path,
    disabled_dir: Path,
    bepinex_cfg_dir: Path,
    env_file: Path,
    read_env_fn: Callable[[], dict[str, str]],
    timeout: float = 15.0,
    idle_timeout: float = 1.5,
) -> str:
    if not is_mod_enabled(plugins_dir, disabled_dir):
        raise RconError(
            "ValheimRcon disabled — enable the bundled mod to use console and moderation"
        )
    cfg = get_rcon_config(
        bepinex_cfg_dir=bepinex_cfg_dir,
        env_file=env_file,
        read_env_fn=read_env_fn,
    )
    if not cfg:
        raise RconError("RCON not configured — set the password in config/bepinex/org.tristan.rcon.cfg")
    slow_idle = float(os.environ.get("PANEL_RCON_IDLE_SLOW", "3"))
    idle = slow_idle if timeout >= float(os.environ.get("PANEL_RCON_TIMEOUT_SLOW", "90")) else idle_timeout
    return rcon_command(
        command,
        host=cfg["host"],
        port=cfg["port"],
        password=cfg["password"],
        response_timeout=timeout,
        idle_timeout=idle,
    )


STEAM_ID_RE = re.compile(r"^\d{17}$")
