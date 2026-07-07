"""E2E das novas features: loadings anti-duplo-clique, console ao vivo, modal de backup, auditoria."""

import re
import time

import pytest
from playwright.sync_api import Page, expect

pytestmark = pytest.mark.e2e


def _enable_advanced(page: Page) -> None:
    page.locator("label").filter(has_text="Modo avançado").click()
    page.wait_for_timeout(400)


def _boot(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.wait_for_selector("[x-cloak]", state="detached")


def test_dashboard_live_console(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    expect(page.get_by_text("Console do Servidor (ao vivo)")).to_be_visible()
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
    page.evaluate("() => { const el = document.querySelector('[x-ref=\"dashConsole\"]'); if (el) el.scrollTop = 0; }")
    page.wait_for_timeout(5500)
    scroll_top = page.evaluate("() => document.querySelector('[x-ref=\"dashConsole\"]')?.scrollTop ?? -1")
    scroll_max = page.evaluate(
        "() => { const el = document.querySelector('[x-ref=\"dashConsole\"]'); return el ? el.scrollHeight - el.clientHeight : 0; }"
    )
    assert scroll_max > 0, "Console deveria ser rolável para testar preservação de scroll"
    assert scroll_top < scroll_max * 0.5, f"Scroll foi para o fim após refresh: top={scroll_top}, max={scroll_max}"


def test_logs_tab_no_supervisord_prefix(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    _enable_advanced(page)
    page.get_by_role("button", name="Logs", exact=True).click()
    page.wait_for_timeout(500)
    console = page.locator("[x-ref='logConsole']")
    expect(console).to_contain_text(re.compile("World loaded|TestPlayer"), timeout=8000)
    text = console.inner_text()
    assert "supervisord:" not in text
    assert "^[[0m" not in text
    assert "[valheim-server]" in text


def test_loading_disables_button(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    btn = page.get_by_role("button", name="↻ Reiniciar", exact=True)
    btn.click()
    page.wait_for_function(
        "() => document.querySelector('[x-data]')._x_dataStack[0].actionPending === 'server:restart'",
        timeout=8000,
    )
    page.wait_for_function(
        "() => !document.querySelector('[x-data]')._x_dataStack[0].actionPending",
        timeout=8000,
    )


def test_double_click_prevented(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    calls: list[str] = []
    page.on("request", lambda r: calls.append(r.url) if "/api/server/start" in r.url else None)

    btn = page.get_by_role("button", name="▶ Iniciar", exact=True)
    btn.click()
    btn.click()
    page.wait_for_timeout(3500)
    assert len(calls) == 1, f"Esperava 1 chamada, obteve {len(calls)}"


def test_backup_modal_flow(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Backups", exact=True).click()
    page.get_by_role("button", name="Backup Agora", exact=True).click()

    expect(page.get_by_text("Criar Backup")).to_be_visible()
    expect(page.get_by_role("button", name="Mundo ativo")).to_be_visible()
    expect(page.get_by_role("button", name="Completo")).to_be_visible()
    expect(page.get_by_role("button", name="Somente configs")).to_be_visible()

    page.get_by_role("button", name="Mundo ativo").click()
    expect(page.get_by_text(re.compile("Backup criado"))).to_be_visible(timeout=8000)
    expect(page.get_by_text("Criar Backup")).not_to_be_visible()


def test_backup_appears_in_list(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Backups", exact=True).click()
    page.get_by_role("button", name="Backup Agora", exact=True).click()
    page.get_by_role("button", name="Completo").click()
    expect(page.get_by_text(re.compile("Backup criado"))).to_be_visible(timeout=8000)
    page.wait_for_timeout(800)
    expect(page.locator("table").get_by_text(re.compile("manual-full-")).first).to_be_visible(timeout=8000)


def test_backup_dashboard_button_opens_modal(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="💾 Backup", exact=True).click()
    expect(page.get_by_text("Criar Backup")).to_be_visible()


def test_audit_records_action(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="↻ Reiniciar", exact=True).click()
    page.wait_for_timeout(3500)  # aguarda ação concluir e ser registrada

    _enable_advanced(page)
    page.get_by_role("button", name="Auditoria", exact=True).click()
    page.wait_for_timeout(800)
    expect(page.get_by_text("/api/server/restart").first).to_be_visible(timeout=8000)


def test_logs_auto_refresh_default_on(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    _enable_advanced(page)
    page.get_by_role("button", name="Logs", exact=True).click()
    checkbox = page.locator("input[type='checkbox']").first
    expect(checkbox).to_be_checked()


def test_file_editor_codemirror(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.wait_for_function("() => typeof window.PanelEditor !== 'undefined'", timeout=20000)
    _enable_advanced(page)
    page.get_by_role("button", name="Arquivos", exact=True).click()
    page.wait_for_selector(".file-btn", timeout=10000)
    page.locator('.file-btn[data-path*="sample.mod.cfg"]').click()
    page.wait_for_function(
        "() => document.querySelector('[x-data]')._x_dataStack[0].editPath && document.querySelector('.cm-editor')",
        timeout=25000,
    )
    page.locator(".cm-content").click()
    page.keyboard.type("# e2e edit")
    expect(page.locator('#file-editor-dirty')).to_be_visible(timeout=5000)
    page.get_by_role("button", name="Salvar", exact=True).click()
    expect(page.get_by_text(re.compile("Arquivo salvo"))).to_be_visible(timeout=8000)


def test_file_editor_undo(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.wait_for_function("() => typeof window.PanelEditor !== 'undefined'", timeout=20000)
    _enable_advanced(page)
    page.get_by_role("button", name="Arquivos", exact=True).click()
    page.wait_for_selector(".file-btn", timeout=10000)
    page.locator('.file-btn[data-path*="sample.mod.cfg"]').click()
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
    page.get_by_role("button", name="Mundos", exact=True).click()
    expect(page.get_by_role("button", name="Salvar configurações", exact=True)).to_be_visible(timeout=8000)
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
    page.get_by_role("button", name="Mundos", exact=True).click()
    expect(page.get_by_text("Valores efetivos")).to_be_visible(timeout=10000)
    world_name = "E2eCfgWorld"
    page.locator("input[x-model='newWorldName']").fill(world_name)
    with page.expect_response(
        lambda r: "/api/worlds/create" in r.url and r.request.method == "POST" and r.status == 200,
        timeout=10000,
    ):
        page.get_by_role("button", name="Criar", exact=True).click()
    expect(page.locator("p.font-medium", has_text=world_name)).to_be_visible(timeout=8000)
    world_row = page.locator(".bg-valheim-800.rounded-xl.p-5").filter(
        has=page.locator("p.font-medium", has_text=world_name)
    ).first
    world_row.get_by_role("button", name="Config", exact=True).click()
    expect(page.locator("select[x-model='worldConfigName']")).to_have_value(world_name, timeout=8000)
    expect(page.get_by_text("Valores efetivos")).to_be_visible()
    expect(page.get_by_role("button", name="Salvar configurações", exact=True)).to_be_visible()
    expect(page.get_by_text("Not found")).not_to_be_visible()


def test_world_config_panel(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Mundos", exact=True).click()
    expect(page.get_by_text("Configurações do Mundo")).to_be_visible()
    expect(page.get_by_text("Valores efetivos")).to_be_visible()
    expect(page.get_by_text("Preset do mundo")).to_be_visible()
    expect(page.locator(".world-preset-card").filter(has_text="Padrão do jogo").first).to_be_visible()
    expect(page.get_by_text("Modificadores individuais")).to_be_visible()
    expect(page.get_by_role("button", name="Salvar configurações", exact=True)).to_be_visible()
    page.get_by_role("button", name="Salvar configurações", exact=True).click()
    expect(page.get_by_text(re.compile("Configurações do mundo salvas|salvas e servidor"))).to_be_visible(timeout=8000)


def test_dashboard_metrics_section(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    _enable_advanced(page)
    page.get_by_role("button", name="Recursos", exact=True).click()
    page.wait_for_timeout(500)
    expect(page.get_by_text("Recursos do Valheim")).to_be_visible()
    expect(page.get_by_text("Tráfego de rede (Valheim)")).to_be_visible()
    expect(page.get_by_text("Limite de RAM do container")).to_be_visible()
    expect(page.locator("canvas")).to_be_visible()


def test_dashboard_cpu_valheim_only(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    _enable_advanced(page)
    page.get_by_role("button", name="Recursos", exact=True).click()
    page.wait_for_timeout(500)
    cpu_card = page.locator(".bg-valheim-900").filter(has=page.get_by_text("CPU", exact=True)).first
    expect(cpu_card.get_by_text("Uso do container Valheim (servidor + serviços relacionados)")).to_be_visible()
    expect(cpu_card.get_by_role("button", name="Sistema", exact=True)).not_to_be_visible()
    expect(cpu_card.locator(".text-xl.font-bold")).to_contain_text("12.5", timeout=5000)
    pct_text = cpu_card.locator(".text-xl.font-bold").inner_text()
    pct_value = float(pct_text.replace("%", "").strip())
    assert pct_value <= 100.0
    assert pct_value > 0.0


def test_dashboard_net_chart_points(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    _enable_advanced(page)
    page.get_by_role("button", name="Recursos", exact=True).click()
    page.wait_for_timeout(4500)
    points = page.evaluate(
        "() => { const root = document.querySelector('[x-data]');"
        " const data = root && root._x_dataStack && root._x_dataStack[0];"
        " return data && data.netChartInstance"
        " ? data.netChartInstance.data.datasets[0].data.length : 0; }"
    )
    assert points >= 2


def test_apply_memory_button_visible(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    _enable_advanced(page)
    page.get_by_role("button", name="Recursos", exact=True).click()
    page.wait_for_timeout(500)
    btn = page.get_by_role("button", name="Aplicar limite de RAM")
    expect(btn).to_be_visible()
    page.on("dialog", lambda d: d.dismiss())
    btn.click()
    expect(btn).to_be_enabled()


def test_worlds_create_buttons(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Mundos", exact=True).click()
    expect(page.get_by_role("button", name="Criar", exact=True)).to_be_visible()
    expect(page.get_by_role("button", name="Criar e Ativar", exact=True)).to_be_visible()


def test_server_password_toggle(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Servidor", exact=True).click()
    pwd = page.locator("input[x-model='envValues.SERVER_PASS']")
    expect(pwd).to_have_attribute("type", "password")
    page.get_by_title("Mostrar senha").click()
    expect(pwd).to_have_attribute("type", "text")


def test_server_world_select(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Servidor", exact=True).click()
    expect(page.locator("select[x-model='selectedWorld']")).to_be_visible()


def test_dashboard_players_card(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    expect(page.get_by_text("Jogadores Online", exact=True)).to_be_visible()
    expect(page.get_by_text("Jogadores Conectados", exact=True)).to_be_visible()
    players_block = page.locator(".bg-valheim-800").filter(has=page.get_by_text("Jogadores Conectados", exact=True))
    expect(players_block.locator("ul .font-medium", has_text="TestPlayer")).to_be_visible()


def test_audit_modal(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="↻ Reiniciar", exact=True).click()
    page.wait_for_timeout(3500)
    _enable_advanced(page)
    page.get_by_role("button", name="Auditoria", exact=True).click()
    page.wait_for_timeout(800)
    page.get_by_role("button", name="Ver").first.click()
    expect(page.get_by_text("Detalhes da Auditoria")).to_be_visible()
    expect(page.get_by_text("Request", exact=True)).to_be_visible()
    expect(page.get_by_text("Response", exact=True)).to_be_visible()


def test_mod_toggle_visible(page: Page, base_url: str) -> None:
    _boot(page, base_url)
    page.get_by_role("button", name="Mods e Configs", exact=True).click()
    page.wait_for_timeout(500)
    expect(page.get_by_text("Nenhum mod instalado")).to_be_visible()
