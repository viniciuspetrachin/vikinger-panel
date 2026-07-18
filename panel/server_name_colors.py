"""Parse and validate Valheim server name color tags."""

from __future__ import annotations

import re

COLOR_TAG_RE = re.compile(r"<color=([^>]+)>([\s\S]*?)(?:</color>|(?=<color=)|$)", re.IGNORECASE)
HEX_SHORT_RE = re.compile(r"<#([0-9A-Fa-f]{3,8})>([\s\S]*?)(?=<#|$)")

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


def strip_color_tags(name: str) -> str:
    text = name or ""
    text = COLOR_TAG_RE.sub(r"\2", text)
    text = HEX_SHORT_RE.sub(r"\2", text)
    text = re.sub(r"</?color[^>]*>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<#[0-9A-Fa-f]{3,8}>", "", text, flags=re.IGNORECASE)
    return text


def validate_colored_server_name(name: str) -> None:
    """Raise ValueError when Valheim color rules are violated."""
    segments: list[tuple[str, str]] = []
    for match in COLOR_TAG_RE.finditer(name or ""):
        segments.append((_normalize_color(match.group(1)), match.group(2)))
    for match in HEX_SHORT_RE.finditer(name or ""):
        segments.append((_normalize_color(f"#{match.group(1)}"), match.group(2)))

    colors = [c for c, _ in segments if c]
    if not colors:
        return

    unique = set(colors)
    has_hex = any(is_hex_color(c) for c in unique)
    if has_hex:
        if len(unique) > 1 or len([c for c in colors if c]) > 1:
            raise ValueError("Hex color allows only one color in the server name")
        return

    if len(unique) > 2:
        raise ValueError("Server name supports at most two different named colors")
