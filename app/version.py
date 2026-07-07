"""Fonte única de verdade da versão do Valheim Panel."""

from __future__ import annotations

import os
import subprocess
from functools import lru_cache
from pathlib import Path

__version__ = "2.0.0"

REPO_URL = "https://github.com/viniciuspetrachin/valheim-panel"
LICENSE = "Polyform Shield 1.0.0"
LICENSE_URL = "https://polyformproject.org/licenses/shield/1.0.0"

_DONATION_ENV = (
    ("PANEL_DONATION_GITHUB", "GitHub Sponsors"),
    ("PANEL_DONATION_KOFI", "Ko-fi"),
    ("PANEL_DONATION_BUYMEACOFFEE", "Buy Me a Coffee"),
)


def donation_links() -> list[dict]:
    links = []
    for env_key, label in _DONATION_ENV:
        url = os.environ.get(env_key, "").strip()
        if url:
            links.append({"id": env_key.lower(), "label": label, "url": url})
    return links


def donation_info() -> dict:
    return {
        "links": donation_links(),
        "pix_key": os.environ.get("PANEL_DONATION_PIX", "").strip(),
        "commercial_email": os.environ.get("PANEL_COMMERCIAL_EMAIL", "").strip(),
        "commercial_url": os.environ.get("PANEL_COMMERCIAL_URL", "").strip(),
    }


@lru_cache(maxsize=1)
def git_commit() -> str:
    """Retorna o hash curto do commit atual, se disponível (build local ou via env)."""
    env_commit = os.environ.get("PANEL_GIT_COMMIT")
    if env_commit:
        return env_commit.strip()[:12]
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=str(Path(__file__).resolve().parent),
            capture_output=True,
            text=True,
            timeout=3,
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except (OSError, subprocess.SubprocessError):
        pass
    return ""


def build_date() -> str:
    """Data de build injetada no container (ou vazio em dev)."""
    return os.environ.get("PANEL_BUILD_DATE", "")


def version_info() -> dict:
    return {
        "version": __version__,
        "commit": git_commit(),
        "build_date": build_date(),
        "repo_url": os.environ.get("PANEL_REPO_URL", REPO_URL),
        "license": LICENSE,
        "license_url": LICENSE_URL,
        "donation": donation_info(),
    }
