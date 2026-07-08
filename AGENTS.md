# Guia para agentes (Cursor / IA)

## Workspace raiz

```
/home/vinicius/valheim-panel
```

Sempre abra o agente nesta pasta. Não use `/home/vinicius` nem `/home/vinicius/valheim-server` como raiz do workspace.

## Mapa de paths

| Path | Conteúdo |
|------|----------|
| `app/main.py` | Backend FastAPI (API, Docker, mods, jogadores) |
| `app/frontend/js/` | Frontend Alpine.js (fonte) |
| `app/static/index.html` | HTML principal |
| `app/static/app.bundle.js` | Bundle gerado (`npm run build`) |
| `app/tests/unit/` | Testes unitários |
| `app/tests/e2e/` | Testes Playwright |
| `config/` → `../valheim-server/config` | Config do servidor (adminlist, bepinex, mundos) |
| `data/` → `../valheim-server/data` | Dados do jogo (worlds, steamapps) |
| `panel-data/` | Dados do painel (audit, exports, registry de mods) |
| `scripts/reload-panel.sh` | Rebuild + restart do container após mudanças |

## Deploy após editar código

```bash
cd /home/vinicius/valheim-panel
./scripts/reload-panel.sh
```

Com testes:

```bash
./scripts/reload-panel.sh --tests
```

O painel serve arquivos da **imagem Docker**; F5 no navegador não aplica mudanças sem rebuild.

## Containers

| Container | Imagem | Porta |
|-----------|--------|-------|
| `valheim-server` | `lloesche/valheim-server:latest` | UDP 2456–2458 |
| `valheim-panel` | build local (`Dockerfile`) | HTTP 8080 |

## O que NÃO editar

- `valheim-server/panel/` — removido (legado); painel atual está em `valheim-panel/app/`
- Bundles em `app/static/*.bundle.js` — gerados por `npm run build`, editar `app/frontend/` em vez disso
