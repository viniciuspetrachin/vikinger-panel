# Discord alerts — get notified about your Valheim server

Vikinger Panel can post messages to a **Discord channel** when something important happens:
players join or leave, the server starts/stops/restarts, a mod is installed, backups fail, or the server hits high load.

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
6. Click **Save**
7. Click **Send test** — you should see a green “Vikinger Panel test” message in Discord

You can click **Send test** even before saving; the panel sends the URL currently in the form.

---

## Events you can enable

| Event | When it fires |
|-------|----------------|
| **Server goes down** | Container stops / becomes offline (also notifies when it comes back up) |
| **Server will start** | You (or a schedule) start the server |
| **Server will shut down** | You stop the server |
| **Server will restart** | Restart or recreate from the panel / nightly schedule |
| **Server at 80% load** | CPU or RAM crosses 80% (waits until it drops below 70% before alerting again) |
| **Player joins** | A Steam ID connects (uses the character name when known) |
| **Player leaves** | A player disconnects |
| **New mod added** | A mod is installed via Thunderstore URL or upload (includes version when available) |
| **Backup fails** | A scheduled/manual backup errors |

Turn on only what you need — join/leave alerts can be chatty on busy servers.

---

## Player names (join / leave)

Valheim logs the Steam ID first; the character name often appears a few seconds later.

The panel:

1. **Waits briefly** for the name when someone joins for the first time
2. **Caches** Steam ID → character name in `panel-data/players-seen.json`
3. On the **next join**, uses the cached name immediately (e.g. `Exforgant joined the server.`)

Leave alerts use the same cache.

---

## Optional: Telegram

Under **More channels (Telegram…)** you can also enable a Telegram bot (`bot_token` + `chat_id`). The same event toggles apply to both Discord and Telegram.

---

## Tips

- Use a dedicated channel so game alerts do not spam general chat
- Keep the panel Discord toggle **enabled** and at least one event checked — otherwise nothing is sent
- After updating the panel image, hard-refresh the browser (`Ctrl+Shift+R`) if the Discord tab looks missing
- If **Send test** fails, paste the webhook again and confirm Discord did not delete/regenerate it

---

## Related

- [Getting started](getting-started.md) — install the panel
- [FAQ](faq.md) — short answers
- [Discord webhook docs](https://docs.discord.com/developers/resources/webhook) — official API reference
