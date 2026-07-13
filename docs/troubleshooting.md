# Troubleshooting

Solutions for the most common problems when self-hosting Valheim with Vikinger Panel.

---

## First boot takes forever

**Normal.** The server downloads Valheim (~2–3 GB) and installs BepInEx on first start.

- Watch **Overview** → live console
- Wait until you see the server ready / "Game server connected" messages
- Can take **10–30+ minutes** on slow connections

**Do not** run `docker compose down` during download unless you want to restart the download.

---

## Permission errors on config/ or data/

Symptoms: container restarts, "permission denied" in logs.

**Fix:**

```bash
sudo chown -R 1000:1000 config/ data/ panel-data/
```

Or use the bundled scripts:

```bash
./scripts/fix-worlds-permissions.sh
./scripts/fix-plugins-permissions.sh
```

Ensure `HOST_PROJECT_DIR` in `.env` points to the **correct absolute path**.

---

## Players cannot connect

| Check | Action |
|-------|--------|
| Server running? | `docker compose ps` — valheim should be `running` |
| Correct IP? | Use **public IP** for internet friends, **LAN IP** for same Wi‑Fi |
| Correct port? | Default is **2456** — `IP:2456` in Join IP |
| Password? | Must match `SERVER_PASS` (min. 5 characters) |
| Ports open? | Forward UDP **2456–2458** — see [Port forwarding](port-forwarding.md) |
| Firewall? | `sudo ufw status` — allow UDP 2456–2458 |

Test from the same network first. If LAN works but WAN does not, the problem is router/ISP.

---

## Docker permission denied

```bash
sudo usermod -aG docker $USER
```

Log out and back in. Verify:

```bash
getent group docker
docker ps
```

Set `DOCKER_GID` in `.env` to the GID from `getent group docker | cut -d: -f3`.

---

## Panel shows old UI after update

Hard refresh: **Ctrl+Shift+R** (or Cmd+Shift+R on Mac).

If you run production Docker (not dev mode), reload the panel image:

```bash
./scripts/reload-panel.sh --load-image
```

---

## Container exits immediately

```bash
docker compose logs valheim
docker compose logs panel
```

Common causes:

- Wrong `HOST_PROJECT_DIR`
- Disk full (`df -h`)
- Invalid `.env` values
- Port 8080 already in use — change `PANEL_PORT`

---

## Server not in public list

The Community list is unreliable. Use **Join IP** instead.

If you still want listing:

- **Server** tab → public server enabled
- Wait 5–15 minutes
- Listing is **not guaranteed** by Iron Gate / Steam

---

## Mod crash on startup

1. **Overview** → read last lines of console log
2. **Mods & Config** → disable the newest mod
3. Restart server
4. Re-enable mods one by one

Check Thunderstore for game-version compatibility after Valheim updates.

---

## RCON / console not working

Requires:

- **Modded (BepInEx)** mode
- ValheimRcon **enabled** on Mods tab
- Valid password in `config/bepinex/org.tristan.rcon.cfg`
- Server fully started (not still downloading)

---

## Out of memory

Valheim + BepInEx + several mods can exceed 4 GB.

- Close other apps on the host
- **Resources** tab (Advanced mode) — set a RAM limit
- Upgrade RAM or use a VPS with more memory

---

## Backup restore failed

- Ensure enough disk space
- Server must restart after restore — wait for Overview to show online
- Use **Undo restore** on Backups tab if you picked the wrong file

---

## Still need help?

1. Panel **Help** tab — searchable FAQ
2. [GitHub Issues](https://github.com/viniciuspetrachin/vikinger-panel/issues) — include `docker compose logs valheim` (redact passwords)
3. [Sponsor support](https://github.com/sponsors/viniciuspetrachin/dashboard) ($1+/month)
