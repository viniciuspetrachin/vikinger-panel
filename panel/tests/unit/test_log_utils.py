"""Testes unitários de sanitização de logs Docker."""

import pytest

from log_utils import (
    apply_log_filters,
    clean_docker_logs,
    filter_log_lines,
    is_game_event,
    is_log_noise,
    normalize_docker_log_line,
    parse_game_chat_line,
    strip_ansi,
)

pytestmark = pytest.mark.unit


def test_strip_ansi_removes_reset_inline():
    assert strip_ansi("Unloading Steam API...\x1b[0m") == "Unloading Steam API..."


def test_strip_ansi_removes_standalone_reset():
    assert strip_ansi("\x1b[0m") == ""


def test_strip_ansi_removes_caret_notation_inline():
    assert strip_ansi("Loading Steam API...^[[0m") == "Loading Steam API..."


def test_strip_ansi_removes_caret_notation_standalone():
    assert strip_ansi("^[[0m") == ""


def test_strip_ansi_removes_caret_notation_merged():
    assert strip_ansi("^[[0mWaiting for client config...^[[0m") == "Waiting for client config..."


def test_normalize_docker_log_line_reformats_supervisord_prefix():
    raw = "Jul  7 00:45:19 supervisord: valheim-updater  Success! App '896660' fully installed."
    result = normalize_docker_log_line(raw)
    assert result == "[Jul  7 00:45:19] Success! App '896660' fully installed."


def test_normalize_docker_log_line_strips_ansi_only_line():
    assert normalize_docker_log_line("Jul  7 00:45:17 supervisord: valheim-updater \x1b[0m") == ""


def test_normalize_docker_log_line_strips_caret_only_line():
    assert normalize_docker_log_line("Jul  7 12:30:09 supervisord: valheim-updater ^[[0m") == ""


def test_normalize_docker_log_line_strips_caret_inline():
    raw = "Jul  7 12:30:09 supervisord: valheim-updater  Loading Steam API...^[[0m"
    assert normalize_docker_log_line(raw) == "[Jul  7 12:30:09] Loading Steam API..."


def test_normalize_docker_log_line_strips_caret_merged():
    raw = "Jul  7 12:30:10 supervisord: valheim-updater ^[[0mWaiting for client config...^[[0m"
    assert normalize_docker_log_line(raw) == "[Jul  7 12:30:10] Waiting for client config..."


def test_normalize_docker_log_line_filters_tar_verbose():
    raw = "Jul  7 12:30:18 supervisord: valheim-updater  .d..t...... ./"
    assert normalize_docker_log_line(raw) == ""


def test_normalize_docker_log_line_preserves_plain_lines():
    line = "Got connection SteamID 76561198273697711"
    assert normalize_docker_log_line(line) == line


def test_clean_docker_logs_filters_empty_and_normalizes():
    raw = "\n".join([
        "Jul  7 00:45:17 supervisord: valheim-updater \x1b[0m",
        "Jul  7 00:45:19 supervisord: valheim-updater  Success! App '896660' fully installed.",
        "Got connection SteamID 76561198273697711",
        "",
    ])
    cleaned = clean_docker_logs(raw)
    assert "\x1b" not in cleaned
    assert "supervisord:" not in cleaned
    assert "[valheim-updater]" not in cleaned
    assert "Success! App '896660' fully installed." in cleaned
    assert "Got connection SteamID" in cleaned
    assert cleaned.count("\n") == 1


def test_clean_docker_logs_steamcmd_block():
    raw = "\n".join([
        "Jul  7 12:30:09 supervisord: valheim-updater  Loading Steam API...^[[0m",
        "Jul  7 12:30:09 supervisord: valheim-updater  OK",
        "Jul  7 12:30:09 supervisord: valheim-updater ^[[0m",
        "Jul  7 12:30:10 supervisord: valheim-updater ^[[0mWaiting for client config...^[[0m",
        "Jul  7 12:30:10 supervisord: valheim-updater  OK",
        "Jul  7 12:30:17 supervisord: valheim-updater ^[[0mSuccess! App '896660' fully installed.",
        "Jul  7 12:30:18 supervisord: valheim-updater  .d..t...... ./",
        "Jul  7 12:30:18 supervisord: valheim-updater  INFO - Valheim Server is already the latest version",
    ])
    cleaned = clean_docker_logs(raw)
    assert "^[[0m" not in cleaned
    assert ".d..t" not in cleaned
    assert "[valheim-updater]" not in cleaned
    assert "Loading Steam API..." in cleaned
    assert "Waiting for client config..." in cleaned
    assert "Success! App '896660' fully installed." in cleaned
    assert "INFO - Valheim Server is already the latest version" in cleaned
    assert cleaned.count(" OK") == 2 or cleaned.count("\nOK") >= 1


def test_parse_game_chat_line_valheim_native():
    line = "[Jul 21 23:58:33] 76561198273697711/Exforgant (2146, -539, 36): say ola"
    parsed = parse_game_chat_line(line)
    assert parsed is not None
    assert parsed["player"] == "Exforgant"
    assert parsed["message"] == "ola"
    assert parsed["channel"] == "say"


def test_parse_game_chat_line_show_message():
    line = "76561198273697711/Exforgant (2146, -539, 36): showMessage ola"
    parsed = parse_game_chat_line(line)
    assert parsed is not None
    assert parsed["player"] == "Exforgant"
    assert parsed["message"] == "ola"
    assert parsed["channel"] == "showmessage"


def test_is_log_noise_global_keys_block():
    assert is_log_noise("[Jul 21 23:58:34] Command completed: globalKeys")
    assert is_log_noise("Global Keys:")
    assert is_log_noise("playerdamage 85")
    assert is_log_noise("Connections 1 ZDOS:541341  sent:0 recv:544")


def test_is_game_event_chat_and_connection():
    chat = "[Jul 21 23:58:33] 76561198273697711/Exforgant (2146, -539, 36): say ola"
    assert is_game_event(chat)
    assert is_game_event("07/22/2026 00:03:03: New connection")
    assert not is_game_event("playerdamage 85")


def test_filter_log_lines_hide_noise_and_chat_category():
    lines = [
        "[Jul 21 23:58:34] Command completed: globalKeys",
        "Global Keys:",
        "playerdamage 85",
        "[Jul 21 23:58:33] 76561198273697711/Exforgant (2146, -539, 36): say ola",
        "07/22/2026 00:03:03: New connection",
    ]
    filtered = filter_log_lines(lines, hide_noise=True, category="chat")
    assert len(filtered) == 1
    assert "Exforgant" in filtered[0]
    assert "say ola" in filtered[0]


def test_apply_log_filters_counts():
    text = "\n".join([
        "Global Keys:",
        "76561198273697711/Exforgant (2146, -539, 36): say ola",
    ])
    out, total, count = apply_log_filters(text, hide_noise=True, category="all")
    assert total == 2
    assert count == 1
    assert "Exforgant" in out
    assert "Global Keys" not in out
