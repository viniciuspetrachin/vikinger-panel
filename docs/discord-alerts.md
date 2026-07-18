# Discord alerts — get notified about your Valheim server

Vikinger Panel can post messages to a **Discord channel** when something important happens:
players join or leave, the server starts/stops/restarts and comes back online, mods are added/updated/removed, backups succeed or fail, high load, or in-game chat with a custom prefix.

You configure everything in the panel sidebar under **Discord** — no bots to host, no extra containers.

---

## What you need

1. A Discord server where you can manage channels
2. Permission to create a **Webhook** in that channel
3. Vikinger Panel running (any recent release with the Discord tab)

---

## Step 1 — Create a Discord webhook

1. Open Discord → your server → the channel where alerts should appear (e.g. `#valheim-alerts`)
2. Click the gear next to the channel name → **Integrations** → **Webhooks** → **New Webhook**
3. Name it something like `Vikinger Panel` (optional avatar)
4. Click **Copy Webhook URL**

The URL looks like:

```
https://discord.com/api/webhooks/1234567890/AbCdEf...
```

Treat it like a password: anyone with the URL can post to that channel. Do not commit it to git or share it publicly.

---

## Step 2 — Configure the panel

1. Open the panel in your browser (`http://localhost:8080` or your host)
2. In the **left sidebar**, click **Discord**
3. Turn **Discord** on
4. Paste the webhook URL (the field is hidden by default — use the eye icon to show it)
5. Enable the events you care about (see below)
6. Optionally enable the **chat bridge** and set a prefix (default `@discord`)
7. Click **Save**
8. Click **Send test** — you should see a green “Vikinger Panel test” message in Discord

You can click **Send test** even before saving; the panel sends the URL currently in the form.

---

## Events you can enable

| Event | When it fires |
|-------|----------------|
| **Server goes down** | Container stops / becomes offline |
| **Server is online** | Server is up again (also paired with start/restart/down toggles) |
| **Server will start** | You (or a schedule) start the server |
| **Server will shut down** | You stop the server |
| **Server will restart** | Restart or recreate from the panel / nightly schedule; when the world is ready, **Server is online** also fires |
| **Server at 80% load** | CPU or RAM crosses 80% (waits until it drops below 70% before alerting again). **Suppressed** while the server is starting or restarting (high load is expected then). |
| **Player joins** | A Steam ID connects (uses the character name when known) |
| **Player leaves** | A player disconnects |
| **First-time player joins** | A Steam ID connects for the first time (tracked in `panel-data/players-seen.json`) |
| **Player kicked via panel** | You kick a player from the Players tab (RCON `kick`) |
| **Player banned via panel** | You ban a player from the Players tab (RCON `banSteamId`) |
| **Player died** | A character dies (`Got character ZDOID from Name : 0:0` in server logs) |
| **Player killed player (PvP)** | Kill-feed line in logs (e.g. `Ragnar killed by Bjorn`) — requires a mod that writes PvP kills to logs |
| **Boss defeated** | A new `defeated_*` global key appears (polled via RCON `globalKeys` every ~60s) |
| **Raid/event started** | A random event starts (`Random event set: army_theelder` in server logs) |
| **Scheduled backup in ~5 min** | About 5 minutes before a panel-scheduled backup or container `BACKUPS_CRON` run |
| **Scheduled restart in ~5 min** | About 5 minutes before a panel-scheduled restart |
| **Player chat with prefix** | In-game chat line with your prefix (see chat bridge) |
| **New mod added** | A mod is installed via Thunderstore URL or upload |
| **Mod updated** | A linked Thunderstore mod is updated |
| **Mod removed** | A mod is deleted from the panel |
| **Backup succeeds** | A scheduled/manual backup request succeeds |
| **Backup fails** | A scheduled/manual backup errors |

Turn on only what you need — join/leave alerts can be chatty on busy servers.

### Restart lifecycle

When you click **Restart** (with **Server will restart** enabled):

1. Discord gets “Server restarting”
2. The panel waits for the world to load (`World loaded` in logs) or a short timeout
3. Discord gets “Server online”

Transient offline during that restart does **not** spam “Server offline”.

---

## Chat bridge (`@discord` …)

Players can relay a message to Discord by typing a **prefix** in in-game chat:

```
@discord hello everyone
```

Discord receives a webhook message as the player (username = character name), content `hello everyone`.

- Default prefix: `@discord`
- Customize the prefix in the Discord tab
- Enable **Chat bridge** and/or the **Player chat with prefix** event

**Important:** vanilla Valheim usually does **not** write player chat to Docker/BepInEx logs. The panel scans those logs for chat-like lines containing your prefix. If chat never appears in the logs, install a mod that logs chat/shouts to BepInEx (or similar), otherwise the bridge has nothing to read.

---

## Player names (join / leave)

Valheim logs the Steam ID first; the character name often appears a few seconds later.

The panel:

1. **Waits briefly** for the name when someone joins for the first time
2. **Caches** Steam ID → character name in `panel-data/players-seen.json`
3. On the **next join**, uses the cached name immediately (e.g. `Exforgant joined the server.`)

Leave alerts use the same cache.

### Player death

Vanilla Valheim logs deaths as:

```
Got character ZDOID from CharacterName : 0:0
```

The panel scans Docker and BepInEx logs every 15 seconds.

### PvP kills

Vanilla logs do **not** record who killed whom — only that the character died. Enable **Player killed player (PvP)** when you use a mod that writes kill-feed lines to the logs (for example Valheim PvP Tweaks). Supported patterns include:

- `Victim killed by Killer`
- `Killer killed Victim`
- `Victim was slain by Killer`

If both **Player died** and **PvP kill** are enabled, a PvP kill suppresses the duplicate death alert for the same victim in the same scan.

### Boss defeated

Requires **Modded (BepInEx)** mode with the bundled **ValheimRcon** mod enabled. The panel polls RCON `globalKeys` about once per minute and notifies when a new `defeated_*` key appears (Eikthyr, The Elder, Bonemass, etc.).

The first poll after enabling the toggle **seeds** existing keys silently — bosses already defeated on your world are not re-announced.

### Raid / random event started

Vanilla Valheim logs random events as:

```
Random event set: army_theelder
```

The panel scans Docker and BepInEx logs every 15 seconds. Common events include Eikthyr, The Elder, Bonemass, and Moder army raids.

### Scheduled backup / restart warning

When **Scheduled backup in ~5 min** or **Scheduled restart in ~5 min** is enabled, the panel warns once about **5 minutes** before:

- A **panel schedule** job (Schedule tab) for backup or restart
- A **container world backup** via `BACKUPS_CRON` (for the backup warning only)

---

## Optional: Telegram

Under **More channels (Telegram…)** you can also enable a Telegram bot (`bot_token` + `chat_id`). The same event toggles apply to both Discord and Telegram.

---

## Tips

- Use a dedicated channel so game alerts do not spam general chat
- Keep the panel Discord toggle **enabled** and at least one event (or chat bridge) checked — otherwise nothing is sent
- After updating the panel image, hard-refresh the browser (`Ctrl+Shift+R`) if the Discord tab looks missing
- If **Send test** fails, paste the webhook again and confirm Discord did not delete/regenerate it

### E2E tests

Playwright Discord delivery tests read `DISCORD_TEST_WEBHOOK_URL` from the repo `.env` (gitignored). Put a **dedicated test-channel** webhook there — never commit the URL. Without the variable, those tests are skipped; UI-only alerts tests still run. Only **one** “Send test” message is posted per run (no event flood).

---

## Related

- [Getting started](getting-started.md) — install the panel
- [FAQ](faq.md) — short answers
- [Discord webhook docs](https://docs.discord.com/developers/resources/webhook) — official API reference
