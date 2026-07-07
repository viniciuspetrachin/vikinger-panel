# Valheim Panel

Painel web moderno para gerenciar servidores **Valheim** dockerizados — mundos, mods BepInEx,
backups, métricas, logs e muito mais, tudo em uma interface única.

[![License: Polyform Shield](https://img.shields.io/badge/License-Polyform%20Shield-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-gold.svg)](https://github.com/viniciuspetrachin/valheim-panel)

> Interface em português · 100% dockerizado · Testes unitários e E2E · Sem CDN externo

---

## Funcionalidades

| Área | O que você pode fazer |
|------|----------------------|
| **Visão Geral** | Status do servidor, jogadores online, console ao vivo, controles rápidos |
| **Servidor** | Nome, senha, porta, listas admin/ban/permitidos, argumentos extra (`-crossplay`) |
| **Mundos** | Criar, trocar, presets (Fácil → Hardcore), editor de `.fwl`, importar mundos |
| **Mods e Configs** | Instalar via Thunderstore/URL/upload, ativar/desativar, editar `.cfg` BepInEx |
| **Backups** | Agendamento cron, backup manual, download e restauração |
| **Recursos** *(avançado)* | Limite de RAM do container, gráficos de CPU/rede em tempo real |
| **Arquivos** *(avançado)* | Navegador de arquivos com editor CodeMirror |
| **Logs / Auditoria** *(avançado)* | Logs do Docker sanitizados, trilha de auditoria de todas as ações |

O **Modo avançado** na sidebar revela Recursos, Arquivos, Logs e Auditoria — ideal para
administradores experientes.

---

## Requisitos

- Linux com **Docker** e **Docker Compose** v2
- Portas UDP **2456–2458** liberadas (para jogadores externos)
- ~4 GB RAM recomendados (Valheim + BepInEx + painel)
- Acesso ao `docker.sock` (o container do painel controla o servidor)

---

## Instalação rápida

```bash
git clone https://github.com/viniciuspetrachin/valheim-panel.git
cd valheim-panel
cp .env.example .env
# Edite .env: SERVER_NAME, WORLD_NAME, SERVER_PASS, HOST_PROJECT_DIR, DOCKER_GID
docker compose up -d --build
```

Abra **http://localhost:8080** (ou a porta definida em `PANEL_PORT`).

### Variáveis importantes

| Variável | Descrição |
|----------|-----------|
| `SERVER_NAME` | Nome exibido na lista do Valheim |
| `WORLD_NAME` | Mundo ativo na primeira subida |
| `SERVER_PASS` | Senha do servidor (mín. 5 caracteres) |
| `HOST_PROJECT_DIR` | Caminho absoluto do projeto no host |
| `DOCKER_GID` | GID do grupo `docker` no host (`getent group docker`) |
| `PANEL_PORT` | Porta HTTP do painel (padrão `8080`) |

### Primeira subida

Na primeira execução o container do Valheim baixa o jogo e instala o BepInEx — pode levar
vários minutos. Acompanhe na aba **Visão Geral** (console ao vivo).

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│  Navegador  →  :8080  →  valheim-panel (FastAPI)        │
│                              │                          │
│                              ├─ docker.sock             │
│                              └─ volumes config/data     │
└─────────────────────────────────────────────────────────┘
                               │
                               ▼
                    valheim-server (lloesche/valheim-server)
                    UDP 2456-2458 · BepInEx · mundos/mods
```

**Stack:** FastAPI · Alpine.js · Tailwind CSS · Chart.js · CodeMirror · Docker Compose

---

## Desenvolvimento

```bash
cd app
python -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/pytest tests/unit -q          # unitários
.venv/bin/playwright install chromium
.venv/bin/pytest tests/e2e -q           # E2E com Playwright

npm install && npm run build            # rebuild CSS/JS
```

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para o fluxo completo de contribuição.

---

## Licenciamento

Este projeto usa a **[Polyform Shield 1.0.0](LICENSE)** — licença *source-available* pensada
para projetos que querem comunidade aberta **sem permitir revenda**.

### Uso gratuito ✅

- Rodar no **seu próprio** servidor Valheim (casa, VPS, comunidade)
- Modificar o código para uso pessoal
- Contribuir com PRs, issues e documentação
- Distribuir forks mantendo os termos da licença

### Requer licença comercial 💼

- Provedores de **hospedagem** que oferecem o painel aos clientes
- **Revenda** ou white-label como produto pago
- Qualquer serviço que concorra com o Valheim Panel como oferta comercial

Detalhes, planos e contato: **[COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md)**

---

## Doações

O desenvolvimento é mantido de forma independente. Se o painel te ajuda, considere apoiar:

- Aba **Doações** dentro do painel (links configuráveis)
- Variáveis de ambiente no `.env`:

```bash
PANEL_DONATION_GITHUB=https://github.com/sponsors/seu-usuario
PANEL_DONATION_KOFI=https://ko-fi.com/seu-usuario
PANEL_DONATION_PIX=sua-chave-pix@email.com
PANEL_COMMERCIAL_EMAIL=licensing@seudominio.com
```

> Doações são voluntárias e **não substituem** licença comercial para hospedagens.

---

## Roadmap

- [ ] Publicar repositório como open source
- [ ] Definir preços da licença comercial para provedores
- [ ] Internacionalização (EN)
- [ ] Autenticação no painel (opcional)

---

## Créditos

- [lloesche/valheim-server-docker](https://github.com/lloesche/valheim-server-docker) —
  imagem base do servidor
- [Thunderstore Valheim](https://thunderstore.io/c/valheim/) — mods
- Comunidade Valheim BR

---

## Suporte

- **Bugs e features:** [GitHub Issues](https://github.com/viniciuspetrachin/valheim-panel/issues)
- **Licenciamento comercial:** veja [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md)
- **Ajuda no painel:** aba **Ajuda** (FAQ integrado)

---

© 2026 [Vinicius Petrachin](https://github.com/viniciuspetrachin) ·
[Polyform Shield 1.0.0](LICENSE)
