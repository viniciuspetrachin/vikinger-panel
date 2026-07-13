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

## [Unreleased]

### Added

### Changed

### Fixed
