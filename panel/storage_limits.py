"""Disk limits per category with automatic cleanup (oldest first)."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Optional

logger = logging.getLogger("vikinger-panel")

GB = 1024**3
MIN_MAX_GB = 0.01

STORAGE_LIMITS_FILE: Path = Path()
BACKUPS_DIR: Path = Path()
FWL_BACKUP_DIR: Path = Path()
LOGS_DIR: Path = Path()
AUDIT_FILE: Path = Path()

CATEGORIES = ("backups", "fwl_backups", "logs")
MONITOR_CATEGORIES = ("game", "mods", "worlds")

DEFAULT_CATEGORY = {"enabled": False, "max_gb": None}

DEFAULT_LIMITS: dict = {
    "backups": dict(DEFAULT_CATEGORY),
    "fwl_backups": dict(DEFAULT_CATEGORY),
    "logs": dict(DEFAULT_CATEGORY),
}

_get_protected_backups: Callable[[], set[str]] = lambda: set()
_write_audit: Optional[Callable[[dict], None]] = None
_dir_size_bytes: Optional[Callable[[Path], int]] = None


def configure(
    *,
    limits_file: Path,
    backups_dir: Path,
    fwl_backup_dir: Path,
    logs_dir: Path,
    audit_file: Path,
    get_protected_backups: Callable[[], set[str]],
    write_audit: Callable[[dict], None],
    dir_size_bytes: Callable[[Path], int],
) -> None:
    global STORAGE_LIMITS_FILE, BACKUPS_DIR, FWL_BACKUP_DIR, LOGS_DIR, AUDIT_FILE
    global _get_protected_backups, _write_audit, _dir_size_bytes
    STORAGE_LIMITS_FILE = limits_file
    BACKUPS_DIR = backups_dir
    FWL_BACKUP_DIR = fwl_backup_dir
    LOGS_DIR = logs_dir
    AUDIT_FILE = audit_file
    _get_protected_backups = get_protected_backups
    _write_audit = write_audit
    _dir_size_bytes = dir_size_bytes


def _gb_to_bytes(max_gb: float | int | None) -> int | None:
    if max_gb is None:
        return None
    try:
        value = float(max_gb)
    except (TypeError, ValueError):
        return None
    if value <= 0:
        return None
    return int(value * GB)


def _bytes_to_gb(max_bytes: int | None) -> float | None:
    if max_bytes is None:
        return None
    return round(max_bytes / GB, 3)


def _normalize_category(raw: dict | None) -> dict:
    base = dict(DEFAULT_CATEGORY)
    if not isinstance(raw, dict):
        return base
    enabled = bool(raw.get("enabled", False))
    max_gb = raw.get("max_gb")
    if max_gb is None and raw.get("max_bytes") is not None:
        max_gb = _bytes_to_gb(int(raw["max_bytes"]))
    if max_gb is not None:
        try:
            max_gb = float(max_gb)
            if max_gb < MIN_MAX_GB:
                max_gb = None
        except (TypeError, ValueError):
            max_gb = None
    if max_gb is None:
        enabled = False
    return {"enabled": enabled, "max_gb": max_gb}


def read_storage_limits() -> dict:
    data = dict(DEFAULT_LIMITS)
    if not STORAGE_LIMITS_FILE.exists():
        return data
    try:
        raw = json.loads(STORAGE_LIMITS_FILE.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            return data
        for key in CATEGORIES:
            if key in raw:
                data[key] = _normalize_category(raw[key])
        return data
    except (OSError, json.JSONDecodeError):
        return data


def write_storage_limits(limits: dict) -> dict:
    normalized = {key: _normalize_category(limits.get(key)) for key in CATEGORIES}
    payload = {
        **normalized,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    STORAGE_LIMITS_FILE.parent.mkdir(parents=True, exist_ok=True)
    STORAGE_LIMITS_FILE.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return normalized


def category_max_bytes(category: str) -> int | None:
    limits = read_storage_limits()
    cfg = limits.get(category, DEFAULT_CATEGORY)
    if not cfg.get("enabled"):
        return None
    return _gb_to_bytes(cfg.get("max_gb"))


def backups_zip_bytes() -> int:
    if not BACKUPS_DIR.exists():
        return 0
    total = 0
    for item in BACKUPS_DIR.iterdir():
        if item.is_file() and item.name.endswith(".zip"):
            try:
                total += item.stat().st_size
            except OSError:
                pass
    return total


def category_usage(category: str) -> int:
    if category == "backups":
        return backups_zip_bytes()
    if category == "fwl_backups":
        if not FWL_BACKUP_DIR.exists():
            return 0
        total = 0
        for item in FWL_BACKUP_DIR.glob("*.fwl.bak"):
            try:
                total += item.stat().st_size
            except OSError:
                pass
        return total
    if category == "logs":
        if not LOGS_DIR.exists():
            return 0
        total = 0
        for item in LOGS_DIR.iterdir():
            if not item.is_file():
                continue
            try:
                total += item.stat().st_size
            except OSError:
                pass
        return total
    return 0


def _backup_sidecar_path(zip_name: str) -> Path:
    return BACKUPS_DIR / f"{zip_name}.manifest.json"


def list_purge_candidates(category: str) -> list[Path]:
    candidates: list[tuple[float, Path]] = []
    if category == "backups":
        if not BACKUPS_DIR.exists():
            return []
        protected = _get_protected_backups()
        for item in BACKUPS_DIR.iterdir():
            if not item.is_file() or not item.name.endswith(".zip"):
                continue
            if item.name in protected:
                continue
            try:
                candidates.append((item.stat().st_mtime, item))
            except OSError:
                continue
    elif category == "fwl_backups":
        if not FWL_BACKUP_DIR.exists():
            return []
        for item in FWL_BACKUP_DIR.glob("*.fwl.bak"):
            try:
                candidates.append((item.stat().st_mtime, item))
            except OSError:
                continue
    elif category == "logs":
        if not LOGS_DIR.exists():
            return []
        for item in LOGS_DIR.iterdir():
            if not item.is_file():
                continue
            if item.resolve() == AUDIT_FILE.resolve():
                continue
            try:
                candidates.append((item.stat().st_mtime, item))
            except OSError:
                continue
    candidates.sort(key=lambda x: x[0])
    return [path for _, path in candidates]


def delete_backup_zip(path: Path) -> int:
    freed = 0
    try:
        freed = path.stat().st_size
    except OSError:
        pass
    try:
        path.unlink(missing_ok=True)
    except OSError as e:
        logger.warning("Failed to delete backup %s: %s", path.name, e)
        return 0
    sidecar = _backup_sidecar_path(path.name)
    try:
        if sidecar.is_file():
            sidecar.unlink()
    except OSError as e:
        logger.warning("Failed to delete sidecar %s: %s", sidecar.name, e)
    return freed


def _delete_file(path: Path) -> int:
    try:
        size = path.stat().st_size
    except OSError:
        size = 0
    try:
        path.unlink(missing_ok=True)
        return size
    except OSError as e:
        logger.warning("Failed to delete %s: %s", path, e)
        return 0


def enforce_storage_limit(category: str) -> dict:
    max_bytes = category_max_bytes(category)
    before_bytes = category_usage(category)
    result = {
        "category": category,
        "deleted": [],
        "freed_bytes": 0,
        "before_bytes": before_bytes,
        "after_bytes": before_bytes,
        "skipped_protected": [],
    }
    if max_bytes is None:
        return result

    current = before_bytes
    while current > max_bytes:
        candidates = list_purge_candidates(category)
        if not candidates:
            break
        target = candidates[0]
        if category == "backups":
            freed = delete_backup_zip(target)
        else:
            freed = _delete_file(target)
        if freed <= 0:
            break
        result["deleted"].append(target.name)
        result["freed_bytes"] += freed
        current = category_usage(category)

    result["after_bytes"] = current
    if result["deleted"] and _write_audit:
        _write_audit({
            "action": "storage.enforce",
            "category": category,
            "deleted": result["deleted"],
            "freed_bytes": result["freed_bytes"],
            "before_bytes": before_bytes,
            "after_bytes": current,
            "max_bytes": max_bytes,
        })
    return result


def enforce_all_storage_limits() -> dict[str, dict]:
    results = {}
    for category in CATEGORIES:
        if category_max_bytes(category) is not None:
            results[category] = enforce_storage_limit(category)
    return results


def category_status(category: str) -> dict:
    limits = read_storage_limits()
    cfg = limits.get(category, DEFAULT_CATEGORY)
    used = category_usage(category)
    max_bytes = _gb_to_bytes(cfg.get("max_gb")) if cfg.get("enabled") else None
    pct = round(used / max_bytes * 100, 1) if max_bytes else None
    return {
        "category": category,
        "enabled": bool(cfg.get("enabled")),
        "max_gb": cfg.get("max_gb"),
        "max_bytes": max_bytes,
        "used_bytes": used,
        "percent": pct,
    }


def storage_overview(monitor_usage: dict | None = None) -> dict:
    limits = read_storage_limits()
    categories = {cat: category_status(cat) for cat in CATEGORIES}
    monitor = monitor_usage or {}
    return {
        "limits": limits,
        "categories": categories,
        "monitor": monitor,
        "updated_at": None,
    }


def disk_limits_summary() -> dict:
    """Lightweight summary for /api/metrics."""
    summary = {}
    for cat in CATEGORIES:
        status = category_status(cat)
        if status["enabled"] and status["max_bytes"]:
            summary[cat] = {
                "used_bytes": status["used_bytes"],
                "max_bytes": status["max_bytes"],
                "percent": status["percent"],
            }
    return summary


def purge_all_backups() -> dict:
    """Delete all backup ZIPs except protected (active restore + undo)."""
    if not BACKUPS_DIR.exists():
        return {"deleted": [], "freed_bytes": 0}
    protected = _get_protected_backups()
    deleted: list[str] = []
    freed = 0
    for item in sorted(BACKUPS_DIR.iterdir(), key=lambda p: p.name):
        if not item.is_file() or not item.name.endswith(".zip"):
            continue
        if item.name in protected:
            continue
        chunk = delete_backup_zip(item)
        if chunk > 0:
            deleted.append(item.name)
            freed += chunk
    if deleted and _write_audit:
        _write_audit({
            "action": "backups.purge_all",
            "deleted": deleted,
            "freed_bytes": freed,
            "protected": sorted(protected),
        })
    return {"deleted": deleted, "freed_bytes": freed}
