"""Container metrics collection and normalization.

The parse helpers here are intentionally standalone (not imported from
``main``) so this module has no circular dependency and every pure function is
unit-testable without docker.

Docker's ``CPUPerc`` is a *host* percentage (already summed across all cores),
so a value of ``80%`` on an 8-core host means "80% of one core's worth spread
over the machine", i.e. 10% of total capacity. ``normalize_cpu`` exposes both
views:

  * ``cpu_percent_host``      — raw host %, exactly as docker reports.
  * ``cpu_percent_of_limit``  — host % divided by the CPU count (0-100), i.e.
    fraction of the container's available CPU it is actually using.

``SampleSmoother`` keeps a short moving average of the host CPU value per
container to dampen the spiky readings docker returns.
"""

from __future__ import annotations

import json
import re
import subprocess
from collections import deque
from pathlib import Path
from typing import Any, Callable, Iterable, Optional

ROOT = Path(__file__).resolve().parent.parent

_SIZE_UNIT = {
    "B": 1,
    "kB": 1000,
    "KB": 1000,
    "KiB": 1024,
    "MB": 1000**2,
    "MiB": 1024**2,
    "GB": 1000**3,
    "GiB": 1024**3,
    "TB": 1000**4,
    "TiB": 1024**4,
}


def parse_size(value: str) -> int:
    """Convert a docker size string (``1.5GiB``, ``900kB``, ``12B``) to bytes.

    Unknown/empty/malformed input yields ``0``. Decimal (kB/MB/GB) and binary
    (KiB/MiB/GiB) units are both supported.
    """
    if not value:
        return 0
    value = value.strip()
    m = re.match(r"^([\d.]+)\s*([A-Za-z]*)$", value)
    if not m:
        return 0
    try:
        num = float(m.group(1))
    except ValueError:
        return 0
    unit = m.group(2) or "B"
    mult = _SIZE_UNIT.get(unit, 1)
    return int(num * mult)


def parse_io_pair(raw: str) -> tuple[int, int]:
    """Parse a ``"1.2kB / 3.4MB"`` pair into ``(bytes, bytes)``."""
    if not raw:
        return 0, 0
    parts = [p.strip() for p in raw.split("/")]
    if len(parts) != 2:
        return 0, 0
    return parse_size(parts[0]), parse_size(parts[1])


def parse_percent(raw: str) -> float:
    """Parse ``"12.3%"`` -> ``12.3``. Returns ``0.0`` on bad input."""
    if not raw:
        return 0.0
    cleaned = raw.replace("%", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def parse_mem_usage(raw: str) -> tuple[int, int]:
    """Parse ``"1.5GiB / 4GiB"`` -> ``(used_bytes, limit_bytes)``."""
    return parse_io_pair(raw)


def normalize_cpu(host_percent: float, n_cpus: int) -> dict:
    """Return both CPU views from a raw host percentage.

    ``n_cpus`` <= 0 is treated as 1. ``cpu_percent_of_limit`` is capped at 100.
    """
    if n_cpus <= 0:
        n_cpus = 1
    host = float(host_percent)
    of_limit = min(host / n_cpus, 100.0)
    return {
        "cpu_percent_host": round(host, 1),
        "cpu_percent_of_limit": round(of_limit, 1),
    }


def moving_average(values: Iterable[float], window: int = 5) -> float:
    """Average of the last ``window`` values. Empty input -> ``0.0``."""
    vals = list(values)
    if not vals:
        return 0.0
    if window > 0:
        vals = vals[-window:]
    return sum(vals) / len(vals)


class MovingAverage:
    """Fixed-window moving average over a stream of pushed values."""

    def __init__(self, window: int = 5):
        self.window = max(1, int(window))
        self._buf: deque[float] = deque(maxlen=self.window)

    def add(self, value: float) -> float:
        self._buf.append(float(value))
        return self.value

    @property
    def value(self) -> float:
        if not self._buf:
            return 0.0
        return sum(self._buf) / len(self._buf)

    def reset(self) -> None:
        self._buf.clear()


class SampleSmoother:
    """Per-container ring buffer smoothing of host CPU percentages."""

    def __init__(self, window: int = 5):
        self.window = max(1, int(window))
        self._buffers: dict[str, deque[float]] = {}

    def add(self, container: str, host_percent: float) -> float:
        """Push a new host CPU reading and return the smoothed value."""
        buf = self._buffers.get(container)
        if buf is None:
            buf = deque(maxlen=self.window)
            self._buffers[container] = buf
        buf.append(float(host_percent))
        return sum(buf) / len(buf)

    def get(self, container: str) -> float:
        buf = self._buffers.get(container)
        if not buf:
            return 0.0
        return sum(buf) / len(buf)

    def reset(self, container: Optional[str] = None) -> None:
        if container is None:
            self._buffers.clear()
        else:
            self._buffers.pop(container, None)


def _empty_metrics() -> dict:
    return {
        "running": False,
        "cpu_percent_host": 0.0,
        "cpu_percent_of_limit": 0.0,
        "memory_used_bytes": 0,
        "memory_limit_bytes": 0,
        "memory_percent": 0.0,
        "net_rx_bytes": 0,
        "net_tx_bytes": 0,
        "block_read_bytes": 0,
        "block_write_bytes": 0,
    }


def default_docker_fn(*args: str, timeout: int = 120) -> subprocess.CompletedProcess:
    """Module-level docker runner. Degrades gracefully when docker is absent."""
    try:
        return subprocess.run(
            ["docker", *args],
            capture_output=True,
            text=True,
            cwd=ROOT,
            timeout=timeout,
        )
    except (OSError, subprocess.SubprocessError):
        return subprocess.CompletedProcess(args=list(args), returncode=1, stdout="", stderr="")


def stats_for_container(
    name: str,
    docker_fn: Callable[..., Any] = default_docker_fn,
    n_cpus: int = 1,
) -> dict:
    """Return a normalized metrics dict for ``name``.

    ``docker_fn`` is injected (defaults to :func:`default_docker_fn`) and must
    behave like ``subprocess.run`` returning an object with ``.returncode`` and
    ``.stdout`` (a ``{{json .}}`` docker stats line). Any failure / non-json
    output yields safe zeros with ``running=False``.
    """
    result = _empty_metrics()
    try:
        proc = docker_fn(
            "stats", name, "--no-stream", "--format", "{{json .}}", timeout=10
        )
    except TypeError:
        # Fake docker_fn that doesn't accept timeout kwarg.
        try:
            proc = docker_fn("stats", name, "--no-stream", "--format", "{{json .}}")
        except Exception:
            return result
    except Exception:
        return result

    if proc is None or getattr(proc, "returncode", 1) != 0:
        return result
    stdout = (getattr(proc, "stdout", "") or "").strip()
    if not stdout:
        return result
    try:
        stats = json.loads(stdout)
    except (json.JSONDecodeError, TypeError, ValueError):
        return result

    mem_used, mem_limit = parse_mem_usage(stats.get("MemUsage", ""))
    net_rx, net_tx = parse_io_pair(stats.get("NetIO", ""))
    block_read, block_write = parse_io_pair(stats.get("BlockIO", ""))
    host_cpu = parse_percent(stats.get("CPUPerc", "0%"))
    cpu = normalize_cpu(host_cpu, n_cpus)

    mem_percent = parse_percent(stats.get("MemPerc", ""))
    if mem_percent == 0.0 and mem_limit:
        mem_percent = round(mem_used / mem_limit * 100, 1)

    return {
        "running": True,
        "cpu_percent_host": cpu["cpu_percent_host"],
        "cpu_percent_of_limit": cpu["cpu_percent_of_limit"],
        "memory_used_bytes": mem_used,
        "memory_limit_bytes": mem_limit,
        "memory_percent": mem_percent,
        "net_rx_bytes": net_rx,
        "net_tx_bytes": net_tx,
        "block_read_bytes": block_read,
        "block_write_bytes": block_write,
    }


_SUM_KEYS = (
    "cpu_percent_host",
    "cpu_percent_of_limit",
    "memory_used_bytes",
    "memory_limit_bytes",
    "net_rx_bytes",
    "net_tx_bytes",
    "block_read_bytes",
    "block_write_bytes",
)


def aggregate(container_metrics_list: Iterable[dict]) -> dict:
    """Sum a list of per-container metrics into one aggregate dict.

    CPU host percentages are summed (panel + server total load); memory used
    and limit are summed and the aggregate ``memory_percent`` is recomputed.
    ``running`` is True if any input container is running.
    """
    result = _empty_metrics()
    metrics = list(container_metrics_list)
    if not metrics:
        return result
    for m in metrics:
        for key in _SUM_KEYS:
            result[key] += m.get(key, 0) or 0
        if m.get("running"):
            result["running"] = True
    result["cpu_percent_host"] = round(result["cpu_percent_host"], 1)
    result["cpu_percent_of_limit"] = round(min(result["cpu_percent_of_limit"], 100.0), 1)
    if result["memory_limit_bytes"]:
        result["memory_percent"] = round(
            result["memory_used_bytes"] / result["memory_limit_bytes"] * 100, 1
        )
    return result
