"""Testes unitários de sanitização de logs Docker."""

import pytest

from log_utils import clean_docker_logs, normalize_docker_log_line, strip_ansi

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
