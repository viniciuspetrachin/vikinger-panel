"""Testes do parser de CHANGELOG e version_info."""

from changelog import (
    has_unreleased_content,
    load_changelog_json,
    parse_changelog_markdown,
    promote_unreleased_to_version,
    version_section_markdown,
)
from version import version_info


SAMPLE = """# Changelog

## [2.1.0]

### Added

- First feature

### Changed

- Something changed

## [Unreleased]

### Added

- New thing

### Fixed

- Bug fix
"""


def test_parse_changelog_markdown():
    versions = parse_changelog_markdown(SAMPLE)
    assert len(versions) == 1
    assert versions[0]["version"] == "2.1.0"
    assert versions[0]["sections"]["Added"] == ["First feature"]
    assert versions[0]["sections"]["Changed"] == ["Something changed"]


def test_has_unreleased_content():
    assert has_unreleased_content(SAMPLE) is True
    empty = "## [Unreleased]\n\n### Added\n\n"
    assert has_unreleased_content(empty) is False


def test_promote_unreleased_to_version():
    promoted = promote_unreleased_to_version(SAMPLE, "2.1.1")
    assert "## [2.1.1]" in promoted
    assert "New thing" in promoted
    assert "Bug fix" in promoted
    assert "## [Unreleased]" in promoted
    assert has_unreleased_content(promote_unreleased_to_version(promoted, "2.1.2")) is False


def test_version_section_markdown(tmp_path):
    changelog = tmp_path / "CHANGELOG.md"
    changelog.write_text(promote_unreleased_to_version(SAMPLE, "2.1.1"), encoding="utf-8")
    body = version_section_markdown("2.1.1", markdown_path=changelog)
    assert "v2.1.1" in body
    assert "New thing" in body


def test_load_changelog_json_order():
    from panel_update import compare_semver

    versions = load_changelog_json(limit=2)
    assert len(versions) <= 2
    if len(versions) >= 2:
        assert compare_semver(versions[0]["version"], versions[1]["version"]) >= 0


def test_version_info_includes_changelog():
    info = version_info()
    assert info["version"]
    assert "changelog" in info
    assert isinstance(info["changelog"], list)
    assert info["changelog_url"].endswith(f"/releases/tag/v{info['version']}")
