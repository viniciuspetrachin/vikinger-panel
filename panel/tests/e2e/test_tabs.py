"""E2E Playwright — navega cada aba do painel sem erros 500."""

import re

import pytest
from playwright.sync_api import Page, expect

pytestmark = pytest.mark.e2e

TAB_IDS = [
    "dashboard",
    "server",
    "worlds",
    "mods",
    "backups",
    "messages",
    "files",
    "logs",
    "audit",
    "help",
    "about",
]


def goto_tab(page: Page, tab_id: str) -> None:
    page.locator(f'[data-nav-id="{tab_id}"]').click()
    page.wait_for_timeout(500)


def assert_no_error_toast(page: Page) -> None:
    expect(page.locator(".bg-red-900\\/90")).to_have_count(0)


def test_all_tabs_load_without_500(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")

    for tab_id in TAB_IDS:
        goto_tab(page, tab_id)
        assert_no_error_toast(page)


def test_help_faq_search(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "help")

    search = page.locator('input[placeholder*="FAQ"]')
    expect(search).to_be_visible()
    search.fill("crossplay")
    expect(page.get_by_text("How do I enable crossplay")).to_be_visible()


def test_about_version(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "about")

    expect(page.get_by_role("main").get_by_role("heading", name="Vikinger Panel")).to_be_visible()
    expect(page.get_by_text("What's new")).to_be_visible()
    expect(page.get_by_text("Panel update")).to_be_visible()
    expect(page.get_by_text("Up to date", exact=False)).to_be_visible()


def test_dashboard_connect_block(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")

    expect(page.get_by_role("heading", name="How to connect", exact=True)).to_be_visible()
    expect(page.get_by_role("button", name="Copy address", exact=True)).to_be_visible()
    assert_no_error_toast(page)


def test_files_all_scopes(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "files")

    for scope in ("Config", "Data"):
        page.locator("button.btn-tab.flex").filter(has_text=scope).first.click()
        page.wait_for_timeout(400)
        assert_no_error_toast(page)


def test_logs_sources(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "logs")

    for source in ("Docker", "BepInEx"):
        page.get_by_role("button", name=source, exact=True).click()
        page.wait_for_timeout(400)
        assert_no_error_toast(page)


def test_backups_tab_content(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "backups")

    expect(page.get_by_role("heading", name="Automatic scheduling")).to_be_visible()
    expect(page.get_by_role("heading", name="Stored backups")).to_be_visible()
    expect(page.get_by_text("Server state")).to_be_visible()
    assert_no_error_toast(page)


def test_messages_tab_content(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_tab(page, "messages")

    expect(page.get_by_role("heading", name="Automatic messages")).to_be_visible()
    expect(page.locator("h3").filter(has_text=re.compile(r"^Messages$"))).to_be_visible()
    expect(page.get_by_role("button", name="New message")).to_be_visible()
    page.get_by_role("button", name="New message").click()
    expect(page.get_by_role("heading", name="New message")).to_be_visible()
    expect(page.get_by_text("Click a tag to insert:")).to_be_visible()
    assert_no_error_toast(page)
