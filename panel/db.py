"""SQLite persistence for the Vikinger panel.

Single database file at ``PANEL_DATA_DIR/panel.db`` (overridable via the
``PANEL_DB_PATH`` env var, which makes tests trivial). The module is
self-contained: it derives ``PANEL_DATA_DIR`` locally and never imports
``main`` to avoid circular imports.

Schema is versioned via a ``schema_migrations`` table. Each entry in
``MIGRATIONS`` is ``(version:int, sql:str)`` and ``run_migrations`` applies the
pending ones inside a single transaction, so ``init_db`` is idempotent.

Tables:
  * ``metrics_samples`` — time series of container metrics.
  * ``settings``        — key/value store, values JSON-encoded.
  * ``player_sessions`` — per-steam_id session bookkeeping.
"""

from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from typing import Any, Optional, Union

# Repo root = two levels up from this file (panel/ -> repo root).
ROOT = Path(os.environ.get("VALHEIM_PANEL_ROOT", Path(__file__).resolve().parent.parent)).resolve()
PANEL_DATA_DIR = ROOT / "panel-data"

ConnOrPath = Union[sqlite3.Connection, str, Path, None]


def get_db_path() -> Path:
    """Resolve the database path, honouring the ``PANEL_DB_PATH`` override."""
    override = os.environ.get("PANEL_DB_PATH")
    if override:
        return Path(override)
    return PANEL_DATA_DIR / "panel.db"


def connect(path: Optional[Union[str, Path]] = None) -> sqlite3.Connection:
    """Open a connection with ``Row`` factory and WAL journal mode."""
    db_path = Path(path) if path is not None else get_db_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
    except sqlite3.DatabaseError:
        # In-memory or read-only edge cases: WAL may be unavailable.
        pass
    return conn


MIGRATIONS: list[tuple[int, str]] = [
    (
        1,
        """
        CREATE TABLE IF NOT EXISTS metrics_samples (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            ts          REAL    NOT NULL,
            container   TEXT    NOT NULL,
            cpu_host    REAL,
            cpu_limit   REAL,
            mem_used    INTEGER,
            mem_limit   INTEGER,
            mem_percent REAL,
            net_rx_bps  INTEGER,
            net_tx_bps  INTEGER,
            players     INTEGER
        );
        CREATE INDEX IF NOT EXISTS idx_metrics_container_ts
            ON metrics_samples (container, ts);

        CREATE TABLE IF NOT EXISTS settings (
            key   TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS player_sessions (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            steam_id   TEXT,
            name       TEXT,
            first_seen REAL,
            last_seen  REAL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_player_sessions_steam
            ON player_sessions (steam_id);
        """,
    ),
]


def _applied_versions(conn: sqlite3.Connection) -> set[int]:
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations ("
        "version INTEGER PRIMARY KEY, applied_at REAL)"
    )
    rows = conn.execute("SELECT version FROM schema_migrations").fetchall()
    return {int(r[0]) for r in rows}


def run_migrations(conn: sqlite3.Connection) -> list[int]:
    """Apply pending migrations in a single transaction. Returns applied versions."""
    import time

    applied = _applied_versions(conn)
    pending = [(v, sql) for v, sql in MIGRATIONS if v not in applied]
    if not pending:
        return []
    just_applied: list[int] = []
    try:
        for version, sql in sorted(pending, key=lambda x: x[0]):
            conn.executescript(sql)
            conn.execute(
                "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)",
                (version, time.time()),
            )
            just_applied.append(version)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    return just_applied


def init_db(path: Optional[Union[str, Path]] = None) -> sqlite3.Connection:
    """Open the db (creating dirs), run migrations idempotently, return the conn."""
    conn = connect(path)
    run_migrations(conn)
    return conn


class _ConnCtx:
    """Yield an existing connection (not closing it) or open/close a fresh one."""

    def __init__(self, conn_or_path: ConnOrPath):
        self._external = isinstance(conn_or_path, sqlite3.Connection)
        if self._external:
            self._conn = conn_or_path  # type: ignore[assignment]
        else:
            self._conn = connect(conn_or_path)  # type: ignore[arg-type]

    def __enter__(self) -> sqlite3.Connection:
        return self._conn

    def __exit__(self, *exc: Any) -> None:
        if not self._external:
            self._conn.close()


def resolve_conn(conn_or_path: ConnOrPath) -> _ConnCtx:
    """Context manager that accepts a live connection OR a path/None.

    When given a connection it is reused and left open; when given a path (or
    ``None`` for the default db) a connection is opened and closed on exit.
    """
    return _ConnCtx(conn_or_path)


def get_setting(key: str, default: Any = None, conn_or_path: ConnOrPath = None) -> Any:
    """Return the JSON-decoded value for ``key`` or ``default`` if missing."""
    with resolve_conn(conn_or_path) as conn:
        _applied_versions(conn)  # ensure schema exists for fresh temp dbs
        try:
            row = conn.execute(
                "SELECT value FROM settings WHERE key = ?", (key,)
            ).fetchone()
        except sqlite3.OperationalError:
            return default
        if row is None or row[0] is None:
            return default
        try:
            return json.loads(row[0])
        except (json.JSONDecodeError, TypeError):
            return default


def set_setting(key: str, value: Any, conn_or_path: ConnOrPath = None) -> None:
    """JSON-encode and upsert ``value`` under ``key``."""
    encoded = json.dumps(value)
    with resolve_conn(conn_or_path) as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)")
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (key, encoded),
        )
        conn.commit()
