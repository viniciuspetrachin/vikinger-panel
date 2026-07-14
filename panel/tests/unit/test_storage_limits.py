"""Tests for storage limits and automatic cleanup."""

import time
import zipfile

import main
import storage_limits

_MB = 1024 * 1024
_MIN_LIMIT_GB = storage_limits.MIN_MAX_GB
_OVER_LIMIT = 11 * _MB


def _write_backup(path, content: bytes = b"x" * 1024) -> None:
    with zipfile.ZipFile(path, "w") as zf:
        zf.writestr("worlds/TestWorld.fwl", content)


def test_storage_get(client):
    r = client.get("/api/storage")
    assert r.status_code == 200
    body = r.json()
    assert "categories" in body
    assert "backups" in body["categories"]
    assert "monitor" in body
    assert "limits" in body
    assert "backups" in body["limits"]
    backups = body["categories"]["backups"]
    assert isinstance(backups["used_bytes"], int)
    assert backups["used_bytes"] >= 0


def test_storage_put_unlimited(client, env_dir):
    client.put(
        "/api/storage/limits",
        json={"backups": {"enabled": True, "max_gb": 5}},
    )
    r = client.put(
        "/api/storage/limits",
        json={"backups": {"enabled": False, "max_gb": None}},
    )
    assert r.status_code == 200
    limits = r.json()["limits"]["backups"]
    assert limits["enabled"] is False
    assert limits["max_gb"] is None

    r2 = client.get("/api/storage")
    assert r2.status_code == 200
    status = r2.json()["categories"]["backups"]
    assert status["enabled"] is False
    assert status["max_bytes"] is None


def test_storage_get_after_backup_created(client, env_dir):
    backups = env_dir["backups"]
    _write_backup(backups / "worlds-20250101-120000.zip", b"x" * 2048)
    r = client.get("/api/storage")
    assert r.status_code == 200
    assert r.json()["categories"]["backups"]["used_bytes"] > 0


def test_storage_put_limits(client, env_dir):
    r = client.put(
        "/api/storage/limits",
        json={"backups": {"enabled": True, "max_gb": 5}},
    )
    assert r.status_code == 200
    assert r.json()["limits"]["backups"]["enabled"] is True
    assert r.json()["limits"]["backups"]["max_gb"] == 5
    assert (env_dir["panel_data"] / "storage_limits.json").is_file()


def test_storage_put_normalizes_microscopic_max_gb(client):
    r = client.put(
        "/api/storage/limits",
        json={"logs": {"enabled": True, "max_gb": 1e-06}},
    )
    assert r.status_code == 200
    limits = r.json()["limits"]["logs"]
    assert limits["enabled"] is False
    assert limits["max_gb"] is None


def test_enforce_backups_by_size_deletes_oldest(env_dir, monkeypatch):
    backups = env_dir["backups"]
    old = backups / "worlds-20250101-120000.zip"
    new = backups / "worlds-20250708-120000.zip"
    _write_backup(old, b"o" * (6 * _MB))
    time.sleep(0.02)
    _write_backup(new, b"n" * (6 * _MB))

    storage_limits.write_storage_limits({
        "backups": {"enabled": True, "max_gb": _MIN_LIMIT_GB},
        "fwl_backups": {"enabled": False, "max_gb": None},
        "logs": {"enabled": False, "max_gb": None},
    })

    result = storage_limits.enforce_storage_limit("backups")
    assert old.name in result["deleted"]
    assert new.exists()


def test_enforce_backups_protects_active_and_undo(env_dir, monkeypatch):
    backups = env_dir["backups"]
    active = backups / "worlds-20250101-120000.zip"
    undo = backups / "checkpoint-20250102-120000.zip"
    extra = backups / "worlds-20250103-120000.zip"
    for path in (active, undo):
        _write_backup(path)
    _write_backup(extra, b"x" * _OVER_LIMIT)

    main.write_backup_state(active=active.name, undo=undo.name)

    storage_limits.write_storage_limits({
        "backups": {"enabled": True, "max_gb": _MIN_LIMIT_GB},
        "fwl_backups": {"enabled": False, "max_gb": None},
        "logs": {"enabled": False, "max_gb": None},
    })

    storage_limits.enforce_storage_limit("backups")
    assert active.exists()
    assert undo.exists()
    assert not extra.exists()


def test_purge_backups_by_count(env_dir, monkeypatch):
    backups = env_dir["backups"]
    for i in range(4):
        path = backups / f"worlds-2025070{i}-120000.zip"
        _write_backup(path)
        time.sleep(0.02)

    env = env_dir["env_file"].read_text()
    env_dir["env_file"].write_text(env + "BACKUPS_MAX_COUNT=2\n")
    deleted = main._purge_backups_by_count(2)
    remaining = [p.name for p in backups.glob("*.zip")]
    assert len(remaining) == 2
    assert len(deleted) == 2


def test_enforce_fwl_backups(env_dir):
    fwl_dir = env_dir["fwl_backups"]
    old = fwl_dir / "OldWorld.fwl.bak"
    new = fwl_dir / "NewWorld.fwl.bak"
    old.write_bytes(b"x" * (6 * _MB))
    time.sleep(0.02)
    new.write_bytes(b"y" * (6 * _MB))

    storage_limits.write_storage_limits({
        "backups": {"enabled": False, "max_gb": None},
        "fwl_backups": {"enabled": True, "max_gb": _MIN_LIMIT_GB},
        "logs": {"enabled": False, "max_gb": None},
    })

    result = storage_limits.enforce_storage_limit("fwl_backups")
    assert old.name in result["deleted"]
    assert new.exists()


def test_enforce_logs_preserves_audit(env_dir):
    logs = env_dir["panel_data"] / "logs"
    audit = logs / "audit.jsonl"
    old = logs / "audit.jsonl.1"
    audit.write_text('{"action":"x"}\n')
    old.write_bytes(b"z" * _OVER_LIMIT)

    storage_limits.write_storage_limits({
        "backups": {"enabled": False, "max_gb": None},
        "fwl_backups": {"enabled": False, "max_gb": None},
        "logs": {"enabled": True, "max_gb": _MIN_LIMIT_GB},
    })

    result = storage_limits.enforce_storage_limit("logs")
    assert audit.exists()
    assert old.name in result["deleted"]


def test_storage_enforce_endpoint(client, env_dir, monkeypatch):
    client.put(
        "/api/storage/limits",
        json={"backups": {"enabled": True, "max_gb": _MIN_LIMIT_GB}},
    )
    backups = env_dir["backups"]
    _write_backup(backups / "worlds-20250101-120000.zip", b"a" * _OVER_LIMIT)
    r = client.post("/api/storage/enforce", json={"category": "backups"})
    assert r.status_code == 200
    assert r.json()["enforced"]["backups"]["deleted"]


def test_metrics_includes_disk_limits(client):
    client.put("/api/storage/limits", json={"backups": {"enabled": True, "max_gb": 1}})
    r = client.get("/api/metrics")
    assert r.status_code == 200
    assert "limits" in r.json()["disk"]
    assert "backups" in r.json()["disk"]["limits"]


def test_purge_all_backups_endpoint(client, env_dir):
    backups = env_dir["backups"]
    keep = backups / "worlds-20250101-120000.zip"
    drop = backups / "worlds-20250102-120000.zip"
    _write_backup(keep)
    _write_backup(drop)
    main.write_backup_state(active=keep.name, undo=None)

    r = client.post("/api/backups/purge-all", json={"confirm": True})
    assert r.status_code == 200
    assert drop.name in r.json()["deleted"]
    assert keep.exists()
    assert not drop.exists()


def test_purge_all_requires_confirm(client):
    r = client.post("/api/backups/purge-all", json={"confirm": False})
    assert r.status_code == 400
