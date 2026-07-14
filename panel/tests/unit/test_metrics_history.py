"""Testes do módulo metrics_history (persistência + downsample + sampler)."""

import time

import pytest

import db
import metrics_history as mh

pytestmark = pytest.mark.unit


def _sample(cpu=50.0, mem=1000):
    return {
        "cpu_percent_host": cpu,
        "cpu_percent_of_limit": cpu / 8,
        "memory_used_bytes": mem,
        "memory_limit_bytes": 4000,
        "memory_percent": mem / 4000 * 100,
        "net_rx_bytes": 10,
        "net_tx_bytes": 20,
    }


def test_record_and_query(tmp_path):
    conn = db.init_db(tmp_path / "p.db")
    now = time.time()
    mh.record_sample(conn, "valheim-server", _sample(), ts=now, players=3)
    rows = mh.query_history(conn, "valheim-server", "1h", now=now + 1)
    assert len(rows) == 1
    assert rows[0]["cpu_host"] == 50.0
    assert rows[0]["players"] == 3
    conn.close()


def test_query_range_filters_out_old(tmp_path):
    conn = db.init_db(tmp_path / "p.db")
    now = time.time()
    mh.record_sample(conn, "c", _sample(), ts=now - 7200)  # 2h ago
    mh.record_sample(conn, "c", _sample(), ts=now - 60)    # 1m ago
    rows_1h = mh.query_history(conn, "c", "1h", now=now)
    assert len(rows_1h) == 1
    rows_24h = mh.query_history(conn, "c", "24h", now=now)
    assert len(rows_24h) == 2
    conn.close()


def test_query_unknown_range(tmp_path):
    conn = db.init_db(tmp_path / "p.db")
    assert mh.query_history(conn, "c", "nope") == []
    conn.close()


def test_query_container_isolation(tmp_path):
    conn = db.init_db(tmp_path / "p.db")
    now = time.time()
    mh.record_sample(conn, "valheim-server", _sample(cpu=10), ts=now)
    mh.record_sample(conn, "vikinger-panel", _sample(cpu=20), ts=now)
    rows = mh.query_history(conn, "vikinger-panel", "1h", now=now + 1)
    assert len(rows) == 1
    assert rows[0]["cpu_host"] == 20
    conn.close()


# --- downsample (pure) ------------------------------------------------------

def test_downsample_noop_when_small():
    rows = [{"ts": i, "cpu_host": i} for i in range(5)]
    assert mh.downsample(rows, 10) is rows


def test_downsample_buckets_and_averages():
    rows = [
        {"ts": float(i), "cpu_host": float(i), "cpu_limit": None,
         "mem_used": i, "mem_limit": None, "mem_percent": None,
         "net_rx_bps": None, "net_tx_bps": None, "players": None}
        for i in range(10)
    ]
    out = mh.downsample(rows, 5)
    assert len(out) == 5
    # First bucket = rows 0,1 -> avg cpu 0.5, avg ts 0.5
    assert out[0]["cpu_host"] == 0.5
    assert out[0]["ts"] == 0.5


def test_downsample_max_points_respected():
    rows = [{"ts": float(i), "cpu_host": float(i)} for i in range(1000)]
    out = mh.downsample(rows, 120)
    assert len(out) <= 120


def test_downsample_zero_maxpoints():
    rows = [{"ts": 1.0, "cpu_host": 2.0}]
    assert mh.downsample(rows, 0) is rows


# --- prune ------------------------------------------------------------------

def test_prune_old(tmp_path):
    conn = db.init_db(tmp_path / "p.db")
    now = time.time()
    mh.record_sample(conn, "c", _sample(), ts=now - 40 * 86400)  # 40d old
    mh.record_sample(conn, "c", _sample(), ts=now)
    deleted = mh.prune_old(conn, max_age_days=14, now=now)
    assert deleted == 1
    remaining = conn.execute("SELECT COUNT(*) FROM metrics_samples").fetchone()[0]
    assert remaining == 1
    conn.close()


# --- MetricsSampler ---------------------------------------------------------

def test_sampler_sample_once_dict(tmp_path):
    conn = db.init_db(tmp_path / "p.db")

    def collect():
        return {"container": "valheim-server", "players": 2, **_sample()}

    sampler = mh.MetricsSampler(conn, collect)
    assert sampler.sample_once() == 1
    rows = mh.query_history(conn, "valheim-server", "1h")
    assert len(rows) == 1
    assert rows[0]["players"] == 2
    conn.close()


def test_sampler_sample_once_list_of_tuples(tmp_path):
    conn = db.init_db(tmp_path / "p.db")

    def collect():
        return [
            ("valheim-server", _sample(), 5),
            ("vikinger-panel", _sample(cpu=3)),
        ]

    sampler = mh.MetricsSampler(conn, collect)
    assert sampler.sample_once() == 2
    conn.close()


def test_sampler_collect_error_safe(tmp_path):
    conn = db.init_db(tmp_path / "p.db")

    def collect():
        raise RuntimeError("boom")

    sampler = mh.MetricsSampler(conn, collect)
    assert sampler.sample_once() == 0
    conn.close()


def test_sampler_thread_start_stop(tmp_path):
    path = tmp_path / "p.db"
    db.init_db(path).close()
    calls = {"n": 0}

    def collect():
        calls["n"] += 1
        return {"container": "c", **_sample()}

    sampler = mh.MetricsSampler(path, collect, interval=0.01)
    sampler.start()
    time.sleep(0.1)
    sampler.stop()
    assert calls["n"] >= 1
