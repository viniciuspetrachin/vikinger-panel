"""Scheduled panel jobs (restart / backup / mod-update) via APScheduler.

APScheduler is imported lazily *inside* methods so importing this module never
fails when the dependency is absent (dev/test). When it's missing the scheduler
no-ops gracefully: ``start``/``shutdown`` do nothing and ``get_status`` still
reports the configured jobs with ``next_run=None``.

Job callables are injected in the constructor (``restart_fn``, ``backup_fn``,
``mod_update_fn``); each run records ``last_run`` / ``last_status``.
"""

from __future__ import annotations

import time
from typing import Any, Callable, Optional

JOB_NAMES = ("restart", "backup", "mod_update")

_CRON_RANGES = {
    0: (0, 59),   # minute
    1: (0, 23),   # hour
    2: (1, 31),   # day of month
    3: (1, 12),   # month
    4: (0, 6),    # day of week (0-6, Sunday=0)
}

_MONTH_NAMES = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}
_DOW_NAMES = {
    "sun": 0, "mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6,
}


def _validate_field(field: str, low: int, high: int, names: Optional[dict] = None) -> bool:
    """Validate a single cron field (supports ``*``, ``,``, ``-``, ``*/n``, ``a/n``)."""
    if field == "*":
        return True
    for part in field.split(","):
        if not part:
            return False
        step = 1
        if "/" in part:
            base, _, step_s = part.partition("/")
            if not step_s.isdigit() or int(step_s) < 1:
                return False
            step = int(step_s)
            part = base if base else "*"
        if part == "*":
            continue
        if "-" in part:
            lo_s, _, hi_s = part.partition("-")
            lo = _resolve_token(lo_s, names)
            hi = _resolve_token(hi_s, names)
            if lo is None or hi is None or lo > hi or lo < low or hi > high:
                return False
        else:
            val = _resolve_token(part, names)
            if val is None or val < low or val > high:
                return False
    return True


def _resolve_token(token: str, names: Optional[dict]) -> Optional[int]:
    token = token.strip().lower()
    if names and token in names:
        return names[token]
    if token.lstrip("-").isdigit():
        return int(token)
    return None


def validate_cron(expr: str) -> bool:
    """Validate a standard 5-field cron expression.

    Fields: minute hour day-of-month month day-of-week. Supports ``*``,
    lists (``1,2``), ranges (``1-5``), and steps (``*/5``, ``0-30/10``), plus
    month/day names. Returns ``False`` for anything malformed.
    """
    if not expr or not isinstance(expr, str):
        return False
    fields = expr.split()
    if len(fields) != 5:
        return False
    checks = [
        (fields[0], 0, 59, None),
        (fields[1], 0, 23, None),
        (fields[2], 1, 31, None),
        (fields[3], 1, 12, _MONTH_NAMES),
        (fields[4], 0, 6, _DOW_NAMES),
    ]
    return all(_validate_field(f, lo, hi, names) for f, lo, hi, names in checks)


def describe_cron(expr: str) -> str:
    """Return a short human description of a cron expression."""
    if not validate_cron(expr):
        return "invalid schedule"
    minute, hour, dom, month, dow = expr.split()
    if minute.isdigit() and hour.isdigit() and dom == "*" and month == "*" and dow == "*":
        return f"daily at {int(hour):02d}:{int(minute):02d}"
    if minute.isdigit() and hour.isdigit() and dow != "*" and dom == "*":
        return f"weekly (dow {dow}) at {int(hour):02d}:{int(minute):02d}"
    if minute.startswith("*/"):
        return f"every {minute[2:]} minutes"
    return f"cron: {expr}"


def next_cron_fire(cron: str, *, after: float | None = None) -> float | None:
    """Return unix timestamp of the next cron fire, or ``None`` if unavailable."""
    if not validate_cron(cron):
        return None
    try:
        from apscheduler.triggers.cron import CronTrigger
        from datetime import datetime, timezone

        trigger = CronTrigger.from_crontab(cron)
        ref = datetime.fromtimestamp(after if after is not None else time.time(), tz=timezone.utc)
        nxt = trigger.get_next_fire_time(None, ref)
        if nxt is None:
            return None
        return nxt.timestamp()
    except Exception:
        return None


def _has_apscheduler() -> bool:
    try:
        import apscheduler  # noqa: F401

        return True
    except Exception:
        return False


class PanelScheduler:
    """Wrap a background APScheduler with panel restart/backup/mod-update jobs."""

    def __init__(
        self,
        restart_fn: Optional[Callable[[], Any]] = None,
        backup_fn: Optional[Callable[[], Any]] = None,
        mod_update_fn: Optional[Callable[[], Any]] = None,
    ):
        self._fns: dict[str, Optional[Callable[[], Any]]] = {
            "restart": restart_fn,
            "backup": backup_fn,
            "mod_update": mod_update_fn,
        }
        self._jobs: dict[str, dict] = {
            name: {"enabled": False, "cron": None} for name in JOB_NAMES
        }
        self._state: dict[str, dict] = {
            name: {"last_run": None, "last_status": None} for name in JOB_NAMES
        }
        self._scheduler = None

    def configure(self, jobs: dict) -> None:
        """Merge a ``{job: {enabled, cron}}`` config in. Unknown jobs ignored."""
        for name, cfg in (jobs or {}).items():
            if name not in self._jobs or not isinstance(cfg, dict):
                continue
            enabled = bool(cfg.get("enabled", False))
            cron = cfg.get("cron")
            self._jobs[name] = {"enabled": enabled, "cron": cron}
        if self._scheduler is not None:
            self._sync_jobs()

    def run_job(self, name: str) -> str:
        """Invoke a job's callable, recording last_run/last_status. Returns status."""
        fn = self._fns.get(name)
        self._state[name]["last_run"] = time.time()
        if fn is None:
            self._state[name]["last_status"] = "skipped"
            return "skipped"
        try:
            fn()
            self._state[name]["last_status"] = "ok"
            return "ok"
        except Exception as exc:  # noqa: BLE001
            self._state[name]["last_status"] = f"error: {exc}"
            return "error"

    def _sync_jobs(self) -> None:
        """(Re)register enabled+valid jobs with the live scheduler."""
        if self._scheduler is None:
            return
        try:
            from apscheduler.triggers.cron import CronTrigger
        except Exception:
            return
        for name, cfg in self._jobs.items():
            job_id = f"panel_{name}"
            existing = self._scheduler.get_job(job_id)
            if existing:
                self._scheduler.remove_job(job_id)
            cron = cfg.get("cron")
            if cfg.get("enabled") and cron and validate_cron(cron):
                try:
                    trigger = CronTrigger.from_crontab(cron)
                except Exception:
                    continue
                self._scheduler.add_job(
                    self.run_job, trigger=trigger, args=[name], id=job_id,
                    replace_existing=True,
                )

    def start(self) -> bool:
        """Start the background scheduler. Returns False if apscheduler absent."""
        if not _has_apscheduler():
            return False
        try:
            from apscheduler.schedulers.background import BackgroundScheduler
        except Exception:
            return False
        if self._scheduler is None:
            self._scheduler = BackgroundScheduler()
        self._sync_jobs()
        if not getattr(self._scheduler, "running", False):
            self._scheduler.start()
        return True

    def shutdown(self, wait: bool = False) -> None:
        if self._scheduler is not None:
            try:
                if getattr(self._scheduler, "running", False):
                    self._scheduler.shutdown(wait=wait)
            except Exception:
                pass
            self._scheduler = None

    def _next_run(self, name: str) -> Optional[float]:
        if self._scheduler is None:
            return None
        try:
            job = self._scheduler.get_job(f"panel_{name}")
        except Exception:
            return None
        if job is None or getattr(job, "next_run_time", None) is None:
            return None
        try:
            return job.next_run_time.timestamp()
        except Exception:
            return None

    def get_status(self) -> dict:
        """Return per-job ``{enabled, cron, last_run, last_status, next_run}``."""
        status: dict[str, dict] = {}
        for name in JOB_NAMES:
            cfg = self._jobs[name]
            state = self._state[name]
            status[name] = {
                "enabled": cfg["enabled"],
                "cron": cfg["cron"],
                "last_run": state["last_run"],
                "last_status": state["last_status"],
                "next_run": self._next_run(name),
            }
        return status
