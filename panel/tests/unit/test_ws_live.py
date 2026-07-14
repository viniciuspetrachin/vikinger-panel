"""Testes do módulo ws_live (LiveHub broadcast + run_live_loop).

Sem pytest-asyncio: os coroutines são executados com asyncio.run.
"""

import asyncio
import json

import pytest

import ws_live

pytestmark = pytest.mark.unit


class FakeSocket:
    def __init__(self, fail=False):
        self.fail = fail
        self.messages = []

    async def send_text(self, text):
        if self.fail:
            raise RuntimeError("socket closed")
        self.messages.append(text)


class FakeSocketSend:
    """Socket that only exposes ``send`` (like raw websockets lib)."""

    def __init__(self):
        self.messages = []

    async def send(self, text):
        self.messages.append(text)


def test_register_and_count():
    async def scenario():
        hub = ws_live.LiveHub()
        a, b = FakeSocket(), FakeSocket()
        await hub.register(a)
        await hub.register(b)
        assert hub.count() == 2
        await hub.unregister(a)
        assert hub.count() == 1

    asyncio.run(scenario())


def test_broadcast_delivers_json():
    async def scenario():
        hub = ws_live.LiveHub()
        a, b = FakeSocket(), FakeSocket()
        await hub.register(a)
        await hub.register(b)
        delivered = await hub.broadcast({"hello": "world", "n": 1})
        assert delivered == 2
        assert json.loads(a.messages[0]) == {"hello": "world", "n": 1}

    asyncio.run(scenario())


def test_broadcast_drops_dead_sockets():
    async def scenario():
        hub = ws_live.LiveHub()
        good, bad = FakeSocket(), FakeSocket(fail=True)
        await hub.register(good)
        await hub.register(bad)
        delivered = await hub.broadcast({"x": 1})
        assert delivered == 1
        assert hub.count() == 1  # bad socket removed
        assert bad not in hub.connections

    asyncio.run(scenario())


def test_broadcast_supports_send_method():
    async def scenario():
        hub = ws_live.LiveHub()
        s = FakeSocketSend()
        await hub.register(s)
        await hub.broadcast({"a": 1})
        assert json.loads(s.messages[0]) == {"a": 1}

    asyncio.run(scenario())


def test_run_live_loop_stops_after_iterations():
    async def scenario():
        hub = ws_live.LiveHub()
        s = FakeSocket()
        await hub.register(s)
        state = {"n": 0}

        def build():
            state["n"] += 1
            return {"tick": state["n"]}

        # Stop after 2 iterations.
        def should_stop():
            return state["n"] >= 2

        iters = await ws_live.run_live_loop(hub, build, interval=0, should_stop=should_stop)
        assert iters == 2
        assert len(s.messages) == 2

    asyncio.run(scenario())


def test_run_live_loop_async_build_payload():
    async def scenario():
        hub = ws_live.LiveHub()
        s = FakeSocket()
        await hub.register(s)
        calls = {"n": 0}

        async def build():
            calls["n"] += 1
            return {"v": calls["n"]}

        iters = await ws_live.run_live_loop(
            hub, build, interval=0, should_stop=lambda: calls["n"] >= 1
        )
        assert iters == 1
        assert len(s.messages) == 1

    asyncio.run(scenario())


def test_run_live_loop_survives_build_error():
    async def scenario():
        hub = ws_live.LiveHub()
        state = {"n": 0}

        def build():
            state["n"] += 1
            raise ValueError("bad payload")

        iters = await ws_live.run_live_loop(
            hub, build, interval=0, should_stop=lambda: state["n"] >= 3
        )
        assert iters == 3

    asyncio.run(scenario())
