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
    ``cpu_percent``, ``memory_percent``, ``load_kind``, ``text`` (chat body).
    """
    ctx = ctx or {}
    player = ctx.get("player") or ctx.get("name") or "Someone"
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
