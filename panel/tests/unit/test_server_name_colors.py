"""Tests for Valheim server name color validation."""

import pytest

from server_name_colors import strip_color_tags, validate_colored_server_name


def test_strip_color_tags():
    assert strip_color_tags("<color=red>My</color> Server") == "My Server"
    assert strip_color_tags("<#FF0000>Red") == "Red"


def test_validate_named_two_colors_ok():
    validate_colored_server_name("<color=red>A</color><color=blue>B</color>")


def test_validate_three_fragments_two_colors_ok():
    validate_colored_server_name(
        "<color=white> branco e </color><color=red>PSYDEV</color><color=white> vermelho e o final </color>"
    )


def test_validate_hex_single_ok():
    validate_colored_server_name("<color=#FFD700>Gold Server</color>")


def test_validate_hex_two_colors_fails():
    with pytest.raises(ValueError, match="Hex color allows only one"):
        validate_colored_server_name("<color=#FF0000>A</color><color=#0000FF>B</color>")


def test_validate_three_named_colors_fails():
    with pytest.raises(ValueError, match="at most two"):
        validate_colored_server_name(
            "<color=red>A</color><color=blue>B</color><color=green>C</color>"
        )
