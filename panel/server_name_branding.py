"""Invisible server name branding suffix for VKP (Vikinger Panel)."""

from __future__ import annotations

SERVER_NAME_SUFFIX = " - Powered by VKP"
LEGACY_SERVER_NAME_SUFFIX = " - Powered by Vikinger Panel"
SERVER_NAME_BRANDING_KEY = "SERVER_NAME_BRANDING"
SERVER_NAME_MAX_LEN = 200


def strip_server_name_branding(name: str) -> str:
    text = (name or "").strip()
    for suffix in (SERVER_NAME_SUFFIX, LEGACY_SERVER_NAME_SUFFIX):
        if text.endswith(suffix):
            return text[: -len(suffix)].rstrip()
    return text


def branding_enabled(env: dict[str, str]) -> bool:
    return (env.get(SERVER_NAME_BRANDING_KEY) or "").strip().lower() != "off"


def resolve_server_name_for_env(raw_name: str, *, branding_on: bool) -> str:
    base = strip_server_name_branding(raw_name.strip())
    if not base:
        return base
    if not branding_on:
        return base
    return base + SERVER_NAME_SUFFIX


def effective_server_name(env: dict[str, str]) -> str:
    raw = (env.get("SERVER_NAME") or "").strip()
    if not raw:
        return "Valheim"
    if branding_enabled(env):
        return resolve_server_name_for_env(raw, branding_on=True)
    return raw


def server_name_meta(env: dict[str, str]) -> dict:
    raw = (env.get("SERVER_NAME") or "").strip()
    enabled = branding_enabled(env)
    base = strip_server_name_branding(raw) if enabled else raw
    effective = resolve_server_name_for_env(base, branding_on=enabled) if base else raw
    return {
        "branding_enabled": enabled,
        "suffix": SERVER_NAME_SUFFIX,
        "effective_name": effective or raw,
    }


def prepare_env_for_api(env: dict[str, str]) -> dict:
    values = dict(env)
    meta = server_name_meta(env)
    if "SERVER_NAME" in values or env.get("SERVER_NAME"):
        if meta["branding_enabled"]:
            values["SERVER_NAME"] = strip_server_name_branding(env.get("SERVER_NAME", ""))
        else:
            values["SERVER_NAME"] = (env.get("SERVER_NAME") or "").strip()
    return {"values": values, "server_name_meta": meta}


def apply_env_save(values: dict[str, str]) -> dict[str, str]:
    out = dict(values)
    raw_name = (out.get("SERVER_NAME") or "").strip()

    if not raw_name:
        out.pop(SERVER_NAME_BRANDING_KEY, None)
        return out

    base = strip_server_name_branding(raw_name)
    if len(base) > SERVER_NAME_MAX_LEN:
        raise ValueError(f"Server name too long (max {SERVER_NAME_MAX_LEN} characters)")

    from server_name_colors import validate_colored_server_name

    validate_colored_server_name(base)

    if (out.get(SERVER_NAME_BRANDING_KEY) or "").strip().lower() == "off":
        out["SERVER_NAME"] = base
        out[SERVER_NAME_BRANDING_KEY] = "off"
        return out

    if raw_name.endswith(SERVER_NAME_SUFFIX):
        out["SERVER_NAME"] = raw_name
        out.pop(SERVER_NAME_BRANDING_KEY, None)
        return out

    out["SERVER_NAME"] = base + SERVER_NAME_SUFFIX
    out.pop(SERVER_NAME_BRANDING_KEY, None)
    return out
