"""Tests for storage limits and automatic cleanup."""

import time
import zipfile

import main
import storage_limits


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


def test_storage_put_limits(client, env_dir):
    r = client.put(
        "/api/storage/limits",
        json={"backups": {"enabled": True, "max_gb": 5}},
    )
    assert r.status_code == 200
    assert r.json()["limits"]["backups"]["enabled"] is True
    assert r.json()["limits"]["backups"]["max_gb"] == 5
    assert (env_dir["panel_data"] / "storage_limits.json").is_file()


def test_enforce_backups_by_size_deletes_oldest(env_dir, monkeypatch):
    backups = env_dir["backups"]
    old = backups / "worlds-20250101-120000.zip"
    new = backups / "worlds-20250708-120000.zip"
    _write_backup(old, b"o" * 2048)
    time.sleep(0.02)
    _write_backup(new, b"n" * 2048)

    storage_limits.write_storage_limits({
        "backups": {"enabled": True, "max_gb": 0.0000025},
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
    for path in (active, undo, extra):
        _write_backup(path)

    main.write_backup_state(active=active.name, undo=undo.name)

    storage_limits.write_storage_limits({
        "backups": {"enabled": True, "max_gb": 0.000001},
        "fwl_backups": {"enabled": False, "max_gb": None},
        "logs": {"enabled": False, "max_gb": None},
    })

    storage_limits.enforce_storage_limit("backups")
    assert active.exists()
    assert undo.exists()


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
    old.write_bytes(b"x" * 2048)
    time.sleep(0.02)
    new.write_bytes(b"y" * 2048)

    storage_limits.write_storage_limits({
        "backups": {"enabled": False, "max_gb": None},
        "fwl_backups": {"enabled": True, "max_gb": 0.000003},
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
    old.write_bytes(b"z" * 4096)

    storage_limits.write_storage_limits({
        "backups": {"enabled": False, "max_gb": None},
        "fwl_backups": {"enabled": False, "max_gb": None},
        "logs": {"enabled": True, "max_gb": 0.000001},
    })

    result = storage_limits.enforce_storage_limit("logs")
    assert audit.exists()
    assert old.name in result["deleted"]


def test_storage_enforce_endpoint(client, env_dir, monkeypatch):
    client.put("/api/storage/limits", json={"backups": {"enabled": True, "max_gb": 0.000001}})
    backups = env_dir["backups"]
    _write_backup(backups / "worlds-20250101-120000.zip", b"a" * 4096)
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
