"""Outbound notifications: Discord webhooks + Telegram bot.

Config shape (persisted by main.py in db ``settings`` under e.g. ``"alerts"``)::

    {
        "discord": {"enabled": bool, "webhook_url": str},
        "telegram": {"enabled": bool, "bot_token": str, "chat_id": str},
        "events": {
            "server_down": bool,
            "server_up": bool,
            "player_join": bool,
            "player_leave": bool,
            "backup_ok": bool,
            "backup_fail": bool,
        }
    }

The pure formatters (:func:`format_event`) build a ``{title, message}`` for each
event type and are fully unit-testable. Network senders take an injected
``http`` client (defaulting to ``httpx``) and never raise on failure — they
return ``bool`` success.
"""

from __future__ import annotations

from typing import Any, Optional

EVENT_TYPES = (
    "server_down",
    "server_up",
    "player_join",
    "player_leave",
    "backup_ok",
    "backup_fail",
)


def format_event(event_type: str, ctx: Optional[dict] = None) -> dict:
    """Return ``{title, message}`` for ``event_type`` using ``ctx`` values.

    Unknown event types get a generic title/message. ``ctx`` keys used:
    ``player`` (name), ``world``, ``error``, ``path``/``file``.
    """
    ctx = ctx or {}
    player = ctx.get("player") or ctx.get("name") or "Someone"
    world = ctx.get("world") or ""
    error = ctx.get("error") or ""
    backup_name = ctx.get("file") or ctx.get("path") or ""

    if event_type == "server_down":
        return {
            "title": "🔴 Server offline",
            "message": "The Valheim server is DOWN"
            + (f" ({world})" if world else "") + ".",
        }
    if event_type == "server_up":
        return {
            "title": "🟢 Server online",
            "message": "The Valheim server is UP"
            + (f" ({world})" if world else "") + " and accepting connections.",
        }
    if event_type == "player_join":
        return {
            "title": "➕ Player joined",
            "message": f"{player} joined the server.",
        }
    if event_type == "player_leave":
        return {
            "title": "➖ Player left",
            "message": f"{player} left the server.",
        }
    if event_type == "backup_ok":
        return {
            "title": "💾 Backup complete",
            "message": "World backup completed successfully"
            + (f": {backup_name}" if backup_name else "") + ".",
        }
    if event_type == "backup_fail":
        return {
            "title": "⚠️ Backup failed",
            "message": "World backup FAILED"
            + (f": {error}" if error else "") + ".",
        }
    return {
        "title": f"Event: {event_type}",
        "message": str(ctx) if ctx else event_type,
    }


def _get_http(http: Any):
    if http is not None:
        return http
    try:
        import httpx

        return httpx
    except Exception:
        return None


def send_discord(webhook_url: str, title: str, message: str, http: Any = None) -> bool:
    """POST an embed to a Discord webhook. Returns success; never raises."""
    if not webhook_url:
        return False
    client = _get_http(http)
    if client is None:
        return False
    payload = {"content": None, "embeds": [{"title": title, "description": message}]}
    try:
        resp = client.post(webhook_url, json=payload, timeout=10)
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
    # Default to enabled when a specific toggle is absent.
    return bool(events.get(event_type, True))


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

    discord = config.get("discord") or {}
    if discord.get("enabled") and discord.get("webhook_url"):
        result["discord"] = send_discord(
            discord["webhook_url"], title, message, http=http
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
        result["discord"] = send_discord(discord["webhook_url"], title, message, http=http)

    telegram = config.get("telegram") or {}
    if telegram.get("bot_token") and telegram.get("chat_id"):
        result["telegram"] = send_telegram(
            telegram["bot_token"], telegram["chat_id"], f"{title}\n{message}", http=http
        )
    return result
