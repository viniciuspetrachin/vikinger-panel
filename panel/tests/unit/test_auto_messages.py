"""Unit tests for automatic messages (tags, schedule, joins, API)."""

from datetime import datetime, timedelta, timezone
from pathlib import Path

import auto_messages
import main
import pytest


@pytest.fixture
def am_env(tmp_path, monkeypatch):
    messages_file = tmp_path / "auto-messages.json"
    seen_file = tmp_path / "players-seen.json"
    sent = []

    def send_rcon(cmd: str) -> str:
        sent.append(cmd)
        return f"ok: {cmd}"

    players_state = {"count": 0, "players": [], "online": False}

    auto_messages.configure(
        messages_file=messages_file,
        players_seen_file=seen_file,
        get_context=lambda: {
            "server_name": "Vikinger",
            "world_name": "Midgard",
            "server_port": "2456",
            "max_players": "10",
            "server_public": "true",
            "mods_count": "3",
            "mods_enabled": "2",
        },
        get_players=lambda: players_state,
        send_rcon=send_rcon,
        rcon_available=lambda: True,
        container_running=lambda: True,
    )
    auto_messages.reset_runtime_state()
    auto_messages.stop_worker()

    return {
        "messages_file": messages_file,
        "seen_file": seen_file,
        "sent": sent,
        "players": players_state,
    }


def test_render_template_known_and_unknown_tags():
    ctx = {"server_name": "Vikinger", "players_online": "2"}
    out = auto_messages.render_template(
        "Hello %server_name% (%players_online%) %unknown%",
        ctx,
    )
    assert out == "Hello Vikinger (2) %unknown%"


def test_normalize_interval_minimum():
    msg = auto_messages.normalize_message({
        "text": "hi",
        "trigger": "interval",
        "interval_seconds": 5,
    }, create=True)
    assert msg["interval_seconds"] == 30


def test_create_list_update_delete(am_env):
    msg = auto_messages.create_message({
        "name": "Ann",
        "text": "Hello %server_name%",
        "trigger": "interval",
        "interval_seconds": 60,
    })
    assert msg["id"]
    listed = auto_messages.list_messages()
    assert listed["enabled"] is True
    assert len(listed["messages"]) == 1
    assert listed["tags"]

    updated = auto_messages.update_message(msg["id"], {"enabled": False, "text": "Bye"})
    assert updated["enabled"] is False
    assert updated["text"] == "Bye"

    auto_messages.delete_message(msg["id"])
    assert auto_messages.list_messages()["messages"] == []


def test_due_interval_and_mark_sent(am_env):
    now = datetime(2026, 7, 14, 12, 0, tzinfo=timezone.utc)
    msg = auto_messages.create_message({
        "text": "tick",
        "trigger": "interval",
        "interval_seconds": 60,
        "next_run_at": (now - timedelta(seconds=1)).isoformat(),
        "only_when_players_online": False,
    })
    due = auto_messages.due_scheduled_messages(now=now)
    assert len(due) == 1
    marked = auto_messages.mark_sent(msg["id"], now=now)
    assert marked["last_sent_at"]
    next_run = datetime.fromisoformat(marked["next_run_at"])
    assert next_run == now + timedelta(seconds=60)


def test_once_completed(am_env):
    now = datetime(2026, 7, 14, 12, 0, tzinfo=timezone.utc)
    msg = auto_messages.create_message({
        "text": "once",
        "trigger": "once",
        "run_at": (now - timedelta(minutes=1)).isoformat(),
        "only_when_players_online": False,
    })
    assert auto_messages.is_due(msg, now)
    marked = auto_messages.mark_sent(msg["id"], now=now)
    assert marked["completed"] is True
    assert auto_messages.is_due(marked, now) is False


def test_detect_joins_and_first(am_env):
    registry = {"111": {"name": "Old", "first_seen_at": "x", "last_seen_at": "x"}}
    events = auto_messages.detect_joins(
        prev_online={"111"},
        current_players=[
            {"steam_id": "111", "name": "Old"},
            {"steam_id": "222", "name": "New"},
        ],
        seen_registry=registry,
    )
    assert len(events) == 1
    assert events[0]["steam_id"] == "222"
    assert events[0]["is_first"] is True


def test_tick_sends_scheduled_and_join(am_env):
    now = datetime.now(timezone.utc)
    auto_messages.create_message({
        "text": "Periodic %server_name%",
        "trigger": "interval",
        "interval_seconds": 60,
        "next_run_at": (now - timedelta(seconds=5)).isoformat(),
        "only_when_players_online": False,
    })
    auto_messages.create_message({
        "text": "Welcome %player_name%",
        "trigger": "on_first_join",
        "channel": "showMessage",
    })

    # First tick seeds online set without firing joins
    am_env["players"].update({"count": 0, "players": [], "online": False})
    r1 = auto_messages.tick()
    assert r1["scheduled"] == 1
    assert any(c.startswith("say Periodic Vikinger") for c in am_env["sent"])

    am_env["sent"].clear()
    am_env["players"].update({
        "count": 1,
        "online": True,
        "players": [{"steam_id": "76561198000000001", "name": "Freya"}],
    })
    r2 = auto_messages.tick()
    assert r2["joins"] == 1
    assert any("showMessage Welcome Freya" in c for c in am_env["sent"])

    # Second join of same player should not fire on_first_join
    am_env["sent"].clear()
    am_env["players"].update({"count": 0, "players": [], "online": False})
    auto_messages.tick()
    am_env["players"].update({
        "count": 1,
        "online": True,
        "players": [{"steam_id": "76561198000000001", "name": "Freya"}],
    })
    r3 = auto_messages.tick()
    assert r3["joins"] == 0
    assert am_env["sent"] == []


def test_only_when_players_online_skips(am_env):
    now = datetime.now(timezone.utc)
    auto_messages.create_message({
        "text": "Need players",
        "trigger": "interval",
        "interval_seconds": 60,
        "next_run_at": (now - timedelta(seconds=5)).isoformat(),
        "only_when_players_online": True,
    })
    am_env["players"].update({"count": 0, "players": [], "online": False})
    auto_messages.tick()  # init
    am_env["sent"].clear()
    r = auto_messages.tick()
    assert r["scheduled"] == 0
    assert am_env["sent"] == []


def test_api_crud_and_preview(client, rcon_ready, monkeypatch):
    monkeypatch.setenv("VIKINGER_DISABLE_AUTO_MESSAGES_WORKER", "1")
    main.configure_auto_messages()

    r = client.get("/api/auto-messages")
    assert r.status_code == 200
    assert "tags" in r.json()
    assert r.json()["messages"] == []

    created = client.post("/api/auto-messages", json={
        "name": "Welcome",
        "text": "Hi %server_name%",
        "trigger": "interval",
        "interval_seconds": 120,
        "only_when_players_online": False,
    })
    assert created.status_code == 200
    msg_id = created.json()["message"]["id"]

    preview = client.post("/api/auto-messages/preview", json={"text": "Hi %server_name%"})
    assert preview.status_code == 200
    assert "Test" in preview.json()["rendered"] or "Hi " in preview.json()["rendered"]

    updated = client.put(f"/api/auto-messages/{msg_id}", json={"enabled": False})
    assert updated.status_code == 200
    assert updated.json()["message"]["enabled"] is False

    settings = client.put("/api/auto-messages/settings", json={"enabled": False})
    assert settings.status_code == 200
    assert settings.json()["enabled"] is False

    send = client.post(f"/api/auto-messages/{msg_id}/send")
    assert send.status_code == 200
    assert send.json()["ok"] is True
    assert "say" in send.json()["command"]

    deleted = client.delete(f"/api/auto-messages/{msg_id}")
    assert deleted.status_code == 200
    assert client.get("/api/auto-messages").json()["messages"] == []


def test_api_not_found(client):
    main.configure_auto_messages()
    assert client.put("/api/auto-messages/missing", json={"text": "x"}).status_code == 404
    assert client.delete("/api/auto-messages/missing").status_code == 404
    assert client.post("/api/auto-messages/missing/send").status_code == 404


def test_api_create_requires_text(client):
    main.configure_auto_messages()
    r = client.post("/api/auto-messages", json={"name": "Empty", "text": "  "})
    assert r.status_code == 400
