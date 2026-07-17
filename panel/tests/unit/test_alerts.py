"""Testes do módulo alerts (formatters + envio com http injetado)."""

import pytest

import alerts

pytestmark = pytest.mark.unit


class FakeResponse:
    def __init__(self, status_code):
        self.status_code = status_code


class FakeHttp:
    def __init__(self, status_code=204, raise_exc=None):
        self.status_code = status_code
        self.raise_exc = raise_exc
        self.calls = []

    def post(self, url, json=None, timeout=None):
        self.calls.append({"url": url, "json": json, "timeout": timeout})
        if self.raise_exc:
            raise self.raise_exc
        return FakeResponse(self.status_code)


# --- format_event -----------------------------------------------------------

@pytest.mark.parametrize("event", alerts.EVENT_TYPES)
def test_format_event_has_title_and_message(event):
    out = alerts.format_event(event, {})
    assert "title" in out and "message" in out
    assert out["title"] and out["message"]
    assert "color" in out


def test_format_event_player_join():
    out = alerts.format_event("player_join", {"player": "Ragnar"})
    assert "Ragnar" in out["message"]


def test_format_event_player_leave():
    out = alerts.format_event("player_leave", {"player": "Bjorn"})
    assert "Bjorn" in out["message"]


def test_format_event_mod_added():
    out = alerts.format_event("mod_added", {"mod": "CoolMod", "version": "1.2.3"})
    assert "CoolMod" in out["message"]
    assert "1.2.3" in out["message"]


def test_format_event_mod_updated_removed():
    updated = alerts.format_event("mod_updated", {"mod": "CoolMod", "version": "2.0.0"})
    assert "CoolMod" in updated["message"]
    assert "2.0.0" in updated["message"]
    removed = alerts.format_event("mod_removed", {"mod": "OldMod"})
    assert "OldMod" in removed["message"]


def test_format_event_player_chat():
    out = alerts.format_event("player_chat", {"player": "Exforgant", "text": "Ola discord"})
    assert out.get("chat") is True
    assert out["username"] == "Exforgant"
    assert out["content"] == "Ola discord"
    assert "Exforgant" in out["message"]


def test_extract_prefixed_chat_default_and_custom():
    logs = (
        "Got character ZDOID from Exforgant : 1:1\n"
        "Exforgant: @discord Ola discord\n"
        "Other: hello\n"
        "[Chat] Bjorn: !dc hi there\n"
    )
    hits = alerts.extract_prefixed_chat(logs, prefix="@discord")
    assert len(hits) == 1
    assert hits[0]["player"] == "Exforgant"
    assert hits[0]["text"] == "Ola discord"

    custom = alerts.extract_prefixed_chat(logs, prefix="!dc")
    assert len(custom) == 1
    assert custom[0]["player"] == "Bjorn"
    assert custom[0]["text"] == "hi there"


def test_format_event_server_lifecycle():
    assert "start" in alerts.format_event("server_starting", {})["message"].lower()
    assert "shut" in alerts.format_event("server_stopping", {})["message"].lower()
    assert "restart" in alerts.format_event("server_restarting", {})["message"].lower()


def test_format_event_high_load():
    out = alerts.format_event("server_high_load", {"cpu_percent": 85, "memory_percent": 40})
    assert "85" in out["message"]


def test_format_event_backup_fail_error():
    out = alerts.format_event("backup_fail", {"error": "disk full"})
    assert "disk full" in out["message"]


def test_format_event_server_down_world():
    out = alerts.format_event("server_down", {"world": "Midgard"})
    assert "Midgard" in out["message"]


def test_format_event_unknown():
    out = alerts.format_event("mystery", {"a": 1})
    assert "mystery" in out["title"]


# --- send_discord -----------------------------------------------------------

def test_send_discord_success():
    http = FakeHttp(status_code=204)
    assert alerts.send_discord("https://hook", "T", "M", http=http) is True
    assert "wait=true" in http.calls[0]["url"]
    assert http.calls[0]["json"]["embeds"][0]["title"] == "T"
    assert http.calls[0]["json"]["username"] == "Vikinger Panel"


def test_send_discord_preserves_existing_query():
    http = FakeHttp(status_code=200)
    alerts.send_discord("https://hook?foo=1", "T", "M", http=http, color=0x123456)
    assert "foo=1" in http.calls[0]["url"]
    assert "wait=true" in http.calls[0]["url"]
    assert http.calls[0]["json"]["embeds"][0]["color"] == 0x123456


def test_send_discord_http_error_status():
    http = FakeHttp(status_code=500)
    assert alerts.send_discord("https://hook", "T", "M", http=http) is False


def test_send_discord_network_exception():
    http = FakeHttp(raise_exc=RuntimeError("connection refused"))
    assert alerts.send_discord("https://hook", "T", "M", http=http) is False


def test_send_discord_no_url():
    assert alerts.send_discord("", "T", "M", http=FakeHttp()) is False


# --- send_telegram ----------------------------------------------------------

def test_send_telegram_success():
    http = FakeHttp(status_code=200)
    assert alerts.send_telegram("tok", "123", "hi", http=http) is True
    assert "bottok/sendMessage" in http.calls[0]["url"]
    assert http.calls[0]["json"] == {"chat_id": "123", "text": "hi"}


def test_send_telegram_missing_creds():
    assert alerts.send_telegram("", "123", "hi", http=FakeHttp()) is False
    assert alerts.send_telegram("tok", "", "hi", http=FakeHttp()) is False


def test_send_telegram_network_exception():
    http = FakeHttp(raise_exc=OSError("boom"))
    assert alerts.send_telegram("tok", "123", "hi", http=http) is False


# --- dispatch ---------------------------------------------------------------

def test_dispatch_both_channels():
    config = {
        "discord": {"enabled": True, "webhook_url": "https://hook"},
        "telegram": {"enabled": True, "bot_token": "t", "chat_id": "c"},
        "events": {"server_down": True},
    }
    http = FakeHttp(status_code=200)
    result = alerts.dispatch(config, "server_down", {}, http=http)
    assert result["discord"] is True
    assert result["telegram"] is True
    assert len(http.calls) == 2


def test_dispatch_event_disabled():
    config = {
        "discord": {"enabled": True, "webhook_url": "https://hook"},
        "events": {"player_join": False},
    }
    http = FakeHttp()
    result = alerts.dispatch(config, "player_join", {"player": "X"}, http=http)
    assert result == {"discord": None, "telegram": None}
    assert http.calls == []


def test_dispatch_channel_disabled():
    config = {
        "discord": {"enabled": False, "webhook_url": "https://hook"},
        "telegram": {"enabled": True, "bot_token": "t", "chat_id": "c"},
        "events": {"server_up": True},
    }
    http = FakeHttp(status_code=200)
    result = alerts.dispatch(config, "server_up", {}, http=http)
    assert result["discord"] is None
    assert result["telegram"] is True


def test_dispatch_server_up_paired_with_server_down():
    config = {
        "discord": {"enabled": True, "webhook_url": "https://hook"},
        "events": {"server_down": True},
    }
    http = FakeHttp(status_code=204)
    result = alerts.dispatch(config, "server_up", {}, http=http)
    assert result["discord"] is True


def test_dispatch_server_up_paired_with_restarting():
    config = {
        "discord": {"enabled": True, "webhook_url": "https://hook"},
        "events": {"server_restarting": True},
    }
    http = FakeHttp(status_code=204)
    result = alerts.dispatch(config, "server_up", {}, http=http)
    assert result["discord"] is True


def test_dispatch_player_chat_as_webhook_username():
    config = {
        "discord": {"enabled": True, "webhook_url": "https://hook"},
        "events": {"player_chat": True},
    }
    http = FakeHttp(status_code=204)
    result = alerts.dispatch(
        config, "player_chat", {"player": "Exforgant", "text": "Ola discord"}, http=http
    )
    assert result["discord"] is True
    payload = http.calls[0]["json"]
    assert payload["username"] == "Exforgant"
    assert payload["content"] == "Ola discord"
    assert "embeds" not in payload


def test_dispatch_player_chat_via_chat_bridge_flag():
    config = {
        "discord": {"enabled": True, "webhook_url": "https://hook"},
        "events": {},
        "chat_bridge": {"enabled": True, "prefix": "@discord"},
    }
    http = FakeHttp(status_code=204)
    result = alerts.dispatch(
        config, "player_chat", {"player": "A", "text": "hi"}, http=http
    )
    assert result["discord"] is True


def test_dispatch_event_disabled_when_absent():
    config = {"discord": {"enabled": True, "webhook_url": "https://hook"}}
    http = FakeHttp(status_code=204)
    result = alerts.dispatch(config, "server_down", {}, http=http)
    assert result == {"discord": None, "telegram": None}


def test_test_channels():
    config = {
        "discord": {"webhook_url": "https://hook"},
        "telegram": {"bot_token": "t", "chat_id": "c"},
    }
    http = FakeHttp(status_code=200)
    result = alerts.test_channels(config, http=http)
    assert result["discord"] is True
    assert result["telegram"] is True


def test_test_channels_empty_config():
    result = alerts.test_channels({}, http=FakeHttp())
    assert result == {"discord": None, "telegram": None}
