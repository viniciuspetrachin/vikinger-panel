"""Sanitização, normalização e filtros de logs Docker/Supervisord/BepInEx."""

from __future__ import annotations

import re
from typing import Optional

ANSI_RE = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")
CARET_ANSI_RE = re.compile(r"\^\[\[[\d;]*[A-Za-z]")

DOCKER_LOG_RE = re.compile(
    r"^(?P<ts>\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+supervisord:\s+(?P<proc>\S+)(?:\s+(?P<msg>.*))?$"
)

TAR_VERBOSE_RE = re.compile(r"^\.[rwxdlst.-]{8,}\s+[\./]")

_DOCKER_TS_BRACKET = re.compile(
    r"^\[[A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\]\s*"
)
_BEPINEX_BRACKET = re.compile(
    r"^\[(?:Info|Warning|Error|Message|Debug|Log)\s*:\s*[^\]]+\]\s*",
    re.IGNORECASE,
)

_RE_VALHEIM_CHAT = re.compile(
    r"(?P<steam>\d+)/(?P<player>[^\s(]+)\s*\([^)]+\):\s*"
    r"(?P<cmd>say|showMessage|shout|talk)\s+(?P<msg>.+)$",
    re.IGNORECASE,
)

_LOG_NOISE_PATTERNS = (
    re.compile(r"Command completed:\s*globalKeys", re.I),
    re.compile(r"^\s*Global Keys:\s*$", re.I),
    re.compile(r"^(?:combat_|deathpenalty_|resources_|raids_|portals_)", re.I),
    re.compile(r"^(?:activebosses|defeated_|killed|killedtroll|killed_surtling)\b", re.I),
    re.compile(r"^(?:playerdamage|enemydamage|enemyspeedsize|skillreductionrate|eventrate|playerevents)\b", re.I),
    re.compile(r"^crond\[", re.I),
    re.compile(r"^steamcmd\.sh\[", re.I),
    re.compile(r"Update state \(0x", re.I),
    re.compile(r"verifying install, progress:", re.I),
    re.compile(r"^adding:\s+config/worlds_local/", re.I),
    re.compile(r"^\(deflated \d+%\)$", re.I),
    re.compile(r"^Redirecting stderr to", re.I),
    re.compile(r"^Checking for available updates", re.I),
    re.compile(r"^Logging directory:", re.I),
    re.compile(r"^-- type 'quit' to exit --", re.I),
    re.compile(r"^Connecting anonymously to Steam", re.I),
    re.compile(r"^Waiting for (?:client config|user info)", re.I),
    re.compile(r"^Unloading Steam API", re.I),
    re.compile(r"^Filesystem\s+Size\s+Used", re.I),
    re.compile(r"^overlay\s+/ overlay", re.I),
    re.compile(r"^/dev/mapper/", re.I),
    re.compile(r"^DEBUG - \[\d+\] - (?:Received signal|Kernel:|Found CPU|Memory total|Storage configuration)", re.I),
    re.compile(r"^INFO - (?:Downloading/updating|Backing up Valheim|Removing backups)", re.I),
    re.compile(r"^Connections \d+ ZDOS:", re.I),
    re.compile(r"Destroying abandoned non persistent zdo", re.I),
    re.compile(r"^Disposing socket$", re.I),
    re.compile(r"^send queue size:", re.I),
    re.compile(r"Got status changed msg k_ESteamNetworkingConnectionState_", re.I),
    re.compile(r"^Socket closed by peer", re.I),
    re.compile(r"^Compression: Tried to remove non-existent peer", re.I),
    re.compile(r"^Steamworks: k_ESteamNetworkingConfig_", re.I),
)

_LOG_CONNECTION_PATTERNS = (
    re.compile(r"\bNew connection\b", re.I),
    re.compile(r"\bAccepting connection\b", re.I),
    re.compile(r"\bConnected\b", re.I),
    re.compile(r"Got connection SteamID", re.I),
    re.compile(r"Got handshake from client", re.I),
    re.compile(r"RPC_Disconnect", re.I),
    re.compile(r"Peer \(?\d+\)? disconnected", re.I),
    re.compile(r"disconnected, removing from validated list", re.I),
    re.compile(r"Compression:.*\bconnected\b", re.I),
    re.compile(r"Compression:.*\bdisconnected\b", re.I),
    re.compile(r"Closing socket \d+", re.I),
    re.compile(r"Adding peer \(\d+\) to validated list", re.I),
)

_LOG_GAME_PATTERNS = (
    *_LOG_CONNECTION_PATTERNS,
    re.compile(r"Got character ZDOID from", re.I),
    re.compile(r"\bkilled by\b", re.I),
    re.compile(r"\bwas slain by\b", re.I),
    re.compile(r"\bkilled \S", re.I),
    re.compile(r"Random event set:", re.I),
    re.compile(r"World (?:saved|loaded)", re.I),
    re.compile(r"\bsave\b.*\bcomplete", re.I),
    re.compile(r"Sending .+ version", re.I),
    re.compile(r"Version check,", re.I),
    re.compile(r"Registered Server Events", re.I),
    _RE_VALHEIM_CHAT,
)


def strip_ansi(text: str) -> str:
    text = ANSI_RE.sub("", text)
    return CARET_ANSI_RE.sub("", text)


def normalize_docker_log_line(line: str) -> str:
    line = strip_ansi(line).rstrip()
    if not line.strip():
        return ""
    match = DOCKER_LOG_RE.match(line)
    if match:
        msg = strip_ansi((match.group("msg") or "")).strip()
        if not msg or TAR_VERBOSE_RE.match(msg):
            return ""
        return f"[{match.group('ts')}] {msg}"
    return line


def clean_docker_logs(raw: str) -> str:
    lines = []
    for line in raw.splitlines():
        cleaned = normalize_docker_log_line(line)
        if cleaned:
            lines.append(cleaned)
    return "\n".join(lines)


def _strip_log_prefixes(line: str) -> str:
    """Strip docker/supervisor, timestamp bracket, and BepInEx prefixes from a log line."""
    raw = (line or "").strip()
    if not raw:
        return ""
    text = re.sub(
        r"^(?:[A-Z][a-z]{2}\s+\d+\s+\d+:\d+:\d+\s+)?(?:supervisord:\s+\S+\s+)?",
        "",
        raw,
    ).strip()
    while True:
        changed = False
        m = _DOCKER_TS_BRACKET.match(text)
        if m:
            text = text[m.end():].strip()
            changed = True
        m = _BEPINEX_BRACKET.match(text)
        if m:
            text = text[m.end():].strip()
            changed = True
        if not changed:
            break
    return text


def parse_game_chat_line(line: str) -> Optional[dict[str, str]]:
    """Extract chat info from a Valheim log line, or ``None`` if not chat-like."""
    cleaned = _strip_log_prefixes(line)
    if not cleaned:
        return None
    m = _RE_VALHEIM_CHAT.search(cleaned)
    if m:
        return {
            "player": m.group("player").strip(),
            "message": m.group("msg").strip(),
            "channel": m.group("cmd").strip().lower(),
            "line": line,
        }
    for pat in (
        re.compile(r"\[Chat\]\s*(.+?):\s*(.+)$", re.I),
        re.compile(r"(?:Got message|Shout|Say|Talk)\s*(?:from\s+)?(.+?):\s*(.+)$", re.I),
        re.compile(r"^(.+?)\s+shouts?:\s*(.+)$", re.I),
    ):
        m = pat.search(cleaned)
        if not m:
            continue
        player = (m.group(1) or "").strip()
        text = (m.group(2) or "").strip()
        if player and text and len(player) <= 40:
            return {"player": player, "message": text, "channel": "chat", "line": line}
    return None


def is_log_noise(line: str) -> bool:
    """Return True if the line is infra/updater/globalKeys noise."""
    cleaned = _strip_log_prefixes(line)
    if not cleaned:
        return True
    for pat in _LOG_NOISE_PATTERNS:
        if pat.search(cleaned):
            return True
    return False


def is_log_connection(line: str) -> bool:
    cleaned = _strip_log_prefixes(line)
    if not cleaned:
        return False
    return any(pat.search(cleaned) for pat in _LOG_CONNECTION_PATTERNS)


def is_game_event(line: str) -> bool:
    """Return True if the line looks like a game/server event worth keeping."""
    if parse_game_chat_line(line):
        return True
    cleaned = _strip_log_prefixes(line)
    if not cleaned:
        return False
    return any(pat.search(cleaned) for pat in _LOG_GAME_PATTERNS)


def filter_log_lines(
    lines: list[str] | str,
    *,
    hide_noise: bool = False,
    category: str = "all",
    search: str = "",
) -> list[str]:
    """Filter log lines by noise, category, and optional search substring."""
    if isinstance(lines, str):
        line_list = [ln for ln in lines.splitlines() if ln]
    else:
        line_list = list(lines or [])

    cat = (category or "all").strip().lower()
    if cat not in ("all", "game", "chat", "connections"):
        cat = "all"
    q = (search or "").strip().lower()

    out: list[str] = []
    for line in line_list:
        if hide_noise and is_log_noise(line):
            continue
        if cat == "game" and not is_game_event(line):
            continue
        if cat == "chat" and not parse_game_chat_line(line):
            continue
        if cat == "connections" and not is_log_connection(line):
            continue
        if q and q not in line.lower():
            continue
        out.append(line)
    return out


def apply_log_filters(
    text: str,
    *,
    hide_noise: bool = False,
    category: str = "all",
    search: str = "",
) -> tuple[str, int, int]:
    """Filter raw log text; return ``(filtered_text, line_count, filtered_count)``."""
    lines = [ln for ln in (text or "").splitlines() if ln]
    line_count = len(lines)
    filtered = filter_log_lines(
        lines,
        hide_noise=hide_noise,
        category=category,
        search=search,
    )
    return "\n".join(filtered), line_count, len(filtered)
