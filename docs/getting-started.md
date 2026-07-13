# Getting started — host Valheim at home

This guide assumes **zero prior experience** with game servers or Docker. Follow the steps in order.

**Time:** ~30–60 minutes (plus Valheim's first download, which can take 10–30 minutes).

---

## What you need

| Requirement | Details |
|-------------|---------|
| **Computer** | Linux PC, old laptop, mini PC, or a cheap cloud VPS (Ubuntu/Debian recommended) |
| **RAM** | At least **4 GB** free (8 GB is comfortable with mods) |
| **Disk** | ~10 GB for the game + mods + worlds |
| **Network** | Stable internet; see [Port forwarding](port-forwarding.md) if friends join from outside your home |
| **Steam account** | Valheim server files are downloaded automatically (no purchase needed on the server machine for dedicated hosting) |

---

## Step 1 — Install Docker

Docker runs the Valheim server and the web panel in isolated containers — like lightweight virtual machines.

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
```

**Log out and log back in** (or reboot) so your user can run Docker without `sudo`.

Verify:

```bash
docker --version
docker compose version
```

### Other Linux distros

See [Docker's official install docs](https://docs.docker.com/engine/install/).

---

## Step 2 — Download Vikinger Panel

Go to **[GitHub Releases](https://github.com/viniciuspetrachin/vikinger-panel/releases)** and download:

```
vikinger-panel-X.Y.Z-dist.zip
```

This ZIP is ready to use — **no git clone, no compiling**.

```bash
unzip vikinger-panel-*-dist.zip
cd vikinger-panel-*/
```

---

## Step 3 — Configure `.env`

Copy the example file and open it in a text editor:

```bash
cp .env.example .env
nano .env
```

### Required settings

| Variable | Example | What it means |
|----------|---------|---------------|
| `HOST_PROJECT_DIR` | `/home/you/vikinger-panel` | **Full path** to this folder on your machine |
| `DOCKER_GID` | `999` | Docker group ID — run: `getent group docker \| cut -d: -f3` |
| `SERVER_NAME` | `Our Viking Realm` | Name shown in Valheim's server list |
| `WORLD_NAME` | `Midgard` | World created on first boot |
| `SERVER_PASS` | `secret123` | Password (min. 5 chars) — leave empty for open server |
| `PANEL_PORT` | `8080` | Web panel URL port |

Save the file (`Ctrl+O`, Enter, `Ctrl+X` in nano).

---

## Step 4 — Start everything

```bash
chmod +x scripts/*.sh
./scripts/start.sh
```

This loads the Docker image and starts two containers:

- **valheim-server** — the game
- **vikinger-panel** — the web UI

Check status:

```bash
docker compose ps
```

Both should show `running` (the game may show `starting` during first boot).

---

## Step 5 — Open the web panel

In your browser:

```
http://localhost:8080
```

Or replace `localhost` with your server's IP if you browse from another PC on the same network.

### First-run wizard

On first visit, the panel asks:

1. **Vanilla** — no mods (simplest)
2. **With mods (BepInEx)** — enables mod support and the built-in console

Pick one and confirm. You can change this later on the **Mods & Config** tab.

### First boot takes time

Valheim downloads game files and (if modded) installs BepInEx. Watch the **Overview** tab — the live console shows progress. **Do not stop the container** during this phase.

---

## Step 6 — Connect in Valheim

### On the same network (LAN)

1. Open Valheim → **Join Game** → **Join IP**
2. Enter: `SERVER_IP:2456` (default game port)
3. Enter the server password if you set one

The panel **Overview** tab shows the exact address under **How to connect**.

### Friends on the internet

You must forward UDP ports **2456–2458** on your router. See **[Port forwarding](port-forwarding.md)**.

---

## Step 7 — Make yourself admin

1. Find your Steam ID at [steamid.io](https://steamid.io) — copy **steamID64** (17 digits)
2. In the panel: **Server** → **Player Lists** → **Administrators**
3. Add your Steam ID, save, restart if prompted

Admins can use in-game moderation commands and the panel's player actions.

---

## Daily commands

| Task | Command |
|------|---------|
| Stop server | `docker compose down` |
| Start again | `docker compose up -d` |
| View game logs | `docker compose logs -f valheim` |
| Update panel | Download new release ZIP → `./scripts/reload-panel.sh --load-image` |

---

## Next steps

- [Forward ports](port-forwarding.md) so friends can join from outside
- [Install mods](installing-mods.md) from Thunderstore
- [Troubleshooting](troubleshooting.md) if something goes wrong
- [FAQ](faq.md) for quick answers

---

## Still stuck?

- Use the **Help** tab inside the panel (searchable FAQ)
- Open a [GitHub Issue](https://github.com/viniciuspetrachin/vikinger-panel/issues)
- [Sponsor at $1+/month](https://github.com/sponsors/viniciuspetrachin/dashboard) for direct help from the maintainer
