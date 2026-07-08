# Guia para agentes (Cursor / IA)

## Workspace raiz

```
/home/vinicius/vikinger-panel
```

Monorepo unico: painel + infra do servidor Valheim. Abra o agente nesta pasta.

## Mapa de paths

| Path | Conteúdo |
|------|----------|
| `panel/main.py` | Backend FastAPI (API, Docker, mods, jogadores) |
| `panel/frontend/js/` | Frontend Alpine.js (fonte) |
| `panel/static/index.html` | HTML principal |
| `panel/static/app.bundle.js` | Bundle gerado (`npm run build`) |
| `panel/tests/unit/` | Testes unitários |
| `panel/tests/e2e/` | Testes Playwright |
| `server/docker-compose.standalone.yml` | Fallback só-servidor (sem painel) |
| `config/` | Config do servidor (adminlist, bepinex, mundos) — gitignored |
| `data/` | Dados do jogo (worlds, steamapps) — gitignored |
| `panel-data/` | Dados do painel (audit, exports, registry de mods) — gitignored |
| `docker-compose.yml` | Produção: sobe `valheim-server` + `vikinger-panel` |
| `docker-compose.dev.yml` | Override de dev (bind-mount + hot-reload) |
| `scripts/dev.sh` | Sobe o painel em modo dev com hot-reload |
| `scripts/reload-panel.sh` | Rebuild + restart do container (fluxo de produção) |

## Desenvolvimento com hot-reload (recomendado para debug)

```bash
cd /home/vinicius/vikinger-panel
./scripts/dev.sh
```

Faz bind-mount de `panel/` no container, roda `uvicorn --reload` e um watcher do
frontend (Tailwind + esbuild). Editar `panel/**` reflete no navegador com F5, sem rebuild.

## Deploy de produção (imagem embarcada)

```bash
cd /home/vinicius/vikinger-panel
./scripts/reload-panel.sh            # rebuild + restart
./scripts/reload-panel.sh --tests    # pytest unit + e2e antes do deploy
```

No modo de produção o painel serve arquivos embarcados na imagem; F5 não basta sem rebuild.

## Containers

| Container | Imagem | Porta |
|-----------|--------|-------|
| `valheim-server` | `lloesche/valheim-server:latest` | UDP 2456–2458 |
| `vikinger-panel` | build local (`Dockerfile`) | HTTP 8080 |

## O que NÃO editar

- Bundles em `panel/static/*.bundle.js` — gerados por `npm run build`, edite `panel/frontend/`
- `config/` e `data/` — dados de runtime do jogo (gitignored)
