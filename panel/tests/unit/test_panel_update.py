"""Testes de verificação e comparação de versão do painel."""

from unittest.mock import patch

from panel_update import check_panel_update, compare_semver, detect_deploy_mode, parse_semver


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
