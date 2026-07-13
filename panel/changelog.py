"""Parse CHANGELOG.md and load embedded changelog_data.json for the About screen."""

from __future__ import annotations

import json
import re
from pathlib import Path

PANEL_DIR = Path(__file__).resolve().parent
ROOT = PANEL_DIR.parent
CHANGELOG_MD = ROOT / "CHANGELOG.md"
CHANGELOG_JSON = PANEL_DIR / "changelog_data.json"

_VERSION_HEADING_RE = re.compile(r"^## \[(?P<version>[^\]]+)\]\s*$", re.MULTILINE)
_SECTION_HEADING_RE = re.compile(r"^### (?P<section>.+?)\s*$", re.MULTILINE)
_BULLET_RE = re.compile(r"^-\s+(.+)$", re.MULTILINE)

_UNRELEASED_TEMPLATE = """## [Unreleased]

### Added

### Changed

### Fixed
"""

DEFAULT_SECTION_ORDER = ("Added", "Changed", "Deprecated", "Removed", "Fixed", "Security")


def parse_changelog_markdown(text: str) -> list[dict]:
    """Parse Keep a Changelog markdown into a list of version dicts (newest first)."""
    versions: list[dict] = []
    headings = list(_VERSION_HEADING_RE.finditer(text))
    if not headings:
        return versions

    for i, match in enumerate(headings):
        version = match.group("version").strip()
        if version.lower() == "unreleased":
            continue
        start = match.end()
        end = headings[i + 1].start() if i + 1 < len(headings) else len(text)
        block = text[start:end]
        sections: dict[str, list[str]] = {}
        section_matches = list(_SECTION_HEADING_RE.finditer(block))
        for j, sec in enumerate(section_matches):
            sec_name = sec.group("section").strip()
            sec_start = sec.end()
            sec_end = section_matches[j + 1].start() if j + 1 < len(section_matches) else len(block)
            sec_block = block[sec_start:sec_end]
            bullets = [m.group(1).strip() for m in _BULLET_RE.finditer(sec_block) if m.group(1).strip()]
            if bullets:
                sections[sec_name] = bullets
        if sections:
            versions.append({"version": version, "sections": sections})

    return versions


def changelog_to_json(versions: list[dict]) -> dict:
    return {"versions": versions}


def write_changelog_json(path: Path | None = None, *, markdown_path: Path | None = None) -> dict:
    md_path = markdown_path or CHANGELOG_MD
    out_path = path or CHANGELOG_JSON
    text = md_path.read_text(encoding="utf-8")
    data = changelog_to_json(parse_changelog_markdown(text))
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return data


def load_changelog_json(*, limit: int = 5) -> list[dict]:
    """Load embedded changelog; fall back to parsing CHANGELOG.md in dev."""
    if CHANGELOG_JSON.exists():
        data = json.loads(CHANGELOG_JSON.read_text(encoding="utf-8"))
        versions = data.get("versions", [])
    elif CHANGELOG_MD.exists():
        versions = parse_changelog_markdown(CHANGELOG_MD.read_text(encoding="utf-8"))
    else:
        versions = []
    return list(reversed(versions[:limit]))


def extract_unreleased_body(text: str) -> str:
    """Return markdown body under ## [Unreleased] (without the heading)."""
    marker = "## [Unreleased]"
    if marker not in text:
        return ""
    after = text.split(marker, 1)[1]
    next_heading = re.search(r"\n## \[", after)
    body = after[: next_heading.start()] if next_heading else after
    return body.strip()


def has_unreleased_content(text: str) -> bool:
    body = extract_unreleased_body(text)
    return bool(re.search(r"^-\s+\S", body, re.MULTILINE))


def promote_unreleased_to_version(text: str, version: str) -> str:
    """Move [Unreleased] content into ## [version] and reset Unreleased template."""
    marker = "## [Unreleased]"
    if marker not in text:
        raise ValueError(f"{marker!r} not found in CHANGELOG.md")

    unreleased_body = extract_unreleased_body(text)
    if not unreleased_body.strip():
        unreleased_body = f"### Changed\n\n- Release automático v{version}."

    new_entry = f"## [{version}]\n\n{unreleased_body}\n\n"
    before, after_marker = text.split(marker, 1)
    next_heading = re.search(r"\n## \[", after_marker)
    rest = after_marker[next_heading.start() + 1 :] if next_heading else ""
    return before.rstrip() + "\n\n" + new_entry + _UNRELEASED_TEMPLATE.strip() + "\n" + rest.lstrip("\n")


def version_section_markdown(version: str, *, markdown_path: Path | None = None) -> str:
    """Return markdown for a single released version (for GitHub Release body)."""
    md_path = markdown_path or CHANGELOG_MD
    text = md_path.read_text(encoding="utf-8")
    match = re.search(rf"^## \[{re.escape(version)}\]\s*$", text, re.MULTILINE)
    if not match:
        return f"Release v{version}"
    start = match.end()
    next_match = re.search(r"\n## \[", text[start:])
    end = start + next_match.start() if next_match else len(text)
    body = text[start:end].strip()
    return f"## v{version}\n\n{body}" if body else f"Release v{version}"
