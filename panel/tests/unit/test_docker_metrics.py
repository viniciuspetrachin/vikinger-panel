"""Testes do módulo docker_metrics (parsing + normalização de CPU)."""

import json

import pytest

import docker_metrics as dm

pytestmark = pytest.mark.unit


class FakeCompleted:
    def __init__(self, returncode=0, stdout="", stderr=""):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


# --- parse_size -------------------------------------------------------------

@pytest.mark.parametrize(
    "text,expected",
    [
        ("0B", 0),
        ("512B", 512),
        ("1kB", 1000),
        ("1KiB", 1024),
        ("1.5GiB", int(1.5 * 1024**3)),
        ("2MB", 2 * 1000**2),
        ("2MiB", 2 * 1024**2),
        ("1TB", 1000**4),
        ("1TiB", 1024**4),
        ("100", 100),  # no unit -> bytes
        ("", 0),
        ("garbage", 0),
    ],
)
def test_parse_size(text, expected):
    assert dm.parse_size(text) == expected


def test_parse_io_pair():
    assert dm.parse_io_pair("1.2kB / 3.4MB") == (1200, int(3.4 * 1000**2))
    assert dm.parse_io_pair("bad") == (0, 0)
    assert dm.parse_io_pair("") == (0, 0)


def test_parse_percent():
    assert dm.parse_percent("12.3%") == 12.3
    assert dm.parse_percent("0%") == 0.0
    assert dm.parse_percent("") == 0.0
    assert dm.parse_percent("abc%") == 0.0


def test_parse_mem_usage():
    used, limit = dm.parse_mem_usage("1.5GiB / 4GiB")
    assert used == int(1.5 * 1024**3)
    assert limit == 4 * 1024**3


# --- normalize_cpu ----------------------------------------------------------

def test_normalize_cpu_host_vs_limit():
    # 80% host on an 8-core box => 10% of the container's available capacity.
    out = dm.normalize_cpu(80.0, 8)
    assert out["cpu_percent_host"] == 80.0
    assert out["cpu_percent_of_limit"] == 10.0


def test_normalize_cpu_single_core():
    out = dm.normalize_cpu(55.5, 1)
    assert out["cpu_percent_host"] == 55.5
    assert out["cpu_percent_of_limit"] == 55.5


def test_normalize_cpu_guards_zero_cpus():
    out = dm.normalize_cpu(40.0, 0)
    assert out["cpu_percent_of_limit"] == 40.0


def test_normalize_cpu_caps_of_limit():
    out = dm.normalize_cpu(400.0, 1)
    assert out["cpu_percent_of_limit"] == 100.0


# --- moving average / smoother ---------------------------------------------

def test_moving_average_pure():
    assert dm.moving_average([], 5) == 0.0
    assert dm.moving_average([10, 20, 30], 5) == 20.0
    assert dm.moving_average([1, 2, 3, 4, 5, 6], window=3) == 5.0  # last 3


def test_moving_average_class():
    ma = dm.MovingAverage(window=3)
    ma.add(90)
    ma.add(0)
    assert ma.value == 45.0
    ma.add(0)
    ma.add(0)  # 90 falls out of window of 3
    assert ma.value == 0.0


def test_sample_smoother_dampens_spike():
    """An 80% spike followed by zeros smooths toward 0 as the window fills."""
    sm = dm.SampleSmoother(window=5)
    assert sm.add("valheim-server", 80.0) == 80.0
    sm.add("valheim-server", 0.0)  # (80+0)/2 = 40
    assert sm.get("valheim-server") == 40.0
    sm.add("valheim-server", 0.0)
    sm.add("valheim-server", 0.0)
    sm.add("valheim-server", 0.0)  # window full: 80/5 = 16
    assert sm.get("valheim-server") == pytest.approx(16.0)
    sm.add("valheim-server", 0.0)  # 80 pushed out -> 0
    assert sm.get("valheim-server") == 0.0


def test_sample_smoother_per_container():
    sm = dm.SampleSmoother(window=5)
    sm.add("a", 10)
    sm.add("b", 20)
    assert sm.get("a") == 10
    assert sm.get("b") == 20
    assert sm.get("unknown") == 0.0


# --- stats_for_container ----------------------------------------------------

def _stats_line(**over):
    base = {
        "CPUPerc": "80.00%",
        "MemUsage": "1.5GiB / 4GiB",
        "MemPerc": "37.50%",
        "NetIO": "1kB / 2kB",
        "BlockIO": "3kB / 4kB",
    }
    base.update(over)
    return json.dumps(base)


def test_stats_for_container_parses(monkeypatch):
    def fake_docker(*args, **kw):
        return FakeCompleted(0, _stats_line())

    out = dm.stats_for_container("valheim-server", fake_docker, n_cpus=8)
    assert out["running"] is True
    assert out["cpu_percent_host"] == 80.0
    assert out["cpu_percent_of_limit"] == 10.0
    assert out["memory_used_bytes"] == int(1.5 * 1024**3)
    assert out["memory_percent"] == 37.5
    assert out["net_rx_bytes"] == 1000
    assert out["block_write_bytes"] == 4000


def test_stats_for_container_docker_absent():
    def failing(*args, **kw):
        raise FileNotFoundError("docker not found")

    out = dm.stats_for_container("x", failing)
    assert out["running"] is False
    assert out["cpu_percent_host"] == 0.0


def test_stats_for_container_bad_json():
    out = dm.stats_for_container("x", lambda *a, **k: FakeCompleted(0, "not json"))
    assert out["running"] is False


def test_stats_for_container_nonzero_rc():
    out = dm.stats_for_container("x", lambda *a, **k: FakeCompleted(1, ""))
    assert out["running"] is False


def test_stats_for_container_mem_percent_fallback():
    line = _stats_line(MemPerc="0%")
    out = dm.stats_for_container("x", lambda *a, **k: FakeCompleted(0, line), n_cpus=1)
    assert out["memory_percent"] == 37.5


# --- aggregate --------------------------------------------------------------

def test_aggregate_sums():
    a = dm.stats_for_container("a", lambda *x, **k: FakeCompleted(0, _stats_line()), 8)
    b = dm.stats_for_container(
        "b",
        lambda *x, **k: FakeCompleted(0, _stats_line(CPUPerc="8.00%", MemUsage="0.5GiB / 4GiB")),
        8,
    )
    agg = dm.aggregate([a, b])
    assert agg["running"] is True
    assert agg["cpu_percent_host"] == 88.0
    assert agg["memory_used_bytes"] == a["memory_used_bytes"] + b["memory_used_bytes"]


def test_aggregate_empty():
    agg = dm.aggregate([])
    assert agg["running"] is False
    assert agg["cpu_percent_host"] == 0.0
