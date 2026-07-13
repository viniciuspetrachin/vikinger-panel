"""Check and apply Vikinger Panel updates from GitHub Releases / GHCR."""

from __future__ import annotations

import os
import re
import subprocess
import time
from pathlib import Path

import httpx

from version import REPO_URL, __version__

_CACHE_TTL_SEC = 900
_cache: dict | None = None
_cache_at: float = 0.0

_GITHUB_REPO_RE = re.compile(r"github\.com/([^/]+/[^/]+)")
_SEMVER_RE = re.compile(r"^v?(\d+)\.(\d+)\.(\d+)$")
_GHCR_IMAGE_RE = re.compile(
    r"^\s*image:\s*(ghcr\.io/[^/\s]+/vikinger-panel):([^\s]+)\s*$",
    re.MULTILINE | re.IGNORECASE,
)
_BUILD_RE = re.compile(r"^\s*build:\s*", re.MULTILINE)


def _repo_slug() -> str:
    custom = os.environ.get("PANEL_GITHUB_REPO", "").strip()
    if custom:
        return custom
    match = _GITHUB_REPO_RE.search(os.environ.get("PANEL_REPO_URL", REPO_URL))
    return match.group(1) if match else "viniciuspetrachin/vikinger-panel"


def _ghcr_owner() -> str:
    owner = os.environ.get("PANEL_GHCR_OWNER", "").strip()
    if owner:
        return owner
    return _repo_slug().split("/", 1)[0]


def parse_semver(tag: str) -> tuple[int, int, int] | None:
    match = _SEMVER_RE.match(tag.strip())
    if not match:
        return None
    return int(match.group(1)), int(match.group(2)), int(match.group(3))


def compare_semver(a: str, b: str) -> int:
    """Return -1 if a<b, 0 if equal, 1 if a>b."""
    pa, pb = parse_semver(a), parse_semver(b)
    if pa is None or pb is None:
        return 0
    return (pa > pb) - (pa < pb)


def detect_deploy_mode(compose_path: Path) -> dict:
    if not compose_path.exists():
        return {"mode": "unknown", "image": "", "tag": ""}
    text = compose_path.read_text(encoding="utf-8")
    if _BUILD_RE.search(text):
        return {"mode": "dev", "image": "", "tag": ""}
    match = _GHCR_IMAGE_RE.search(text)
    if match:
        return {"mode": "ghcr", "image": match.group(1), "tag": match.group(2)}
    return {"mode": "unknown", "image": "", "tag": ""}


def _github_headers() -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "vikinger-panel",
    }
    token = os.environ.get("GITHUB_TOKEN", "").strip() or os.environ.get("PANEL_GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def fetch_latest_release(*, force: bool = False) -> dict:
    global _cache, _cache_at
    now = time.time()
    if not force and _cache and now - _cache_at < _CACHE_TTL_SEC:
        return _cache

    slug = _repo_slug()
    url = f"https://api.github.com/repos/{slug}/releases/latest"
    with httpx.Client(timeout=20.0) as client:
        resp = client.get(url, headers=_github_headers())
        resp.raise_for_status()
        data = resp.json()

    tag = (data.get("tag_name") or "").lstrip("v")
    result = {
        "latest": tag,
        "release_url": data.get("html_url") or f"{REPO_URL}/releases/latest",
        "published_at": data.get("published_at") or "",
        "release_notes": data.get("body") or "",
    }
    _cache = result
    _cache_at = now
    return result


def check_panel_update(compose_path: Path) -> dict:
    current = __version__
    deploy = detect_deploy_mode(compose_path)
    try:
        release = fetch_latest_release()
        latest = release["latest"]
        update_available = compare_semver(latest, current) > 0
        error = ""
    except Exception as exc:  # noqa: BLE001
        latest = ""
        update_available = False
        release = {"release_url": f"{REPO_URL}/releases", "published_at": "", "release_notes": ""}
        error = str(exc)

    can_update = deploy["mode"] == "ghcr" and update_available
    message = ""
    if deploy["mode"] == "dev":
        message = "Development install — use git pull and ./scripts/reload-panel.sh"
    elif deploy["mode"] != "ghcr":
        message = "Unknown deploy mode — update manually from GitHub Releases"

    return {
        "current": current,
        "latest": latest,
        "update_available": update_available,
        "can_update": can_update,
        "deploy_mode": deploy["mode"],
        "image": deploy.get("image") or f"ghcr.io/{_ghcr_owner()}/vikinger-panel",
        "release_url": release.get("release_url", ""),
        "published_at": release.get("published_at", ""),
        "release_notes": release.get("release_notes", ""),
        "message": message,
        "error": error,
    }


def start_panel_update(root: Path, version: str) -> dict:
    compose_path = root / "docker-compose.yml"
    status = check_panel_update(compose_path)
    if status["deploy_mode"] == "dev":
        raise ValueError(status["message"] or "Cannot auto-update dev install")
    if status["deploy_mode"] != "ghcr":
        raise ValueError(status["message"] or "Cannot auto-update this install")
    target = version.strip().lstrip("v") or status.get("latest", "")
    if not target:
        raise ValueError("No target version")
    if compare_semver(target, __version__) <= 0:
        raise ValueError(f"Already on v{__version__}")

    script = root / "scripts" / "panel-self-update.sh"
    if not script.exists():
        raise FileNotFoundError(f"Missing {script}")

    log_dir = root / "panel-data" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "panel-update.log"

    cmd = [
        "bash",
        str(script),
        target,
        str(root),
        _ghcr_owner(),
    ]
    with open(log_file, "a", encoding="utf-8") as log:
        log.write(f"\n--- update to v{target} started ---\n")
        subprocess.Popen(
            cmd,
            cwd=str(root),
            stdout=log,
            stderr=subprocess.STDOUT,
            start_new_session=True,
        )

    return {
        "status": "updating",
        "target_version": target,
        "log_file": str(log_file.relative_to(root)) if log_file.is_relative_to(root) else str(log_file),
    }
