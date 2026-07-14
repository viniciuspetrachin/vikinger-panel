"""Testes do módulo db (SQLite migrations + settings)."""

import sqlite3

import pytest

import db

pytestmark = pytest.mark.unit


def test_get_db_path_env_override(tmp_path, monkeypatch):
    target = tmp_path / "custom.db"
    monkeypatch.setenv("PANEL_DB_PATH", str(target))
    assert db.get_db_path() == target


def test_get_db_path_default(monkeypatch):
    monkeypatch.delenv("PANEL_DB_PATH", raising=False)
    assert db.get_db_path().name == "panel.db"


def test_connect_row_factory_and_wal(tmp_path):
    conn = db.connect(tmp_path / "x.db")
    assert conn.row_factory is sqlite3.Row
    mode = conn.execute("PRAGMA journal_mode").fetchone()[0]
    assert mode.lower() == "wal"
    conn.close()


def test_init_db_creates_tables(tmp_path):
    conn = db.init_db(tmp_path / "panel.db")
    names = {
        r[0]
        for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()
    }
    assert {"metrics_samples", "settings", "player_sessions", "schema_migrations"} <= names
    conn.close()


def test_migrations_idempotent(tmp_path):
    path = tmp_path / "panel.db"
    conn = db.init_db(path)
    # Second run applies nothing new.
    assert db.run_migrations(conn) == []
    versions = {
        r[0] for r in conn.execute("SELECT version FROM schema_migrations").fetchall()
    }
    assert versions == {v for v, _ in db.MIGRATIONS}
    conn.close()

    # Re-opening and re-initialising is also a no-op.
    conn2 = db.init_db(path)
    assert db.run_migrations(conn2) == []
    conn2.close()


def test_first_migration_reports_applied(tmp_path):
    conn = db.connect(tmp_path / "panel.db")
    applied = db.run_migrations(conn)
    assert 1 in applied
    conn.close()


def test_settings_roundtrip_with_conn(tmp_path):
    conn = db.init_db(tmp_path / "panel.db")
    db.set_setting("alerts", {"discord": True, "n": 3}, conn_or_path=conn)
    assert db.get_setting("alerts", conn_or_path=conn) == {"discord": True, "n": 3}
    conn.close()


def test_settings_roundtrip_with_path(tmp_path):
    path = tmp_path / "panel.db"
    db.init_db(path).close()
    db.set_setting("k", [1, 2, 3], conn_or_path=path)
    assert db.get_setting("k", conn_or_path=path) == [1, 2, 3]


def test_settings_default_when_missing(tmp_path):
    conn = db.init_db(tmp_path / "panel.db")
    assert db.get_setting("nope", default="fallback", conn_or_path=conn) == "fallback"
    conn.close()


def test_settings_overwrite(tmp_path):
    conn = db.init_db(tmp_path / "panel.db")
    db.set_setting("x", 1, conn_or_path=conn)
    db.set_setting("x", 2, conn_or_path=conn)
    assert db.get_setting("x", conn_or_path=conn) == 2
    conn.close()


def test_env_override_used_by_default_conn(tmp_path, monkeypatch):
    target = tmp_path / "envdb.db"
    monkeypatch.setenv("PANEL_DB_PATH", str(target))
    conn = db.init_db()
    db.set_setting("hello", "world", conn_or_path=conn)
    conn.close()
    assert target.exists()
    assert db.get_setting("hello") == "world"
