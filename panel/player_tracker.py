"""Merge log-parsed players with RCON names and track sessions.

The panel discovers online players from two sources:

  * server logs  — reliable steam_id + name (see ``parse_players_from_logs``).
  * RCON ``list`` — a bare list of display names (no steam_id).

:func:`merge_players` reconciles the two into a single enriched list. Session
duration is persisted in the ``player_sessions`` table: a new steam_id gets a
``first_seen`` stamp; subsequent sightings bump ``last_seen``; ``session_seconds``
is ``last_seen - first_seen``. This module never touches RCON/docker itself —
callers pass already-parsed inputs.
"""

from __future__ import annotations

import time
from typing import Any, Optional

import db

BIOME_PLACEHOLDER = "—"

# A player is considered to have started a fresh session if they reappear after
# being absent for longer than this many seconds.
STALE_SESSION_SECONDS = 300


def compute_session_seconds(first_seen: Optional[float], now: float) -> int:
    """Return non-negative ``now - first_seen`` in whole seconds."""
    if first_seen is None:
        return 0
    return max(0, int(now - first_seen))


def merge_players(log_players: list[dict], rcon_names: list[str]) -> list[dict]:
    """Combine log players (steam_id + name) with RCON display names.

    Returns entries shaped ``{name, steam_id, ping, biome, session_seconds}``.
    Log players are authoritative (they carry steam_id). RCON names not matched
    to any log player are appended with ``steam_id=None``. Matching is by exact
    (case-insensitive) name; matched RCON names are consumed so duplicates are
    not double-counted.
    """
    remaining = list(rcon_names or [])
    result: list[dict] = []
    seen_steam: set[str] = set()

    for lp in log_players or []:
        steam_id = lp.get("steam_id")
        name = lp.get("name") or steam_id or "?"
        if steam_id is not None and steam_id in seen_steam:
            continue
        if steam_id is not None:
            seen_steam.add(steam_id)
        # Consume a matching rcon name if present (case-insensitive).
        for i, rn in enumerate(remaining):
            if rn.strip().lower() == str(name).strip().lower():
                remaining.pop(i)
                break
        result.append(
            {
                "name": name,
                "steam_id": steam_id,
                "ping": None,
                "biome": BIOME_PLACEHOLDER,
                "session_seconds": 0,
            }
        )

    # RCON-only players (present in list but not in logs).
    for rn in remaining:
        result.append(
            {
                "name": rn,
                "steam_id": None,
                "ping": None,
                "biome": BIOME_PLACEHOLDER,
                "session_seconds": 0,
            }
        )
    return result


def update_sessions(
    conn_or_path: Any,
    players: list[dict],
    now: Optional[float] = None,
    stale_seconds: float = STALE_SESSION_SECONDS,
) -> dict[str, int]:
    """Upsert ``player_sessions`` for the given players.

    For each player with a steam_id: insert with ``first_seen=last_seen=now``
    on first sight; on subsequent sights bump ``last_seen=now``. If the player
    reappears after being absent longer than ``stale_seconds`` the session is
    reset (``first_seen=now``). Returns ``{steam_id: session_seconds}`` and
    writes the computed ``session_seconds`` back into each player dict.
    """
    if now is None:
        now = time.time()
    out: dict[str, int] = {}
    with db.resolve_conn(conn_or_path) as conn:
        db.run_migrations(conn)
        for p in players:
            steam_id = p.get("steam_id")
            if not steam_id:
                continue
            name = p.get("name")
            row = conn.execute(
                "SELECT first_seen, last_seen, name FROM player_sessions WHERE steam_id = ?",
                (steam_id,),
            ).fetchone()
            # Don't clobber a known character name with a Steam-ID placeholder.
            if row is not None:
                prev_name = row["name"]
                if (
                    (not name or name == steam_id)
                    and prev_name
                    and prev_name != steam_id
                ):
                    name = prev_name
            if row is None:
                conn.execute(
                    "INSERT INTO player_sessions (steam_id, name, first_seen, last_seen) "
                    "VALUES (?, ?, ?, ?)",
                    (steam_id, name, now, now),
                )
                first_seen = now
            else:
                first_seen = row["first_seen"]
                last_seen = row["last_seen"]
                # Reset the session start if they've been gone too long.
                if last_seen is not None and (now - last_seen) > stale_seconds:
                    first_seen = now
                conn.execute(
                    "UPDATE player_sessions SET name = ?, first_seen = ?, last_seen = ? "
                    "WHERE steam_id = ?",
                    (name, first_seen, now, steam_id),
                )
            seconds = compute_session_seconds(first_seen, now)
            out[steam_id] = seconds
            p["session_seconds"] = seconds
        conn.commit()
    return out


def close_stale_sessions(
    conn_or_path: Any,
    active_steam_ids: list[str],
    now: Optional[float] = None,
    stale_seconds: float = STALE_SESSION_SECONDS,
) -> list[str]:
    """Reset ``first_seen`` for previously-tracked players who are back online.

    Given the set of currently active steam_ids, any of them whose stored
    ``last_seen`` is older than ``stale_seconds`` has its session reset (their
    ``first_seen`` becomes ``now``). Returns the list of reset steam_ids.
    """
    if now is None:
        now = time.time()
    active = set(active_steam_ids or [])
    reset: list[str] = []
    if not active:
        return reset
    with db.resolve_conn(conn_or_path) as conn:
        db.run_migrations(conn)
        placeholders = ",".join("?" for _ in active)
        rows = conn.execute(
            f"SELECT steam_id, last_seen FROM player_sessions WHERE steam_id IN ({placeholders})",
            tuple(active),
        ).fetchall()
        for r in rows:
            last_seen = r["last_seen"]
            if last_seen is not None and (now - last_seen) > stale_seconds:
                conn.execute(
                    "UPDATE player_sessions SET first_seen = ?, last_seen = ? WHERE steam_id = ?",
                    (now, now, r["steam_id"]),
                )
                reset.append(r["steam_id"])
        conn.commit()
    return reset
