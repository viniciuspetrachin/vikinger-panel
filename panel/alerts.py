"""Outbound notifications: Discord webhooks + Telegram bot.

Config shape (persisted by main.py in db ``settings`` under e.g. ``"alerts"``)::

    {
        "discord": {"enabled": bool, "webhook_url": str},
        "telegram": {"enabled": bool, "bot_token": str, "chat_id": str},
        "events": {
            "server_down": bool,
            "server_up": bool,
            "server_starting": bool,
            "server_stopping": bool,
            "server_restarting": bool,
            "server_high_load": bool,
            "player_join": bool,
            "player_leave": bool,
            "mod_added": bool,
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
    "mod_added",
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


def format_event(event_type: str, ctx: Optional[dict] = None) -> dict:
    """Return ``{title, message, color}`` for ``event_type`` using ``ctx`` values.

    Unknown event types get a generic title/message. ``ctx`` keys used:
    ``player`` (name), ``world``, ``error``, ``path``/``file``, ``mod``, ``version``,
    ``cpu_percent``, ``memory_percent``, ``load_kind``.
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
    if event_type == "mod_added":
        ver = f" v{version}" if version else ""
        return {
            "title": "🧩 Mod added",
            "message": f"New mod installed: {mod}{ver}.",
            "color": _COLOR_PURPLE,
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


def send_discord(webhook_url: str, title: str, message: str, http: Any = None, color: int | None = None) -> bool:
    """POST an embed to a Discord webhook. Returns success; never raises."""
    if not webhook_url:
        return False
    client = _get_http(http)
    if client is None:
        return False
    embed: dict[str, Any] = {"title": title, "description": message}
    if color is not None:
        embed["color"] = color
    payload = {"username": "Vikinger Panel", "embeds": [embed]}
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
    # server_up is paired with the "server goes down" toggle (no separate UI switch).
    if event_type == "server_up":
        return bool(events.get("server_up") or events.get("server_down"))
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

    discord = config.get("discord") or {}
    if discord.get("enabled") and discord.get("webhook_url"):
        result["discord"] = send_discord(
            discord["webhook_url"], title, message, http=http, color=color
        )

    telegram = config.get("telegram") or {}
    if telegram.get("enabled") and telegram.get("bot_token") and telegram.get("chat_id"):
        text = f"{title}\n{message}"
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
