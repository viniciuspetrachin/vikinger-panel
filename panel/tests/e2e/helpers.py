"""Helpers compartilhados dos testes E2E Playwright."""

from playwright.sync_api import Page, expect


def ready_panel(page: Page, base_url: str) -> None:
    """Aguarda o painel terminar init() antes de interagir com a UI."""
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")
    page.wait_for_function(
        """() => {
            const r = document.querySelector('body')?._x_dataStack?.[0];
            return r && r.status && typeof r.status.container === 'string' && !r.setupWizardOpen;
        }""",
        timeout=20000,
    )
    wizard = page.get_by_role("button", name="Confirm and start", exact=True)
    if wizard.is_visible(timeout=500):
        wizard.click()
        page.wait_for_function(
            "() => !document.querySelector('body')?._x_dataStack?.[0]?.setupWizardOpen",
            timeout=15000,
        )
        dismiss = page.get_by_role("button", name="Got it", exact=True)
        if dismiss.is_visible(timeout=2000):
            dismiss.click()
    page.wait_for_function(
        "() => !document.querySelector('body')?._x_dataStack?.[0]?.actionPending",
        timeout=20000,
    )


def open_primary(page: Page, tab_id: str) -> None:
    """Navigate to a primary sidebar destination by data-nav-id."""
    page.locator(f'aside [data-nav-id="{tab_id}"]').first.click()
    page.wait_for_timeout(400)


def open_config(page: Page, tab_id: str) -> None:
    """Open the Config hub, then the given sub-section by data-nav-id."""
    page.locator('aside [data-nav-id="config"]').first.click()
    page.wait_for_timeout(250)
    page.locator(f'.subnav [data-nav-id="{tab_id}"]').first.click()
    page.wait_for_timeout(400)


def go_worlds(page: Page) -> None:
    open_config(page, "worlds")
    expect(page.get_by_text("World Settings")).to_be_visible(timeout=10000)
