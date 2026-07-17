"""Automatic in-game messages via RCON (say / showMessage)."""

from __future__ import annotations

import json
import logging
import re
import threading
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable, Optional

logger = logging.getLogger("vikinger-panel")

AUTO_MESSAGES_FILE: Path = Path()
PLAYERS_SEEN_FILE: Path = Path()

MIN_INTERVAL_SECONDS = 30
CHANNELS = frozenset({"say", "showMessage"})
TRIGGERS = frozenset({"interval", "once", "daily", "on_first_join", "on_join"})

AVAILABLE_TAGS = [
    {"tag": "%server_name%", "group": "server"},
    {"tag": "%world_name%", "group": "server"},
    {"tag": "%server_port%", "group": "server"},
    {"tag": "%max_players%", "group": "server"},
    {"tag": "%server_public%", "group": "server"},
    {"tag": "%players_online%", "group": "players"},
    {"tag": "%players_list%", "group": "players"},
    {"tag": "%player_name%", "group": "players"},
    {"tag": "%player_steam_id%", "group": "players"},
    {"tag": "%mods_count%", "group": "panel"},
    {"tag": "%mods_enabled%", "group": "panel"},
    {"tag": "%time%", "group": "time"},
    {"tag": "%date%", "group": "time"},
    {"tag": "%datetime%", "group": "time"},
]

_TAG_RE = re.compile(r"%([a-zA-Z0-9_]+)%")
_DAILY_TIME_RE = re.compile(r"^([01]?\d|2[0-3]):([0-5]\d)$")

DEFAULT_STORE: dict = {
    "enabled": True,
    "messages": [],
}

_lock = threading.RLock()
_worker_stop: Optional[threading.Event] = None
_worker_thread: Optional[threading.Thread] = None
_prev_online_ids: set[str] = set()
_online_initialized = False

_get_context: Optional[Callable[[], dict]] = None
_get_players: Optional[Callable[[], dict]] = None
_send_rcon: Optional[Callable[[str], str]] = None
_rcon_available: Optional[Callable[[], bool]] = None
_container_running: Optional[Callable[[], bool]] = None


def configure(
    *,
    messages_file: Path,
    players_seen_file: Path,
    get_context: Callable[[], dict],
    get_players: Callable[[], dict],
    send_rcon: Callable[[str], str],
    rcon_available: Callable[[], bool],
    container_running: Callable[[], bool],
) -> None:
    global AUTO_MESSAGES_FILE, PLAYERS_SEEN_FILE
    global _get_context, _get_players, _send_rcon, _rcon_available, _container_running
    AUTO_MESSAGES_FILE = messages_file
    PLAYERS_SEEN_FILE = players_seen_file
    _get_context = get_context
    _get_players = get_players
    _send_rcon = send_rcon
    _rcon_available = rcon_available
    _container_running = container_running


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _parse_iso(value: str | None) -> datetime | None:
    if not value or not isinstance(value, str):
        return None
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _to_iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


def _normalize_channel(raw: Any) -> str:
    channel = str(raw or "say").strip()
    return channel if channel in CHANNELS else "say"


def _normalize_trigger(raw: Any) -> str:
    trigger = str(raw or "interval").strip()
    return trigger if trigger in TRIGGERS else "interval"


def _normalize_interval(raw: Any) -> int:
    try:
        value = int(raw)
    except (TypeError, ValueError):
        value = 1800
    return max(MIN_INTERVAL_SECONDS, value)


def _normalize_daily_time(raw: Any) -> str:
    text = str(raw or "12:00").strip()
    m = _DAILY_TIME_RE.match(text)
    if not m:
        return "12:00"
    return f"{int(m.group(1)):02d}:{int(m.group(2)):02d}"


def normalize_message(raw: dict | None, *, create: bool = False) -> dict:
    raw = raw if isinstance(raw, dict) else {}
    msg_id = str(raw.get("id") or "").strip()
    if create or not msg_id:
        msg_id = str(uuid.uuid4())

    trigger = _normalize_trigger(raw.get("trigger"))
    text = str(raw.get("text") or "").strip()
    name = str(raw.get("name") or "").strip() or "Message"

    msg = {
        "id": msg_id,
        "name": name[:120],
        "text": text[:1000],
        "enabled": bool(raw.get("enabled", True)),
        "channel": _normalize_channel(raw.get("channel")),
        "trigger": trigger,
        "only_when_players_online": bool(raw.get("only_when_players_online", True)),
        "last_sent_at": raw.get("last_sent_at"),
        "next_run_at": raw.get("next_run_at"),
        "interval_seconds": None,
        "run_at": None,
        "daily_time": None,
        "completed": bool(raw.get("completed", False)),
    }

    if trigger == "interval":
        msg["interval_seconds"] = _normalize_interval(raw.get("interval_seconds"))
        if not msg["next_run_at"]:
            msg["next_run_at"] = _to_iso(_now_utc() + timedelta(seconds=msg["interval_seconds"]))
    elif trigger == "once":
        run_at = _parse_iso(raw.get("run_at"))
        if run_at is None:
            run_at = _now_utc() + timedelta(minutes=5)
        msg["run_at"] = _to_iso(run_at)
        msg["next_run_at"] = None if msg["completed"] else msg["run_at"]
    elif trigger == "daily":
        msg["daily_time"] = _normalize_daily_time(raw.get("daily_time"))
        if not msg["next_run_at"]:
            msg["next_run_at"] = _to_iso(_next_daily_run(msg["daily_time"], _now_utc()))
    else:
        # join triggers: no schedule fields
        msg["only_when_players_online"] = False
        msg["next_run_at"] = None

    return msg


def _next_daily_run(daily_time: str, now: datetime) -> datetime:
    hour, minute = map(int, daily_time.split(":"))
    local_now = now.astimezone()
    candidate = local_now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if candidate <= local_now:
        candidate = candidate + timedelta(days=1)
    return candidate.astimezone(timezone.utc)


def read_store() -> dict:
    data = {"enabled": True, "messages": []}
    if not AUTO_MESSAGES_FILE.exists():
        return data
    try:
        raw = json.loads(AUTO_MESSAGES_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return data
    if not isinstance(raw, dict):
        return data
    data["enabled"] = bool(raw.get("enabled", True))
    messages = raw.get("messages")
    if isinstance(messages, list):
        data["messages"] = [normalize_message(m) for m in messages if isinstance(m, dict)]
    return data


def write_store(store: dict) -> dict:
    enabled = bool(store.get("enabled", True))
    messages = [
        normalize_message(m)
        for m in (store.get("messages") or [])
        if isinstance(m, dict)
    ]
    payload = {
        "enabled": enabled,
        "messages": messages,
        "updated_at": _to_iso(_now_utc()),
    }
    AUTO_MESSAGES_FILE.parent.mkdir(parents=True, exist_ok=True)
    with _lock:
        AUTO_MESSAGES_FILE.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return {"enabled": enabled, "messages": messages}


def list_messages() -> dict:
    store = read_store()
    return {
        "enabled": store["enabled"],
        "messages": store["messages"],
        "tags": AVAILABLE_TAGS,
    }


def update_settings(*, enabled: bool) -> dict:
    store = read_store()
    store["enabled"] = bool(enabled)
    return write_store(store)


def create_message(payload: dict) -> dict:
    store = read_store()
    msg = normalize_message(payload, create=True)
    if not msg["text"]:
        raise ValueError("text is required")
    store["messages"].append(msg)
    write_store(store)
    return msg


def update_message(msg_id: str, payload: dict) -> dict:
    store = read_store()
    for i, existing in enumerate(store["messages"]):
        if existing["id"] != msg_id:
            continue
        merged = {**existing, **payload, "id": msg_id}
        # Preserve schedule progress unless trigger/interval/time changed
        if payload.get("trigger") and payload["trigger"] != existing["trigger"]:
            merged.pop("last_sent_at", None)
            merged.pop("next_run_at", None)
            merged["completed"] = False
        msg = normalize_message(merged)
        if not msg["text"]:
            raise ValueError("text is required")
        store["messages"][i] = msg
        write_store(store)
        return msg
    raise KeyError(msg_id)


def delete_message(msg_id: str) -> None:
    store = read_store()
    before = len(store["messages"])
    store["messages"] = [m for m in store["messages"] if m["id"] != msg_id]
    if len(store["messages"]) == before:
        raise KeyError(msg_id)
    write_store(store)


def get_message(msg_id: str) -> dict | None:
    for msg in read_store()["messages"]:
        if msg["id"] == msg_id:
            return msg
    return None


def read_players_seen() -> dict[str, dict]:
    if not PLAYERS_SEEN_FILE.exists():
        return {}
    try:
        raw = json.loads(PLAYERS_SEEN_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    if not isinstance(raw, dict):
        return {}
    out: dict[str, dict] = {}
    for sid, entry in raw.items():
        if not isinstance(sid, str) or not sid.isdigit():
            continue
        if not isinstance(entry, dict):
            continue
        out[sid] = {
            "name": str(entry.get("name") or sid),
            "first_seen_at": entry.get("first_seen_at"),
            "last_seen_at": entry.get("last_seen_at"),
        }
    return out


def write_players_seen(registry: dict[str, dict]) -> dict[str, dict]:
    PLAYERS_SEEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    with _lock:
        PLAYERS_SEEN_FILE.write_text(
            json.dumps(registry, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return registry


def is_placeholder_player_name(steam_id: str, name: str | None) -> bool:
    """True when ``name`` is missing or still just the Steam ID."""
    sid = str(steam_id or "").strip()
    live = str(name or "").strip()
    return not live or not sid or live == sid


def resolve_player_name(
    steam_id: str,
    live_name: str | None = None,
    registry: dict[str, dict] | None = None,
) -> str:
    """Prefer live character name, then players-seen cache, then Steam ID."""
    sid = str(steam_id or "").strip()
    if not sid:
        return str(live_name or "?").strip() or "?"
    if not is_placeholder_player_name(sid, live_name):
        return str(live_name).strip()
    reg = registry if registry is not None else read_players_seen()
    cached = str((reg.get(sid) or {}).get("name") or "").strip()
    if cached and not is_placeholder_player_name(sid, cached):
        return cached
    return sid


def mark_player_seen(steam_id: str, name: str, *, now: datetime | None = None) -> bool:
    """Record player sighting. Returns True if this is the first time."""
    now = now or _now_utc()
    iso = _to_iso(now)
    with _lock:
        registry = read_players_seen()
        is_first = steam_id not in registry
        if is_first:
            registry[steam_id] = {
                "name": name or steam_id,
                "first_seen_at": iso,
                "last_seen_at": iso,
            }
        else:
            entry = registry[steam_id]
            entry["last_seen_at"] = iso
            if name and name != steam_id:
                entry["name"] = name
        write_players_seen(registry)
    return is_first


def detect_joins(
    prev_online: set[str],
    current_players: list[dict],
    seen_registry: dict[str, dict] | None = None,
) -> list[dict]:
    """Return join events for steam IDs newly present vs prev_online."""
    seen_registry = seen_registry if seen_registry is not None else read_players_seen()
    current_ids = {str(p.get("steam_id") or "") for p in current_players if p.get("steam_id")}
    joined_ids = current_ids - prev_online
    by_id = {str(p.get("steam_id")): p for p in current_players if p.get("steam_id")}
    events = []
    for sid in sorted(joined_ids):
        player = by_id.get(sid) or {"steam_id": sid, "name": sid}
        name = str(player.get("name") or sid)
        is_first = sid not in seen_registry
        events.append({
            "steam_id": sid,
            "name": name,
            "is_first": is_first,
        })
    return events


def build_tag_context(
    *,
    base: dict | None = None,
    players: dict | None = None,
    player: dict | None = None,
    now: datetime | None = None,
) -> dict[str, str]:
    now = now or _now_utc()
    local = now.astimezone()
    base = base or {}
    players = players or {}
    player_list = players.get("players") or []
    names = [str(p.get("name") or p.get("steam_id") or "") for p in player_list]
    names = [n for n in names if n]

    ctx = {
        "server_name": str(base.get("server_name") or "Valheim"),
        "world_name": str(base.get("world_name") or ""),
        "server_port": str(base.get("server_port") or "2456"),
        "max_players": str(base.get("max_players") or "10"),
        "server_public": str(base.get("server_public") or "true"),
        "players_online": str(players.get("count", len(player_list))),
        "players_list": ", ".join(names) if names else "",
        "player_name": "",
        "player_steam_id": "",
        "mods_count": str(base.get("mods_count") or "0"),
        "mods_enabled": str(base.get("mods_enabled") or "0"),
        "time": local.strftime("%H:%M"),
        "date": local.strftime("%Y-%m-%d"),
        "datetime": local.strftime("%Y-%m-%d %H:%M"),
    }
    if player:
        ctx["player_name"] = str(player.get("name") or "")
        ctx["player_steam_id"] = str(player.get("steam_id") or "")
    return ctx


def render_template(text: str, ctx: dict[str, str] | None = None) -> str:
    ctx = ctx or {}

    def repl(match: re.Match) -> str:
        key = match.group(1)
        if key in ctx:
            return str(ctx[key])
        return match.group(0)

    return _TAG_RE.sub(repl, text or "")


def is_due(msg: dict, now: datetime) -> bool:
    if not msg.get("enabled"):
        return False
    trigger = msg.get("trigger")
    if trigger in ("on_join", "on_first_join"):
        return False
    if trigger == "once":
        if msg.get("completed"):
            return False
        run_at = _parse_iso(msg.get("run_at"))
        return run_at is not None and run_at <= now
    next_run = _parse_iso(msg.get("next_run_at"))
    if next_run is None:
        return True
    return next_run <= now


def due_scheduled_messages(store: dict | None = None, now: datetime | None = None) -> list[dict]:
    store = store or read_store()
    now = now or _now_utc()
    if not store.get("enabled"):
        return []
    return [
        m for m in store.get("messages") or []
        if m.get("trigger") in ("interval", "once", "daily") and is_due(m, now)
    ]


def mark_sent(msg_id: str, *, now: datetime | None = None) -> dict | None:
    now = now or _now_utc()
    store = read_store()
    for i, msg in enumerate(store["messages"]):
        if msg["id"] != msg_id:
            continue
        msg = dict(msg)
        msg["last_sent_at"] = _to_iso(now)
        trigger = msg.get("trigger")
        if trigger == "interval":
            seconds = _normalize_interval(msg.get("interval_seconds"))
            msg["interval_seconds"] = seconds
            msg["next_run_at"] = _to_iso(now + timedelta(seconds=seconds))
        elif trigger == "once":
            msg["completed"] = True
            msg["next_run_at"] = None
        elif trigger == "daily":
            daily = _normalize_daily_time(msg.get("daily_time"))
            msg["daily_time"] = daily
            msg["next_run_at"] = _to_iso(_next_daily_run(daily, now + timedelta(seconds=1)))
        store["messages"][i] = msg
        write_store(store)
        return msg
    return None


def build_rcon_command(channel: str, text: str) -> str:
    channel = _normalize_channel(channel)
    text = (text or "").replace("\n", " ").strip()
    return f"{channel} {text}".strip()


def send_message_now(
    msg: dict,
    *,
    player: dict | None = None,
    mark: bool = True,
) -> dict:
    if not _send_rcon:
        raise RuntimeError("auto_messages not configured")
    if _container_running and not _container_running():
        raise RuntimeError("Valheim container is not running")
    if _rcon_available and not _rcon_available():
        raise RuntimeError("RCON is not available")

    players = _get_players() if _get_players else {"count": 0, "players": []}
    base = _get_context() if _get_context else {}
    ctx = build_tag_context(base=base, players=players, player=player)
    rendered = render_template(msg.get("text") or "", ctx)
    if not rendered.strip():
        raise ValueError("rendered message is empty")

    command = build_rcon_command(msg.get("channel") or "say", rendered)
    output = _send_rcon(command)
    updated = None
    if mark and msg.get("id"):
        updated = mark_sent(msg["id"])
    return {
        "ok": True,
        "command": command,
        "rendered": rendered,
        "output": output,
        "message": updated or msg,
    }


def _should_skip_for_players(msg: dict, players: dict) -> bool:
    if msg.get("trigger") in ("on_join", "on_first_join"):
        return False
    if not msg.get("only_when_players_online", True):
        return False
    return not players.get("online") and int(players.get("count") or 0) <= 0


def tick() -> dict:
    """One worker iteration. Safe to call from tests."""
    global _prev_online_ids, _online_initialized

    result = {"scheduled": 0, "joins": 0, "errors": 0}
    if not _get_players or not _send_rcon:
        return result

    store = read_store()
    if not store.get("enabled"):
        return result

    if _container_running and not _container_running():
        return result
    if _rcon_available and not _rcon_available():
        return result

    try:
        players = _get_players() or {"count": 0, "players": [], "online": False}
    except Exception as e:
        logger.warning("auto_messages: failed to get players: %s", e)
        result["errors"] += 1
        return result

    current_ids = {
        str(p.get("steam_id"))
        for p in (players.get("players") or [])
        if p.get("steam_id")
    }

    # Scheduled messages
    now = _now_utc()
    for msg in due_scheduled_messages(store, now):
        if _should_skip_for_players(msg, players):
            continue
        try:
            send_message_now(msg, mark=True)
            result["scheduled"] += 1
        except Exception as e:
            logger.warning("auto_messages: failed to send %s: %s", msg.get("id"), e)
            result["errors"] += 1

    # Join detection (skip first snapshot to avoid blasting all current players on startup)
    if not _online_initialized:
        _prev_online_ids = set(current_ids)
        _online_initialized = True
        # Still seed registry for currently online players without firing messages
        for p in players.get("players") or []:
            sid = str(p.get("steam_id") or "")
            if sid:
                mark_player_seen(sid, str(p.get("name") or sid))
        return result

    join_events = detect_joins(_prev_online_ids, players.get("players") or [])
    _prev_online_ids = set(current_ids)

    join_msgs = [
        m for m in store.get("messages") or []
        if m.get("enabled") and m.get("trigger") in ("on_join", "on_first_join")
    ]

    for event in join_events:
        is_first = mark_player_seen(event["steam_id"], event["name"])
        event["is_first"] = is_first
        for msg in join_msgs:
            if msg["trigger"] == "on_first_join" and not is_first:
                continue
            if msg["trigger"] == "on_join" or (msg["trigger"] == "on_first_join" and is_first):
                try:
                    send_message_now(msg, player=event, mark=True)
                    result["joins"] += 1
                except Exception as e:
                    logger.warning(
                        "auto_messages: join message %s failed: %s",
                        msg.get("id"),
                        e,
                    )
                    result["errors"] += 1

    return result


def _worker_loop(stop_event: threading.Event, interval: float = 5.0) -> None:
    logger.info("auto_messages worker started")
    while not stop_event.wait(interval):
        try:
            tick()
        except Exception:
            logger.exception("auto_messages worker tick failed")
    logger.info("auto_messages worker stopped")


def start_worker(*, interval: float = 5.0) -> bool:
    """Start background ticker. Returns False if already running or disabled."""
    global _worker_stop, _worker_thread
    import os

    if os.environ.get("VIKINGER_DISABLE_AUTO_MESSAGES_WORKER", "").strip() in ("1", "true", "yes"):
        logger.info("auto_messages worker disabled by env")
        return False
    if _worker_thread and _worker_thread.is_alive():
        return False
    stop = threading.Event()
    thread = threading.Thread(
        target=_worker_loop,
        args=(stop, interval),
        name="auto-messages-worker",
        daemon=True,
    )
    _worker_stop = stop
    _worker_thread = thread
    thread.start()
    return True


def stop_worker() -> None:
    global _worker_stop, _worker_thread, _online_initialized, _prev_online_ids
    if _worker_stop:
        _worker_stop.set()
    if _worker_thread and _worker_thread.is_alive():
        _worker_thread.join(timeout=2)
    _worker_stop = None
    _worker_thread = None
    _online_initialized = False
    _prev_online_ids = set()


def reset_runtime_state() -> None:
    """Test helper: clear join snapshot state."""
    global _online_initialized, _prev_online_ids
    _online_initialized = False
    _prev_online_ids = set()
