"""Parse and validate Valheim server name color tags."""

from __future__ import annotations

import re

COLOR_TAG_RE = re.compile(r"<color=([^>]+)>([\s\S]*?)(?:</color>|(?=<color=)|$)", re.IGNORECASE)
HEX_SHORT_RE = re.compile(r"<#([0-9A-Fa-f]{3,8})>([\s\S]*?)(?=<#|$)")

SERVER_NAME_FORBIDDEN_CHARS_RE = re.compile(r'["<>]')

SERVER_NAME_NAMED_COLORS = frozenset({
    "red", "green", "blue", "yellow", "orange", "cyan", "purple", "white",
})

SERVER_NAME_HEX_PRESETS = frozenset({"#FFD700", "#FF6600", "#FFFFFF"})

ALLOWED_SERVER_NAME_COLORS = SERVER_NAME_NAMED_COLORS | SERVER_NAME_HEX_PRESETS

# Legacy names still parsed from saved configs; not offered in the UI.
VALHEIM_NAMED_COLORS = frozenset({
    "red", "blue", "green", "yellow", "cyan", "magenta", "white", "black",
    "silver", "grey", "gray", "maroon", "olive", "lime", "navy", "teal", "orange", "purple",
})


def _normalize_color(raw: str) -> str:
    value = (raw or "").strip().strip("\"'")
    if not value:
        return ""
    if re.fullmatch(r"#[0-9A-Fa-f]{3,8}", value):
        return value.upper()
    lower = value.lower()
    return "grey" if lower == "gray" else lower


def is_hex_color(color: str) -> bool:
    return bool(re.fullmatch(r"#[0-9A-Fa-f]{3,8}", (color or "").strip()))


def is_allowed_server_name_color(color: str) -> bool:
    normalized = _normalize_color(color)
    if not normalized:
        return True
    if is_hex_color(normalized):
        return normalized.upper() in ALLOWED_SERVER_NAME_COLORS
    return normalized in ALLOWED_SERVER_NAME_COLORS


def strip_forbidden_server_name_chars(text: str) -> str:
    return SERVER_NAME_FORBIDDEN_CHARS_RE.sub("", text or "")


def strip_color_tags(name: str) -> str:
    text = name or ""
    text = COLOR_TAG_RE.sub(r"\2", text)
    text = HEX_SHORT_RE.sub(r"\2", text)
    text = re.sub(r"</?color[^>]*>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<#[0-9A-Fa-f]{3,8}>", "", text, flags=re.IGNORECASE)
    return text


def validate_colored_server_name(name: str) -> None:
    """Raise ValueError when Valheim color rules are violated."""
    plain = strip_color_tags(name or "")
    if SERVER_NAME_FORBIDDEN_CHARS_RE.search(plain):
        raise ValueError('Server name cannot contain quotes (") or angle brackets (< >)')

    segments: list[tuple[str, str]] = []
    for match in COLOR_TAG_RE.finditer(name or ""):
        segments.append((_normalize_color(match.group(1)), match.group(2)))
    for match in HEX_SHORT_RE.finditer(name or ""):
        segments.append((_normalize_color(f"#{match.group(1)}"), match.group(2)))

    colors = [c for c, _ in segments if c]
    if not colors:
        return

    for color in colors:
        if not is_allowed_server_name_color(color):
            raise ValueError(f"Unsupported server name color: {color}")

    unique = set(colors)
    has_hex = any(is_hex_color(c) for c in unique)
    if has_hex:
        if len(unique) > 1 or len([c for c in colors if c]) > 1:
            raise ValueError("Hex color allows only one color in the server name")
        return

    if len(unique) > 2:
        raise ValueError("Server name supports at most two different named colors")
