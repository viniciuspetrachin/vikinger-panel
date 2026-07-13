# Vikinger Panel — Installation

Ready-to-use package **without source code**. You only need Docker and Docker Compose.

**New to game servers?** Read **[docs/getting-started.md](docs/getting-started.md)** for a full beginner walkthrough.

## Requirements

- Linux with **Docker** and **Docker Compose** v2
- UDP ports **2456–2458** open on the firewall (external players)
- ~4 GB RAM (Valheim + BepInEx + panel)
- User with access to `docker.sock` (`docker` group)

## Quick install

### 1. Extract the package

```bash
unzip vikinger-panel-*-dist.zip
cd vikinger-panel-*/
```

### 2. Configure `.env`

```bash
cp .env.example .env
nano .env   # or your preferred editor
```

| Variable | What to set |
|----------|-------------|
| `HOST_PROJECT_DIR` | **Absolute** path to this folder (e.g. `/home/you/vikinger-panel`) |
| `DOCKER_GID` | Docker group GID: `getent group docker \| cut -d: -f3` |
| `SERVER_NAME` | Server name in the list |
| `WORLD_NAME` | World name |
| `SERVER_PASS` | Server password (empty = open) |
| `PANEL_PORT` | Panel HTTP port (default `8080`) |

### 3. Start everything

```bash
chmod +x scripts/*.sh
./scripts/start.sh
```

The script loads the Docker image from `images/` and starts two containers:
**valheim-server** (game) and **vikinger-panel** (web UI).

### 4. Open the panel

Browse to **http://localhost:8080** (or your `PANEL_PORT`).

On the **first boot**, Valheim downloads the game and installs BepInEx — this can take
several minutes. Watch progress on the **Overview** tab.

---

## Update to a new version

1. Download the new release ZIP from [GitHub Releases](https://github.com/viniciuspetrachin/vikinger-panel/releases)
2. Extract **over** the existing folder (or migrate `config/`, `data/`, `panel-data/`)
3. Run:

```bash
./scripts/reload-panel.sh --load-image
```

Your worlds, mods, and settings in `config/`, `data/`, and `panel-data/` are preserved.

---

## Alternative: pull image from the internet

If you prefer not to use the local `.tar` file:

```bash
# Replace VERSION with the version in the VERSION file in this folder
docker pull ghcr.io/viniciuspetrachin/vikinger-panel:VERSION
docker compose up -d
```

---

## Useful commands

| Command | Description |
|---------|-------------|
| `docker compose ps` | Container status |
| `docker compose logs -f valheim` | Game server logs |
| `docker compose logs -f panel` | Panel logs |
| `docker compose down` | Stop everything |
| `docker compose up -d` | Start again |

---

## Important folders

| Folder | Contents |
|--------|----------|
| `config/` | Valheim and BepInEx configuration |
| `data/` | Game data (worlds, Steam, installed mods) |
| `panel-data/` | Audit log, FWL backups, mod registry |

**Back up** `config/`, `data/`, and `panel-data/` before major updates.

---

## Documentation (included in this package)

| Guide | Topic |
|-------|-------|
| [docs/getting-started.md](docs/getting-started.md) | Install, configure, connect |
| [docs/port-forwarding.md](docs/port-forwarding.md) | Friends join from the internet |
| [docs/installing-mods.md](docs/installing-mods.md) | Thunderstore & BepInEx |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Common errors |
| [docs/faq.md](docs/faq.md) | Quick answers |

---

## License & support

This software is distributed under [Polyform Shield 1.0.0](LICENSE).
Commercial use requires a separate license — contact **[vr.petrachin@gmail.com](mailto:vr.petrachin@gmail.com)**.

Support the project: [GitHub Sponsors](https://github.com/sponsors/viniciuspetrachin/dashboard)
