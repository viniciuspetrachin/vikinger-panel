# Frequently asked questions

Quick answers for self-hosting Valheim with Vikinger Panel. The same content is searchable inside the panel under **Help**.

For step-by-step setup, see [Getting started](getting-started.md).

---

## Getting started

**How do my friends join the server?**  
In Valheim, use **Join via IP** and enter `YOUR_IP:2456` (default port 2456). Enter the server password. The address appears on the panel **Overview** tab under **How to connect**.

**Where do I set the server name and password?**  
**Server** tab. Password must be at least 5 characters and cannot contain the server name. Save and restart to apply.

**The server doesn't show up in the public list. What now?**  
Valheim's public list is slow and unreliable. Prefer **Join via IP**. Confirm the server is set to public on the **Server** tab.

**Do I need to open ports on my router?**  
Yes — for internet play, forward UDP ports **2456–2458**. See [Port forwarding](port-forwarding.md).

**How do I enable crossplay (PC + Xbox/Game Pass)?**  
On the **Server** tab, add `-crossplay` in **Extra arguments** and restart.

---

## Server

**What's the difference between Start, Stop, Restart, Pause, and Resume?**  
Start/Stop/Restart control the whole container. Pause/Resume only suspend the Valheim process inside the container (faster, container stays up).

**What are the Administrators, Banned, and Permitted lists?**  
Steam ID lists. Admins get moderation commands; banned players cannot join; permitted acts as a whitelist. On **Overview**, use **Actions** next to each player to promote, kick, or ban.

**How do I use the panel's interactive console?**  
The **ValheimRcon** mod is built in. In **Modded (BepInEx)** mode, the RCON password is generated on first setup. Console and moderation require BepInEx active.

**How do I change the RCON password?**  
Edit `config/bepinex/org.tristan.rcon.cfg` on the Mods tab, or set `PANEL_RCON_PASSWORD` in `.env`. Restart after changing.

**What's the difference between kick and ban?**  
Kick disconnects immediately but the player can rejoin. Ban blocks the Steam ID until you unban them.

**Can I remove ValheimRcon?**  
No — it is integrated. You can disable it on the Mods tab; it re-enables when switching back to Modded mode.

**How do I find a player's Steam ID?**  
Connected players show on Overview. For offline players, use [steamid.io](https://steamid.io) and copy **steamID64** (17 digits).

---

## Worlds

**How do I create a new world?**  
**Worlds** tab → enter a name → **Create** (pending) or **Create & Activate** (switches server). The world file is generated on first boot.

**What are the presets (Easy, Hard, Hardcore...)?**  
Same modifiers as Valheim's world creation screen, saved in the `.fwl` file. You can override individual settings after choosing a preset.

**Can I import a world I already have?**  
Yes. Copy `WorldName.fwl` and `WorldName.db` to `config/worlds_local/` via the Files tab or directly on disk.

**Does switching worlds delete the previous one?**  
No. Other worlds stay saved in `config/worlds_local/`.

---

## Mods & BepInEx

**How do I install a mod?**  
**Mods & Config** → paste a [Thunderstore](https://thunderstore.io/c/valheim/) URL and Install, or upload `.zip`/`.dll`. See [Installing mods](installing-mods.md).

**Do players need the mod too?**  
Server-side mods: no. Most gameplay/UI mods: yes, same version on each client.

**What is BepInEx?**  
The mod loader for Valheim. Mods usually create `.cfg` files in `config/bepinex/`, editable in the panel.

**Vanilla or modded?**  
Choose on first launch or **Server** → **Game updates**. Vanilla disables BepInEx; Modded enables BepInEx and ValheimRcon.

**How do game updates work?**  
The container uses SteamCMD (`valheim-updater`). Enable auto-update on the **Server** tab or click **Check for updates now**.

**Can updates break mods?**  
Yes. Back up, update the game, then check each mod on Thunderstore.

**How do I update a mod?**  
Thunderstore-linked mods show version status — use **Check for updates** and **Update mod**.

**I enabled/disabled a mod and nothing changed.**  
Restart the server from **Overview**.

---

## Backups

**Are backups automatic?**  
Yes — configure the schedule on the **Backups** tab. Worlds are zipped to `config/backups/`. Default retention: 30 days.

**How do I back up right now?**  
**Create manual backup** — choose Active world, Full, or Configs only.

**How do I restore a backup?**  
Click **Restore to here** on a backup row. Use **Undo last restore** to roll back.

**Can I limit backup disk usage?**  
**Server** tab → **Backup disk usage** → set a total limit. Oldest backups are pruned automatically.

---

## Resources & performance

**How much RAM does the server need?**  
Typically 2–4 GB, more with mods/players. Set a cap on **Server** → **Server capacity**. Metrics on **Overview**.

**How do I set the player limit?**  
**Server** tab → **Server capacity**. Vanilla supports up to 10; above that needs a mod (Valheim Plus or MaxPlayerCount).

**Does changing the RAM limit disconnect players?**  
Yes — the container is recreated. Do it during quiet hours.

---

## Installation & Docker

**How do I run the panel + server?**  
Copy `.env.example` to `.env`, edit values, run `./scripts/start.sh` or `docker compose up -d`. Panel at `http://YOUR_IP:8080`.

**I'm getting permission errors on folders.**  
Run `sudo chown -R 1000:1000 config/ data/ panel-data/`. See [Troubleshooting](troubleshooting.md).

**Is it safe to mount docker.sock in the panel?**  
The panel needs it to control the game container. Keep the panel on a private network; do not expose port 8080 to the whole internet without protection.

---

## Useful links

- [Official Valheim Wiki](https://valheim.fandom.com/wiki/Valheim_Wiki)
- [Thunderstore (Valheim mods)](https://thunderstore.io/c/valheim/)
- [BepInEx documentation](https://docs.bepinex.dev/)
- [lloesche/valheim-server Docker image](https://github.com/lloesche/valheim-server-docker)
- [Dedicated server (official wiki)](https://valheim.fandom.com/wiki/Hosting_a_Dedicated_Server)
