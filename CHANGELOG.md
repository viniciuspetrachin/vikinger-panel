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

## [Unreleased]

### Added

- Aba **Mods**: bloco **Atualizações do jogo** com modo vanilla/modded (BepInEx), auto-update, intervalo cron, verificação manual e aviso sobre compatibilidade de mods.
- API `/api/updates/*` para config, status e trigger do `valheim-updater`.
- Registro Thunderstore (`panel-data/mods-registry.json`) e endpoints por mod: vincular, buscar e aplicar atualizações.
- FAQ expandido sobre updates e mods.
