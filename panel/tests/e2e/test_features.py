"""E2E das novas features: loadings anti-duplo-clique, console ao vivo, modal de backup, auditoria."""

import re
import time

import pytest
from playwright.sync_api import Page, expect

from helpers import go_worlds, ready_panel

pytestmark = pytest.mark.e2e


def _boot(page: Page, base_url: str) -> None:
    ready_panel(page, base_url)


def _go_worlds(page: Page) -> None:
    go_worlds(page)


def test_dashboard_live_console(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    expect(page.get_by_text("Server Console (live)")).to_be_visible()
    console = page.locator("[x-ref='dashConsole']")
    expect(console).to_contain_text(re.compile("World loaded|Listening|connected"), timeout=8000)
    text = console.inner_text()
    assert "supervisord:" not in text
    assert "^[[0m" not in text
    assert ".d..t" not in text


def test_dashboard_console_preserves_scroll(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    console = page.locator("[x-ref='dashConsole']")
    expect(console).to_contain_text(re.compile("World loaded|Listening|connected"), timeout=8000)
    page.wait_for_function(
        "() => { const el = document.querySelector('[x-ref=\"dashConsole\"]'); return el && el.scrollHeight > el.clientHeight + 10; }",
        timeout=8000,
    )
    logs_get = lambda r: "/api/logs" in r.url and r.request.method == "GET"  # noqa: E731
    # Drena refresh em voo (captura scroll antigo e restaura no fim após o await da API).
    with page.expect_response(logs_get, timeout=8000):
        pass
    page.wait_for_timeout(400)
    page.evaluate("() => { const el = document.querySelector('[x-ref=\"dashConsole\"]'); if (el) el.scrollTop = 0; }")
    # Próximo poll (5s) deve preservar scroll no topo, não auto-rolar para o fim.
    with page.expect_response(logs_get, timeout=8000):
        page.wait_for_timeout(6000)
    page.wait_for_timeout(400)
    scroll_top = page.evaluate("() => document.querySelector('[x-ref=\"dashConsole\"]')?.scrollTop ?? -1")
    scroll_max = page.evaluate(
        "() => { const el = document.querySelector('[x-ref=\"dashConsole\"]'); return el ? el.scrollHeight - el.clientHeight : 0; }"
    )
    assert scroll_max > 0, "Console deveria ser rolável para testar preservação de scroll"
    assert scroll_top < scroll_max * 0.5, f"Scroll foi para o fim após refresh: top={scroll_top}, max={scroll_max}"


def test_logs_tab_no_supervisord_prefix(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Logs", exact=True).click()
    page.wait_for_timeout(500)
    console = page.locator("[x-ref='logConsole']")
    expect(console).to_contain_text(re.compile("World loaded|TestPlayer"), timeout=8000)
    text = console.inner_text()
    assert "supervisord:" not in text
    assert "^[[0m" not in text
    assert "[valheim-server]" not in text
    assert re.search(r"\[Jul\s+\d", text)


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


def test_backup_modal_flow(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Backups", exact=True).click()
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
    page.get_by_role("button", name="Backups", exact=True).click()
    page.get_by_role("button", name="Create manual backup", exact=True).click()
    page.get_by_role("button", name="Full").click()
    expect(page.get_by_text(re.compile("Backup created"))).to_be_visible(timeout=8000)
    page.wait_for_timeout(800)
    expect(page.locator("table").get_by_text(re.compile("manual-full-")).first).to_be_visible(timeout=8000)


def test_backup_details_modal_shows_mods(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Backups", exact=True).click()
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
    page.get_by_role("button", name="Backups", exact=True).click()
    page.get_by_role("button", name="Create manual backup", exact=True).click()
    page.get_by_role("button", name="Active world (quick)").click()
    expect(page.get_by_text(re.compile("Backup created"))).to_be_visible(timeout=8000)
    page.wait_for_timeout(800)
    expect(page.get_by_role("button", name="Restore to here").first).to_be_visible(timeout=8000)


def test_backup_apply_single_button(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Backups", exact=True).click()
    expect(page.get_by_role("button", name="Apply and restart", exact=True)).to_be_visible()
    expect(page.get_by_role("button", name="Save", exact=True)).not_to_be_visible()
    expect(page.get_by_role("button", name="Run scheduled job now", exact=True)).to_be_visible()


def test_backup_restore_modal_flow(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Backups", exact=True).click()
    page.get_by_role("button", name="Create manual backup", exact=True).click()
    page.get_by_role("button", name="Active world (quick)").click()
    expect(page.get_by_text(re.compile("Backup created"))).to_be_visible(timeout=8000)
    page.wait_for_timeout(800)
    page.get_by_role("button", name="Restore to here").first.click()
    expect(page.get_by_role("heading", name="Restore backup")).to_be_visible()
    expect(page.get_by_role("button", name="Restore and restart")).to_be_visible()


def test_backup_dashboard_button_opens_modal(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="💾 Backup", exact=True).click()
    expect(page.get_by_role("heading", name="Create Backup")).to_be_visible()


def test_audit_records_action(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    btn = page.get_by_role("button", name="↻ Restart", exact=True)
    expect(btn).to_be_enabled(timeout=5000)
    btn.click()
    page.wait_for_timeout(3500)  # aguarda ação concluir e ser registrada

    page.get_by_role("button", name="Audit", exact=True).click()
    page.wait_for_timeout(800)
    expect(page.get_by_text("/api/server/restart").first).to_be_visible(timeout=8000)


def test_logs_auto_refresh_default_on(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Logs", exact=True).click()
    checkbox = page.locator("input[x-model='logAutoRefresh']")
    expect(checkbox).to_be_checked()


def _open_sample_mod_cfg(page: Page) -> None:
    page.wait_for_selector('.file-tree-folder[data-path="config/bepinex"]', timeout=10000)
    page.locator('.file-tree-folder[data-path="config/bepinex"]').click()
    page.wait_for_selector('.file-tree-file[data-path="config/bepinex/sample.mod.cfg"]', timeout=5000)
    page.locator('.file-tree-file[data-path="config/bepinex/sample.mod.cfg"]').click()


def test_file_editor_codemirror(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.wait_for_function("() => typeof window.PanelEditor !== 'undefined'", timeout=20000)
    page.get_by_role("button", name="Files", exact=True).click()
    _open_sample_mod_cfg(page)
    page.wait_for_function(
        "() => document.querySelector('[x-data]')._x_dataStack[0].editPath && document.querySelector('.cm-editor')",
        timeout=25000,
    )
    page.locator(".cm-content").click()
    page.keyboard.type("# e2e edit")
    expect(page.locator('#file-editor-dirty')).to_be_visible(timeout=5000)
    page.get_by_role("button", name="Save", exact=True).click()
    expect(page.get_by_text(re.compile("File saved"))).to_be_visible(timeout=8000)


def test_file_editor_undo(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.wait_for_function("() => typeof window.PanelEditor !== 'undefined'", timeout=20000)
    page.get_by_role("button", name="Files", exact=True).click()
    _open_sample_mod_cfg(page)
    page.wait_for_function(
        "() => document.querySelector('.cm-editor')",
        timeout=25000,
    )
    page.locator(".cm-content").click()
    page.keyboard.type("UNDO_TEST")
    page.get_by_role("button", name="↶", exact=True).click()
    page.wait_for_timeout(300)
    content = page.evaluate(
        "() => window.PanelEditor && PanelEditor.get('file')"
        " ? PanelEditor.get('file').getContent() : ''"
    )
    assert "UNDO_TEST" not in content


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
    expect(page.get_by_text("Seed", exact=True)).to_be_visible()
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


def test_dashboard_metrics_section(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    expect(page.get_by_role("heading", name="Performance", exact=True)).to_be_visible()
    expect(page.get_by_text("Network traffic (chart)")).to_be_visible()
    page.get_by_text("Network traffic (chart)").click()
    page.wait_for_timeout(500)
    expect(page.locator("canvas")).to_be_visible()


def test_dashboard_disk_usage(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    perf = page.locator(".bg-valheim-800").filter(has=page.get_by_role("heading", name="Performance", exact=True))
    disk_card = perf.locator(".bg-valheim-900").filter(has=page.get_by_text("Disk (Valheim)", exact=True)).first
    expect(disk_card.locator(".text-lg.font-bold")).not_to_have_text("—", timeout=8000)
    expect(disk_card.get_by_text("game:", exact=False)).to_be_visible()
    expect(disk_card.get_by_text("mods:", exact=False)).to_be_visible()
    expect(disk_card.get_by_text("worlds:", exact=False)).to_be_visible()
    expect(disk_card.get_by_text("backups:", exact=False)).to_be_visible()


def test_dashboard_cpu_valheim_only(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    perf = page.locator(".bg-valheim-800").filter(has=page.get_by_role("heading", name="Performance", exact=True))
    cpu_card = perf.locator(".bg-valheim-900").filter(has=page.get_by_text("CPU", exact=True)).first
    expect(cpu_card.get_by_role("button", name="Sistema", exact=True)).not_to_be_visible()
    expect(cpu_card.locator(".text-lg.font-bold")).to_contain_text("12.5", timeout=8000)
    pct_text = cpu_card.locator(".text-lg.font-bold").inner_text()
    pct_value = float(pct_text.replace("%", "").strip())
    assert pct_value <= 100.0
    assert pct_value > 0.0


def test_dashboard_net_chart_points(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_text("Network traffic (chart)").click()
    page.wait_for_timeout(6000)
    points = page.evaluate(
        "() => { const root = document.querySelector('[x-data]');"
        " const data = root && root._x_dataStack && root._x_dataStack[0];"
        " return data && data.netChartInstance"
        " ? data.netChartInstance.data.datasets[0].data.length : 0; }"
    )
    assert points >= 1


def test_apply_memory_button_visible(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Server", exact=True).click()
    page.wait_for_timeout(500)
    expect(page.get_by_role("heading", name="Server capacity", exact=True)).to_be_visible()
    btn = page.get_by_role("button", name="Apply RAM limit")
    expect(btn).to_be_visible()
    page.on("dialog", lambda d: d.dismiss())
    btn.click()
    expect(btn).to_be_enabled()


def test_worlds_create_buttons(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Worlds", exact=True).click()
    expect(page.get_by_role("button", name="Create", exact=True)).to_be_visible()
    expect(page.get_by_role("button", name="Create and Activate", exact=True)).to_be_visible()


def test_server_password_toggle(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Server", exact=True).click()
    pwd = page.locator("input[x-model='envValues.SERVER_PASS']")
    expect(pwd).to_have_attribute("type", "password")
    page.get_by_title("Show password").click()
    expect(pwd).to_have_attribute("type", "text")


def test_server_world_select(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Server", exact=True).click()
    expect(page.locator("select[x-model='selectedWorld']")).to_be_visible()


def test_dashboard_players_card(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    expect(page.get_by_text("Players Online", exact=True)).to_be_visible()
    expect(page.get_by_text("Connected Players", exact=True)).to_be_visible()
    players_block = page.locator(".bg-valheim-800").filter(has=page.get_by_text("Connected Players", exact=True))
    expect(players_block.locator("ul .font-medium", has_text="TestPlayer")).to_be_visible()
    expect(players_block.get_by_text("76561198273697711")).to_be_visible()
    expect(players_block.get_by_role("button", name="Actions ▾")).to_be_visible()
    page.on("dialog", lambda d: d.accept())
    players_block.get_by_role("button", name="Actions ▾").click()
    expect(page.get_by_role("button", name="Kick")).to_be_visible()
    expect(page.get_by_role("button", name="Ban")).to_be_visible()


def test_dashboard_console_command(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    console_input = page.locator(".console-input").first
    expect(console_input).to_be_visible()
    expect(console_input).to_be_enabled(timeout=8000)
    console_input.fill("save")
    page.get_by_role("button", name="Send", exact=True).first.click()
    expect(console_input).to_have_value("", timeout=5000)
    expect(page.locator(".console-history")).to_have_count(0)


def test_console_tab_completes_command(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    console_input = page.locator(".console-input").first
    expect(console_input).to_be_enabled(timeout=8000)
    console_input.fill("sa")
    console_input.press("Tab")
    expect(console_input).to_have_value("save ")


def test_console_tab_completes_player(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    console_input = page.locator(".console-input").first
    expect(console_input).to_be_enabled(timeout=8000)
    page.wait_for_timeout(1500)
    console_input.fill("kick Test")
    console_input.press("Tab")
    expect(console_input).to_have_value("kick TestPlayer ")


def test_console_help_modal(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="View available commands").first.click()
    expect(page.get_by_text("RCON commands")).to_be_visible()
    expect(page.get_by_text("kick", exact=True).first).to_be_visible()
    page.keyboard.press("Escape")
    expect(page.get_by_text("RCON commands")).not_to_be_visible()


def test_audit_modal(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="↻ Restart", exact=True).click()
    page.wait_for_timeout(3500)
    page.get_by_role("button", name="Audit", exact=True).click()
    expect(page.get_by_text("/api/server/restart").first).to_be_visible(timeout=8000)
    audit_section = page.locator("section").filter(has=page.get_by_text("Persistent log"))
    audit_section.get_by_role("button", name="View").first.click()
    modal = page.locator(".modal-overlay").filter(has_text="Audit details")
    expect(modal).to_be_visible(timeout=8000)
    expect(modal.get_by_text("Request", exact=True)).to_be_visible()
    expect(modal.get_by_text("Response", exact=True)).to_be_visible()


def test_mod_toggle_visible(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Mods & Config", exact=True).click()
    page.wait_for_timeout(500)
    mods_section = page.locator("section").filter(has=page.get_by_text("is bundled with the panel"))
    expect(mods_section.get_by_text("Bundled — cannot be removed", exact=True)).to_be_visible()
    expect(mods_section.locator("input[type='checkbox']").first).to_be_visible()


def test_server_mode_vanilla_bepinex_copy(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Server", exact=True).click()
    page.wait_for_timeout(800)
    updates = page.locator("section").filter(has=page.get_by_role("heading", name="Game updates"))
    expect(updates.get_by_text("With mods (BepInEx)", exact=True)).to_be_visible()
    expect(updates.get_by_text("turns off all mods", exact=False)).to_be_visible()


def test_server_updates_section(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Server", exact=True).click()
    page.wait_for_timeout(800)
    expect(page.get_by_role("heading", name="Game updates")).to_be_visible()
    expect(page.get_by_role("button", name="Check for updates now", exact=True)).to_be_visible()
    expect(page.get_by_text("Auto-update game")).to_be_visible()


def test_server_save_update_config_busy(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Server", exact=True).click()
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
    page.get_by_role("button", name="Server", exact=True).click()
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


def test_file_search_by_name(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Files", exact=True).click()
    page.wait_for_timeout(800)
    page.get_by_placeholder("Search by file name...").fill("sample")
    page.wait_for_timeout(400)
    expect(page.get_by_text("config/bepinex/sample.mod.cfg")).to_be_visible(timeout=5000)


def test_file_search_config_filter(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Files", exact=True).click()
    page.wait_for_timeout(800)
    page.locator(".file-search-bar button.btn-tab-sm", has_text="Config").click()
    page.wait_for_timeout(400)
    expect(page.get_by_text("config/bepinex/sample.mod.cfg")).to_be_visible(timeout=5000)


def test_server_backup_disk_limit_section(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Server", exact=True).click()
    page.wait_for_timeout(800)
    expect(page.get_by_role("heading", name="Backup disk usage")).to_be_visible()
    expect(page.get_by_role("button", name="Clear all backups now")).to_be_visible()
    checkbox = page.get_by_label("Limit backup disk usage")
    expect(checkbox).not_to_be_checked()
    checkbox.check()
    expect(page.get_by_role("button", name="Save limit")).to_be_visible()
