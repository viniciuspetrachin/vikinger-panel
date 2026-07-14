"""Testes do módulo player_tracker (merge + sessões)."""

import pytest

import db
import player_tracker as pt

pytestmark = pytest.mark.unit


# --- merge_players ----------------------------------------------------------

def test_merge_players_shape():
    out = pt.merge_players(
        [{"name": "Ragnar", "steam_id": "111"}],
        ["Ragnar"],
    )
    assert len(out) == 1
    p = out[0]
    assert p == {
        "name": "Ragnar",
        "steam_id": "111",
        "ping": None,
        "biome": pt.BIOME_PLACEHOLDER,
        "session_seconds": 0,
    }


def test_merge_players_rcon_only_appended():
    out = pt.merge_players(
        [{"name": "Ragnar", "steam_id": "111"}],
        ["Ragnar", "Lagertha"],
    )
    names = {p["name"] for p in out}
    assert names == {"Ragnar", "Lagertha"}
    lagertha = next(p for p in out if p["name"] == "Lagertha")
    assert lagertha["steam_id"] is None


def test_merge_players_case_insensitive_match():
    out = pt.merge_players(
        [{"name": "Ragnar", "steam_id": "111"}],
        ["ragnar"],
    )
    # Only one entry; rcon name consumed by match.
    assert len(out) == 1


def test_merge_players_dedup_steam():
    out = pt.merge_players(
        [{"name": "A", "steam_id": "1"}, {"name": "A2", "steam_id": "1"}],
        [],
    )
    assert len(out) == 1


def test_merge_players_empty():
    assert pt.merge_players([], []) == []


# --- compute_session_seconds ------------------------------------------------

def test_compute_session_seconds():
    assert pt.compute_session_seconds(None, 100) == 0
    assert pt.compute_session_seconds(100.0, 160.0) == 60
    assert pt.compute_session_seconds(200.0, 100.0) == 0  # clamps negative


# --- update_sessions --------------------------------------------------------

def test_update_sessions_new_and_bump(tmp_path):
    conn = db.init_db(tmp_path / "p.db")
    players = [{"name": "Ragnar", "steam_id": "111"}]
    out = pt.update_sessions(conn, players, now=1000.0)
    assert out["111"] == 0
    # 60s later, same session.
    out2 = pt.update_sessions(conn, [{"name": "Ragnar", "steam_id": "111"}], now=1060.0)
    assert out2["111"] == 60
    conn.close()


def test_update_sessions_writes_back(tmp_path):
    conn = db.init_db(tmp_path / "p.db")
    players = [{"name": "R", "steam_id": "1"}]
    pt.update_sessions(conn, players, now=1000.0)
    pt.update_sessions(conn, players, now=1030.0)
    assert players[0]["session_seconds"] == 30
    conn.close()


def test_update_sessions_resets_after_stale(tmp_path):
    conn = db.init_db(tmp_path / "p.db")
    p = [{"name": "R", "steam_id": "1"}]
    pt.update_sessions(conn, p, now=1000.0)
    # Reappears 10 min later (> 300s stale) -> session resets.
    out = pt.update_sessions(conn, p, now=1000.0 + 600, stale_seconds=300)
    assert out["1"] == 0
    conn.close()


def test_update_sessions_ignores_no_steam(tmp_path):
    conn = db.init_db(tmp_path / "p.db")
    out = pt.update_sessions(conn, [{"name": "Anon", "steam_id": None}], now=1.0)
    assert out == {}
    conn.close()


def test_close_stale_sessions(tmp_path):
    conn = db.init_db(tmp_path / "p.db")
    pt.update_sessions(conn, [{"name": "R", "steam_id": "1"}], now=1000.0)
    reset = pt.close_stale_sessions(conn, ["1"], now=1000.0 + 600, stale_seconds=300)
    assert reset == ["1"]
    # Not stale -> not reset.
    reset2 = pt.close_stale_sessions(conn, ["1"], now=1000.0 + 700, stale_seconds=300)
    assert reset2 == []
    conn.close()


def test_close_stale_sessions_empty(tmp_path):
    conn = db.init_db(tmp_path / "p.db")
    assert pt.close_stale_sessions(conn, [], now=1.0) == []
    conn.close()
