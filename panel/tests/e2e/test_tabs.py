"""E2E Playwright — navega cada aba do painel sem erros 500."""

import pytest
from playwright.sync_api import Page, expect

pytestmark = pytest.mark.e2e

TAB_LABELS = [
    "Overview",
    "Server",
    "Worlds",
    "Mods & Config",
    "Backups",
    "Files",
    "Logs",
    "Audit",
    "Help",
    "About",
]


def goto_tab(page: Page, label: str) -> None:
    page.get_by_role("button", name=label, exact=True).click()
    page.wait_for_timeout(500)


def assert_no_error_toast(page: Page) -> None:
    expect(page.locator(".bg-red-900\\/90")).to_have_count(0)


def test_all_tabs_load_without_500(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")

    for label in TAB_LABELS:
        goto_tab(page, label)
        assert_no_error_toast(page)


def test_help_faq_search(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "Help")

    expect(page.get_by_placeholder("Search FAQ...")).to_be_visible()
    page.get_by_placeholder("Search FAQ...").fill("crossplay")
    expect(page.get_by_text("How do I enable crossplay")).to_be_visible()


def test_about_version(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "About")

    expect(page.get_by_role("main").get_by_role("heading", name="Vikinger Panel")).to_be_visible()
    expect(page.get_by_text("What's new")).to_be_visible()
    expect(page.get_by_role("main").get_by_text("v2.0.0")).to_be_visible()


def test_dashboard_connect_block(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")

    expect(page.get_by_role("heading", name="How to connect", exact=True)).to_be_visible()
    expect(page.get_by_role("button", name="Copy address", exact=True)).to_be_visible()
    assert_no_error_toast(page)


def test_files_all_scopes(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "Files")

    for scope in ("Config", "Data"):
        page.get_by_role("button", name=scope, exact=True).click()
        page.wait_for_timeout(400)
        assert_no_error_toast(page)


def test_logs_sources(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "Logs")

    for source in ("Docker", "BepInEx"):
        page.get_by_role("button", name=source, exact=True).click()
        page.wait_for_timeout(400)
        assert_no_error_toast(page)


def test_backups_tab_content(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "Backups")

    expect(page.get_by_role("heading", name="Automatic scheduling")).to_be_visible()
    expect(page.get_by_role("heading", name="Stored backups")).to_be_visible()
    expect(page.get_by_text("Server state")).to_be_visible()
    assert_no_error_toast(page)
