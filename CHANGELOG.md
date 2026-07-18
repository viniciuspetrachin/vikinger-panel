# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0]

### Changed

- **Monorepo único:** `valheim-panel` e `valheim-server` consolidados em uma só pasta/repositório (`vikinger-panel`). `config/`, `data/` e `.mod-cache/` agora vivem dentro do projeto (sem symlinks).
- Código do painel movido de `app/` para `panel/`; infra do servidor em `server/`.
- Rebrand para **Vikinger Panel** (interface, docs e metadados).
- `docker-compose.yml` único sobe os 2 containers (`valheim-server` + `vikinger-panel`) com paths relativos.

### Added

- **Modo dev com hot-reload:** `docker-compose.dev.yml` + `scripts/dev.sh` (uvicorn `--reload` + watcher Tailwind/esbuild). Editar `panel/**` reflete no navegador com F5, sem rebuild.
- `server/docker-compose.standalone.yml` para rodar só o servidor.

## [2.1.1]

### Changed

- Release automático v2.1.1.

## [2.1.2]

### Changed

- Release automático v2.1.2.

## [2.1.3]

### Changed

- Release automático v2.1.3.

## [2.1.4]

### Changed

- Release automático v2.1.4.

## [2.1.5]

### Added

- **Files tab:** search by file name with type filter chips (Config, DLLs, Plugins, Worlds, Lists, Backups, Logs).
- **Server tab:** optional backup disk usage limit with automatic pruning of oldest ZIPs; **Clear all backups now** action (irreversible, preserves restore checkpoints).
- Aba **Mods**: bloco **Atualizações do jogo** com modo vanilla/modded (BepInEx), auto-update, intervalo cron, verificação manual e aviso sobre compatibilidade de mods.
- API `/api/updates/*` para config, status e trigger do `valheim-updater`.
- Registro Thunderstore (`panel-data/mods-registry.json`) e endpoints por mod: vincular, buscar e aplicar atualizações.
- FAQ expandido sobre updates e mods.
- **i18n:** multi-language UI (en-US, pt-BR, de-DE, ru-RU, es-ES) with locale persistence.
- **About:** changelog synced 1:1 from `CHANGELOG.md` / GitHub Releases.
- **Panel self-update:** check for new releases and apply GHCR image update with automatic container restart.

### Changed

- Translation fixes for technical terms (RAM, Mods, Plugins, etc.).

## [2.1.6]

### Added

### Changed

### Fixed

## [2.1.7]

### Added

### Changed

### Fixed

## [2.1.8]

### Added

### Changed

### Fixed

## [2.1.9]

### Added

### Changed

### Fixed

## [2.1.10]

### Added

- **Aba Mapa:** leitura do arquivo ServerSideMap (`.mod.serversidemap.explored`) com pins compartilhados e fog de exploração renderizado como PNG (`GET /api/map/{world}` + `/api/map/{world}/fog.png`).
- **Aba Mapa:** seletor de mundo (padrão = mundo ativo) e opção “mostrar totalmente explorado” (fog of war vs disco completo).
- **Aba Mapa:** zoom/pan (scroll, arrastar, botões +/−/reset) no canvas do mapa.
- **Aba Mapa:** marcada como **Beta** na sidebar e no título da página.

### Changed

- **Aba Mapa:** o ServerSideMap deixou de ser obrigatório — o PNG do mapa (disco tintado pela seed) é sempre gerado; o mod só acrescenta fog real e pins compartilhados.

### Fixed

- **Tema claro:** paleta parchment/forest alinhada (contraste de texto, borders, botões sólidos, badges, toasts e estados success/danger/warning).
- **Aba Mapa:** deixava de mostrar conteúdo em saves reais (scan heurístico de portais no `.db` não encontra prefabs); agora usa pins/fog do ServerSideMap quando o mod está presente.
- **Aba Mapa:** “mostrar totalmente explorado” não atualizava / ficava oculto sem o mod; agora o toggle sempre aparece com mundo selecionado e força reload da imagem.

## [2.1.11]

### Added

### Changed

### Fixed

## [2.1.12]

### Added

- **Discord alerts (sidebar):** primary **Discord** tab with webhook setup, event toggles, secret eye-toggle, and reliable Send test (uses form URL + Discord `wait=true`).
- **Alert events:** player leave, mod installed (+ version), server starting/stopping/restarting, high load (≥80% CPU/RAM with hysteresis).
- **Player name cache:** join/leave alerts prefer character names from `panel-data/players-seen.json`; waits briefly for the name on first sighting.
- **Docs:** [Discord alerts guide](docs/discord-alerts.md) — webhook setup for beginners.

### Changed

- Discord/Telegram alerts page moved out of Config into the main sidebar for easier discovery.
- Event list is data-driven (`ALERT_EVENT_DEFS`) so new toggles are easy to add.

### Fixed

- Send test could report success without delivering when the webhook was not saved yet.

## [2.1.13]

### Added

### Changed

### Fixed

## [2.1.14]

### Added

### Changed

### Fixed

## [Unreleased]

### Added

- **Files tab:** delete files from the editor with a confirmation modal; BepInEx plugin configs show whether an active `.dll` depends on them and whether the server will recreate the file on next load.
- **Files tab:** new **JSON** filter chip; JSON files open pre-formatted with a **Format JSON** action and validation on save.
- **Map:** ServerSideMap shared pins use Valheim-style sprites (`mapIcons.png`), fog is clipped to the world circle, and pins can be focused or deleted from the UI (`DELETE /api/map/{world}/pins/{index}`).
- **Map:** install hint linking to ServerSideMap on Thunderstore when the mod DLL is missing.

### Changed

- **Files tab:** **Plugins** filter now lists `.dll` files under `plugins/`; **Worlds** filter hides backup worlds (`*_backup*`, `.bak`, `backups/`).
- **Map:** higher max zoom, improved marker layout, and `serversidemap_dll` flag when the mod is installed but data is not present yet.

### Fixed

- **Console / Logs:** log viewer no longer stays blank when output is empty or whitespace-only; refresh after RCON commands targets the Console page again; log polling no longer blocks on unrelated busy actions.
