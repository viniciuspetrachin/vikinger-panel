"""Outbound notifications: Discord webhooks + Telegram bot.

Config shape (persisted by main.py in db ``settings`` under e.g. ``"alerts"``)::

    {
        "discord": {"enabled": bool, "webhook_url": str},
        "telegram": {"enabled": bool, "bot_token": str, "chat_id": str},
        "chat_bridge": {"enabled": bool, "prefix": str},
        "events": {
            "server_down": bool,
            "server_up": bool,
            "server_starting": bool,
            "server_stopping": bool,
            "server_restarting": bool,
            "server_high_load": bool,
            "player_join": bool,
            "player_leave": bool,
            "player_first_join": bool,
            "player_kick": bool,
            "player_ban": bool,
            "player_death": bool,
            "player_pvp_kill": bool,
            "boss_defeated": bool,
            "raid_started": bool,
            "backup_scheduled_warning": bool,
            "restart_scheduled_warning": bool,
            "player_chat": bool,
            "mod_added": bool,
            "mod_updated": bool,
            "mod_removed": bool,
            "backup_ok": bool,
            "backup_fail": bool,
        }
    }

The pure formatters (:func:`format_event`) build a ``{title, message, color}`` for each
event type and are fully unit-testable. Network senders take an injected
``http`` client (defaulting to ``httpx``) and never raise on failure — they
return ``bool`` success.
"""

from __future__ import annotations

import re
from typing import Any, Optional
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

EVENT_TYPES = (
    "server_down",
    "server_up",
    "server_starting",
    "server_stopping",
    "server_restarting",
    "server_high_load",
    "player_join",
    "player_leave",
    "player_first_join",
    "player_kick",
    "player_ban",
    "player_death",
    "player_pvp_kill",
    "boss_defeated",
    "raid_started",
    "backup_scheduled_warning",
    "restart_scheduled_warning",
    "player_chat",
    "mod_added",
    "mod_updated",
    "mod_removed",
    "backup_ok",
    "backup_fail",
)

# Discord embed colors (decimal)
_COLOR_RED = 0xE74C3C
_COLOR_GREEN = 0x2ECC71
_COLOR_AMBER = 0xF39C12
_COLOR_BLUE = 0x3498DB
_COLOR_PURPLE = 0x9B59B6
_COLOR_GRAY = 0x95A5A6

HIGH_LOAD_THRESHOLD = 80.0
HIGH_LOAD_CLEAR_THRESHOLD = 70.0

DEFAULT_CHAT_PREFIX = "@discord"

BOSS_KEY_LABELS = {
    "defeated_eikthyr": "Eikthyr",
    "defeated_gdking": "The Elder",
    "defeated_bonemass": "Bonemass",
    "defeated_dragon": "Moder",
    "defeated_goblinking": "Yagluth",
    "defeated_queen": "The Queen",
    "defeated_fader": "Fader",
}

RAID_EVENT_LABELS = {
    "army_eikthyr": "Eikthyr army raid",
    "army_theelder": "The Elder army raid",
    "army_gdking": "The Elder army raid",
    "army_bonemass": "Bonemass army raid",
    "army_dragon": "Moder army raid",
    "army_goblin": "Goblin army raid",
    "army_goblins": "Goblin army raid",
    "army_goblinbrute": "Goblin brute raid",
    "army_skeletons": "Skeleton raid",
    "army_trolls": "Troll raid",
    "army_wolves": "Wolf raid",
}

_RE_PLAYER_DEATH = re.compile(r"Got character ZDOID from (.+?) : 0:0")
_RE_PVP_KILLED_BY = re.compile(
    r"(?P<victim>.+?) killed by (?P<killer>.+)$",
    re.IGNORECASE,
)
_RE_PVP_KILLED = re.compile(
    r"(?P<killer>.+?) killed (?P<victim>.+)$",
    re.IGNORECASE,
)
_RE_PVP_SLAIN = re.compile(
    r"(?P<victim>.+?) was slain by (?P<killer>.+)$",
    re.IGNORECASE,
)
_RE_BOSS_KEY = re.compile(r"\b(defeated_[a-z0-9_]+)\b", re.IGNORECASE)
_RE_RANDOM_EVENT = re.compile(r"Random event set:\s*(\S+)", re.IGNORECASE)

# Common chat log line shapes from docker / BepInEx (when a mod logs chat).
_CHAT_LINE_PATTERNS = (
    re.compile(r"\[Chat\]\s*(.+?):\s*(.+)$", re.IGNORECASE),
    re.compile(r"\[Info\s*:\s*[^\]]*Chat[^\]]*\]\s*(.+?):\s*(.+)$", re.IGNORECASE),
    re.compile(r"(?:Got message|Shout|Say|Talk)\s*(?:from\s+)?(.+?):\s*(.+)$", re.IGNORECASE),
    re.compile(r"^(.+?)\s+shouts?:\s*(.+)$", re.IGNORECASE),
    re.compile(r"^(.+?):\s*(.+)$"),
)

# Skip obvious non-chat noise when using the generic ``Name: msg`` fallback.
_CHAT_SKIP_NAMES = frozenset({
    "error", "warning", "info", "debug", "message", "bepinex", "unity",
    "supervisord", "valheim-server", "valheim", "steam", "fallback",
})


def format_event(event_type: str, ctx: Optional[dict] = None) -> dict:
    """Return ``{title, message, color}`` for ``event_type`` using ``ctx`` values.

    Unknown event types get a generic title/message. ``ctx`` keys used:
    ``player`` (name), ``world``, ``error``, ``path``/``file``, ``mod``, ``version``,
    ``cpu_percent``, ``memory_percent``, ``load_kind``, ``text`` (chat body),
    ``killer``, ``victim``, ``boss``, ``key``, ``raid``, ``event``, ``job``,
    ``minutes``, ``action``.
    """
    ctx = ctx or {}
    player = ctx.get("player") or ctx.get("name") or "Someone"
    killer = ctx.get("killer") or "Someone"
    victim = ctx.get("victim") or player
    boss = ctx.get("boss") or ctx.get("key") or "Unknown boss"
    raid = ctx.get("raid") or ctx.get("event") or "Unknown raid"
    job = ctx.get("job") or "job"
    minutes = ctx.get("minutes")
    action = ctx.get("action") or ""
    world = ctx.get("world") or ""
    error = ctx.get("error") or ""
    backup_name = ctx.get("file") or ctx.get("path") or ""
    mod = ctx.get("mod") or ctx.get("mod_name") or "Unknown mod"
    version = ctx.get("version") or ""
    cpu = ctx.get("cpu_percent")
    mem = ctx.get("memory_percent")
    load_kind = ctx.get("load_kind") or "resource"
    text = ctx.get("text") or ctx.get("message") or ""

    if event_type == "server_down":
        return {
            "title": "🔴 Server offline",
            "message": "The Valheim server is DOWN"
            + (f" ({world})" if world else "") + ".",
            "color": _COLOR_RED,
        }
    if event_type == "server_up":
        return {
            "title": "🟢 Server online",
            "message": "The Valheim server is UP"
            + (f" ({world})" if world else "") + " and accepting connections.",
            "color": _COLOR_GREEN,
        }
    if event_type == "server_starting":
        return {
            "title": "▶️ Server starting",
            "message": "The Valheim server is about to start"
            + (f" ({world})" if world else "") + ".",
            "color": _COLOR_BLUE,
        }
    if event_type == "server_stopping":
        return {
            "title": "⏹️ Server stopping",
            "message": "The Valheim server is about to shut down"
            + (f" ({world})" if world else "") + ".",
            "color": _COLOR_AMBER,
        }
    if event_type == "server_restarting":
        return {
            "title": "🔄 Server restarting",
            "message": "The Valheim server is about to restart"
            + (f" ({world})" if world else "") + ".",
            "color": _COLOR_AMBER,
        }
    if event_type == "server_high_load":
        parts = []
        if cpu is not None:
            parts.append(f"CPU {float(cpu):.0f}%")
        if mem is not None:
            parts.append(f"RAM {float(mem):.0f}%")
        detail = " / ".join(parts) if parts else f"{load_kind} ≥ {int(HIGH_LOAD_THRESHOLD)}%"
        return {
            "title": "⚠️ High server load",
            "message": f"The Valheim server is under high load ({detail}).",
            "color": _COLOR_AMBER,
        }
    if event_type == "player_join":
        return {
            "title": "➕ Player joined",
            "message": f"{player} joined the server.",
            "color": _COLOR_GREEN,
        }
    if event_type == "player_leave":
        return {
            "title": "➖ Player left",
            "message": f"{player} left the server.",
            "color": _COLOR_GRAY,
        }
    if event_type == "player_first_join":
        return {
            "title": "🆕 First-time player",
            "message": f"{player} joined the server for the first time.",
            "color": _COLOR_GREEN,
        }
    if event_type == "player_kick":
        return {
            "title": "👢 Player kicked",
            "message": f"{player} was kicked from the server via the panel.",
            "color": _COLOR_AMBER,
        }
    if event_type == "player_ban":
        return {
            "title": "🚫 Player banned",
            "message": f"{player} was banned from the server via the panel.",
            "color": _COLOR_RED,
        }
    if event_type == "player_death":
        return {
            "title": "💀 Player died",
            "message": f"{player} died on the server.",
            "color": _COLOR_RED,
        }
    if event_type == "player_pvp_kill":
        return {
            "title": "⚔️ PvP kill",
            "message": f"{killer} killed {victim}.",
            "color": _COLOR_RED,
        }
    if event_type == "boss_defeated":
        return {
            "title": "🏆 Boss defeated",
            "message": f"{boss} was defeated on the server.",
            "color": _COLOR_PURPLE,
        }
    if event_type == "raid_started":
        return {
            "title": "⚔️ Raid started",
            "message": f"A raid/event started on the server: {raid}.",
            "color": _COLOR_RED,
        }
    if event_type == "backup_scheduled_warning":
        when = f" in about {int(minutes)} minute(s)" if minutes is not None else " soon"
        label = "World backup" if job == "world_backup" else "Scheduled backup"
        return {
            "title": "⏰ Backup scheduled",
            "message": f"{label} will run{when}.",
            "color": _COLOR_AMBER,
        }
    if event_type == "restart_scheduled_warning":
        when = f" in about {int(minutes)} minute(s)" if minutes is not None else " soon"
        return {
            "title": "⏰ Restart scheduled",
            "message": f"Scheduled server restart will run{when}.",
            "color": _COLOR_AMBER,
        }
    if event_type == "player_chat":
        body = text or ""
        return {
            "title": "💬 Player chat",
            "message": f"{player}: {body}" if body else f"{player}:",
            "color": _COLOR_BLUE,
            "chat": True,
            "username": str(player)[:80],
            "content": body or "(empty)",
        }
    if event_type == "mod_added":
        ver = f" v{version}" if version else ""
        return {
            "title": "🧩 Mod added",
            "message": f"New mod installed: {mod}{ver}.",
            "color": _COLOR_PURPLE,
        }
    if event_type == "mod_updated":
        ver = f" v{version}" if version else ""
        return {
            "title": "🧩 Mod updated",
            "message": f"Mod updated: {mod}{ver}.",
            "color": _COLOR_PURPLE,
        }
    if event_type == "mod_removed":
        return {
            "title": "🧩 Mod removed",
            "message": f"Mod removed: {mod}.",
            "color": _COLOR_GRAY,
        }
    if event_type == "backup_ok":
        return {
            "title": "💾 Backup complete",
            "message": "World backup completed successfully"
            + (f": {backup_name}" if backup_name else "") + ".",
            "color": _COLOR_GREEN,
        }
    if event_type == "backup_fail":
        return {
            "title": "⚠️ Backup failed",
            "message": "World backup FAILED"
            + (f": {error}" if error else "") + ".",
            "color": _COLOR_RED,
        }
    return {
        "title": f"Event: {event_type}",
        "message": str(ctx) if ctx else event_type,
        "color": _COLOR_BLUE,
    }


def parse_chat_line(line: str) -> Optional[tuple[str, str]]:
    """Extract ``(player, message)`` from a log line, or ``None`` if not chat-like."""
    raw = (line or "").strip()
    if not raw:
        return None
    # Drop common docker/supervisor prefixes.
    cleaned = re.sub(
        r"^(?:[A-Z][a-z]{2}\s+\d+\s+\d+:\d+:\d+\s+)?(?:supervisord:\s+\S+\s+)?",
        "",
        raw,
    ).strip()
    if not cleaned:
        return None
    for pat in _CHAT_LINE_PATTERNS:
        m = pat.search(cleaned)
        if not m:
            continue
        player = (m.group(1) or "").strip()
        text = (m.group(2) or "").strip()
        if not player or not text:
            continue
        # Avoid matching timestamps / log levels as names on the generic pattern.
        if pat.pattern == r"^(.+?):\s*(.+)$":
            name_key = player.lower().split()[-1] if player else ""
            if name_key in _CHAT_SKIP_NAMES or len(player) > 40:
                continue
            if re.search(r"[\[\]/\\]", player):
                continue
        return player, text
    return None


def extract_prefixed_chat(
    lines: list[str] | str,
    prefix: str = DEFAULT_CHAT_PREFIX,
) -> list[dict[str, str]]:
    """Return chat messages whose body starts with ``prefix`` (case-insensitive).

    Each item is ``{"player": str, "text": str, "line": str}`` with the prefix stripped
    from ``text``.
    """
    if isinstance(lines, str):
        line_list = lines.splitlines()
    else:
        line_list = list(lines or [])
    pref = (prefix or DEFAULT_CHAT_PREFIX).strip()
    if not pref:
        pref = DEFAULT_CHAT_PREFIX
    pref_lower = pref.lower()
    out: list[dict[str, str]] = []
    for line in line_list:
        parsed = parse_chat_line(line)
        if not parsed:
            continue
        player, text = parsed
        body = text.lstrip()
        if not body.lower().startswith(pref_lower):
            continue
        remainder = body[len(pref):].lstrip(" \t:-")
        if not remainder:
            continue
        out.append({"player": player, "text": remainder, "line": line})
    return out


def _clean_game_log_line(line: str) -> str:
    """Strip docker/supervisor prefixes from a log line."""
    raw = (line or "").strip()
    if not raw:
        return ""
    return re.sub(
        r"^(?:[A-Z][a-z]{2}\s+\d+\s+\d+:\d+:\d+\s+)?(?:supervisord:\s+\S+\s+)?",
        "",
        raw,
    ).strip()


def _looks_like_system_line(cleaned: str) -> bool:
    lower = cleaned.lower()
    if not cleaned or len(cleaned) > 200:
        return True
    for token in (
        "supervisord", "bepinex", "valheim-server", "unity", "steam",
        "got connection steamid", "got character zdoid", "closing socket",
        "world loaded",
    ):
        if token in lower:
            return True
    return False


def extract_player_deaths(lines: list[str] | str) -> list[dict[str, str]]:
    """Return death events from Valheim log lines (ZDOID 0:0)."""
    if isinstance(lines, str):
        line_list = lines.splitlines()
    else:
        line_list = list(lines or [])
    out: list[dict[str, str]] = []
    for line in line_list:
        cleaned = _clean_game_log_line(line)
        if not cleaned:
            continue
        m = _RE_PLAYER_DEATH.search(cleaned)
        if not m:
            continue
        player = (m.group(1) or "").strip()
        if not player:
            continue
        out.append({"player": player, "line": line})
    return out


def extract_pvp_kills(lines: list[str] | str) -> list[dict[str, str]]:
    """Return PvP kill events from log lines (mod kill-feed patterns)."""
    if isinstance(lines, str):
        line_list = lines.splitlines()
    else:
        line_list = list(lines or [])
    out: list[dict[str, str]] = []
    for line in line_list:
        cleaned = _clean_game_log_line(line)
        if _looks_like_system_line(cleaned):
            continue
        for pat in (_RE_PVP_KILLED_BY, _RE_PVP_SLAIN, _RE_PVP_KILLED):
            m = pat.search(cleaned)
            if not m:
                continue
            killer = (m.group("killer") or "").strip().strip(".")
            victim = (m.group("victim") or "").strip().strip(".")
            if not killer or not victim or killer.lower() == victim.lower():
                continue
            if killer.lower() in _CHAT_SKIP_NAMES or victim.lower() in _CHAT_SKIP_NAMES:
                continue
            out.append({"killer": killer, "victim": victim, "line": line})
            break
    return out


def parse_global_boss_keys(rcon_output: str) -> set[str]:
    """Extract defeated_* global keys from RCON globalKeys output."""
    keys: set[str] = set()
    for m in _RE_BOSS_KEY.finditer(rcon_output or ""):
        key = (m.group(1) or "").lower()
        if key.startswith("defeated_"):
            keys.add(key)
    return keys


def boss_label_for_key(key: str) -> str:
    """Human-readable boss name for a global key."""
    normalized = (key or "").lower()
    return BOSS_KEY_LABELS.get(normalized, normalized.replace("defeated_", "").replace("_", " ").title())


def extract_random_events(lines: list[str] | str) -> list[dict[str, str]]:
    """Return raid/random-event starts from Valheim log lines."""
    if isinstance(lines, str):
        line_list = lines.splitlines()
    else:
        line_list = list(lines or [])
    out: list[dict[str, str]] = []
    for line in line_list:
        cleaned = _clean_game_log_line(line)
        if not cleaned:
            continue
        m = _RE_RANDOM_EVENT.search(cleaned)
        if not m:
            continue
        event_key = (m.group(1) or "").strip().strip(".")
        if not event_key:
            continue
        out.append({"event": event_key, "line": line})
    return out


def raid_label_for_key(key: str) -> str:
    """Human-readable raid name for a random-event key."""
    normalized = (key or "").lower()
    return RAID_EVENT_LABELS.get(
        normalized,
        normalized.replace("army_", "").replace("_", " ").title() + " raid",
    )


def _get_http(http: Any):
    if http is not None:
        return http
    try:
        import httpx

        return httpx
    except Exception:
        return None


def _webhook_url_with_wait(webhook_url: str) -> str:
    """Ensure Discord ``wait=true`` so failures are reported (docs default is false)."""
    parts = urlsplit(webhook_url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query["wait"] = "true"
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def send_discord(
    webhook_url: str,
    title: str,
    message: str,
    http: Any = None,
    color: int | None = None,
    *,
    username: str | None = None,
    content: str | None = None,
    use_embed: bool = True,
) -> bool:
    """POST to a Discord webhook. Returns success; never raises.

    When ``use_embed`` is False, sends plain ``content`` with optional webhook
    ``username`` (player chat bridge).
    """
    if not webhook_url:
        return False
    client = _get_http(http)
    if client is None:
        return False
    if use_embed:
        embed: dict[str, Any] = {"title": title, "description": message}
        if color is not None:
            embed["color"] = color
        payload: dict[str, Any] = {
            "username": username or "Vikinger Panel",
            "embeds": [embed],
        }
    else:
        payload = {
            "username": (username or "Player")[:80],
            "content": (content if content is not None else message)[:2000],
        }
    url = _webhook_url_with_wait(webhook_url)
    try:
        resp = client.post(url, json=payload, timeout=10)
        code = getattr(resp, "status_code", 0)
        return 200 <= code < 300
    except Exception:
        return False


def send_telegram(bot_token: str, chat_id: str, text: str, http: Any = None) -> bool:
    """Send a Telegram message via the bot API. Returns success; never raises."""
    if not bot_token or not chat_id:
        return False
    client = _get_http(http)
    if client is None:
        return False
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    try:
        resp = client.post(url, json=payload, timeout=10)
        code = getattr(resp, "status_code", 0)
        return 200 <= code < 300
    except Exception:
        return False


def _event_enabled(config: dict, event_type: str) -> bool:
    events = config.get("events") or {}
    # server_up pairs with down / intentional start / restart toggles.
    if event_type == "server_up":
        return bool(
            events.get("server_up")
            or events.get("server_down")
            or events.get("server_starting")
            or events.get("server_restarting")
        )
    # player_chat can be enabled via the dedicated toggle or chat_bridge.enabled.
    if event_type == "player_chat":
        bridge = config.get("chat_bridge") or {}
        return bool(events.get("player_chat") or bridge.get("enabled"))
    # Opt-in: missing toggle means disabled (matches DEFAULT_ALERTS_CONFIG).
    return bool(events.get(event_type, False))


def dispatch(config: dict, event_type: str, ctx: Optional[dict] = None, http: Any = None) -> dict:
    """Send an event to every enabled channel.

    Returns ``{"discord": bool|None, "telegram": bool|None}`` where ``None``
    means the channel was disabled/unconfigured (not attempted).
    """
    result: dict[str, Any] = {"discord": None, "telegram": None}
    config = config or {}
    if not _event_enabled(config, event_type):
        return result

    formatted = format_event(event_type, ctx)
    title, message = formatted["title"], formatted["message"]
    color = formatted.get("color")
    is_chat = bool(formatted.get("chat"))

    discord = config.get("discord") or {}
    if discord.get("enabled") and discord.get("webhook_url"):
        if is_chat:
            result["discord"] = send_discord(
                discord["webhook_url"],
                title,
                message,
                http=http,
                use_embed=False,
                username=formatted.get("username") or "Player",
                content=formatted.get("content") or message,
            )
        else:
            result["discord"] = send_discord(
                discord["webhook_url"], title, message, http=http, color=color
            )

    telegram = config.get("telegram") or {}
    if telegram.get("enabled") and telegram.get("bot_token") and telegram.get("chat_id"):
        text = message if is_chat else f"{title}\n{message}"
        result["telegram"] = send_telegram(
            telegram["bot_token"], telegram["chat_id"], text, http=http
        )
    return result


def test_channels(config: dict, http: Any = None) -> dict:
    """Send a test message to each configured channel. Returns per-channel bool."""
    config = config or {}
    title = "✅ Vikinger Panel test"
    message = "This is a test notification from the Vikinger Panel."
    result: dict[str, Any] = {"discord": None, "telegram": None}

    discord = config.get("discord") or {}
    if discord.get("webhook_url"):
        result["discord"] = send_discord(
            discord["webhook_url"], title, message, http=http, color=_COLOR_GREEN
        )

    telegram = config.get("telegram") or {}
    if telegram.get("bot_token") and telegram.get("chat_id"):
        result["telegram"] = send_telegram(
            telegram["bot_token"], telegram["chat_id"], f"{title}\n{message}", http=http
        )
    return result
