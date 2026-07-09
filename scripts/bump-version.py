#!/usr/bin/env python3
"""Incrementa o patch SemVer e sincroniza arquivos espelho da versão."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VERSION_PY = ROOT / "panel" / "version.py"
PACKAGE_JSON = ROOT / "panel" / "package.json"
README = ROOT / "README.md"
CHANGELOG = ROOT / "CHANGELOG.md"

_VERSION_RE = re.compile(r'^__version__\s*=\s*["\'](\d+)\.(\d+)\.(\d+)["\']', re.M)
_BADGE_RE = re.compile(
    r"(https://img\.shields\.io/badge/version-)\d+\.\d+\.\d+(-gold\.svg)",
)


def read_version() -> tuple[int, int, int]:
    text = VERSION_PY.read_text(encoding="utf-8")
    match = _VERSION_RE.search(text)
    if not match:
        raise SystemExit(f"Não foi possível ler __version__ em {VERSION_PY}")
    return int(match.group(1)), int(match.group(2)), int(match.group(3))


def bump_patch(major: int, minor: int, patch: int) -> str:
    return f"{major}.{minor}.{patch + 1}"


def write_version_py(version: str) -> None:
    text = VERSION_PY.read_text(encoding="utf-8")
    new_text, count = _VERSION_RE.subn(f'__version__ = "{version}"', text, count=1)
    if count != 1:
        raise SystemExit("Falha ao atualizar panel/version.py")
    VERSION_PY.write_text(new_text, encoding="utf-8")


def write_package_json(version: str) -> None:
    data = json.loads(PACKAGE_JSON.read_text(encoding="utf-8"))
    data["version"] = version
    PACKAGE_JSON.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def write_readme_badge(version: str) -> None:
    text = README.read_text(encoding="utf-8")
    new_text, count = _BADGE_RE.subn(rf"\g<1>{version}\g<2>", text, count=1)
    if count != 1:
        raise SystemExit("Falha ao atualizar badge de versão no README.md")
    README.write_text(new_text, encoding="utf-8")


def write_changelog(version: str) -> None:
    text = CHANGELOG.read_text(encoding="utf-8")
    entry = f"## [{version}]\n\n### Changed\n\n- Release automático v{version}.\n\n"
    marker = "## [Unreleased]"
    if marker not in text:
        raise SystemExit(f"Marcador {marker!r} não encontrado em CHANGELOG.md")
    CHANGELOG.write_text(text.replace(marker, entry + marker, 1), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Bump patch SemVer e sincroniza arquivos.")
    parser.add_argument(
        "--write",
        action="store_true",
        help="Grava a nova versão nos arquivos (padrão: apenas imprime).",
    )
    args = parser.parse_args()

    major, minor, patch = read_version()
    new_version = bump_patch(major, minor, patch)

    if args.write:
        write_version_py(new_version)
        write_package_json(new_version)
        write_readme_badge(new_version)
        write_changelog(new_version)

    print(new_version)
    return 0


if __name__ == "__main__":
    sys.exit(main())
