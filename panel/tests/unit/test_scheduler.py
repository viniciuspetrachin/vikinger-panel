"""Testes do módulo scheduler (validação de cron + PanelScheduler)."""

import pytest

import scheduler

pytestmark = pytest.mark.unit


# --- validate_cron ----------------------------------------------------------

@pytest.mark.parametrize(
    "expr",
    [
        "0 5 * * *",
        "*/5 * * * *",
        "30 4 1,15 * *",
        "0 0 * * 0",
        "0 22 * * 1-5",
        "0-30/10 * * * *",
        "0 5 * jan mon",
    ],
)
def test_validate_cron_valid(expr):
    assert scheduler.validate_cron(expr) is True


@pytest.mark.parametrize(
    "expr",
    [
        "",
        "0 5 * *",          # too few fields
        "0 5 * * * *",      # too many fields
        "60 5 * * *",       # minute out of range
        "0 24 * * *",       # hour out of range
        "0 5 * * 9",        # dow out of range
        "abc 5 * * *",      # non-numeric
        "*/0 * * * *",      # zero step
        "5-1 * * * *",      # inverted range
    ],
)
def test_validate_cron_invalid(expr):
    assert scheduler.validate_cron(expr) is False


def test_describe_cron():
    assert scheduler.describe_cron("0 5 * * *") == "daily at 05:00"
    assert "5 minutes" in scheduler.describe_cron("*/5 * * * *")
    assert scheduler.describe_cron("bad") == "invalid schedule"


# --- PanelScheduler ---------------------------------------------------------

def test_configure_and_status():
    sched = scheduler.PanelScheduler()
    sched.configure({
        "restart": {"enabled": True, "cron": "0 5 * * *"},
        "backup": {"enabled": False, "cron": "0 3 * * *"},
        "bogus": {"enabled": True, "cron": "* * * * *"},  # ignored
    })
    status = sched.get_status()
    assert set(status.keys()) == set(scheduler.JOB_NAMES)
    assert status["restart"]["enabled"] is True
    assert status["restart"]["cron"] == "0 5 * * *"
    assert status["backup"]["enabled"] is False
    assert "bogus" not in status


def test_run_job_records_status():
    calls = {"n": 0}

    def restart():
        calls["n"] += 1

    sched = scheduler.PanelScheduler(restart_fn=restart)
    assert sched.run_job("restart") == "ok"
    assert calls["n"] == 1
    status = sched.get_status()
    assert status["restart"]["last_status"] == "ok"
    assert status["restart"]["last_run"] is not None


def test_run_job_skipped_when_no_fn():
    sched = scheduler.PanelScheduler()
    assert sched.run_job("backup") == "skipped"
    assert sched.get_status()["backup"]["last_status"] == "skipped"


def test_run_job_error():
    def boom():
        raise RuntimeError("nope")

    sched = scheduler.PanelScheduler(backup_fn=boom)
    assert sched.run_job("backup") == "error"
    assert "error" in sched.get_status()["backup"]["last_status"]


def test_status_next_run_none_without_start():
    sched = scheduler.PanelScheduler()
    sched.configure({"restart": {"enabled": True, "cron": "0 5 * * *"}})
    assert sched.get_status()["restart"]["next_run"] is None


def test_start_and_shutdown_if_available():
    """When apscheduler is installed, start registers jobs and next_run fills in."""
    if not scheduler._has_apscheduler():
        pytest.skip("apscheduler not installed")
    calls = {"n": 0}
    sched = scheduler.PanelScheduler(restart_fn=lambda: calls.__setitem__("n", 1))
    sched.configure({"restart": {"enabled": True, "cron": "0 5 * * *"}})
    assert sched.start() is True
    try:
        status = sched.get_status()
        assert status["restart"]["next_run"] is not None
    finally:
        sched.shutdown()
    # After shutdown next_run should be None again.
    assert sched.get_status()["restart"]["next_run"] is None
