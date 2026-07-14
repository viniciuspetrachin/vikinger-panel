"""Persist and query the ``metrics_samples`` time series.

Sampling is done by :class:`MetricsSampler`, a thin background-thread wrapper
around an injected ``collect()`` callable. All the interesting logic
(downsampling, range windowing) lives in pure helpers that are unit-testable
without threads or docker.
"""

from __future__ import annotations

import threading
import time
from typing import Any, Callable, Optional

import db

RANGE_SECONDS = {"1h": 3600, "24h": 86400, "7d": 604800}

DEFAULT_MAX_POINTS = 120

_NUMERIC_COLUMNS = (
    "cpu_host",
    "cpu_limit",
    "mem_used",
    "mem_limit",
    "mem_percent",
    "net_rx_bps",
    "net_tx_bps",
    "players",
)


def record_sample(
    conn_or_path: Any,
    container: str,
    sample: dict,
    ts: Optional[float] = None,
    players: Optional[int] = None,
) -> None:
    """Insert one metrics row.

    ``sample`` uses the :func:`docker_metrics.stats_for_container` keys; missing
    keys default to ``None``/``0``. ``players`` overrides ``sample['players']``
    when provided.
    """
    if ts is None:
        ts = time.time()
    if players is None:
        players = sample.get("players")
    row = (
        ts,
        container,
        sample.get("cpu_percent_host"),
        sample.get("cpu_percent_of_limit"),
        sample.get("memory_used_bytes"),
        sample.get("memory_limit_bytes"),
        sample.get("memory_percent"),
        sample.get("net_rx_bps", sample.get("net_rx_bytes")),
        sample.get("net_tx_bps", sample.get("net_tx_bytes")),
        players,
    )
    with db.resolve_conn(conn_or_path) as conn:
        db.run_migrations(conn)
        conn.execute(
            "INSERT INTO metrics_samples "
            "(ts, container, cpu_host, cpu_limit, mem_used, mem_limit, "
            " mem_percent, net_rx_bps, net_tx_bps, players) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            row,
        )
        conn.commit()


def _row_to_dict(row: Any) -> dict:
    return {k: row[k] for k in row.keys()}


def downsample(rows: list[dict], max_points: int) -> list[dict]:
    """Bucket rows into at most ``max_points`` averaged points.

    Rows are assumed ordered by ``ts`` ascending. When ``len(rows)`` is already
    within ``max_points`` the list is returned unchanged. Otherwise rows are
    split into contiguous buckets; each bucket's numeric columns are averaged
    and ``ts`` becomes the bucket's mean timestamp. Non-numeric columns take the
    first row's value.
    """
    if max_points <= 0 or len(rows) <= max_points:
        return rows
    n = len(rows)
    bucket_size = -(-n // max_points)  # ceil division
    out: list[dict] = []
    for start in range(0, n, bucket_size):
        chunk = rows[start:start + bucket_size]
        agg: dict[str, Any] = dict(chunk[0])
        ts_vals = [r.get("ts") for r in chunk if r.get("ts") is not None]
        if ts_vals:
            agg["ts"] = sum(ts_vals) / len(ts_vals)
        for col in _NUMERIC_COLUMNS:
            vals = [r.get(col) for r in chunk if r.get(col) is not None]
            agg[col] = round(sum(vals) / len(vals), 2) if vals else None
        out.append(agg)
    return out


def query_history(
    conn_or_path: Any,
    container: str,
    range_key: str,
    max_points: int = DEFAULT_MAX_POINTS,
    now: Optional[float] = None,
) -> list[dict]:
    """Return downsampled rows for ``container`` within ``range_key``.

    ``range_key`` must be one of :data:`RANGE_SECONDS` keys. Unknown keys yield
    an empty list.
    """
    window = RANGE_SECONDS.get(range_key)
    if window is None:
        return []
    if now is None:
        now = time.time()
    since = now - window
    with db.resolve_conn(conn_or_path) as conn:
        db.run_migrations(conn)
        cursor = conn.execute(
            "SELECT * FROM metrics_samples "
            "WHERE container = ? AND ts >= ? ORDER BY ts ASC",
            (container, since),
        )
        rows = [_row_to_dict(r) for r in cursor.fetchall()]
    return downsample(rows, max_points)


def prune_old(conn_or_path: Any, max_age_days: float = 14, now: Optional[float] = None) -> int:
    """Delete samples older than ``max_age_days``. Returns rows deleted."""
    if now is None:
        now = time.time()
    cutoff = now - max_age_days * 86400
    with db.resolve_conn(conn_or_path) as conn:
        db.run_migrations(conn)
        cur = conn.execute("DELETE FROM metrics_samples WHERE ts < ?", (cutoff,))
        conn.commit()
        return cur.rowcount


class MetricsSampler:
    """Background sampler that periodically calls ``collect()`` and stores it.

    ``collect`` must return either a ``dict`` sample or a ``(container, sample)``
    / ``(container, sample, players)`` tuple, or a list of such tuples for
    multiple containers. Nothing is started on construction; call :meth:`start`.
    """

    def __init__(
        self,
        conn_path: Any,
        collect: Callable[[], Any],
        interval: float = 15.0,
    ):
        self.conn_path = conn_path
        self.collect = collect
        self.interval = interval
        self._thread: Optional[threading.Thread] = None
        self._stop = threading.Event()

    def sample_once(self, now: Optional[float] = None) -> int:
        """Run ``collect`` once and persist. Returns the number of rows written."""
        try:
            result = self.collect()
        except Exception:
            return 0
        if result is None:
            return 0
        entries = result if isinstance(result, list) else [result]
        written = 0
        for entry in entries:
            container = "valheim-server"
            players = None
            sample: dict = {}
            if isinstance(entry, dict):
                sample = entry
                container = entry.get("container", container)
                players = entry.get("players")
            elif isinstance(entry, (tuple, list)):
                if len(entry) >= 2:
                    container, sample = entry[0], entry[1]
                if len(entry) >= 3:
                    players = entry[2]
            else:
                continue
            try:
                record_sample(self.conn_path, container, sample or {}, ts=now, players=players)
                written += 1
            except Exception:
                continue
        return written

    def _run(self) -> None:
        while not self._stop.is_set():
            self.sample_once()
            self._stop.wait(self.interval)

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._run, name="metrics-sampler", daemon=True)
        self._thread.start()

    def stop(self, timeout: float = 5.0) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=timeout)
            self._thread = None
