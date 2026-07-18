# Vikinger Panel — Documentation

Step-by-step guides for hosting a **Valheim dedicated server at home**, even if you have never used Docker or Linux before.

## Who is this for?

- Friends who want a **private Valheim world** on your own PC or a cheap VPS
- Community admins who need **mods, backups, and a web UI** without editing config files by hand
- Anyone tired of confusing wiki guides and wants **one download + a browser panel**

You do **not** need to know programming. Basic copy-paste in a terminal is enough.

## Guides

| Guide | What you'll learn |
|-------|-------------------|
| [Getting started](getting-started.md) | Install Docker, download the panel, configure `.env`, start the server, connect in-game |
| [Port forwarding](port-forwarding.md) | Let friends join from the internet (router, firewall, cloud VPS) |
| [Installing mods](installing-mods.md) | BepInEx, Thunderstore, what players need on their PC |
| [Discord alerts](discord-alerts.md) | Webhook setup — player join/leave, server start/stop, mods, high load |
| [Troubleshooting](troubleshooting.md) | Common errors and fixes (permissions, ports, first boot) |
| [FAQ](faq.md) | Quick answers — same topics as the in-panel **Help** tab |

## Quick links

- [Download latest release](https://github.com/viniciuspetrachin/vikinger-panel/releases) (recommended — no git required)
- [Main README](../README.md) — features, licensing, development
- [Report a bug](https://github.com/viniciuspetrachin/vikinger-panel/issues)
- [Support the project](https://github.com/sponsors/viniciuspetrachin/dashboard)

## What is VKP (Vikinger Panel)?

**VKP** is the short name for **Vikinger Panel** — a free web panel that runs next to your Valheim server in Docker. You manage worlds, passwords, mods, backups, and player lists from **http://localhost:8080** instead of SSH and text files.

Built for **self-hosters** — home labs, friend groups, and small communities — under the [Polyform Shield](../LICENSE) license.
