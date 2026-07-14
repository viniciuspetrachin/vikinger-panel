"""Framework-agnostic WebSocket live-push helper.

``LiveHub`` tracks a set of connected sockets and broadcasts JSON payloads,
transparently dropping any socket that errors on send. FastAPI's ``WebSocket``
is *not* imported at module level so the hub is testable with a trivial fake
async socket exposing ``send_text`` (or ``send``).

``run_live_loop`` periodically builds a payload (via an injected sync or async
``build_payload``) and broadcasts it, until ``should_stop()`` returns True.
"""

from __future__ import annotations

import asyncio
import inspect
import json
from typing import Any, Awaitable, Callable, Optional, Union


class LiveHub:
    """Manage a set of async WebSocket-like connections."""

    def __init__(self) -> None:
        self._connections: set[Any] = set()
        self._lock = asyncio.Lock()

    @property
    def connections(self) -> set[Any]:
        return self._connections

    def count(self) -> int:
        return len(self._connections)

    async def register(self, ws: Any) -> None:
        async with self._lock:
            self._connections.add(ws)

    async def unregister(self, ws: Any) -> None:
        async with self._lock:
            self._connections.discard(ws)

    @staticmethod
    async def _send(ws: Any, text: str) -> None:
        """Send ``text`` using whatever coroutine the socket exposes."""
        sender = getattr(ws, "send_text", None) or getattr(ws, "send", None)
        if sender is None:
            raise AttributeError("socket has no send_text/send method")
        result = sender(text)
        if inspect.isawaitable(result):
            await result

    async def broadcast(self, payload: dict) -> int:
        """Serialize ``payload`` to JSON and send to all sockets.

        Dead sockets (any that raise on send) are dropped. Returns the number
        of sockets successfully delivered to.
        """
        text = json.dumps(payload, default=str)
        # Snapshot to avoid mutation during iteration.
        targets = list(self._connections)
        dead: list[Any] = []
        delivered = 0
        for ws in targets:
            try:
                await self._send(ws, text)
                delivered += 1
            except Exception:
                dead.append(ws)
        if dead:
            async with self._lock:
                for ws in dead:
                    self._connections.discard(ws)
        return delivered


async def _maybe_await(value: Union[Any, Awaitable[Any]]) -> Any:
    if inspect.isawaitable(value):
        return await value
    return value


async def run_live_loop(
    hub: Any,
    build_payload: Callable[[], Union[dict, Awaitable[dict]]],
    interval: float = 1.5,
    should_stop: Optional[Callable[[], bool]] = None,
) -> int:
    """Loop building + broadcasting payloads until ``should_stop`` is truthy.

    ``build_payload`` may be sync or async. ``should_stop`` is checked before
    each iteration; when omitted the loop runs forever. Returns the number of
    iterations performed (useful for tests). Exceptions from ``build_payload``
    skip that iteration rather than crashing the loop.
    """
    iterations = 0
    while True:
        if should_stop is not None and should_stop():
            break
        try:
            payload = await _maybe_await(build_payload())
        except Exception:
            payload = None
        if payload is not None:
            await hub.broadcast(payload)
        iterations += 1
        if should_stop is not None and should_stop():
            break
        await asyncio.sleep(interval)
    return iterations
