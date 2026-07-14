"""E2E das features após o redesign: cockpit, Console, Metrics, Players, backups, Config."""

import re

import pytest
from playwright.sync_api import Page, expect

from helpers import go_worlds, open_config, open_primary, ready_panel

pytestmark = pytest.mark.e2e


def _boot(page: Page, base_url: str) -> None:
    ready_panel(page, base_url)


def _go_worlds(page: Page) -> None:
    go_worlds(page)


# ── Console page ──────────────────────────────────────────────────────────────

def test_console_live_logs(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "console")
    console = page.locator("[x-ref='logConsole']")
    expect(console).to_contain_text(re.compile("World loaded|Listening|connected|TestPlayer"), timeout=8000)
    text = console.inner_text()
    assert "supervisord:" not in text
    assert "^[[0m" not in text
    assert ".d..t" not in text


def test_console_log_prefix_cleaned(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "console")
    console = page.locator("[x-ref='logConsole']")
    expect(console).to_contain_text(re.compile("World loaded|TestPlayer"), timeout=8000)
    text = console.inner_text()
    assert "supervisord:" not in text
    assert "^[[0m" not in text
    assert "[valheim-server]" not in text
    assert re.search(r"\[Jul\s+\d", text)


def test_console_command(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "console")
    console_input = page.locator(".console-input").first
    expect(console_input).to_be_visible()
    expect(console_input).to_be_enabled(timeout=8000)
    console_input.fill("save")
    page.get_by_role("button", name="Send", exact=True).first.click()
    expect(console_input).to_have_value("", timeout=5000)


def test_console_quick_command_chip(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "console")
    chip = page.locator(".cmd-chip").filter(has_text="Save").first
    expect(chip).to_be_visible()


def test_console_tab_completes_command(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "console")
    console_input = page.locator(".console-input").first
    expect(console_input).to_be_enabled(timeout=8000)
    console_input.fill("sa")
    console_input.press("Tab")
    expect(console_input).to_have_value("save ")


def test_console_tab_completes_player(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "console")
    console_input = page.locator(".console-input").first
    expect(console_input).to_be_enabled(timeout=8000)
    page.wait_for_timeout(1500)
    console_input.fill("kick Test")
    console_input.press("Tab")
    expect(console_input).to_have_value("kick TestPlayer ")


def test_console_help_modal(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "console")
    page.get_by_role("button", name="View available commands", exact=True).first.click()
    expect(page.get_by_text("RCON commands")).to_be_visible()
    expect(page.get_by_text("kick", exact=True).first).to_be_visible()
    page.keyboard.press("Escape")
    expect(page.get_by_text("RCON commands")).not_to_be_visible()


def test_console_auto_refresh_default_on(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "console")
    checkbox = page.locator("input[x-model='logAutoRefresh']")
    expect(checkbox).to_be_checked()


# ── Overview cockpit ─────────────────────────────────────────────────────────

def test_loading_disables_button(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    btn = page.get_by_role("button", name="↻ Restart", exact=True)
    expect(btn).to_be_enabled(timeout=5000)
    btn.click()
    page.wait_for_function(
        "() => document.querySelector('body')._x_dataStack[0].actionPending === 'server:restart'",
        timeout=8000,
    )
    page.wait_for_function(
        "() => !document.querySelector('body')._x_dataStack[0].actionPending",
        timeout=12000,
    )


def test_double_click_prevented(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    seen = {"n": 0}

    def handle(route):
        if seen["n"] > 0:
            route.abort()
            return
        seen["n"] += 1
        route.continue_()

    page.route("**/api/server/start", handle)
    btn = page.get_by_role("button", name="▶ Start", exact=True)
    expect(btn).to_be_enabled(timeout=5000)
    btn.click()
    btn.click()
    page.wait_for_timeout(800)
    assert seen["n"] == 1, f"Esperava 1 chamada, obteve {seen['n']}"


def test_overview_cpu_bounded(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    cpu_card = page.locator(".stat-card").filter(has=page.get_by_text("CPU", exact=True)).first
    value = cpu_card.locator(".stat-value")
    expect(value).not_to_have_text("—", timeout=8000)
    pct = float(value.inner_text().replace("%", "").strip())
    assert 0.0 <= pct <= 100.0


def test_overview_sparkline(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    expect(page.get_by_text("CPU trend")).to_be_visible()
    expect(page.locator("svg polyline")).to_have_count(1)


# ── Metrics page ─────────────────────────────────────────────────────────────

def test_metrics_history_chart(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "metrics")
    expect(page.get_by_role("heading", name="History", exact=True)).to_be_visible()
    expect(page.locator("[x-ref='histChartCanvas']")).to_be_visible()


def test_metrics_range_toggle(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "metrics")
    with page.expect_response(lambda r: "/api/metrics/history" in r.url and "range=24h" in r.url, timeout=8000):
        page.get_by_role("button", name="24h", exact=True).click()


# ── Players page ─────────────────────────────────────────────────────────────

def test_players_table(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "players")
    table = page.locator("table")
    expect(table.get_by_text("TestPlayer")).to_be_visible(timeout=8000)
    expect(table.get_by_text("76561198273697711")).to_be_visible()
    page.on("dialog", lambda d: d.accept())
    page.get_by_role("button", name="Actions ▾").first.click()
    expect(page.get_by_role("button", name="Kick")).to_be_visible()
    expect(page.get_by_role("button", name="Ban")).to_be_visible()


# ── Map page ─────────────────────────────────────────────────────────────────

def test_map_page_loads(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "map")
    expect(page.locator(".map-canvas-wrap")).to_be_visible()


# ── Backups ──────────────────────────────────────────────────────────────────

def test_backup_modal_flow(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "backups")
    page.get_by_role("button", name="Create manual backup", exact=True).click()

    expect(page.get_by_role("heading", name="Create Backup")).to_be_visible()
    expect(page.get_by_role("button", name="Active world (quick)")).to_be_visible()
    expect(page.get_by_role("button", name="Full")).to_be_visible()
    expect(page.get_by_role("button", name="Configs only")).to_be_visible()

    page.get_by_role("button", name="Active world (quick)").click()
    expect(page.get_by_text(re.compile("Backup created"))).to_be_visible(timeout=8000)
    expect(page.get_by_role("heading", name="Create Backup")).not_to_be_visible()


def test_backup_appears_in_list(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "backups")
    page.get_by_role("button", name="Create manual backup", exact=True).click()
    page.get_by_role("button", name="Full").click()
    expect(page.get_by_text(re.compile("Backup created"))).to_be_visible(timeout=8000)
    page.wait_for_timeout(800)
    expect(page.locator("table").get_by_text(re.compile("manual-full-")).first).to_be_visible(timeout=8000)


def test_backup_details_modal_shows_mods(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "backups")
    page.get_by_role("button", name="Create manual backup", exact=True).click()
    page.get_by_role("button", name="Full").click()
    expect(page.get_by_text(re.compile("Backup created"))).to_be_visible(timeout=8000)
    page.wait_for_timeout(800)
    expect(page.locator("table th", has_text="Mods")).to_be_visible()
    page.get_by_role("button", name="Details").first.click()
    expect(page.get_by_role("heading", name="Backup details")).to_be_visible(timeout=8000)
    modal = page.locator(".modal-overlay").filter(has=page.get_by_role("heading", name="Backup details"))
    expect(modal.get_by_text(re.compile(r"Mods \(\d+\)"))).to_be_visible(timeout=8000)


def test_backup_restore_button_visible(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "backups")
    page.get_by_role("button", name="Create manual backup", exact=True).click()
    page.get_by_role("button", name="Active world (quick)").click()
    expect(page.get_by_text(re.compile("Backup created"))).to_be_visible(timeout=8000)
    page.wait_for_timeout(800)
    expect(page.get_by_role("button", name="Restore to here").first).to_be_visible(timeout=8000)


def test_backup_apply_single_button(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "backups")
    expect(page.get_by_role("button", name="Apply and restart", exact=True)).to_be_visible()
    expect(page.get_by_role("button", name="Run scheduled job now", exact=True)).to_be_visible()


def test_backup_restore_modal_flow(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "backups")
    page.get_by_role("button", name="Create manual backup", exact=True).click()
    page.get_by_role("button", name="Active world (quick)").click()
    expect(page.get_by_text(re.compile("Backup created"))).to_be_visible(timeout=8000)
    page.wait_for_timeout(800)
    page.get_by_role("button", name="Restore to here").first.click()
    expect(page.get_by_role("heading", name="Restore backup")).to_be_visible()
    expect(page.get_by_role("button", name="Restore and restart")).to_be_visible()


def test_backup_overview_button_opens_modal(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="💾 Backup", exact=True).click()
    expect(page.get_by_role("heading", name="Create Backup")).to_be_visible()


# ── Audit ────────────────────────────────────────────────────────────────────

def test_audit_records_action(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    btn = page.get_by_role("button", name="↻ Restart", exact=True)
    expect(btn).to_be_enabled(timeout=5000)
    btn.click()
    page.wait_for_timeout(3500)

    open_config(page, "audit")
    page.wait_for_timeout(800)
    expect(page.get_by_text("/api/server/restart").first).to_be_visible(timeout=8000)


def test_audit_modal(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="↻ Restart", exact=True).click()
    page.wait_for_timeout(3500)
    open_config(page, "audit")
    expect(page.get_by_text("/api/server/restart").first).to_be_visible(timeout=8000)
    audit_section = page.locator("section").filter(has=page.get_by_text("Persistent log"))
    audit_section.get_by_role("button", name="View").first.click()
    modal = page.locator(".modal-overlay").filter(has_text="Audit details")
    expect(modal).to_be_visible(timeout=8000)
    expect(modal.get_by_text("Request", exact=True)).to_be_visible()
    expect(modal.get_by_text("Response", exact=True)).to_be_visible()


# ── Files ────────────────────────────────────────────────────────────────────

def _open_sample_mod_cfg(page: Page) -> None:
    tree = page.locator(".file-tree-scroll")
    page.wait_for_selector('.file-tree-folder[data-path="config/bepinex"]', timeout=10000)
    tree.locator('.file-tree-folder[data-path="config/bepinex"]').click()
    page.wait_for_selector('.file-tree-file[data-path="config/bepinex/sample.mod.cfg"]', timeout=5000)
    tree.locator('.file-tree-file[data-path="config/bepinex/sample.mod.cfg"]').first.click()


def test_file_editor_codemirror(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.wait_for_function("() => typeof window.PanelEditor !== 'undefined'", timeout=20000)
    open_config(page, "files")
    _open_sample_mod_cfg(page)
    page.wait_for_function(
        "() => document.querySelector('[x-data]')._x_dataStack[0].editPath && document.querySelector('#file-editor-host .cm-editor')",
        timeout=25000,
    )
    page.locator("#file-editor-host .cm-content").click()
    page.keyboard.type("# e2e edit")
    expect(page.locator('#file-editor-dirty')).to_be_visible(timeout=5000)
    page.get_by_role("button", name="Save", exact=True).click()
    expect(page.get_by_text(re.compile("File saved"))).to_be_visible(timeout=8000)


def test_file_editor_undo(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.wait_for_function("() => typeof window.PanelEditor !== 'undefined'", timeout=20000)
    open_config(page, "files")
    _open_sample_mod_cfg(page)
    page.wait_for_function(
        "() => document.querySelector('#file-editor-host .cm-editor')",
        timeout=25000,
    )
    page.locator("#file-editor-host .cm-content").click()
    page.keyboard.type("UNDO_TEST")
    page.get_by_role("button", name="↶", exact=True).click()
    page.wait_for_timeout(300)
    content = page.evaluate(
        "() => window.PanelEditor && PanelEditor.get('file')"
        " ? PanelEditor.get('file').getContent() : ''"
    )
    assert "UNDO_TEST" not in content


def test_file_search_by_name(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_config(page, "files")
    page.wait_for_timeout(800)
    page.get_by_placeholder("Search by file name...").fill("sample")
    page.wait_for_timeout(400)
    expect(page.get_by_text("config/bepinex/sample.mod.cfg")).to_be_visible(timeout=5000)


def test_file_search_config_filter(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_config(page, "files")
    page.wait_for_timeout(800)
    page.locator(".file-search-bar button.btn-tab-sm", has_text="Config").click()
    page.wait_for_timeout(400)
    expect(page.get_by_text("config/bepinex/sample.mod.cfg")).to_be_visible(timeout=5000)


# ── Worlds ───────────────────────────────────────────────────────────────────

def test_world_config_open_from_list(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    _go_worlds(page)
    expect(page.get_by_role("button", name="Save settings", exact=True)).to_be_visible(timeout=8000)
    world_row = page.locator(".bg-valheim-800.rounded-xl.p-5").filter(
        has=page.locator("p.font-medium", has_text="TestWorld")
    ).first
    expect(world_row).to_be_visible()
    with page.expect_response(
        lambda r: "/api/worlds/TestWorld/config" in r.url
        and r.request.method == "GET"
        and r.status == 200,
        timeout=10000,
    ):
        world_row.get_by_role("button", name="Config", exact=True).click()
    worlds_section = page.locator("section").filter(has=page.get_by_text("World Settings"))
    expect(worlds_section.get_by_text("Seed", exact=True).first).to_be_visible()
    expect(page.get_by_text("Not found")).not_to_be_visible()


def test_world_config_after_create(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    _go_worlds(page)
    expect(page.get_by_text("Effective values")).to_be_visible(timeout=10000)
    world_name = "E2eCfgWorld"
    page.locator("input[x-model='newWorldName']").fill(world_name)
    with page.expect_response(
        lambda r: "/api/worlds/create" in r.url and r.request.method == "POST" and r.status == 200,
        timeout=10000,
    ):
        page.get_by_role("button", name="Create", exact=True).click()
    expect(page.locator("p.font-medium", has_text=world_name)).to_be_visible(timeout=8000)
    world_row = page.locator(".bg-valheim-800.rounded-xl.p-5").filter(
        has=page.locator("p.font-medium", has_text=world_name)
    ).first
    world_row.get_by_role("button", name="Config", exact=True).click()
    expect(page.locator("select[x-model='worldConfigName']")).to_have_value(world_name, timeout=8000)
    expect(page.get_by_text("Effective values")).to_be_visible()
    expect(page.get_by_role("button", name="Save settings", exact=True)).to_be_visible()
    expect(page.get_by_text("Not found")).not_to_be_visible()


def test_world_config_panel(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    _go_worlds(page)
    expect(page.get_by_text("World Settings")).to_be_visible()
    expect(page.get_by_text("Effective values")).to_be_visible()
    expect(page.get_by_text("World preset")).to_be_visible()
    expect(page.locator(".world-preset-card").filter(has_text="Game default").first).to_be_visible()
    expect(page.get_by_text("Individual modifiers")).to_be_visible()
    expect(page.get_by_role("button", name="Save settings", exact=True)).to_be_visible()
    page.get_by_role("button", name="Save settings", exact=True).click()
    expect(page.get_by_text(re.compile("World settings saved|Settings saved and server restarted"))).to_be_visible(timeout=8000)


def test_worlds_create_buttons(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    _go_worlds(page)
    expect(page.get_by_role("button", name="Create", exact=True)).to_be_visible()
    expect(page.get_by_role("button", name="Create and Activate", exact=True)).to_be_visible()


# ── Server config ────────────────────────────────────────────────────────────

def test_apply_memory_button_visible(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_config(page, "server")
    page.wait_for_timeout(500)
    expect(page.get_by_role("heading", name="Server capacity", exact=True)).to_be_visible()
    btn = page.get_by_role("button", name="Apply RAM limit")
    expect(btn).to_be_visible()
    page.on("dialog", lambda d: d.dismiss())
    btn.click()
    expect(btn).to_be_enabled()


def test_server_password_toggle(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_config(page, "server")
    pwd = page.locator("input[x-model='envValues.SERVER_PASS']")
    expect(pwd).to_have_attribute("type", "password")
    page.get_by_title("Show password").click()
    expect(pwd).to_have_attribute("type", "text")


def test_server_world_select(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_config(page, "server")
    expect(page.locator("select[x-model='selectedWorld']")).to_be_visible()


def test_server_mode_vanilla_bepinex_copy(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_config(page, "server")
    page.wait_for_timeout(800)
    updates = page.locator("section").filter(has=page.get_by_role("heading", name="Game updates"))
    expect(updates.get_by_text("With mods (BepInEx)", exact=True)).to_be_visible()
    expect(updates.get_by_text("turns off all mods", exact=False)).to_be_visible()


def test_server_updates_section(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_config(page, "server")
    page.wait_for_timeout(800)
    expect(page.get_by_role("heading", name="Game updates")).to_be_visible()
    expect(page.get_by_role("button", name="Check for updates now", exact=True)).to_be_visible()
    expect(page.get_by_text("Auto-update game")).to_be_visible()


def test_server_save_update_config_busy(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_config(page, "server")
    page.wait_for_timeout(800)
    btn = page.get_by_role("button", name="Save", exact=True)
    btn.click()
    page.wait_for_function(
        "() => !document.querySelector('[x-data]')._x_dataStack[0].actionPending",
        timeout=8000,
    )


def test_server_check_game_update_shows_loading(page: Page, base_url: str) -> None:
    def slow_check(route):
        page.wait_for_timeout(1500)
        route.continue_()

    _boot(page, base_url)
    page.route("**/api/updates/check", slow_check)
    open_config(page, "server")
    page.wait_for_timeout(800)
    btn = page.get_by_role("button", name="Check for updates now", exact=True)
    btn.click()
    page.wait_for_function(
        "() => document.querySelector('[x-data]')._x_dataStack[0].actionPending === 'checkGameUpdate'",
        timeout=3000,
    )
    expect(btn).to_contain_text("Checking...")
    page.wait_for_function(
        "() => !document.querySelector('[x-data]')._x_dataStack[0].actionPending",
        timeout=8000,
    )


def test_server_backup_disk_limit_section(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_config(page, "server")
    page.wait_for_timeout(800)
    expect(page.get_by_role("heading", name="Backup disk usage")).to_be_visible()
    card = page.locator("div.bg-valheim-800").filter(
        has=page.get_by_role("heading", name="Backup disk usage")
    )
    select = page.get_by_label("Total backup limit")
    expect(select).to_be_visible()
    expect(select).to_be_enabled()
    expect(select).to_have_value("0")
    expect(select.locator("option")).to_have_count(8)
    expect(page.get_by_role("button", name="Clear all backups now")).to_be_visible()

    usage_panel = card.locator(".rounded-lg.border").filter(has_text="Current usage")
    expect(usage_panel.get_by_text("Unlimited", exact=True)).to_be_visible()

    usage_value = usage_panel.locator("p.text-2xl")
    expect(usage_value).not_to_have_text("Loading…", timeout=10000)
    expect(usage_value).to_have_text(re.compile(r"\d+(\.\d+)?\s*(B|KB|MB|GB)"))

    select.select_option("10")
    page.get_by_role("button", name="Save backup limit").click()
    page.wait_for_function(
        "() => document.querySelector('body')._x_dataStack[0].actionPending === 'saveBackupStorageLimit'",
        timeout=3000,
    )
    page.wait_for_function(
        "() => !document.querySelector('body')._x_dataStack[0].actionPending",
        timeout=10000,
    )
    expect(usage_panel.get_by_text("10 GB", exact=True)).to_be_visible(timeout=10000)
    expect(select).to_have_value("10")

    select.select_option("0")
    page.get_by_role("button", name="Save backup limit").click()
    page.wait_for_function(
        "() => document.querySelector('body')._x_dataStack[0].actionPending === 'saveBackupStorageLimit'",
        timeout=3000,
    )
    page.wait_for_function(
        "() => !document.querySelector('body')._x_dataStack[0].actionPending",
        timeout=10000,
    )
    expect(usage_panel.get_by_text("Unlimited", exact=True)).to_be_visible(timeout=10000)
    expect(select).to_have_value("0")
    expect(page.get_by_role("button", name="Save backup limit")).to_be_visible()


# ── Mods ─────────────────────────────────────────────────────────────────────

def test_mod_toggle_visible(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_primary(page, "mods")
    page.wait_for_timeout(500)
    mods_section = page.locator("section").filter(has=page.get_by_text("is bundled with the panel"))
    expect(mods_section.get_by_text("Bundled — cannot be removed", exact=True)).to_be_visible()
    expect(mods_section.locator("input[type='checkbox']").first).to_be_visible()


# ── Alerts / Schedule ────────────────────────────────────────────────────────

def test_alerts_save(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_config(page, "alerts")
    with page.expect_response(lambda r: "/api/alerts" in r.url and r.request.method == "PUT", timeout=8000):
        page.get_by_role("button", name="Save", exact=True).click()


def test_schedule_save(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    open_config(page, "schedule")
    with page.expect_response(lambda r: "/api/schedule" in r.url and r.request.method == "PUT", timeout=8000):
        page.get_by_role("button", name="Save", exact=True).click()
