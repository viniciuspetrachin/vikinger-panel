# Installing mods on your Valheim server

Vikinger Panel supports **BepInEx** mods via Thunderstore, direct upload, or URLs. This guide explains what beginners need to know.

---

## Vanilla vs modded

| Mode | Best for |
|------|----------|
| **Vanilla** | Pure Valheim, no extra setup, all players only need the base game |
| **Modded (BepInEx)** | Custom gameplay, admin tools, quality-of-life mods |

Switch on first-run wizard or **Mods & Config** tab. Switching to modded installs BepInEx and may restart the server.

---

## Install from Thunderstore

1. Open [Thunderstore — Valheim](https://thunderstore.io/c/valheim/)
2. Copy a mod page URL (or r2modman link)
3. In the panel: **Mods & Config** → paste URL → **Install**
4. Restart the server if prompted

The panel downloads dependencies when Thunderstore lists them.

---

## Install from a ZIP or DLL

**Mods & Config** → **Upload** → select `.zip` or `.dll`.

Use this for mods not on Thunderstore or custom builds.

---

## Do players need the same mods?

| Mod type | Players need it? |
|----------|------------------|
| **Server-side** (e.g. ServerSideMap, anti-cheat) | No — runs only on server |
| **Gameplay / UI / content** | **Yes** — same mod and version on each PC |
| **World generation** | Usually yes — join before exploring new areas |

When in doubt, read the mod's Thunderstore description.

### Easy workflow for friends

1. Share your mod list (export from panel or r2modman profile)
2. Friends install [r2modman](https://thunderstore.io/c/valheim/p/denikson/BepInExPack_Valheim/) or [Gale](https://thunderstore.io/c/valheim/p/Kesomannen/GaleModManager/)
3. Import the same profile / mod versions

---

## Configure mod settings

Most mods create a `.cfg` file under `config/bepinex/`.

Edit in the panel: **Mods & Config** → click the mod → **Config**.

Save and restart the server when the mod requires it.

---

## Built-in ValheimRcon

The panel includes **ValheimRcon** for:

- Live console on **Overview**
- Kick / ban / promote from the player list

It is **integrated** — you cannot remove it, but you can disable it on the Mods tab. Requires **Modded (BepInEx)** mode.

RCON password is auto-generated on first setup. Copy it from the notice or find it in `config/bepinex/org.tristan.rcon.cfg`.

---

## Game updates vs mod updates

**Mods & Config** → **Game updates** section:

- Schedule automatic Valheim updates (cron)
- Option to update only when no players are online
- After a game update, check mod compatibility on Thunderstore

Update individual mods with **Check update** / **Update all** on the Mods tab.

---

## Common issues

| Problem | Fix |
|---------|-----|
| Server crashes on start after mod install | Disable the last mod; check server log on **Overview** |
| Players disconnect or desync | Version mismatch — align mod versions on client and server |
| Mod not loading | Confirm BepInEx mode; check mod is **enabled** on Mods tab |
| Permission errors | Run `scripts/fix-plugins-permissions.sh` from the project folder |

More: [Troubleshooting](troubleshooting.md)

---

## Related

- [Getting started](getting-started.md)
- [FAQ — Mods & BepInEx](faq.md#mods--bepinex)
- [Thunderstore Valheim](https://thunderstore.io/c/valheim/)
