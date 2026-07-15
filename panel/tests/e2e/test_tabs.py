"""E2E Playwright — navega cada destino do painel (nova IA) sem erros 500."""

import re

import pytest
from playwright.sync_api import Page, expect

pytestmark = pytest.mark.e2e

# Novos destinos primários da barra lateral.
PRIMARY_IDS = [
    "dashboard",
    "players",
    "mods",
    "map",
    "backups",
    "console",
    "metrics",
]

# Sub-seções sob o hub Config (acessadas via subnav).
CONFIG_IDS = [
    "server",
    "worlds",
    "messages",
    "alerts",
    "schedule",
    "files",
    "audit",
    "help",
    "about",
    "donation",
]


def goto_primary(page: Page, tab_id: str) -> None:
    page.locator(f'aside [data-nav-id="{tab_id}"]').first.click()
    page.wait_for_timeout(500)


def goto_config(page: Page, tab_id: str) -> None:
    # Abre o hub Config (navega para a última sub-aba) e então a sub-aba desejada.
    page.locator('aside [data-nav-id="config"]').first.click()
    page.wait_for_timeout(300)
    page.locator(f'.subnav [data-nav-id="{tab_id}"]').first.click()
    page.wait_for_timeout(500)


def assert_no_error_toast(page: Page) -> None:
    expect(page.locator(".bg-red-900\\/90")).to_have_count(0)


def test_all_primary_tabs_load(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")

    for tab_id in PRIMARY_IDS:
        goto_primary(page, tab_id)
        assert_no_error_toast(page)


def test_dashboard_loads_status_quickly(page: Page, base_url: str) -> None:
    """Dashboard should get status without staying on empty em-dashes forever."""
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    page.wait_for_function(
        """() => {
            const r = document.querySelector('body')?._x_dataStack?.[0];
            return r && typeof r.status?.container === 'string' && r.status.container.length > 0;
        }""",
        timeout=15000,
    )
    # Skeleton/loading for first paint should clear once status arrives.
    page.wait_for_function(
        """() => {
            const r = document.querySelector('body')?._x_dataStack?.[0];
            return r && !r.pageLoading?.dashboard;
        }""",
        timeout=15000,
    )
    assert_no_error_toast(page)


def test_files_tab_shows_tree_or_loading(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_config(page, "files")
    page.wait_for_function(
        """() => {
            const r = document.querySelector('body')?._x_dataStack?.[0];
            if (!r || r.page !== 'files') return false;
            if (r.pageLoading?.files) return true;
            return Array.isArray(r.fileTree);
        }""",
        timeout=15000,
    )
    page.wait_for_function(
        """() => {
            const r = document.querySelector('body')?._x_dataStack?.[0];
            return r && !r.pageLoading?.files && Array.isArray(r.fileTree);
        }""",
        timeout=15000,
    )
    assert_no_error_toast(page)


def test_all_config_tabs_load(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")

    for tab_id in CONFIG_IDS:
        goto_config(page, tab_id)
        assert_no_error_toast(page)


def test_theme_toggle(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")

    initial = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
    assert initial in ("dark", "light")
    page.get_by_role("button", name=re.compile("theme", re.I)).first.click()
    page.wait_for_timeout(200)
    after = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
    assert after != initial


def test_light_theme_tokens(page: Page, base_url: str) -> None:
    """Light theme uses warm parchment tokens (readable contrast on surfaces)."""
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    page.evaluate("() => document.documentElement.setAttribute('data-theme', 'light')")
    tokens = page.evaluate(
        """() => {
          const s = getComputedStyle(document.documentElement);
          return {
            bg: s.getPropertyValue('--v-950').trim(),
            surface: s.getPropertyValue('--v-900').trim(),
            text: s.getPropertyValue('--g-100').trim(),
            accent: s.getPropertyValue('--v-gold').trim(),
            brand: s.getPropertyValue('--v-moss').trim(),
          };
        }"""
    )
    assert tokens["bg"] == "244 241 232"
    assert tokens["surface"] == "255 255 255"
    assert tokens["text"] == "26 26 24"
    assert tokens["accent"] == "201 122 43"
    assert tokens["brand"] == "31 58 46"


def test_help_faq_search(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_config(page, "help")

    search = page.locator('input[placeholder*="FAQ"]')
    expect(search).to_be_visible()
    search.fill("crossplay")
    expect(page.get_by_text("How do I enable crossplay")).to_be_visible()


def test_about_version(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_config(page, "about")

    expect(page.get_by_role("main").get_by_role("heading", name="Vikinger Panel")).to_be_visible()
    expect(page.get_by_text("What's new")).to_be_visible()
    expect(page.get_by_text("Panel update")).to_be_visible()


def test_overview_connect_block(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")

    expect(page.get_by_role("heading", name="How to connect", exact=True)).to_be_visible()
    expect(page.get_by_role("button", name="Copy address", exact=True)).to_be_visible()
    assert_no_error_toast(page)


def test_players_page(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_primary(page, "players")

    expect(page.locator("h3.section-title").filter(has_text="Players")).to_be_visible()
    assert_no_error_toast(page)


def test_metrics_page(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_primary(page, "metrics")

    expect(page.get_by_role("heading", name="History", exact=True)).to_be_visible()
    assert_no_error_toast(page)


def test_console_sources(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_primary(page, "console")

    for source in ("Docker", "BepInEx"):
        page.get_by_role("button", name=source, exact=True).click()
        page.wait_for_timeout(400)
        assert_no_error_toast(page)


def test_files_all_scopes(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_config(page, "files")

    for scope in ("Config", "Data"):
        page.locator("button.btn-tab.flex").filter(has_text=scope).first.click()
        page.wait_for_timeout(400)
        assert_no_error_toast(page)


def test_backups_tab_content(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_primary(page, "backups")

    expect(page.get_by_role("heading", name="Automatic scheduling")).to_be_visible()
    expect(page.get_by_role("heading", name="Stored backups")).to_be_visible()
    expect(page.get_by_text("Server state")).to_be_visible()
    assert_no_error_toast(page)


def test_messages_tab_content(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_config(page, "messages")

    expect(page.get_by_role("heading", name="Automatic messages")).to_be_visible()
    expect(page.locator("h3").filter(has_text=re.compile(r"^Messages$"))).to_be_visible()
    expect(page.get_by_role("button", name="New message")).to_be_visible()
    page.get_by_role("button", name="New message").click()
    expect(page.get_by_role("heading", name="New message")).to_be_visible()
    expect(page.get_by_text("Click a tag to insert:")).to_be_visible()
    assert_no_error_toast(page)


def test_alerts_page(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_config(page, "alerts")

    expect(page.get_by_role("heading", name="Alerts", exact=True)).to_be_visible()
    expect(page.get_by_text("Discord")).to_be_visible()
    assert_no_error_toast(page)


def test_schedule_page(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    goto_config(page, "schedule")

    expect(page.get_by_role("heading", name="Schedule", exact=True)).to_be_visible()
    assert_no_error_toast(page)
