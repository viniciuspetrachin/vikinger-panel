"""Testes de verificação e comparação de versão do painel."""

import json
import time
from unittest.mock import patch

import httpx
import pytest

import panel_update
from panel_update import (
    _CACHE_TTL_SEC,
    check_panel_update,
    compare_semver,
    detect_deploy_mode,
    fetch_latest_release,
    parse_semver,
)


@pytest.fixture(autouse=True)
def reset_release_cache():
    panel_update._cache = None
    panel_update._cache_at = 0.0
    yield
    panel_update._cache = None
    panel_update._cache_at = 0.0


def test_parse_semver():
    assert parse_semver("2.1.3") == (2, 1, 3)
    assert parse_semver("v2.1.3") == (2, 1, 3)
    assert parse_semver("bad") is None


def test_compare_semver():
    assert compare_semver("2.1.4", "2.1.3") == 1
    assert compare_semver("2.1.3", "2.1.3") == 0
    assert compare_semver("2.1.2", "2.1.3") == -1


def test_detect_deploy_mode_dev(tmp_path):
    compose = tmp_path / "docker-compose.yml"
    compose.write_text("services:\n  panel:\n    build: .\n", encoding="utf-8")
    assert detect_deploy_mode(compose)["mode"] == "dev"


def test_detect_deploy_mode_ghcr(tmp_path):
    compose = tmp_path / "docker-compose.yml"
    compose.write_text(
        "services:\n  panel:\n    image: ghcr.io/owner/vikinger-panel:2.1.3\n",
        encoding="utf-8",
    )
    info = detect_deploy_mode(compose)
    assert info["mode"] == "ghcr"
    assert info["tag"] == "2.1.3"


@patch("panel_update.fetch_latest_release")
def test_check_panel_update_available(mock_fetch, tmp_path):
    compose = tmp_path / "docker-compose.yml"
    compose.write_text(
        "services:\n  panel:\n    image: ghcr.io/owner/vikinger-panel:2.1.3\n",
        encoding="utf-8",
    )
    mock_fetch.return_value = {
        "latest": "2.1.4",
        "release_url": "https://example.com/release",
        "published_at": "2026-01-01T00:00:00Z",
        "release_notes": "notes",
    }
    result = check_panel_update(compose)
    assert result["update_available"] is True
    assert result["can_update"] is True
    assert result["latest"] == "2.1.4"


@patch("panel_update.fetch_latest_release")
def test_check_panel_update_dev_install(mock_fetch, tmp_path):
    compose = tmp_path / "docker-compose.yml"
    compose.write_text("services:\n  panel:\n    build: .\n", encoding="utf-8")
    mock_fetch.return_value = {
        "latest": "9.9.9",
        "release_url": "https://example.com/release",
        "published_at": "",
        "release_notes": "",
    }
    result = check_panel_update(compose)
    assert result["update_available"] is True
    assert result["can_update"] is False
    assert result["deploy_mode"] == "dev"
    assert "reload-panel" in result["message"] or "Development" in result["message"]


def test_fetch_latest_release_uses_disk_cache(tmp_path, monkeypatch):
    monkeypatch.setenv("VALHEIM_PANEL_ROOT", str(tmp_path))
    cache_file = tmp_path / "panel-data" / "github-release-cache.json"
    cache_file.parent.mkdir(parents=True)
    stale = {
        "fetched_at": time.time() - 100,
        "data": {
            "latest": "2.1.5",
            "release_url": "https://example.com/release",
            "published_at": "",
            "release_notes": "",
        },
    }
    cache_file.write_text(json.dumps(stale), encoding="utf-8")

    with patch("panel_update._fetch_from_github") as mock_fetch:
        result = fetch_latest_release()

    mock_fetch.assert_not_called()
    assert result["latest"] == "2.1.5"


def test_fetch_latest_release_force_bypasses_cache(tmp_path, monkeypatch):
    monkeypatch.setenv("VALHEIM_PANEL_ROOT", str(tmp_path))
    cache_file = tmp_path / "panel-data" / "github-release-cache.json"
    cache_file.parent.mkdir(parents=True)
    cache_file.write_text(
        json.dumps(
            {
                "fetched_at": time.time(),
                "data": {"latest": "2.1.5", "release_url": "", "published_at": "", "release_notes": ""},
            }
        ),
        encoding="utf-8",
    )

    with patch("panel_update._fetch_from_github", return_value={"latest": "2.1.6", "release_url": "", "published_at": "", "release_notes": ""}):
        result = fetch_latest_release(force=True)

    assert result["latest"] == "2.1.6"


def test_fetch_latest_release_rate_limit_returns_stale(tmp_path, monkeypatch):
    monkeypatch.setenv("VALHEIM_PANEL_ROOT", str(tmp_path))
    cache_file = tmp_path / "panel-data" / "github-release-cache.json"
    cache_file.parent.mkdir(parents=True)
    cache_file.write_text(
        json.dumps(
            {
                "fetched_at": time.time() - _CACHE_TTL_SEC - 10,
                "data": {
                    "latest": "2.1.4",
                    "release_url": "https://example.com/old",
                    "published_at": "",
                    "release_notes": "",
                },
            }
        ),
        encoding="utf-8",
    )

    request = httpx.Request("GET", "https://api.github.com/repos/x/y/releases/latest")
    response = httpx.Response(403, request=request, json={"message": "rate limit exceeded"})

    with patch("panel_update._fetch_from_github", side_effect=httpx.HTTPStatusError("403", request=request, response=response)):
        result = fetch_latest_release(force=True)

    assert result["latest"] == "2.1.4"
