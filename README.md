# Vikinger Panel — Free Valheim Server Manager (Docker)

**Host a Valheim dedicated server at home** with a modern web panel — no coding required.
Manage worlds, passwords, **BepInEx mods**, Thunderstore installs, backups, and player lists
from your browser.

[![License: Polyform Shield](https://img.shields.io/badge/License-Polyform%20Shield-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.1.10-gold.svg)](https://github.com/viniciuspetrachin/vikinger-panel/releases)
[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa)](https://github.com/sponsors/viniciuspetrachin/dashboard)

> **Self-hosted Valheim** · Docker one-click setup · Modded & vanilla · English UI · Free for personal use

**Looking for a step-by-step guide?** → **[Documentation for beginners](docs/getting-started.md)** (install Docker, download, connect friends)

---

## Table of contents

- [Who is this for?](#who-is-this-for)
- [Documentation](#documentation)
- [Quick start (recommended — GitHub Release)](#quick-start-recommended--github-release)
- [Install from source](#install-from-source)
- [Updating](#updating)
- [Features](#features)
- [Requirements](#requirements)
- [GitHub Sponsors](#github-sponsors)
- [Licensing](#licensing)
- [Support](#support)
- [Development](#development)
- [CI/CD and releases](#cicd-and-releases)
- [Credits](#credits)

---

## Who is this for?

- **First-time server hosts** who want Valheim with friends without reading wiki threads
- **Home lab / VPS owners** who prefer Docker over manual SteamCMD setup
- **Modded communities** using Thunderstore, BepInEx, and scheduled backups
- **Not for** commercial hosting providers reselling the panel (see [licensing](#licensing))

---

## Documentation

| Guide | Description |
|-------|-------------|
| [**Getting started**](docs/getting-started.md) | Full walkthrough — Docker, `.env`, first boot, connect in-game |
| [**Port forwarding**](docs/port-forwarding.md) | Router, firewall, VPS — let friends join from the internet |
| [**Installing mods**](docs/installing-mods.md) | Thunderstore, BepInEx, what players need on their PC |
| [**Troubleshooting**](docs/troubleshooting.md) | Permissions, ports, slow first boot, common errors |
| [**FAQ**](docs/faq.md) | Quick answers (same topics as the in-panel Help tab) |

---

## Quick start (recommended — GitHub Release)

Best for server owners who just want to run the panel — **no git clone required**.

### 1. Requirements

- Linux with **Docker** and **Docker Compose** v2
- UDP ports **2456–2458** open on your firewall (for external players)
- ~4 GB RAM (Valheim + BepInEx + panel)
- Your user in the `docker` group (`DOCKER_GID`)

### 2. Download the release

Go to **[GitHub Releases](https://github.com/viniciuspetrachin/vikinger-panel/releases)** and download:

`vikinger-panel-X.Y.Z-dist.zip`

### 3. Extract and configure

```bash
unzip vikinger-panel-*-dist.zip
cd vikinger-panel-*/
cp .env.example .env
nano .env   # or your preferred editor
```

| Variable | What to set |
|----------|-------------|
| `HOST_PROJECT_DIR` | **Absolute** path to this folder (e.g. `/home/you/vikinger-panel`) |
| `DOCKER_GID` | Docker group GID: `getent group docker \| cut -d: -f3` |
| `SERVER_NAME` | Server name shown in the server list |
| `WORLD_NAME` | Active world name on first boot |
| `SERVER_PASS` | Server password (min. 5 characters; empty = open) |
| `PANEL_PORT` | Panel HTTP port (default `8080`) |

### 4. Start everything

```bash
chmod +x scripts/*.sh
./scripts/start.sh
```

The script loads the bundled Docker image and starts two containers:
**valheim-server** (game) and **vikinger-panel** (web UI).

### 5. Open the panel

Browse to **http://localhost:8080** (or your `PANEL_PORT`).

On the **first boot**, Valheim downloads the game and installs BepInEx — this can take
several minutes. Watch progress on the **Overview** tab (live console).

### 6. Connect in-game

In Valheim, use **Join IP** and enter `YOUR_IP:2456` (default port). Enter the server
password if set. The current address is shown on the **Overview** tab under “How to connect”.

### Troubleshooting

See **[docs/troubleshooting.md](docs/troubleshooting.md)** for detailed fixes. Quick reference:

| Issue | Fix |
|-------|-----|
| Permission errors on folders | Ensure `config/` and `data/` are owned by UID 1000 |
| Players cannot connect | Forward UDP **2456–2458** to the host — [port forwarding guide](docs/port-forwarding.md) |
| Panel looks stale after update | Hard refresh: `Ctrl+Shift+R` |
| `DOCKER_GID` wrong | Run `getent group docker` and update `.env` |
| First boot very slow | Normal — Valheim downloads ~2–3 GB; watch Overview console |

---

## Install from source

For contributors or anyone who wants to build the image locally:

```bash
git clone https://github.com/viniciuspetrachin/vikinger-panel.git
cd vikinger-panel
cp .env.example .env
# Edit .env: SERVER_NAME, WORLD_NAME, SERVER_PASS, HOST_PROJECT_DIR, DOCKER_GID
docker compose up -d --build
```

Open **http://localhost:8080**. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full dev workflow.

### Valheim only (no panel)

```bash
docker compose --project-directory . -f server/docker-compose.standalone.yml up -d
```

---

## Updating

### From a release ZIP

1. Download the new release from [GitHub Releases](https://github.com/viniciuspetrachin/vikinger-panel/releases)
2. Extract **over** the existing folder (or migrate `config/`, `data/`, `panel-data/`)
3. Run:

```bash
./scripts/reload-panel.sh --load-image
```

Your worlds, mods, and settings in `config/`, `data/`, and `panel-data/` are preserved.

### Pull image from GHCR (alternative)

```bash
docker pull ghcr.io/viniciuspetrachin/vikinger-panel:X.Y.Z
docker compose up -d
```

---

## Features

| Area | What you can do |
|------|-----------------|
| **Overview** | Server status, online players, live console, quick controls |
| **Server** | Name, password, port, admin/ban/allow lists, extra args (`-crossplay`) |
| **Worlds** | Create, switch, presets (Easy → Hardcore), `.fwl` editor, import worlds |
| **Mods & Config** | Install via Thunderstore/URL/upload, enable/disable, edit BepInEx `.cfg`, game & mod updates |
| **Backups** | Cron scheduling, manual backup, download and restore |
| **Resources** *(advanced)* | Container RAM limit, real-time CPU/network charts |
| **Files** *(advanced)* | File browser with CodeMirror editor |
| **Logs / Audit** *(advanced)* | Sanitized Docker logs, audit trail of all panel actions |

**Advanced mode** in the sidebar reveals Resources, Files, Logs, and Audit — for experienced admins.

---

## Requirements

- Linux with **Docker** and **Docker Compose** v2
- UDP ports **2456–2458** open (for external players)
- ~4 GB RAM recommended (Valheim + BepInEx + panel)
- Access to `docker.sock` (the panel container controls the game server)

---

## GitHub Sponsors

If Vikinger Panel helps you, consider becoming a sponsor:

**[github.com/sponsors/viniciuspetrachin/dashboard](https://github.com/sponsors/viniciuspetrachin/dashboard)**

- Sponsorship helps **keep the project maintained** — new features, bug fixes, and releases
- Sponsors at **$1 USD/month or more** get **direct support** from the author (install help, configuration questions, etc.)
- Sponsorship is voluntary and **does not replace** a commercial license for hosting providers reselling the panel

You can also use the **Support the Project** tab inside the panel.

---

## Licensing

This project uses **[Polyform Shield 1.0.0](LICENSE)** — a *source-available* license for open
community use **without allowing resale**.

### Free for self-hosters

- Run on **your own** Valheim server (home, VPS, community)
- Modify the code for personal use
- Contribute PRs, issues, and documentation
- Distribute forks under the same license terms

### Commercial license for hosting providers

- Hosting providers offering the panel to paying customers
- Resale or white-label as a paid product
- Any service competing with Vikinger Panel as a commercial offering

**Contact for commercial licensing:** [vr.petrachin@gmail.com](mailto:vr.petrachin@gmail.com)

See [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md) for details.

---

## Support

| Channel | Purpose |
|---------|---------|
| [GitHub Issues](https://github.com/viniciuspetrachin/vikinger-panel/issues) | Bugs and feature requests |
| [GitHub Sponsors](https://github.com/sponsors/viniciuspetrachin/dashboard) ($1+/month) | Direct support from the author |
| Panel **Help** tab | Built-in FAQ |
| [vr.petrachin@gmail.com](mailto:vr.petrachin@gmail.com) | Commercial licensing |

---

## Development

### Dev mode with hot-reload

```bash
./scripts/dev.sh
```

- **Backend:** `uvicorn --reload` — edit `panel/*.py` and it reloads
- **Frontend:** Tailwind + esbuild watcher — edit `panel/frontend/**` and refresh with **F5**
- No image rebuild needed in dev mode

### Production deploy (embedded assets)

```bash
./scripts/reload-panel.sh           # rebuild + restart panel container
./scripts/reload-panel.sh --tests   # pytest unit + e2e before deploy
```

### Manual tests and build

```bash
cd panel
python -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/pytest tests/unit -q
.venv/bin/playwright install chromium
.venv/bin/pytest tests/e2e -q
npm install && npm run build
```

---

## CI/CD and releases

Every merge to `main` automatically:

1. **Runs tests** (unit + E2E with Playwright)
2. **Bumps version** — patch auto-increment (`2.1.0` → `2.1.1`; edit `panel/version.py` manually for major/minor)
3. **Creates git tag** `vX.Y.Z` and **GitHub Release** with:
   - Ready-to-use ZIP (no source code)
   - Docker image `.tar` file
4. **Publishes image to GHCR:** `ghcr.io/viniciuspetrachin/vikinger-panel:X.Y.Z`

Pull requests to `main` run the same tests via GitHub Actions. Enable **branch protection**
requiring the `test` check before merge — see [CONTRIBUTING.md](CONTRIBUTING.md).

### Monorepo layout

```
vikinger-panel/
├─ panel/                     # web panel (FastAPI + Alpine.js)
├─ server/                    # standalone game server compose
├─ scripts/                   # dev.sh, reload-panel.sh, release scripts
├─ docker-compose.yml         # PRODUCTION: valheim-server + vikinger-panel
├─ docker-compose.dev.yml     # DEV: hot-reload override
├─ config/                    # server config (gitignored)
├─ data/                      # game data: worlds, steamapps (gitignored)
└─ panel-data/                # panel data: audit, mod registry (gitignored)
```

### Important environment variables

| Variable | Description |
|----------|-------------|
| `SERVER_NAME` | Name shown in the Valheim server list |
| `WORLD_NAME` | Active world on first boot |
| `SERVER_PASS` | Server password (min. 5 characters) |
| `HOST_PROJECT_DIR` | Absolute project path on the host |
| `DOCKER_GID` | GID of the `docker` group (`getent group docker`) |
| `PANEL_PORT` | Panel HTTP port (default `8080`) |
| `UPDATE_CRON` | Cron for game update checks (empty = disabled) |
| `UPDATE_IF_IDLE` | Only update when no players online (`true`/`false`) |

---

## Credits

- [lloesche/valheim-server-docker](https://github.com/lloesche/valheim-server-docker) — base server image
- [Thunderstore Valheim](https://thunderstore.io/c/valheim/) — mods
- Valheim community

---

© 2026 [Vinicius Petrachin](https://github.com/viniciuspetrachin) ·
[Polyform Shield 1.0.0](LICENSE)
