"""Testes do sistema de idiomas."""

import os

import pytest

from version import DEFAULT_LOCALE, SUPPORTED_LOCALES, default_locale, version_info


def test_default_locale_fallback():
    assert default_locale() == DEFAULT_LOCALE


def test_default_locale_from_env(monkeypatch):
    monkeypatch.setenv("PANEL_DEFAULT_LOCALE", "pt-BR")
    assert default_locale() == "pt-BR"


def test_default_locale_invalid_env(monkeypatch):
    monkeypatch.setenv("PANEL_DEFAULT_LOCALE", "fr-FR")
    assert default_locale() == DEFAULT_LOCALE


def test_version_info_includes_locale():
    info = version_info()
    assert info["default_locale"] == DEFAULT_LOCALE
    assert info["supported_locales"] == list(SUPPORTED_LOCALES)


@pytest.mark.parametrize("code", SUPPORTED_LOCALES)
def test_supported_locales_count(code):
    assert code in ("en-US", "pt-BR", "de-DE", "ru-RU", "es-ES")
