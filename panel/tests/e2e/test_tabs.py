"""E2E Playwright — navega cada aba do painel sem erros 500."""

import pytest
from playwright.sync_api import Page, expect

pytestmark = pytest.mark.e2e

TAB_LABELS_DEFAULT = [
    "Visão Geral",
    "Servidor",
    "Mundos",
    "Mods e Configs",
    "Backups",
    "Ajuda",
    "Sobre",
]

TAB_LABELS_ADVANCED = [
    "Recursos",
    "Arquivos",
    "Logs",
    "Auditoria",
]


def enable_advanced_mode(page: Page) -> None:
    page.locator("label").filter(has_text="Modo avançado").click()
    page.wait_for_timeout(400)


def goto_tab(page: Page, label: str) -> None:
    page.get_by_role("button", name=label, exact=True).click()
    page.wait_for_timeout(500)


def assert_no_error_toast(page: Page) -> None:
    expect(page.locator(".bg-red-900\\/90")).to_have_count(0)


def test_all_default_tabs_load_without_500(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")

    for label in TAB_LABELS_DEFAULT:
        goto_tab(page, label)
        assert_no_error_toast(page)


def test_advanced_tabs_load_without_500(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    enable_advanced_mode(page)

    for label in TAB_LABELS_ADVANCED:
        goto_tab(page, label)
        assert_no_error_toast(page)


def test_help_faq_search(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "Ajuda")

    expect(page.get_by_placeholder("Buscar no FAQ...")).to_be_visible()
    page.get_by_placeholder("Buscar no FAQ...").fill("crossplay")
    expect(page.get_by_text("Como habilito crossplay")).to_be_visible()


def test_about_version(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "Sobre")

    expect(page.get_by_role("main").get_by_role("heading", name="Vikinger Panel")).to_be_visible()
    expect(page.get_by_text("Novidades")).to_be_visible()
    expect(page.get_by_role("main").get_by_text("v2.0.0")).to_be_visible()


def test_dashboard_connect_block(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")

    expect(page.get_by_role("heading", name="Como conectar", exact=True)).to_be_visible()
    expect(page.get_by_role("button", name="Copiar endereço", exact=True)).to_be_visible()
    assert_no_error_toast(page)


def test_files_all_scopes(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    enable_advanced_mode(page)
    goto_tab(page, "Arquivos")

    for scope in ("config", "data", "root"):
        page.get_by_role("button", name=scope, exact=True).click()
        page.wait_for_timeout(400)
        assert_no_error_toast(page)


def test_logs_sources(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    enable_advanced_mode(page)
    goto_tab(page, "Logs")

    for source in ("Docker", "BepInEx"):
        page.get_by_role("button", name=source, exact=True).click()
        page.wait_for_timeout(400)
        assert_no_error_toast(page)


def test_backups_tab_content(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "Backups")

    expect(page.get_by_text("Configuração de Backups")).to_be_visible()
    expect(page.get_by_text("Backups Armazenados")).to_be_visible()
    assert_no_error_toast(page)
