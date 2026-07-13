(() => {
  // frontend/locales/en-US.json
  var en_US_default = {
    meta: {
      locale: "en-US",
      appTitle: "Vikinger Panel",
      appSubtitle: "PsyDev Server Manager"
    },
    nav: {
      sections: {
        painel: "Panel",
        gerenciar: "Manage",
        ferramentas: "Tools",
        suporte: "Support"
      },
      items: {
        dashboard: "Overview",
        server: "Server",
        worlds: "Worlds",
        mods: "Mods & Config",
        backups: "Backups",
        files: "Files",
        logs: "Console",
        audit: "Audit",
        help: "Help",
        donation: "Support the Project",
        about: "About"
      },
      sidebar: {
        containerRunning: "Container running",
        containerStopped: "Container stopped"
      },
      refresh: "Refresh"
    },
    common: {
      actions: {
        copy: "Copy",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        download: "Download",
        close: "\u2715",
        view: "View",
        ok: "OK",
        send: "Send",
        undo: "Undo",
        redo: "Redo",
        find: "Find",
        gotIt: "Got it",
        confirmAndStart: "Confirm and start",
        copyAddress: "Copy address",
        copyKey: "Copy key",
        copyCode: "Copy code",
        copyRequest: "Copy request",
        copyResponse: "Copy response",
        copyAll: "Copy all",
        restoreDraft: "Restore draft",
        discard: "Discard"
      },
      loading: {
        loading: "Loading...",
        loadingEllipsis: "Loading\u2026",
        applying: "Applying...",
        saving: "Saving...",
        restarting: "Restarting...",
        creating: "Creating...",
        activating: "Activating...",
        deleting: "Deleting...",
        removing: "Removing...",
        uploading: "Uploading...",
        installing: "Installing...",
        checking: "Checking...",
        updating: "Updating...",
        linking: "Linking...",
        generating: "Generating...",
        publishing: "Publishing...",
        running: "Running...",
        restoring: "Restoring...",
        undoing: "Undoing...",
        recreatingContainer: "Recreating container..."
      },
      status: {
        online: "Online",
        paused: "Paused",
        offline: "Offline",
        starting: "Starting",
        realTime: "Real-time",
        emDash: "\u2014",
        yes: "Yes",
        no: "No",
        on: "On",
        off: "Off",
        enabled: "Enabled",
        disabled: "Disabled",
        active: "Active",
        unlimited: "Unlimited",
        noLimit: "No limit",
        hostSuffix: "(host)",
        pending: "(pending)",
        days: "{count} days",
        day: "{count} day",
        match: "match",
        matches: "matches",
        matchEs: "match(es)",
        ofLimit: "of limit",
        players: "player(s)",
        mod: "mod",
        mods: "mods",
        ms: "ms"
      },
      toasts: {
        copied: "Copied!",
        failedToCopy: "Failed to copy",
        actionCompleted: "Action completed",
        fileSaved: "File saved!",
        settingsSaved: "Settings saved!",
        listsSaved: "Lists saved! Server restarted if it was online.",
        limitApplied: "Limit applied",
        playerLimitSaved: "Player limit saved",
        backupLimitSaved: "Backup limit saved and cleanup applied",
        updateSettingsSaved: "Update settings saved!",
        configSavedRecreated: "Config saved and container recreated!",
        backupConfigApplied: "Configuration applied and container restarted!",
        worldSettingsSaved: "World settings saved",
        worldSettingsSavedRestart: "Settings saved and server restarted",
        serverConfiguredVanilla: "Server configured in Vanilla mode",
        serverConfiguredBepinex: "Server configured with BepInEx",
        rconPasswordGenerated: "RCON password generated \u2014 copy it before closing the notice",
        installed: "Installed: {names}",
        modRemoved: "{name} removed",
        modEnabled: "Mod enabled",
        modDisabled: "Mod disabled",
        modLinked: "Mod linked to Thunderstore",
        modUpdated: "Mod updated to v{version}",
        modOnLatest: "Mod is on the latest version",
        modUpdateAvailable: "Update available: v{installed} \u2192 v{latest}",
        orphanedConfigsRemoved: "{count} orphaned config(s) removed",
        r2zDownloaded: ".r2z profile downloaded",
        codeCopied: "Code copied: {count} mod(s){skipped}",
        codeCopiedSkipped: " ({skipped} mod(s) skipped)",
        backupCreated: "Backup created: {name}",
        scheduledBackupTriggered: "Scheduled backup triggered \u2014 wait a few seconds.",
        backupRestored: 'Backup "{name}" restored \u2014 server restarting.',
        backupRestoredLatest: 'Backup "{name}" restored \u2014 server restarting.',
        restoreUndone: 'Restore undone \u2014 "{name}" is active.',
        backupDeleted: 'Backup "{name}" deleted',
        purgeDeleted: "Deleted {count} backup(s)",
        purgeNone: "No backups to delete",
        worldActivated: 'World "{name}" activated',
        worldCreatedActivated: 'World "{name}" created and activated',
        worldRegistered: 'World "{name}" registered',
        worldDeleted: 'World "{name}" deleted',
        playerKicked: "{label} kicked",
        playerBanned: "{label} banned",
        playerUnbanned: "{label} unbanned",
        playerPromoted: "{label} promoted to admin",
        playerDemoted: "{label} removed from admin",
        serverActionCompleted: 'Action "{action}" completed',
        checkRequested: "Check requested"
      },
      confirm: {
        kickPlayer: "Kick {label}? The player can rejoin.",
        banPlayer: "Ban {label} ({steamId})? The player cannot join until unbanned.",
        removeMod: "Remove mod {name}?",
        updateMod: "Update {name}? The server may need to be restarted.",
        removeOrphanedConfig: "Remove orphaned config {names}?",
        removeOrphanedConfigs: "Remove {count} orphaned config file(s)?\n\n{names}",
        activateWorldNew: 'Activate world "{name}"? The server will restart and a NEW (empty) world will be created.',
        activateWorld: 'Activate world "{name}"? The server will restart.',
        deleteWorld: 'Permanently delete world "{name}"?',
        restoreLatest: "Restore the latest backup? The server will restart.",
        undoRestore: "Undo the last restore? The server will return to the previous state.",
        applyMemoryLimit: "Set RAM limit to {label}? The container will be recreated and players disconnected."
      },
      errors: {
        invalidSteamId: "Invalid Steam ID \u2014 use 17 digits",
        invalidWorldName: "Invalid world name \u2014 use only letters, numbers, _ and -",
        rconUnavailable: "RCON unavailable",
        couldNotLoadUsage: "Could not load usage"
      },
      logEmpty: {
        waitingForOutput: "Waiting for server output...",
        noLogsAvailable: "No logs available."
      },
      editor: {
        unsavedChanges: "Unsaved changes",
        localDraftFound: "Local draft found (not saved on server).",
        defaultLabel: "Default:",
        ctrlSaveSearch: "Ctrl+S to save \xB7 Ctrl+F to search",
        noMatchingSettings: "No matching settings"
      },
      language: "Language"
    },
    help: {
      categories: {
        "primeiros-passos": {
          label: "Getting started",
          items: [
            {
              q: "How do my friends join the server?",
              a: "In Valheim, use <b>Join via IP</b> and enter <code>YOUR_IP:2456</code> (the default port is 2456). Then enter the server password. The current address appears on the <b>Overview</b> tab, in the \u201CHow to connect\u201D block."
            },
            {
              q: "Where do I set the server name and password?",
              a: "On the <b>Server</b> tab. The password must be at least 5 characters and cannot contain the server name. Save and restart to apply."
            },
            {
              q: "The server doesn't show up in the public list. What now?",
              a: "Valheim's public list often takes a few minutes and sometimes fails. Prefer <b>Join via IP</b>. Also confirm that <code>SERVER_PUBLIC</code> is set to <code>true</code> on the Server tab."
            },
            {
              q: "Do I need to open ports on my router?",
              a: "Yes \u2014 to play over the internet, forward UDP ports <b>2456\u20132458</b> to the server machine (port forwarding)."
            },
            {
              q: "How do I enable crossplay (PC + Xbox/Game Pass)?",
              a: "On the Server tab, add <code>-crossplay</code> in the <b>Extra arguments</b> field and restart."
            }
          ]
        },
        servidor: {
          label: "Server",
          items: [
            {
              q: "What's the difference between Start, Stop, Restart, Pause, and Resume?",
              a: "<b>Start/Stop/Restart</b> turn the entire container on/off. <b>Pause/Resume</b> only suspend the Valheim process inside the container (faster, keeps the container running)."
            },
            {
              q: "What are the Administrators, Banned, and Permitted lists?",
              a: "Steam ID lists. <b>Admin</b> gets moderation commands; <b>Banned</b> players cannot join; <b>Permitted</b> works as a whitelist (if filled, only those IDs can join). On <b>Overview</b>, use the <b>Actions</b> menu next to each connected player to promote, kick, or ban without editing files manually."
            },
            {
              q: "How do I use the panel's interactive console?",
              a: "The <b>ValheimRcon</b> mod is built into the panel (<b>Integrated</b> badge on the Mods tab). In <b>Modded (BepInEx)</b> mode, the RCON password is generated automatically on first setup. Console and moderation require BepInEx active and the mod enabled."
            },
            {
              q: "How do I change the RCON password?",
              a: "Edit <code>config/bepinex/org.tristan.rcon.cfg</code> (the <code>Password</code> field) on Mods \u2192 ValheimRcon config, or set <code>PANEL_RCON_PASSWORD</code> in <code>.env</code>. Restart the server after changing."
            },
            {
              q: "What's the difference between kick and ban?",
              a: "<b>Kick</b> disconnects the player immediately, but they can rejoin. <b>Ban</b> blocks the Steam ID on the ban list until you unban them. Both require ValheimRcon enabled and an RCON password configured."
            },
            {
              q: "Can I remove ValheimRcon?",
              a: "No \u2014 it is integrated into the panel and cannot be removed. You can <b>disable</b> it on the Mods tab; when you switch back to Modded (BepInEx) mode, it is re-enabled automatically."
            },
            {
              q: "How do I find a player's Steam ID?",
              a: 'Connected players appear on Overview with name and Steam ID. For offline players, use <a href="https://steamid.io" target="_blank" rel="noopener">steamid.io</a> and copy the <b>steamID64</b> (17 digits).'
            }
          ]
        },
        mundos: {
          label: "Worlds",
          items: [
            {
              q: "How do I create a new world?",
              a: "On the <b>Worlds</b> tab, enter a name and click <b>Create</b> (stays pending) or <b>Create & Activate</b> (switches the server to it). A world is only actually generated on first boot."
            },
            {
              q: "What are the presets (Easy, Hard, Hardcore...)?",
              a: "They are the same modifiers as Valheim's world creation screen, saved in the <code>.fwl</code> file. You can use a preset and still override individual settings (combat, resources, raids, portals, death penalty)."
            },
            {
              q: "Can I import a world I already have?",
              a: "Yes. Copy <code>WorldName.fwl</code> and <code>WorldName.db</code> to <code>config/worlds_local/</code> (Files tab or Docker volume) and it will appear in the list."
            },
            {
              q: "Does switching worlds delete the previous one?",
              a: "No. Switching only changes which world is active; progress on other worlds remains saved in <code>config/worlds_local/</code>."
            }
          ]
        },
        mods: {
          label: "Mods & BepInEx",
          items: [
            {
              q: "How do I install a mod?",
              a: 'On <b>Mods & Config</b>, paste a <a href="https://thunderstore.io/c/valheim/" target="_blank" rel="noopener">Thunderstore</a> URL (page, download link, or r2modman) and click Install, or upload a <code>.zip</code>/<code>.dll</code>.'
            },
            {
              q: "Do players need the mod too?",
              a: "It depends on the mod. Server-side mods (e.g. ServerSideMap) run only on the server; most gameplay/UI mods must be installed on each player's client at the same version."
            },
            {
              q: "What is BepInEx?",
              a: "It is the mod loader used by Valheim. Each mod usually generates a <code>.cfg</code> file in <code>config/bepinex</code>, editable on the Mods & Config tab."
            },
            {
              q: "Vanilla or modded?",
              a: "On <b>first launch</b> or on <b>Server</b> \u2192 <b>Game updates</b>, choose <b>Vanilla</b> (disables BepInEx and all mods) or <b>Modded</b> (enables BepInEx and integrated ValheimRcon). In vanilla mode, use <b>Administrators</b> in Player Lists to be admin in-game."
            },
            {
              q: "How do game updates work?",
              a: "The container uses <code>valheim-updater</code> (SteamCMD). On the <b>Server</b> tab you can enable auto-update, disable it, or click <b>Check for updates now</b>. With mods installed, prefer updating manually after checking compatibility."
            },
            {
              q: "Can updates break mods?",
              a: "Yes. A Valheim patch may require new mod versions. Back up, update the game, then use <b>Check for updates</b> on each Thunderstore-linked mod."
            },
            {
              q: "How do I update a mod?",
              a: "Mods installed via Thunderstore show version status. Use <b>Check for updates</b> and, if a new version is available, <b>Update mod</b>. Uploaded mods must be <b>linked</b> to a Thunderstore URL for automatic checks."
            },
            {
              q: "I enabled/disabled a mod and nothing changed.",
              a: "Mod changes require a <b>server restart</b>. Use the Restart button on Overview."
            }
          ]
        },
        backups: {
          label: "Backups",
          items: [
            {
              q: "Are backups automatic?",
              a: "Yes. On the <b>Backups</b> tab, under <b>Automatic schedule</b>, you set the interval. The container copies <code>worlds_local/</code> to <code>config/backups/</code> as <code>worlds-*.zip</code> files. Retention: 30 days."
            },
            {
              q: "How do I back up right now?",
              a: "Click <b>Create manual backup</b> and choose the type: Active world (quick), Full, or Configs only."
            },
            {
              q: "How do I restore a backup?",
              a: "In the backup list, click <b>Restore to here</b> on the desired point. The panel creates a checkpoint, restores files, and restarts the server. Use <b>Restore to latest</b> or <b>Undo last restore</b> to go back."
            },
            {
              q: "What is Run scheduled now?",
              a: "Manually triggers the same backup job that runs on the configured interval \u2014 different from <b>Create manual backup</b>, which lets you choose scope (world, full, or configs)."
            },
            {
              q: "Can I limit how much disk backups use?",
              a: "Yes. On the <b>Server</b> tab, under <b>Backup disk usage</b>, use the <b>Total backup limit</b> dropdown. Leave it on <b>Unlimited</b> for no cap, or pick a size (1 GB, 2 GB, 10 GB, etc.) and click <b>Save backup limit</b>. Oldest backups are removed automatically when the cap is exceeded."
            },
            {
              q: "What does Clear all backups now do?",
              a: "On the <b>Server</b> tab, this irreversibly deletes every backup ZIP in <code>config/backups/</code>, except backups tied to an active restore or undo checkpoint."
            }
          ]
        },
        files: {
          label: "Files",
          items: [
            {
              q: "How do I find a specific file quickly?",
              a: "On the <b>Files</b> tab, use the search box to filter by file name. Matching files appear in a flat list for fast access."
            },
            {
              q: "What are the file type filters?",
              a: "Click chips such as <b>Config</b>, <b>DLLs</b>, <b>Plugins</b>, or <b>Worlds</b> to narrow the tree to common file types \u2014 useful when you only need to edit a few configs or mod files."
            }
          ]
        },
        recursos: {
          label: "Resources & performance",
          items: [
            {
              q: "How much RAM does the server need?",
              a: "A Valheim server typically uses 2\u20134 GB, increasing with more players/mods. Adjust the cap on the <b>Server</b> tab under <b>Server capacity</b>. Real-time metrics are on <b>Overview</b>."
            },
            {
              q: "How do I set the player limit?",
              a: "On the <b>Server</b> tab under <b>Server capacity</b>. Vanilla supports up to 10 players; above that you need a mod (Valheim Plus or MaxPlayerCount). The panel syncs the value to the mod's .cfg if installed."
            },
            {
              q: "Does changing the RAM limit disconnect players?",
              a: "Yes \u2014 applying a new limit recreates the container and disconnects anyone online. Do this during quiet hours."
            }
          ]
        },
        docker: {
          label: "Installation & Docker",
          items: [
            {
              q: "How do I run the panel + server?",
              a: "Copy <code>.env.example</code> to <code>.env</code>, adjust values, and run <code>docker compose up -d</code>. The panel is at <code>http://YOUR_IP:8080</code>."
            },
            {
              q: "I'm getting permission errors on folders.",
              a: "When running via Docker, the panel and server use the same user (UID/GID 1000) and share volumes, so permission errors should not occur. Confirm that <code>config/</code> and <code>data/</code> belong to UID 1000."
            },
            {
              q: "Is it safe to mount docker.sock in the panel?",
              a: "The panel needs <code>docker.sock</code> to control the Valheim container. This grants Docker control to the panel container \u2014 keep the panel on a private network/behind a proxy with authentication in production."
            }
          ]
        },
        problemas: {
          label: "Troubleshooting",
          items: [
            {
              q: "Where do I see what's happening?",
              a: "Open <b>Console</b> (docker/BepInEx) in the Tools section. The <b>Audit</b> tab shows all actions taken by the panel. Real-time CPU and RAM are on <b>Overview</b>."
            },
            {
              q: "The panel is unresponsive / showing error 500.",
              a: "Check Console and Audit. Confirm Docker is running and the <code>valheim-server</code> container exists."
            },
            {
              q: "A change didn't apply.",
              a: "Many changes (mods, lists, running world config) only take effect after restarting the server."
            }
          ]
        }
      },
      referenceLinks: [
        {
          label: "Official Valheim Wiki",
          url: "https://valheim.fandom.com/wiki/Valheim_Wiki"
        },
        {
          label: "Thunderstore (Valheim mods)",
          url: "https://thunderstore.io/c/valheim/"
        },
        {
          label: "BepInEx (mod loader)",
          url: "https://docs.bepinex.dev/"
        },
        {
          label: "lloesche/valheim-server Docker image",
          url: "https://github.com/lloesche/valheim-server-docker"
        },
        {
          label: "Dedicated server (official guide)",
          url: "https://valheim.fandom.com/wiki/Hosting_a_Dedicated_Server"
        }
      ],
      title: "Frequently asked questions",
      searchPlaceholder: "Search FAQ...",
      usefulLinks: "Useful links"
    },
    worlds: {
      presets: {
        preset: {
          _default: {
            label: "Game default",
            desc: "No modifiers \u2014 vanilla experience, as before the Hildir's Request patch."
          },
          easy: {
            label: "Easy",
            desc: "Lighter combat (easy damage) and less frequent raids."
          },
          normal: {
            label: "Normal",
            desc: "Equivalent to game default \u2014 all sliders at Normal."
          },
          hard: {
            label: "Hard",
            desc: "Hard combat and more frequent raids."
          },
          hardcore: {
            label: "Hardcore",
            desc: "Very hard combat, maximum death penalty, frequent raids, hard portals, and no map."
          },
          casual: {
            label: "Casual",
            desc: "Very easy combat, light death penalty, more resources, no raids, casual portals, per-player events, and passive mobs."
          },
          hammer: {
            label: "Hammer mode",
            desc: "Building with no material cost, raids disabled, and passive mobs."
          },
          immersive: {
            label: "Immersive",
            desc: "Portals forbidden, fire spreads across the world, and no map/minimap."
          }
        },
        combat: {
          _default: {
            label: "Use preset",
            desc: "Inherit combat difficulty from the selected preset."
          },
          veryeasy: {
            label: "Very easy",
            desc: "125% player damage, 50% enemy damage, enemies 90% speed/size."
          },
          easy: {
            label: "Easy",
            desc: "110% player damage, 75% enemy damage, enemies 95% speed/size."
          },
          normal: {
            label: "Normal",
            desc: "100% on all combat parameters. Higher chance of high-level enemies on Hard/Very hard."
          },
          hard: {
            label: "Hard",
            desc: "85% player damage, 150% enemy damage, enemies 110% speed/size, 120% level-up rate."
          },
          veryhard: {
            label: "Very hard",
            desc: "70% player damage, 200% enemy damage, enemies 120% speed/size, 140% level-up rate."
          }
        },
        deathpenalty: {
          _default: {
            label: "Use preset",
            desc: "Inherit death penalty from the selected preset."
          },
          casual: {
            label: "Casual",
            desc: "Equipment kept on death. Inventory dropped. Skill loss: 1%."
          },
          veryeasy: {
            label: "Very easy",
            desc: "Drop everything on death. Skill loss: 1% (less than Normal)."
          },
          easy: {
            label: "Easy",
            desc: "Drop everything on death. Skill loss: 2.5%."
          },
          normal: {
            label: "Normal",
            desc: "Drop everything on death. Skill loss: 5%."
          },
          hard: {
            label: "Hard",
            desc: "Equipment dropped, inventory permanently destroyed. Skill loss: 7.5%."
          },
          hardcore: {
            label: "Hardcore",
            desc: "All items and skills permanently lost on death."
          }
        },
        resources: {
          _default: {
            label: "Use preset",
            desc: "Inherit resource rate from the selected preset."
          },
          muchless: {
            label: "Much less",
            desc: "50% of normal mob and object drop rate (\u22480.5\xD7)."
          },
          less: {
            label: "Less",
            desc: "75% of normal rate (\u22480.75\xD7)."
          },
          normal: {
            label: "Normal",
            desc: "Default game resource rate."
          },
          more: {
            label: "More",
            desc: "150% of normal rate (\u22481.5\xD7)."
          },
          muchmore: {
            label: "Much more",
            desc: "200% of normal rate (\u22482\xD7)."
          },
          most: {
            label: "Maximum",
            desc: "300% of normal rate (\u22483\xD7)."
          }
        },
        raids: {
          _default: {
            label: "Use preset",
            desc: "Inherit raid frequency from the selected preset."
          },
          none: {
            label: "None",
            desc: "EventRate 0 \u2014 daytime raids disabled. Night raids may still occur."
          },
          muchless: {
            label: "Much less",
            desc: "Interval ~92 min, 10% chance \u2014 far fewer raids."
          },
          less: {
            label: "Less",
            desc: "Interval ~69 min, ~13% chance."
          },
          normal: {
            label: "Normal",
            desc: "Interval ~46 min, 20% chance."
          },
          more: {
            label: "More",
            desc: "Interval ~28 min, ~33% chance."
          },
          muchmore: {
            label: "Much more",
            desc: "Interval ~14 min, ~67% chance."
          }
        },
        portals: {
          _default: {
            label: "Use preset",
            desc: "Inherit portal rules from the selected preset."
          },
          casual: {
            label: "Casual",
            desc: "TeleportAll \u2014 almost everything can go through portals (except tamed animals)."
          },
          normal: {
            label: "Normal",
            desc: "Non-portable items follow default game rules."
          },
          hard: {
            label: "No boss portals",
            desc: "Portals unavailable while a boss is active in the area."
          },
          veryhard: {
            label: "No portals",
            desc: "No portals allowed in the world."
          }
        }
      },
      flags: {
        nobuildcost: {
          label: "No build cost",
          desc: "Building pieces consume no materials. Recipes still need to be discovered."
        },
        playerevents: {
          label: "Per-player raids",
          desc: "Raids based on each player's individual progress, not bosses killed on the server."
        },
        fire: {
          label: "Fire hazard",
          desc: "Wood can catch fire and fire spreads across the entire world, not just Ashlands."
        },
        passivemobs: {
          label: "Passive enemies",
          desc: "Enemies do not attack until provoked."
        },
        nomap: {
          label: "No map",
          desc: "Map and minimap disabled \u2014 navigate by landmarks only."
        }
      },
      fields: {
        preset: "Preset",
        combat: "Combat",
        deathpenalty: "Death penalty",
        death: "Death",
        resources: "Resources",
        raids: "Raids",
        portals: "Portals"
      },
      badges: {
        awaitingCreation: "Awaiting creation",
        running: "Running",
        active: "Active",
        pending: "Pending",
        configBadge: "{preset} \xB7 Portals: {portals}"
      },
      fallback: {
        gameDefault: "Game default",
        preset: "Preset"
      },
      ui: {
        createTitle: "Create New World",
        worldNamePlaceholder: "World name",
        create: "Create",
        createAndActivate: "Create and Activate",
        db: "DB: {value}",
        notCreated: "not created",
        configBtn: "Config",
        activate: "Activate",
        settingsTitle: "World Settings",
        settingsDesc: `Modifiers saved in the <span class="font-mono">.fwl</span> file \u2014 equivalent to Valheim's world creation screen.`,
        refresh: "\u21BB Refresh",
        seed: "Seed",
        uid: "UID",
        fwlFile: ".fwl file",
        saveDb: "Save .db",
        presetTitle: "World preset",
        detectedFromFwl: "Detected from .fwl",
        custom: "Custom",
        effectiveTitle: "Effective values",
        effectiveDesc: "What will be applied to the world after saving (preset + overrides).",
        modifiersTitle: "Individual modifiers",
        modifiersDesc: "Leave on \xABUse preset\xBB to inherit from the preset above, or choose a specific value.",
        seedNewWorld: "\u{1F331} Seed (new world)",
        seedPlaceholder: "Optional \u2014 1-10 characters",
        seedHint: "Used only when creating the .fwl file for the first time.",
        advancedTitle: "Advanced options",
        technicalTitle: "Technical details \u2014 strings saved in .fwl",
        noModifiers: "No modifiers (vanilla / Normal world).",
        saveSettings: "Save settings",
        saveAndRestart: "Save and restart",
        backupHint: 'Automatic backup of the previous .fwl in <span class="font-mono">panel-data/world_fwl_backups/</span> before each save.',
        restartWarning: "World is running \u2014 restart the server after saving to apply .fwl changes."
      }
    },
    console: {
      categories: {
        Server: "Server",
        Moderation: "Moderation",
        Players: "Players",
        Chat: "Chat",
        Objects: "Objects",
        World: "World"
      },
      commands: {
        save: {
          usage: "save",
          desc: "Saves the current world"
        },
        list: {
          usage: "list",
          desc: "Lists all commands on the server"
        },
        players: {
          usage: "players",
          desc: "Shows online players with position"
        },
        serverStats: {
          usage: "serverStats",
          desc: "Server statistics (FPS, RAM, players)"
        },
        time: {
          usage: "time",
          desc: "Shows server time and day"
        },
        logs: {
          usage: "logs",
          desc: "Latest server log lines"
        },
        consoleCommand: {
          usage: "consoleCommand <command>",
          desc: "Runs a Valheim console command"
        },
        kick: {
          usage: "kick <player|SteamID>",
          desc: "Kicks a player"
        },
        ban: {
          usage: "ban <player|SteamID>",
          desc: "Bans by name or Steam ID"
        },
        banSteamId: {
          usage: "banSteamId <SteamID>",
          desc: "Bans by Steam ID"
        },
        unban: {
          usage: "unban <player|SteamID>",
          desc: "Removes a ban"
        },
        addAdmin: {
          usage: "addAdmin <SteamID>",
          desc: "Adds an administrator"
        },
        removeAdmin: {
          usage: "removeAdmin <SteamID>",
          desc: "Removes an administrator"
        },
        addPermitted: {
          usage: "addPermitted <SteamID>",
          desc: "Adds to permitted list"
        },
        removePermitted: {
          usage: "removePermitted <SteamID>",
          desc: "Removes from permitted list"
        },
        adminlist: {
          usage: "adminlist",
          desc: "Lists administrators"
        },
        banlist: {
          usage: "banlist",
          desc: "Lists banned players"
        },
        permitted: {
          usage: "permitted",
          desc: "Lists permitted players"
        },
        disconnectAll: {
          usage: "disconnectAll",
          desc: "Disconnects all players"
        },
        give: {
          usage: "give <player|SteamID> <item> [options]",
          desc: "Gives an item to a player"
        },
        heal: {
          usage: "heal <player|SteamID> <health>",
          desc: "Heals player to health value"
        },
        damage: {
          usage: "damage <player|SteamID> <damage>",
          desc: "Deals damage to a player"
        },
        teleport: {
          usage: "teleport <player|SteamID> <x> <y> <z>",
          desc: "Teleports a player"
        },
        findPlayer: {
          usage: "findPlayer <name>",
          desc: "Finds a player and shows details"
        },
        say: {
          usage: "say <message>",
          desc: "Sends a chat message (shout)"
        },
        showMessage: {
          usage: "showMessage <message>",
          desc: "Center-screen message for everyone"
        },
        ping: {
          usage: "ping <x> <y> <z>",
          desc: "Map ping for everyone"
        },
        spawn: {
          usage: "spawn <prefab> <x> <y> <z> [options]",
          desc: "Spawns objects/creatures"
        },
        findObjects: {
          usage: "findObjects [options]",
          desc: "Searches for objects in the world"
        },
        addGlobalKey: {
          usage: "addGlobalKey <key>",
          desc: "Adds a global key (e.g. boss defeated)"
        },
        removeGlobalKey: {
          usage: "removeGlobalKey <key>",
          desc: "Removes a global key"
        },
        globalKeys: {
          usage: "globalKeys",
          desc: "Lists active global keys"
        }
      },
      hints: {
        bepinexRequired: "RCON console only works with BepInEx active \u2014 choose Modded on the Server tab.",
        modRequired: "Enable the ValheimRcon mod on Mods & Config to use console and moderation.",
        configPending: "Waiting for RCON configuration \u2014 restart the panel or Valheim server.",
        serverStopped: "Start the server to use the interactive console.",
        unavailable: "RCON unavailable at the moment."
      },
      placeholder: "RCON command (e.g. save, list, kick Name...)",
      viewCommands: "View available commands",
      inputHints: "Tab autocompletes \xB7 Enter sends \xB7 output appears in the logs above",
      moderationActions: "Moderation actions",
      helpModal: {
        title: "RCON commands",
        intro: 'Click a command to fill the console. Use <code class="text-valheim-gold-light">list</code> on the server to see all installed commands.',
        searchPlaceholder: "Search command...",
        noCommands: "No commands found.",
        docPrefix: "Full documentation:",
        docLink: "ValheimRcon no GitHub"
      },
      chart: {
        download: "Download",
        upload: "Upload",
        networkTraffic: "Network traffic (chart)"
      }
    },
    setup: {
      title: "Set up server",
      subtitle: "Choose how the Valheim server will run.",
      serverMode: "Server mode",
      modes: {
        vanilla: "Vanilla",
        bepinex: "With mods (BepInEx)"
      },
      vanillaHint: "No BepInEx and no mods. Add your Steam ID as administrator below.",
      bepinexHint: "Enables BepInEx, the bundled ValheimRcon mod, and generates the RCON password automatically.",
      adminSteamId: "Your Steam ID (admin)",
      adminSteamIdPlaceholder: "76561198000000000",
      adminSteamIdHint: "Optional for now \u2014 you can edit later under Server \u2192 Player Lists.",
      firstWorld: "First world (optional)",
      firstWorldPlaceholder: "MyWorld",
      createAndActivate: "Create and activate this world",
      rconPassword: {
        title: "Generated RCON password",
        body: "The panel has configured ValheimRcon. Copy the password \u2014 it will not be shown again.",
        changeHint: 'To change later: edit <code class="text-gray-400">config/bepinex/org.tristan.rcon.cfg</code> or set <code class="text-gray-400">PANEL_RCON_PASSWORD</code> in .env.'
      }
    },
    dashboard: {
      stats: {
        server: "Server",
        activeWorld: "Active World",
        playersOnline: "Players Online",
        mods: "Mods",
        port: "Port"
      },
      configCorrected: "Config corrected: {from} \u2192 {to}",
      performance: "Performance",
      metrics: {
        cpu: "CPU",
        ram: "RAM",
        disk: "Disk (Valheim)",
        network: "Network"
      },
      diskBreakdown: {
        game: "game",
        mods: "mods",
        worlds: "worlds",
        backups: "backups"
      },
      connect: {
        title: "How to connect",
        intro: 'In Valheim, use <strong class="text-gray-200">Join IP</strong> and enter:',
        hint: "Password is set on the Server tab. Open UDP <strong>2456\u20132458</strong> on your router for external access."
      },
      players: {
        title: "Connected Players",
        empty: "No players connected right now.",
        admin: "Admin",
        banned: "Banned",
        actions: "Actions \u25BE",
        promote: "Make admin",
        demote: "Remove admin",
        kick: "Kick",
        ban: "Ban",
        unban: "Unban"
      },
      quickControls: {
        title: "Quick Controls",
        start: "Start",
        stop: "Stop",
        restart: "Restart",
        pause: "Pause",
        resume: "Resume",
        backup: "\u{1F4BE} Backup"
      },
      console: {
        title: "Server Console (live)"
      },
      supervisor: {
        title: "Supervisor"
      }
    },
    server: {
      settings: {
        title: "Server Settings (.env)",
        activeWorld: "Active World",
        password: "Password",
        showPassword: "Show password",
        hidePassword: "Hide password",
        save: "Save Settings",
        saveAndRestart: "Save and Restart"
      },
      envFields: {
        SERVER_NAME: {
          label: "Server Name",
          hint: "Shown in the in-game server list."
        },
        SERVER_PUBLIC: {
          label: "Public (true/false)",
          hint: "true = listed publicly; false = direct connection only."
        },
        SERVER_ARGS: {
          label: "Extra arguments",
          hint: "E.g. -crossplay to enable crossplay."
        }
      },
      capacity: {
        title: "Server capacity",
        subtitle: "Container RAM limit and maximum player count.",
        wikiGuide: "Wiki guide",
        ramLimit: "RAM limit",
        current: "Current: {value}",
        applyRamLimit: "Apply RAM limit",
        ramWarning: "Applying recreates the container \u2014 connected players will be disconnected.",
        playerLimit: "Player limit",
        modSource: "Mod: {name}",
        vanillaMax: "Vanilla (max. 10)",
        playersAbove10: "Above 10 players requires Valheim Plus or MaxPlayerCount on the Mods tab.",
        savePlayerLimit: "Save player limit",
        table: {
          players: "Players",
          suggestedRam: "Suggested RAM",
          notes: "Notes"
        }
      },
      playerLists: {
        title: "Player Lists",
        vanillaHint: "In <b>Vanilla</b> mode, add your Steam ID under <b>Administrators</b> for in-game admin permissions (without the panel RCON console).",
        admin: "Administrators (Steam IDs)",
        banned: "Banned (Steam IDs)",
        permitted: "Permitted / whitelist (Steam IDs)",
        saveLists: "Save Lists"
      }
    },
    storage: {
      title: "Backup disk usage",
      intro: 'Optional cap on <code class="text-gray-400">config/backups/</code> ZIP files. Choose <span class="text-valheim-gold font-medium">Unlimited</span> to keep all backups, or pick a size \u2014 oldest backups are deleted first when the limit is exceeded.',
      totalLimit: "Total backup limit",
      unlimitedKeep: "Backups are kept until disk space runs out.",
      oldestDeleted: "Oldest backups are deleted first when usage exceeds the limit above.",
      currentUsage: "Current usage",
      saveLimit: "Save backup limit",
      clearAll: "Clear all backups now",
      clearAllHint: "Irreversible \u2014 deletes every backup ZIP except those tied to an active restore or undo checkpoint.",
      purgeModal: {
        title: "Clear all backups",
        body: 'This action is <strong>irreversible</strong>. Every backup ZIP in <code class="text-gray-400">config/backups/</code> will be deleted.',
        preserved: "Backups linked to an active restore or undo checkpoint are preserved.",
        deleteAll: "Delete all"
      },
      usageNoLimit: "{used} used (no limit)",
      usageOfLimit: "{used} of {limit} GB"
    },
    updates: {
      title: "Game updates",
      subtitle: "Control Valheim updates via valheim-updater (SteamCMD).",
      modsWarning: "Valheim updates may break mods. Back up first. Check each mod's compatibility after updating the game.",
      serverMode: "Server mode",
      modeHint: "Vanilla disables BepInEx and turns off all mods. With mods enables BepInEx and the bundled ValheimRcon.",
      installedVersion: "Installed version",
      build: "Build",
      updater: "Updater",
      autoUpdate: "Auto-update game",
      onlyWhenEmpty: "Only when the server is empty",
      checkInterval: "Check interval",
      customCron: "Custom cron",
      save: "Save",
      saveRecreate: "Save and recreate container",
      checkNow: "Check for updates now",
      presets: {
        "15min": "Every 15 minutes",
        "1h": "Every hour",
        "6h": "Every 6 hours",
        daily: "Daily (06:00)",
        custom: "Custom"
      }
    },
    mods: {
      install: {
        title: "Install Mod",
        upload: "\u{1F4C1} Upload (.zip / .dll)",
        urlPlaceholder: "Thunderstore URL (page, download, or r2modman)",
        installUrl: "Install from URL"
      },
      valheimRcon: '<strong class="text-valheim-gold">ValheimRcon</strong> is bundled with the panel (RCON console, kick, ban, and admin). It cannot be removed, but it can be disabled. The console and player actions require active BepInEx and this mod enabled.',
      bundled: "Bundled",
      bundledCannotRemove: "Bundled \u2014 cannot be removed",
      active: "Active",
      disabled: "Disabled",
      activeConsole: "Active \u2014 console and moderation available",
      disabledConsole: "Disabled \u2014 enable to use console and moderation",
      configPrefix: "Config: {name}",
      noConfig: "No config",
      version: "Version",
      checkUpdates: "Check for updates",
      updateMod: "Update mod",
      linkThunderstore: "Link Thunderstore",
      linkUrlPlaceholder: "Thunderstore URL",
      configBtn: "Config",
      remove: "Remove",
      empty: "No mods installed",
      orphaned: {
        title: "Orphaned configs",
        desc: "{count} config file(s) from removed mods are still on disk.",
        remove: "Remove orphaned configs"
      },
      export: {
        title: "Export r2modman profile",
        desc: "Exports mods linked to Thunderstore and BepInEx configs for import in r2modman. Unlinked mods are skipped.",
        skipped: "{count} mod(s) without a Thunderstore link will be skipped",
        downloadR2z: "Download .r2z"
      },
      bepinexConfigs: {
        title: "BepInEx Configs",
        desc: 'Configuration files generated by mods in <code class="font-mono">config/bepinex/</code>.',
        empty: "No configuration files found",
        edit: "Edit"
      },
      status: {
        up_to_date: "Up to date",
        update_available: "Update available",
        unknown: "Unknown source",
        error: "Check failed"
      }
    },
    backups: {
      state: {
        title: "Server state",
        restoredFrom: "Restored from: {name}",
        live: "Server in <strong>live</strong> state \u2014 no panel restore recorded.",
        lastRestore: "Last restore: {date}",
        restoreLatest: "Restore latest",
        undoRestore: "Undo last restore",
        hint: "Restore always restarts the server. An automatic checkpoint is created before each restore."
      },
      schedule: {
        title: "Automatic scheduling",
        info: 'The Valheim container periodically copies the <code class="text-gray-400">worlds_local/</code> folder to <code class="text-gray-400">config/backups/</code>. Files appear as <code class="text-gray-400">worlds-YYYYMMDD-HHMMSS.zip</code>. Retention: 30 days.',
        automatic: "Automatic backups",
        enabled: "Enabled",
        disabled: "Disabled",
        interval: "Interval",
        customCron: "Custom cron",
        retention: "Retention",
        retentionValue: "30 days",
        idleLabel: "Backup when no players online",
        idleYes: "Yes \u2014 back up even when empty",
        idleNo: "Only when players are online",
        current: "Current: {value}",
        applyRestart: "Apply and restart",
        manual: "Create manual backup",
        runScheduled: "Run scheduled job now",
        runScheduledTitle: "Runs now the same job that runs on the scheduled interval"
      },
      intervalPresets: {
        hourly: "Every hour",
        "6h": "Every 6 hours",
        "12h": "Every 12 hours",
        daily: "Daily (00:00)",
        custom: "Custom"
      },
      idleLabels: {
        online: "Only when players are online",
        empty: "Yes \u2014 even with no players"
      },
      list: {
        title: "Stored backups",
        hideCheckpoints: "Hide checkpoints",
        empty: "No backups found in config/backups/",
        columns: {
          type: "Type",
          name: "Name",
          date: "Date",
          age: "Age",
          size: "Size",
          mods: "Mods",
          actions: "Actions"
        },
        badges: {
          active: "Active",
          latest: "Latest",
          checkpoint: "Checkpoint"
        },
        activeMods: "{count} active",
        restoreToHere: "Restore to here",
        details: "Details"
      },
      types: {
        world: {
          label: "Active world (quick)",
          desc: "Only the world in use (.fwl + .db)."
        },
        full: {
          label: "Full",
          desc: "Worlds + BepInEx configs + mods + lists + .env."
        },
        configs: {
          label: "Configs only",
          desc: "BepInEx configs + player lists + .env."
        }
      },
      modals: {
        create: {
          title: "Create Backup",
          desc: "Choose the type of manual backup to create now.",
          creating: "Creating backup..."
        },
        restore: {
          title: "Restore backup",
          intro: "Restore the server to this backup's state:",
          name: "Name:",
          type: "Type:",
          date: "Date:",
          bullets: [
            "The server will be stopped and restarted automatically",
            "World/config files will be overwritten",
            "A checkpoint of the current state will be created first"
          ],
          confirm: "Restore and restart"
        },
        delete: {
          title: "Delete backup",
          confirm: "Permanently delete {name}?"
        },
        details: {
          title: "Backup details",
          loading: "Loading details...",
          world: "World:",
          build: "Valheim build:",
          inferred: "Metadata inferred from ZIP \u2014 Thunderstore versions may be unavailable.",
          modsTitle: "Mods ({count})",
          noMods: "No mods recorded in this backup.",
          columns: {
            mod: "Mod",
            package: "Package",
            version: "Version",
            state: "State"
          },
          contents: "Contents",
          includesWorlds: "Worlds included",
          includesDlls: "Mod DLLs included",
          includesEnv: ".env file included",
          hasAdminlist: "Admin list",
          fileCount: "{count} file(s) in ZIP",
          worldsList: "Worlds: {names}"
        }
      },
      contentsNotes: {
        noDlls: "This backup does not include mod files (.dll) \u2014 the list below reflects the server state at backup time.",
        configsOnly: "This backup contains only world/configs \u2014 mods were not included. Use Manual backup \u2014 Full for a snapshot with DLLs."
      }
    },
    files: {
      searchPlaceholder: "Search by file name...",
      browser: "Browser",
      noMatches: "No matches",
      selectFile: "Select a file to edit",
      searchSettings: "Search settings...",
      form: "Form",
      raw: "Raw",
      scopes: {
        config: "Config",
        data: "Data"
      },
      typeFilters: {
        all: "All",
        config: "Config",
        dll: "DLLs",
        plugin: "Plugins",
        world: "Worlds",
        list: "Lists",
        backup: "Backups",
        log: "Logs"
      },
      tree: {
        emptyFolder: "Empty folder",
        inaccessible: "inaccessible"
      }
    },
    logs: {
      docker: "Docker",
      bepinex: "BepInEx",
      autoRefresh: "Auto (5s)"
    },
    audit: {
      downloadLog: "Download full log",
      autoRefresh: "Auto (5s)",
      description: "Persistent log of all actions (POST/PUT/DELETE) for diagnostics and error recovery.",
      empty: "No events recorded",
      columns: {
        time: "Time",
        method: "Method",
        action: "Action",
        status: "Status",
        duration: "Dur.",
        error: "Error",
        details: "Details"
      },
      modal: {
        title: "Audit details",
        request: "Request",
        response: "Response"
      }
    },
    donation: {
      title: "Support the project",
      pitch: "Vikinger Panel is free for personal use. Sponsors help maintain the project and keep development going. Contributors at $1+/month get direct support from the maintainer. Sponsorship does not replace a commercial license \u2014 hosting providers still need one (see below).",
      voluntary: {
        title: "Voluntary donations",
        desc: "The panel is free for personal use. If it helps you, any contribution funds new features, fixes, and documentation."
      },
      pix: "Pix (Brasil)",
      notConfigured: 'Donation links are not configured yet. Set <code class="text-gray-400">PANEL_DONATION_*</code> in the server <code class="text-gray-400">.env</code>.',
      commercial: {
        title: "Commercial licensing",
        intro: '<strong class="text-gray-200">Hosting providers</strong> who want to offer this panel to customers need a <strong class="text-gray-200">commercial license</strong>. Resale and white-label use without authorization violate the {license}.',
        items: [
          "Personal use and open-source contribution: free",
          "Commercial hosting / resale: paid license",
          "Donations do not replace a commercial license"
        ],
        requestLicense: "Request commercial license",
        licenseText: "License text",
        contact: "Licensing contact:"
      }
    },
    about: {
      subtitle: "Web manager for a dockerized Valheim server",
      fields: {
        version: "Version",
        build: "Build",
        commit: "Commit",
        license: "License"
      },
      repository: "Repository",
      whatsNew: "What's new",
      changelogEmpty: "No changelog entries.",
      creditsTitle: "Credits",
      changelogSections: {
        added: "Added",
        changed: "Changed",
        deprecated: "Deprecated",
        removed: "Removed",
        fixed: "Fixed",
        security: "Security"
      },
      update: {
        title: "Panel update",
        upToDate: "Up to date (v{current})",
        available: "Update available: v{latest}",
        viewRelease: "View release on GitHub",
        apply: "Update now",
        updating: "Updating\u2026 restarting",
        started: "Panel update started \u2014 the page will reload when the container restarts."
      },
      credits: {
        valheimDocker: {
          label: "Valheim server in Docker",
          by: "lloesche/valheim-server-docker"
        },
        backend: {
          label: "Backend",
          by: "FastAPI + Uvicorn"
        },
        frontend: {
          label: "Frontend",
          by: "Alpine.js + Tailwind CSS + Chart.js + CodeMirror"
        }
      }
    },
    resources: {
      noLimit: "No limit",
      hostSuffix: "(host)"
    }
  };

  // frontend/locales/pt-BR.json
  var pt_BR_default = {
    meta: {
      locale: "pt-BR",
      appTitle: "Vikinger Panel",
      appSubtitle: "Gerenciador de Servidor PsyDev"
    },
    nav: {
      sections: {
        painel: "Painel",
        gerenciar: "Gerenciar",
        ferramentas: "Ferramentas",
        suporte: "Suporte"
      },
      items: {
        dashboard: "Vis\xE3o geral",
        server: "Servidor",
        worlds: "Mundos",
        mods: "Mods e Config",
        backups: "Backups",
        files: "Arquivos",
        logs: "Console",
        audit: "Auditoria",
        help: "Ajuda",
        donation: "Apoie o projeto",
        about: "Sobre"
      },
      sidebar: {
        containerRunning: "Container em execu\xE7\xE3o",
        containerStopped: "Container parado"
      },
      refresh: "Atualizar"
    },
    common: {
      actions: {
        copy: "C\xF3pia",
        cancel: "Cancelar",
        save: "Salvar",
        delete: "Excluir",
        edit: "Editar",
        download: "Baixar",
        close: "\u2715",
        view: "Visualizar",
        ok: "OK",
        send: "Enviar",
        undo: "Desfazer",
        redo: "Refazer",
        find: "Encontrar",
        gotIt: "Entendi",
        confirmAndStart: "Confirme e comece",
        copyAddress: "Copiar endere\xE7o",
        copyKey: "Copiar chave",
        copyCode: "Copiar c\xF3digo",
        copyRequest: "Solicita\xE7\xE3o de c\xF3pia",
        copyResponse: "Copiar resposta",
        copyAll: "Copiar tudo",
        restoreDraft: "Restaurar rascunho",
        discard: "Descartar"
      },
      loading: {
        loading: "Carregando...",
        loadingEllipsis: "Carregando\u2026",
        applying: "Aplicando...",
        saving: "Salvando...",
        restarting: "Reiniciando...",
        creating: "Criando...",
        activating: "Ativando...",
        deleting: "Excluindo...",
        removing: "Removendo...",
        uploading: "Fazendo upload...",
        installing: "Instalando...",
        checking: "Verificando...",
        updating: "Atualizando...",
        linking: "Vinculando...",
        generating: "Gerando...",
        publishing: "Publicando...",
        running: "Correndo...",
        restoring: "Restaurando...",
        undoing: "Desfazendo...",
        recreatingContainer: "Recriando cont\xEAiner..."
      },
      status: {
        online: "On-line",
        paused: "Pausado",
        offline: "Off-line",
        starting: "Come\xE7ando",
        realTime: "Em tempo real",
        emDash: "-",
        yes: "Sim",
        no: "N\xE3o",
        on: "Sobre",
        off: "Desligado",
        enabled: "Habilitado",
        disabled: "Desabilitado",
        active: "Ativo",
        unlimited: "Ilimitado",
        noLimit: "Sem limite",
        hostSuffix: "(hospedar)",
        pending: "(pendente)",
        days: "{count} dias",
        day: "{count} dia",
        match: "corresponder",
        matches: "partidas",
        matchEs: "partidas)",
        ofLimit: "de limite",
        players: "jogador(es)",
        mod: "mod",
        mods: "mods",
        ms: "ms"
      },
      toasts: {
        copied: "Copiado!",
        failedToCopy: "Falha ao copiar",
        actionCompleted: "A\xE7\xE3o conclu\xEDda",
        fileSaved: "Arquivo salvo!",
        settingsSaved: "Configura\xE7\xF5es salvas!",
        listsSaved: "Listas salvas! O servidor foi reiniciado se estivesse online.",
        limitApplied: "Limite aplicado",
        playerLimitSaved: "Limite de jogadores salvo",
        backupLimitSaved: "Limite de backup salvo e limpeza aplicada",
        updateSettingsSaved: "Configura\xE7\xF5es de atualiza\xE7\xE3o salvas!",
        configSavedRecreated: "Configura\xE7\xE3o salva e cont\xEAiner recriado!",
        backupConfigApplied: "Configura\xE7\xE3o aplicada e cont\xEAiner reiniciado!",
        worldSettingsSaved: "Configura\xE7\xF5es mundiais salvas",
        worldSettingsSavedRestart: "Configura\xE7\xF5es salvas e servidor reiniciado",
        serverConfiguredVanilla: "Servidor configurado no modo Vanilla",
        serverConfiguredBepinex: "Servidor configurado com BepInEx",
        rconPasswordGenerated: "Senha RCON gerada \u2014 copie-a antes de fechar o aviso",
        installed: "Instalado: {names}",
        modRemoved: "{name} removido",
        modEnabled: "Mod ativado",
        modDisabled: "Mod desativado",
        modLinked: "Mod vinculado ao Thunderstore",
        modUpdated: "Mod atualizado para v{version}",
        modOnLatest: "O mod est\xE1 na vers\xE3o mais recente",
        modUpdateAvailable: "Atualiza\xE7\xE3o dispon\xEDvel: v{installed} \u2192 v{latest}",
        orphanedConfigsRemoved: "{count} configura\xE7\xF5es \xF3rf\xE3s removidas",
        r2zDownloaded: "Perfil .r2z baixado",
        codeCopied: "C\xF3digo copiado: {count} mod(s){skipped}",
        codeCopiedSkipped: "({skipped} mod(s) ignorados)",
        backupCreated: "Backup criado: {name}",
        scheduledBackupTriggered: "Backup agendado acionado \u2013 aguarde alguns segundos.",
        backupRestored: 'Backup "{name}" restaurado \u2014 servidor reiniciando.',
        backupRestoredLatest: 'Backup "{name}" restaurado \u2014 servidor reiniciando.',
        restoreUndone: 'Restaura\xE7\xE3o desfeita \u2014 "{name}" est\xE1 ativo.',
        backupDeleted: 'Backup "{name}" exclu\xEDdo',
        purgeDeleted: "{count} backup(s) exclu\xEDdo(s)",
        purgeNone: "Nenhum backup para excluir",
        worldActivated: 'Mundo "{name}" ativado',
        worldCreatedActivated: 'Mundo "{name}" criado e ativado',
        worldRegistered: 'Mundo "{name}" registrado',
        worldDeleted: 'Mundo "{name}" exclu\xEDdo',
        playerKicked: "{label} chutado",
        playerBanned: "{label} banido",
        playerUnbanned: "{label} n\xE3o banido",
        playerPromoted: "{label} promovido a administrador",
        playerDemoted: "{label} removido do administrador",
        serverActionCompleted: 'A\xE7\xE3o "{action}" conclu\xEDda',
        checkRequested: "Cheque solicitado"
      },
      confirm: {
        kickPlayer: "Chutar {label}? O jogador pode voltar.",
        banPlayer: "Banir {label} ({steamId})? O jogador n\xE3o pode entrar at\xE9 que seja desbanido.",
        removeMod: "Remover mod {name}?",
        updateMod: "Atualizar {name}? O servidor pode precisar ser reiniciado.",
        removeOrphanedConfig: "Remover configura\xE7\xE3o \xF3rf\xE3 {names}?",
        removeOrphanedConfigs: "Remover {count} arquivo(s) de configura\xE7\xE3o \xF3rf\xE3o(s)?\n\n{names}",
        activateWorldNew: 'Ativar mundo "{name}"? O servidor ser\xE1 reiniciado e um NOVO mundo (vazio) ser\xE1 criado.',
        activateWorld: 'Ativar mundo "{name}"? O servidor ser\xE1 reiniciado.',
        deleteWorld: 'Excluir permanentemente o mundo "{name}"?',
        restoreLatest: "Restaurar o backup mais recente? O servidor ser\xE1 reiniciado.",
        undoRestore: "Desfazer a \xFAltima restaura\xE7\xE3o? O servidor retornar\xE1 ao estado anterior.",
        applyMemoryLimit: "Definir limite de RAM para {label}? O cont\xEAiner ser\xE1 recriado e os jogadores ser\xE3o desconectados."
      },
      errors: {
        invalidSteamId: "Steam ID inv\xE1lido \u2013 use 17 d\xEDgitos",
        invalidWorldName: "Nome mundial inv\xE1lido \u2014 use apenas letras, n\xFAmeros, _ e -",
        rconUnavailable: "RCON indispon\xEDvel",
        couldNotLoadUsage: "N\xE3o foi poss\xEDvel carregar o uso"
      },
      logEmpty: {
        waitingForOutput: "Aguardando sa\xEDda do servidor...",
        noLogsAvailable: "Nenhum registro dispon\xEDvel."
      },
      editor: {
        unsavedChanges: "Altera\xE7\xF5es n\xE3o salvas",
        localDraftFound: "Rascunho local encontrado (n\xE3o salvo no servidor).",
        defaultLabel: "Padr\xE3o:",
        ctrlSaveSearch: "Ctrl+S para salvar \xB7 Ctrl+F para pesquisar",
        noMatchingSettings: "Nenhuma configura\xE7\xE3o correspondente"
      },
      language: "Linguagem"
    },
    help: {
      categories: {
        "primeiros-passos": {
          label: "Come\xE7ando",
          items: [
            {
              q: "Como meus amigos entram no servidor?",
              a: "Em Valheim, use <b>Join via IP</b> e digite <code>YOUR_IP:2456</code> (a porta padr\xE3o \xE9 2456). Em seguida, digite a senha do servidor. O endere\xE7o atual aparece na aba <b>Overview</b>, no bloco \u201CComo conectar\u201D."
            },
            {
              q: "Onde defino o nome do servidor e a senha?",
              a: "Na guia <b>Servidor</b>. A senha deve ter pelo menos 5 caracteres e n\xE3o pode conter o nome do servidor. Salve e reinicie para aplicar."
            },
            {
              q: "O servidor n\xE3o aparece na lista p\xFAblica. E agora?",
              a: "A lista p\xFAblica de Valheim geralmente leva alguns minutos e \xE0s vezes falha. Prefira <b>Inscreva-se via IP</b>. Confirme tamb\xE9m se <code>SERVER_PUBLIC</code> est\xE1 definido como <code>true</code> na guia Servidor."
            },
            {
              q: "Preciso abrir portas no meu roteador?",
              a: "Sim \u2014 para jogar pela Internet, encaminhe as portas UDP <b>2456\u20132458</b> para a m\xE1quina do servidor (encaminhamento de porta)."
            },
            {
              q: "Como habilito o jogo cruzado (PC + Xbox/Game Pass)?",
              a: "Na guia Servidor, adicione <code>-crossplay</code> no campo <b>Argumentos extras</b> e reinicie."
            }
          ]
        },
        servidor: {
          label: "Servidor",
          items: [
            {
              q: "Qual \xE9 a diferen\xE7a entre Iniciar, Parar, Reiniciar, Pausar e Continuar?",
              a: "<b>Iniciar/Parar/Reiniciar</b> liga/desliga todo o cont\xEAiner. <b>Pause/Resume</b> apenas suspende o processo Valheim dentro do cont\xEAiner (mais r\xE1pido, mant\xE9m o cont\xEAiner funcionando)."
            },
            {
              q: "Quais s\xE3o as listas de Administradores, Banidos e Permitidos?",
              a: "Listas de ID do Steam. <b>Admin</b> recebe comandos de modera\xE7\xE3o; <b>banidos</b> jogadores n\xE3o podem participar; <b>Permitted</b> funciona como uma lista de permiss\xF5es (se preenchida, apenas esses IDs podem ingressar). Em <b>Overview</b>, use o menu <b>Actions</b> ao lado de cada jogador conectado para promover, expulsar ou banir sem editar os arquivos manualmente."
            },
            {
              q: "Como utilizo o console interativo do painel?",
              a: "O mod <b>ValheimRcon</b> est\xE1 embutido no painel (<b>Integrated</b> na guia Mods). No modo <b>Modded (BepInEx)</b>, a senha RCON \xE9 gerada automaticamente na primeira configura\xE7\xE3o. O console e a modera\xE7\xE3o requerem BepInEx ativo e o mod habilitado."
            },
            {
              q: "Como altero a senha do RCON?",
              a: "Edite <code>config/bepinex/org.tristan.rcon.cfg</code> (o campo <code>Password</code>) em Mods \u2192 ValheimRcon config ou defina <code>PANEL_RCON_PASSWORD</code> em <code>.env</code>. Reinicie o servidor ap\xF3s alterar."
            },
            {
              q: "Qual \xE9 a diferen\xE7a entre kick e ban?",
              a: "<b>Kick</b> desconecta o jogador imediatamente, mas ele pode voltar. <b>Ban</b> bloqueia o Steam ID na lista de banimentos at\xE9 que voc\xEA os cancele. Ambos requerem ValheimRcon habilitado e uma senha RCON configurada."
            },
            {
              q: "Posso remover ValheimRcon?",
              a: "N\xE3o \u2013 est\xE1 integrado no painel e n\xE3o pode ser removido. Voc\xEA pode <b>desativar</b> na aba Mods; quando voc\xEA volta para o modo Modded (BepInEx), ele \xE9 reativado automaticamente."
            },
            {
              q: "Como encontro o Steam ID de um jogador?",
              a: 'Os jogadores conectados aparecem na Vis\xE3o geral com nome e ID Steam. Para jogadores offline, use <a href="https://steamid.io" target="_blank" rel="noopener">steamid.io</a> e copie <b>steamID64</b> (17 d\xEDgitos).'
            }
          ]
        },
        mundos: {
          label: "Mundos",
          items: [
            {
              q: "Como fa\xE7o para criar um novo mundo?",
              a: "Na aba <b>Worlds</b>, digite um nome e clique em <b>Create</b> (permanece pendente) ou <b>Create & Activate</b> (muda o servidor para ele). Um mundo s\xF3 \xE9 gerado na primeira inicializa\xE7\xE3o."
            },
            {
              q: "Quais s\xE3o os presets (Easy, Hard, Hardcore...)?",
              a: "Eles s\xE3o os mesmos modificadores da tela de cria\xE7\xE3o de mundo de Valheim, salvos no arquivo <code>.fwl</code>. Voc\xEA pode usar uma predefini\xE7\xE3o e ainda substituir configura\xE7\xF5es individuais (combate, recursos, ataques, portais, pena de morte)."
            },
            {
              q: "Posso importar um mundo que j\xE1 possuo?",
              a: "Sim. Copie <code>WorldName.fwl</code> e <code>WorldName.db</code> para <code>config/worlds_local/</code> (guia Arquivos ou volume Docker) e ele aparecer\xE1 na lista."
            },
            {
              q: "Mudar de mundo exclui o anterior?",
              a: "N\xE3o. A troca apenas altera o mundo que est\xE1 ativo; o progresso em outros mundos permanece salvo em <code>config/worlds_local/</code>."
            }
          ]
        },
        mods: {
          label: "Mods e BepInEx",
          items: [
            {
              q: "Como fa\xE7o para instalar um mod?",
              a: 'Em <b>Mods & Config</b>, cole um <a href="https://thunderstore.io/c/valheim/" target="_blank" rel="noopener">Thunderstore</a> URL (p\xE1gina, link de download ou r2modman) e clique em Instalar ou carregue um <code>.zip</code>/<code>.dll</code>.'
            },
            {
              q: "Os jogadores tamb\xE9m precisam do mod?",
              a: "Depende do mod. Mods do lado do servidor (por exemplo, ServerSideMap) s\xE3o executados apenas no servidor; a maioria dos mods de jogabilidade/UI devem ser instalados no cliente de cada jogador na mesma vers\xE3o."
            },
            {
              q: "O que \xE9 BepInEx?",
              a: "\xC9 o mod loader usado por Valheim. Cada mod geralmente gera um arquivo <code>.cfg</code> em <code>config/bepinex</code>, edit\xE1vel na aba Mods & Config."
            },
            {
              q: "Baunilha ou modificado?",
              a: "No <b>primeiro lan\xE7amento</b> ou em <b>Server</b> \u2192 <b>Atualiza\xE7\xF5es do jogo</b>, escolha <b>Vanilla</b> (desativa BepInEx e todos os mods) ou <b>Modded</b> (ativa BepInEx e ValheimRcon integrado). No modo vanilla, use <b>Administradores</b> nas listas de jogadores para ser administrador no jogo."
            },
            {
              q: "Como funcionam as atualiza\xE7\xF5es do jogo?",
              a: "O cont\xEAiner usa <code>valheim-updater</code> (SteamCMD). Na guia <b>Server</b> voc\xEA pode ativar a atualiza\xE7\xE3o autom\xE1tica, desativ\xE1-la ou clicar em <b>Verificar atualiza\xE7\xF5es agora</b>. Com os mods instalados, prefira atualizar manualmente ap\xF3s verificar a compatibilidade."
            },
            {
              q: "As atualiza\xE7\xF5es podem quebrar os mods?",
              a: "Sim. Um patch Valheim pode exigir novas vers\xF5es mod. Fa\xE7a backup, atualize o jogo e use <b>Check for updates</b> em cada mod vinculado ao Thunderstore."
            },
            {
              q: "Como fa\xE7o para atualizar um mod?",
              a: "Mods instalados via Thunderstore mostram o status da vers\xE3o. Use <b>Check for updates</b> e, se uma nova vers\xE3o estiver dispon\xEDvel, <b>Update mod</b>. Os mods enviados devem ser <b>linkados</b> a uma URL do Thunderstore para verifica\xE7\xF5es autom\xE1ticas."
            },
            {
              q: "Ativei/desativei um mod e nada mudou.",
              a: "As altera\xE7\xF5es de mod requerem <b>reinicializa\xE7\xE3o do servidor</b>. Use o bot\xE3o Reiniciar em Vis\xE3o geral."
            }
          ]
        },
        backups: {
          label: "C\xF3pias de seguran\xE7a",
          items: [
            {
              q: "Os backups s\xE3o autom\xE1ticos?",
              a: "Sim. Na guia <b>Backups</b>, em <b>Programa\xE7\xE3o autom\xE1tica</b>, voc\xEA define o intervalo. O cont\xEAiner copia <code>worlds_local/</code> para <code>config/backups/</code> como arquivos <code>worlds-*.zip</code>. Reten\xE7\xE3o: 30 dias."
            },
            {
              q: "Como fa\xE7o backup agora?",
              a: "Clique em <b>Criar backup manual</b> e escolha o tipo: Mundo ativo (r\xE1pido), Completo ou Somente configura\xE7\xF5es."
            },
            {
              q: "Como restauro um backup?",
              a: "Na lista de backup, clique em <b>Restore to here</b> no ponto desejado. O painel cria um ponto de verifica\xE7\xE3o, restaura arquivos e reinicia o servidor. Use <b>Restaurar para o mais recente</b> ou <b>Desfazer a \xFAltima restaura\xE7\xE3o</b> para voltar."
            },
            {
              q: "O que a corrida est\xE1 agendada agora?",
              a: "Aciona manualmente a mesma tarefa de backup executada no intervalo configurado \u2014 diferente de <b>Criar backup manual</b>, que permite escolher o escopo (mundial, completo ou configura\xE7\xF5es)."
            },
            {
              q: "Posso limitar a quantidade de backups de disco usados?",
              a: "Sim. Na guia <b>Servidor</b>, em <b>Uso do disco de backup</b>, use o menu suspenso <b>Total backup limit</b>. Deixe em <b>Ilimitado</b> sem limite ou escolha um tamanho (1 GB, 2 GB, 10 GB, etc.) e clique em <b>Salvar limite de backup</b>. Os backups mais antigos s\xE3o removidos automaticamente quando o limite \xE9 excedido."
            },
            {
              q: "O que Limpar todos os backups faz agora?",
              a: "Na guia <b>Server</b>, isso exclui irreversivelmente todos os ZIPs de backup em <code>config/backups/</code>, exceto backups vinculados a uma restaura\xE7\xE3o ativa ou ponto de verifica\xE7\xE3o de desfazer."
            }
          ]
        },
        files: {
          label: "Arquivos",
          items: [
            {
              q: "Como encontro um arquivo espec\xEDfico rapidamente?",
              a: "Na guia <b>Arquivos</b>, use a caixa de pesquisa para filtrar por nome de arquivo. Os arquivos correspondentes aparecem em uma lista simples para acesso r\xE1pido."
            },
            {
              q: "Quais s\xE3o os filtros de tipo de arquivo?",
              a: "Clique em chips como <b>Config</b>, <b>DLLs</b>, <b>Plugins</b> ou <b>Worlds</b> para restringir a \xE1rvore a tipos de arquivos comuns - \xFAtil quando voc\xEA s\xF3 precisa editar algumas configura\xE7\xF5es ou arquivos mod."
            }
          ]
        },
        recursos: {
          label: "Recursos e desempenho",
          items: [
            {
              q: "De quanta RAM o servidor precisa?",
              a: "Um servidor Valheim normalmente usa 2\u20134 \u200B\u200BGB, aumentando com mais jogadores/mods. Ajuste o limite na guia <b>Server</b> em <b>Capacidade do servidor</b>. As m\xE9tricas em tempo real est\xE3o em <b>Overview</b>."
            },
            {
              q: "Como defino o limite de jogadores?",
              a: "Na guia <b>Server</b> em <b>Capacidade do servidor</b>. Vanilla suporta at\xE9 10 jogadores; acima disso voc\xEA precisa de um mod (Valheim Plus ou MaxPlayerCount). O painel sincroniza o valor com o .cfg do mod, se instalado."
            },
            {
              q: "Alterar o limite de RAM desconecta os jogadores?",
              a: "Sim \u2013 aplicar um novo limite recria o cont\xEAiner e desconecta qualquer pessoa online. Fa\xE7a isso durante horas tranquilas."
            }
          ]
        },
        docker: {
          label: "Instala\xE7\xE3o e Docker",
          items: [
            {
              q: "Como executo o painel + servidor?",
              a: "Copie <code>.env.example</code> para <code>.env</code>, ajuste os valores e execute <code>docker compose up -d</code>. O painel est\xE1 em <code>http://YOUR_IP:8080</code>."
            },
            {
              q: "Estou recebendo erros de permiss\xE3o em pastas.",
              a: "Ao executar via Docker, o painel e o servidor utilizam o mesmo usu\xE1rio (UID/GID 1000) e compartilham volumes, portanto n\xE3o devem ocorrer erros de permiss\xE3o. Confirme que <code>config/</code> e <code>data/</code> pertencem ao UID 1000."
            },
            {
              q: "\xC9 seguro montar docker.sock no painel?",
              a: "O painel precisa de <code>docker.sock</code> para controlar o cont\xEAiner Valheim. Isso concede controle do Docker ao cont\xEAiner do painel \u2014 mantenha o painel em uma rede privada/atr\xE1s de um proxy com autentica\xE7\xE3o em produ\xE7\xE3o."
            }
          ]
        },
        problemas: {
          label: "Solu\xE7\xE3o de problemas",
          items: [
            {
              q: "Onde posso ver o que est\xE1 acontecendo?",
              a: "Abra <b>Console</b> (docker/BepInEx) na se\xE7\xE3o Ferramentas. A aba <b>Audit</b> mostra todas as a\xE7\xF5es realizadas pelo painel. CPU e RAM em tempo real est\xE3o em <b>Overview</b>."
            },
            {
              q: "O painel n\xE3o responde/apresenta erro 500.",
              a: "Verifique o console e a auditoria. Confirme se o Docker est\xE1 em execu\xE7\xE3o e se o cont\xEAiner <code>valheim-server</code> existe."
            },
            {
              q: "Uma altera\xE7\xE3o n\xE3o se aplica.",
              a: "Muitas altera\xE7\xF5es (mods, listas, execu\xE7\xE3o da configura\xE7\xE3o mundial) s\xF3 entram em vigor ap\xF3s reiniciar o servidor."
            }
          ]
        }
      },
      referenceLinks: [
        {
          label: "Wiki oficial de Valheim",
          url: "https://valheim.fandom.com/wiki/Valheim_Wiki"
        },
        {
          label: "Thunderstore (mods Valheim)",
          url: "https://thunderstore.io/c/valheim/"
        },
        {
          label: "BepInEx (carregador de mods)",
          url: "https://docs.bepinex.dev/"
        },
        {
          label: "imagem Docker lloesche/valheim-server",
          url: "https://github.com/lloesche/valheim-server-docker"
        },
        {
          label: "Servidor dedicado (guia oficial)",
          url: "https://valheim.fandom.com/wiki/Hosting_a_Dedicated_Server"
        }
      ],
      title: "Perguntas frequentes",
      searchPlaceholder: "Pesquisar perguntas frequentes...",
      usefulLinks: "Links \xFAteis"
    },
    worlds: {
      presets: {
        preset: {
          _default: {
            label: "Padr\xE3o do jogo",
            desc: "Sem modificadores \u2013 experi\xEAncia b\xE1sica, como antes do patch Hildir's Request."
          },
          easy: {
            label: "F\xE1cil",
            desc: "Combate mais leve (dano f\xE1cil) e ataques menos frequentes."
          },
          normal: {
            label: "Normal",
            desc: "Equivalente ao padr\xE3o do jogo \u2013 todos os controles deslizantes em Normal."
          },
          hard: {
            label: "Duro",
            desc: "Combate dif\xEDcil e ataques mais frequentes."
          },
          hardcore: {
            label: "Incondicional",
            desc: "Combate muito dif\xEDcil, pena de morte m\xE1xima, ataques frequentes, portais dif\xEDceis e nenhum mapa."
          },
          casual: {
            label: "Casual",
            desc: "Combate muito f\xE1cil, pena de morte leve, mais recursos, sem ataques, portais casuais, eventos por jogador e mobs passivos."
          },
          hammer: {
            label: "Modo martelo",
            desc: "Construindo sem custo de material, ataques desativados e mobs passivos."
          },
          immersive: {
            label: "Imersivo",
            desc: "Portais proibidos, o fogo se espalha pelo mundo e nenhum mapa/minimapa."
          }
        },
        combat: {
          _default: {
            label: "Usar predefini\xE7\xE3o",
            desc: "Herde a dificuldade de combate da predefini\xE7\xE3o selecionada."
          },
          veryeasy: {
            label: "Muito f\xE1cil",
            desc: "125% de dano ao jogador, 50% de dano ao inimigo, inimigos com 90% de velocidade/tamanho."
          },
          easy: {
            label: "F\xE1cil",
            desc: "110% de dano ao jogador, 75% de dano ao inimigo, inimigos com 95% de velocidade/tamanho."
          },
          normal: {
            label: "Normal",
            desc: "100% em todos os par\xE2metros de combate. Maior chance de inimigos de alto n\xEDvel no Dif\xEDcil/Muito Dif\xEDcil."
          },
          hard: {
            label: "Duro",
            desc: "85% de dano ao jogador, 150% de dano ao inimigo, inimigos com 110% de velocidade/tamanho, 120% de taxa de subida de n\xEDvel."
          },
          veryhard: {
            label: "Muito dif\xEDcil",
            desc: "70% de dano ao jogador, 200% de dano ao inimigo, inimigos com 120% de velocidade/tamanho, 140% de taxa de subida de n\xEDvel."
          }
        },
        deathpenalty: {
          _default: {
            label: "Usar predefini\xE7\xE3o",
            desc: "Herde a pena de morte da predefini\xE7\xE3o selecionada."
          },
          casual: {
            label: "Casual",
            desc: "Equipamento mantido ap\xF3s a morte. O estoque caiu. Perda de habilidade: 1%."
          },
          veryeasy: {
            label: "Muito f\xE1cil",
            desc: "Largue tudo na morte. Perda de habilidade: 1% (menos que o Normal)."
          },
          easy: {
            label: "F\xE1cil",
            desc: "Largue tudo na morte. Perda de habilidade: 2,5%."
          },
          normal: {
            label: "Normal",
            desc: "Largue tudo na morte. Perda de habilidade: 5%."
          },
          hard: {
            label: "Duro",
            desc: "Equipamento descartado, invent\xE1rio destru\xEDdo permanentemente. Perda de habilidade: 7,5%."
          },
          hardcore: {
            label: "Incondicional",
            desc: "Todos os itens e habilidades s\xE3o perdidos permanentemente com a morte."
          }
        },
        resources: {
          _default: {
            label: "Usar predefini\xE7\xE3o",
            desc: "Herdar a taxa de recursos da predefini\xE7\xE3o selecionada."
          },
          muchless: {
            label: "Muito menos",
            desc: "50% da taxa normal de queda de criaturas e objetos (\u22480,5\xD7)."
          },
          less: {
            label: "Menos",
            desc: "75% da taxa normal (\u22480,75\xD7)."
          },
          normal: {
            label: "Normal",
            desc: "Taxa de recursos do jogo padr\xE3o."
          },
          more: {
            label: "Mais",
            desc: "150% da taxa normal (\u22481,5\xD7)."
          },
          muchmore: {
            label: "Muito mais",
            desc: "200% da taxa normal (\u22482\xD7)."
          },
          most: {
            label: "M\xE1ximo",
            desc: "300% da taxa normal (\u22483\xD7)."
          }
        },
        raids: {
          _default: {
            label: "Usar predefini\xE7\xE3o",
            desc: "Herde a frequ\xEAncia de ataque da predefini\xE7\xE3o selecionada."
          },
          none: {
            label: "Nenhum",
            desc: "EventRate 0 \u2014 ataques diurnos desativados. Ainda podem ocorrer ataques noturnos."
          },
          muchless: {
            label: "Muito menos",
            desc: "Intervalo ~92 min, 10% de chance \u2013 muito menos ataques."
          },
          less: {
            label: "Menos",
            desc: "Intervalo ~69 min, ~13% de chance."
          },
          normal: {
            label: "Normal",
            desc: "Intervalo ~46 min, 20% de chance."
          },
          more: {
            label: "Mais",
            desc: "Intervalo ~28 min, ~33% de chance."
          },
          muchmore: {
            label: "Muito mais",
            desc: "Intervalo ~14 min, ~67% de chance."
          }
        },
        portals: {
          _default: {
            label: "Usar predefini\xE7\xE3o",
            desc: "Herdar regras do portal da predefini\xE7\xE3o selecionada."
          },
          casual: {
            label: "Casual",
            desc: "TeleportAll \u2014 quase tudo pode passar por portais (exceto animais domesticados)."
          },
          normal: {
            label: "Normal",
            desc: "Itens n\xE3o port\xE1teis seguem as regras padr\xE3o do jogo."
          },
          hard: {
            label: "Sem portais de chefe",
            desc: "Portais indispon\xEDveis enquanto um chefe estiver ativo na \xE1rea."
          },
          veryhard: {
            label: "Sem portais",
            desc: "N\xE3o s\xE3o permitidos portais no mundo."
          }
        }
      },
      flags: {
        nobuildcost: {
          label: "Sem custo de constru\xE7\xE3o",
          desc: "As pe\xE7as de constru\xE7\xE3o n\xE3o consomem materiais. As receitas ainda precisam ser descobertas."
        },
        playerevents: {
          label: "Ataques por jogador",
          desc: "Raids baseadas no progresso individual de cada jogador, n\xE3o em chefes mortos no servidor."
        },
        fire: {
          label: "Risco de inc\xEAndio",
          desc: "A madeira pode pegar fogo e o fogo se espalha por todo o mundo, n\xE3o apenas por Ashlands."
        },
        passivemobs: {
          label: "Inimigos passivos",
          desc: "Os inimigos n\xE3o atacam at\xE9 serem provocados."
        },
        nomap: {
          label: "Sem mapa",
          desc: "Mapa e minimapa desativados \u2014 navegue apenas por pontos de refer\xEAncia."
        }
      },
      fields: {
        preset: "Predefinido",
        combat: "Combate",
        deathpenalty: "Pena de morte",
        death: "Morte",
        resources: "Recursos",
        raids: "Invas\xF5es",
        portals: "Portais"
      },
      badges: {
        awaitingCreation: "Aguardando cria\xE7\xE3o",
        running: "Correndo",
        active: "Ativo",
        pending: "Pendente",
        configBadge: "{preset} \xB7 Portais: {portals}"
      },
      fallback: {
        gameDefault: "Padr\xE3o do jogo",
        preset: "Predefinido"
      },
      ui: {
        createTitle: "Crie um novo mundo",
        worldNamePlaceholder: "Nome mundial",
        create: "Criar",
        createAndActivate: "Criar e ativar",
        db: "Banco de dados: {value}",
        notCreated: "n\xE3o criado",
        configBtn: "Configura\xE7\xE3o",
        activate: "Ativar",
        settingsTitle: "Configura\xE7\xF5es mundiais",
        settingsDesc: 'Modificadores salvos no arquivo <span class="font-mono">.fwl</span> \u2014 equivalente \xE0 tela de cria\xE7\xE3o de mundo de Valheim.',
        refresh: "\u21BB Atualizar",
        seed: "Semente",
        uid: "UID",
        fwlFile: "Arquivo .fwl",
        saveDb: "Salvar .db",
        presetTitle: "Predefini\xE7\xE3o mundial",
        detectedFromFwl: "Detectado em .fwl",
        custom: "Personalizado",
        effectiveTitle: "Valores efetivos",
        effectiveDesc: "O que ser\xE1 aplicado ao mundo ap\xF3s salvar (predefini\xE7\xE3o + substitui\xE7\xF5es).",
        modifiersTitle: "Modificadores individuais",
        modifiersDesc: "Deixe em \u201CUsar predefini\xE7\xE3o\u201D para herdar da predefini\xE7\xE3o acima ou escolha um valor espec\xEDfico.",
        seedNewWorld: "\u{1F331} Semente (novo mundo)",
        seedPlaceholder: "Opcional \u2013 1 a 10 caracteres",
        seedHint: "Usado somente ao criar o arquivo .fwl pela primeira vez.",
        advancedTitle: "Op\xE7\xF5es avan\xE7adas",
        technicalTitle: "Detalhes t\xE9cnicos \u2014 strings salvas em .fwl",
        noModifiers: "Sem modificadores (baunilha / mundo normal).",
        saveSettings: "Salvar configura\xE7\xF5es",
        saveAndRestart: "Salve e reinicie",
        backupHint: 'Backup autom\xE1tico do .fwl anterior em <span class="font-mono">panel-data/world_fwl_backups/</span> antes de cada salvamento.',
        restartWarning: "O mundo est\xE1 em execu\xE7\xE3o \u2013 reinicie o servidor ap\xF3s salvar para aplicar as altera\xE7\xF5es .fwl."
      }
    },
    console: {
      categories: {
        Server: "Servidor",
        Moderation: "Modera\xE7\xE3o",
        Players: "Jogadores",
        Chat: "Bater papo",
        Objects: "Objetos",
        World: "Mundo"
      },
      commands: {
        save: {
          usage: "salvar",
          desc: "Salva o mundo atual"
        },
        list: {
          usage: "lista",
          desc: "Lista todos os comandos do servidor"
        },
        players: {
          usage: "jogadores",
          desc: "Mostra jogadores online com posi\xE7\xE3o"
        },
        serverStats: {
          usage: "serverStats",
          desc: "Estat\xEDsticas do servidor (FPS, RAM, jogadores)"
        },
        time: {
          usage: "tempo",
          desc: "Mostra a hora e o dia do servidor"
        },
        logs: {
          usage: "registros",
          desc: "\xDAltimas linhas de log do servidor"
        },
        consoleCommand: {
          usage: "consoleCommand <command>",
          desc: "Executa um comando do console Valheim"
        },
        kick: {
          usage: "chute <player|SteamID>",
          desc: "Chuta um jogador"
        },
        ban: {
          usage: "banir <player|SteamID>",
          desc: "Banimentos por nome ou Steam ID"
        },
        banSteamId: {
          usage: "banirSteamId <SteamID>",
          desc: "Banimentos por Steam ID"
        },
        unban: {
          usage: "cancelar banimento <player|SteamID>",
          desc: "Remove uma proibi\xE7\xE3o"
        },
        addAdmin: {
          usage: "adicionarAdmin <SteamID>",
          desc: "Adiciona um administrador"
        },
        removeAdmin: {
          usage: "removerAdmin <SteamID>",
          desc: "Remove um administrador"
        },
        addPermitted: {
          usage: "addPermitido <SteamID>",
          desc: "Adiciona \xE0 lista permitida"
        },
        removePermitted: {
          usage: "removerPermitido <SteamID>",
          desc: "Remove da lista permitida"
        },
        adminlist: {
          usage: "lista de administradores",
          desc: "Lista administradores"
        },
        banlist: {
          usage: "lista banida",
          desc: "Lista jogadores banidos"
        },
        permitted: {
          usage: "permitido",
          desc: "Lista jogadores permitidos"
        },
        disconnectAll: {
          usage: "desconectar tudo",
          desc: "Desconecta todos os jogadores"
        },
        give: {
          usage: "d\xEA <player|SteamID> <item> [op\xE7\xF5es]",
          desc: "D\xE1 um item a um jogador"
        },
        heal: {
          usage: "curar <player|SteamID> <health>",
          desc: "Cura o valor da sa\xFAde do jogador"
        },
        damage: {
          usage: "dano <player|SteamID> <damage>",
          desc: "Causa dano a um jogador"
        },
        teleport: {
          usage: "teletransportar <player|SteamID> <x> <y> <z>",
          desc: "Teleporta um jogador"
        },
        findPlayer: {
          usage: "encontrar Jogador <name>",
          desc: "Encontra um jogador e mostra detalhes"
        },
        say: {
          usage: "diga <message>",
          desc: "Envia uma mensagem de bate-papo (gritar)"
        },
        showMessage: {
          usage: "mostrar mensagem <message>",
          desc: "Mensagem na tela central para todos"
        },
        ping: {
          usage: "ping <x> <y> <z>",
          desc: "Mapear ping para todos"
        },
        spawn: {
          usage: "gerar <prefab> <x> <y> <z> [op\xE7\xF5es]",
          desc: "Gera objetos/criaturas"
        },
        findObjects: {
          usage: "encontrarObjects [op\xE7\xF5es]",
          desc: "Procura objetos no mundo"
        },
        addGlobalKey: {
          usage: "adicionarGlobalKey <key>",
          desc: "Adiciona uma chave global (por exemplo, chefe derrotado)"
        },
        removeGlobalKey: {
          usage: "removerGlobalKey <key>",
          desc: "Remove uma chave global"
        },
        globalKeys: {
          usage: "chaves globais",
          desc: "Lista chaves globais ativas"
        }
      },
      hints: {
        bepinexRequired: "O console RCON funciona apenas com BepInEx ativo - escolha Modded na guia Servidor.",
        modRequired: "Habilite o mod ValheimRcon em Mods & Config para usar console e modera\xE7\xE3o.",
        configPending: "Aguardando configura\xE7\xE3o RCON \u2013 reinicie o painel ou servidor Valheim.",
        serverStopped: "Inicie o servidor para usar o console interativo.",
        unavailable: "RCON indispon\xEDvel no momento."
      },
      placeholder: "Comando RCON (por exemplo, salvar, listar, chutar nome...)",
      viewCommands: "Ver comandos dispon\xEDveis",
      inputHints: "Preenchimento autom\xE1tico da guia \xB7 Insira envios \xB7 a sa\xEDda aparece nos logs acima",
      moderationActions: "A\xE7\xF5es de modera\xE7\xE3o",
      helpModal: {
        title: "Comandos RCON",
        intro: 'Clique em um comando para preencher o console. Use <code class="text-valheim-gold-light">list</code> no servidor para ver todos os comandos instalados.',
        searchPlaceholder: "Comando de pesquisa...",
        noCommands: "Nenhum comando encontrado.",
        docPrefix: "Documenta\xE7\xE3o completa:",
        docLink: "ValheimRcon no GitHub"
      },
      chart: {
        download: "Baixar",
        upload: "Carregar",
        networkTraffic: "Tr\xE1fego de rede (gr\xE1fico)"
      }
    },
    setup: {
      title: "Configurar servidor",
      subtitle: "Escolha como o servidor Valheim ser\xE1 executado.",
      serverMode: "Modo servidor",
      modes: {
        vanilla: "Baunilha",
        bepinex: "Com mods (BepInEx)"
      },
      vanillaHint: "Sem BepInEx e sem mods. Adicione seu Steam ID como administrador abaixo.",
      bepinexHint: "Habilita BepInEx, o mod ValheimRcon inclu\xEDdo, e gera a senha RCON automaticamente.",
      adminSteamId: "Seu ID Steam (administrador)",
      adminSteamIdPlaceholder: "76561198000000000",
      adminSteamIdHint: "Opcional por enquanto \u2013 voc\xEA pode editar mais tarde em Servidor \u2192 Listas de Jogadores.",
      firstWorld: "Primeiro mundo (opcional)",
      firstWorldPlaceholder: "Meu Mundo",
      createAndActivate: "Crie e ative este mundo",
      rconPassword: {
        title: "Senha RCON gerada",
        body: "O painel configurou ValheimRcon. Copie a senha \u2013 ela n\xE3o ser\xE1 mostrada novamente.",
        changeHint: 'Para alterar mais tarde: edite <code class="text-gray-400">config/bepinex/org.tristan.rcon.cfg</code> ou defina <code class="text-gray-400">PANEL_RCON_PASSWORD</code> em .env.'
      }
    },
    dashboard: {
      stats: {
        server: "Servidor",
        activeWorld: "Mundo Ativo",
        playersOnline: "Jogadores on-line",
        mods: "Mods",
        port: "Porta"
      },
      configCorrected: "Configura\xE7\xE3o corrigida: {from} \u2192 {to}",
      performance: "Desempenho",
      metrics: {
        cpu: "CPU",
        ram: "RAM",
        disk: "Disco (Valheim)",
        network: "Rede"
      },
      diskBreakdown: {
        game: "jogo",
        mods: "mods",
        worlds: "mundos",
        backups: "c\xF3pias de seguran\xE7a"
      },
      connect: {
        title: "Como conectar",
        intro: 'Em Valheim, use <strong class="text-gray-200">Join IP</strong> e digite:',
        hint: "A senha \xE9 definida na guia Servidor. Abra UDP <strong>2456\u20132458</strong> em seu roteador para acesso externo."
      },
      players: {
        title: "Jogadores Conectados",
        empty: "Nenhum jogador conectado no momento.",
        admin: "Administrador",
        banned: "Banido",
        actions: "A\xE7\xF5es \u25BE",
        promote: "Tornar administrador",
        demote: "Remover administrador",
        kick: "Kick",
        ban: "Ban",
        unban: "Desbanir"
      },
      quickControls: {
        title: "Controles r\xE1pidos",
        start: "Come\xE7ar",
        stop: "Parar",
        restart: "Reiniciar",
        pause: "Pausa",
        resume: "Retomar",
        backup: "\u{1F4BE} Backup"
      },
      console: {
        title: "Console do servidor (ao vivo)"
      },
      supervisor: {
        title: "Supervisor"
      }
    },
    server: {
      settings: {
        title: "Configura\xE7\xF5es do servidor (.env)",
        activeWorld: "Mundo Ativo",
        password: "Senha",
        showPassword: "Mostrar senha",
        hidePassword: "Ocultar senha",
        save: "Salvar configura\xE7\xF5es",
        saveAndRestart: "Salvar e reiniciar"
      },
      envFields: {
        SERVER_NAME: {
          label: "Nome do servidor",
          hint: "Mostrado na lista de servidores do jogo."
        },
        SERVER_PUBLIC: {
          label: "P\xFAblico (verdadeiro/falso)",
          hint: "true = listado publicamente; false = somente conex\xE3o direta."
        },
        SERVER_ARGS: {
          label: "Argumentos extras",
          hint: "Por exemplo -crossplay para ativar o jogo cruzado."
        }
      },
      capacity: {
        title: "Capacidade do servidor",
        subtitle: "Limite de RAM do cont\xEAiner e contagem m\xE1xima de jogadores.",
        wikiGuide: "Guia Wiki",
        ramLimit: "Limite de RAM",
        current: "Atual: {value}",
        applyRamLimit: "Aplicar limite de RAM",
        ramWarning: "A aplica\xE7\xE3o recria o cont\xEAiner \u2013 os jogadores conectados ser\xE3o desconectados.",
        playerLimit: "Limite de jogadores",
        modSource: "Mod: {name}",
        vanillaMax: "Baunilha (m\xE1x. 10)",
        playersAbove10: "Acima de 10 jogadores requer Valheim Plus ou MaxPlayerCount na guia Mods.",
        savePlayerLimit: "Salvar limite de jogadores",
        table: {
          players: "Jogadores",
          suggestedRam: "RAM sugerida",
          notes: "Notas"
        }
      },
      playerLists: {
        title: "Listas de jogadores",
        vanillaHint: "No modo <b>Vanilla</b>, adicione seu Steam ID em <b>Administrators</b> para permiss\xF5es de administrador no jogo (sem o console RCON do painel).",
        admin: "Administradores (IDs Steam)",
        banned: "Banido (IDs Steam)",
        permitted: "Permitido/lista de permiss\xF5es (IDs Steam)",
        saveLists: "Salvar listas"
      }
    },
    storage: {
      title: "Uso do disco de backup",
      intro: 'Limite opcional em arquivos <code class="text-gray-400">config/backups/</code> ZIP. Escolha <span class="text-valheim-gold font-medium">Ilimitado</span> para manter todos os backups ou escolha um tamanho \u2013 os backups mais antigos s\xE3o exclu\xEDdos primeiro quando o limite \xE9 excedido.',
      totalLimit: "Limite total de backup",
      unlimitedKeep: "Os backups s\xE3o mantidos at\xE9 que o espa\xE7o em disco acabe.",
      oldestDeleted: "Os backups mais antigos s\xE3o exclu\xEDdos primeiro quando o uso excede o limite acima.",
      currentUsage: "Uso atual",
      saveLimit: "Salvar limite de backup",
      clearAll: "Limpe todos os backups agora",
      clearAllHint: "Irrevers\xEDvel \u2013 exclui todos os ZIPs de backup, exceto aqueles vinculados a uma restaura\xE7\xE3o ativa ou ponto de verifica\xE7\xE3o de desfazer.",
      purgeModal: {
        title: "Limpar todos os backups",
        body: 'Esta a\xE7\xE3o \xE9 <strong>irrevers\xEDvel</strong>. Cada ZIP de backup em <code class="text-gray-400">config/backups/</code> ser\xE1 exclu\xEDdo.',
        preserved: "Os backups vinculados a uma restaura\xE7\xE3o ativa ou a um ponto de verifica\xE7\xE3o de desfazer s\xE3o preservados.",
        deleteAll: "Excluir tudo"
      },
      usageNoLimit: "{used} usado (sem limite)",
      usageOfLimit: "{used} de {limit} GB"
    },
    updates: {
      title: "Atualiza\xE7\xF5es do jogo",
      subtitle: "Controle as atualiza\xE7\xF5es do Valheim via valheim-updater (SteamCMD).",
      modsWarning: "As atualiza\xE7\xF5es de Valheim podem quebrar os mods. Fa\xE7a backup primeiro. Verifique a compatibilidade de cada mod ap\xF3s atualizar o jogo.",
      serverMode: "Modo servidor",
      modeHint: "Vanilla desativa BepInEx e desativa todos os mods. Com mods habilita BepInEx e o ValheimRcon inclu\xEDdo.",
      installedVersion: "Vers\xE3o instalada",
      build: "Construir",
      updater: "Atualizador",
      autoUpdate: "Jogo com atualiza\xE7\xE3o autom\xE1tica",
      onlyWhenEmpty: "Somente quando o servidor est\xE1 vazio",
      checkInterval: "Verifique o intervalo",
      customCron: "Cron personalizado",
      save: "Salvar",
      saveRecreate: "Salvar e recriar cont\xEAiner",
      checkNow: "Verifique se h\xE1 atualiza\xE7\xF5es agora",
      presets: {
        "15min": "A cada 15 minutos",
        "1h": "A cada hora",
        "6h": "A cada 6 horas",
        daily: "Diariamente (06:00)",
        custom: "Personalizado"
      }
    },
    mods: {
      install: {
        title: "Instalar mod",
        upload: "\u{1F4C1} Carregar (.zip/.dll)",
        urlPlaceholder: "URL do Thunderstore (p\xE1gina, download ou r2modman)",
        installUrl: "Instalar a partir do URL"
      },
      valheimRcon: '<strong class="text-valheim-gold">ValheimRcon</strong> vem junto com o painel (console RCON, kick, ban e admin). N\xE3o pode ser removido, mas pode ser desativado. As a\xE7\xF5es do console e do jogador requerem BepInEx ativo e este mod habilitado.',
      bundled: "Empacotado",
      bundledCannotRemove: "Empacotado \u2013 n\xE3o pode ser removido",
      active: "Ativo",
      disabled: "Desabilitado",
      activeConsole: "Ativo \u2013 console e modera\xE7\xE3o dispon\xEDveis",
      disabledConsole: "Desativado \u2013 habilite o uso do console e modera\xE7\xE3o",
      configPrefix: "Configura\xE7\xE3o: {name}",
      noConfig: "Sem configura\xE7\xE3o",
      version: "Vers\xE3o",
      checkUpdates: "Verifique se h\xE1 atualiza\xE7\xF5es",
      updateMod: "Atualizar mod",
      linkThunderstore: "Link Thunderstore",
      linkUrlPlaceholder: "URL do Thunderstore",
      configBtn: "Configura\xE7\xE3o",
      remove: "Remover",
      empty: "Nenhum mod instalado",
      orphaned: {
        title: "Configura\xE7\xF5es \xF3rf\xE3s",
        desc: "{count} arquivo(s) de configura\xE7\xE3o dos mods removidos ainda est\xE3o no disco.",
        remove: "Remover configura\xE7\xF5es \xF3rf\xE3s"
      },
      export: {
        title: "Exportar perfil r2modman",
        desc: "Exporta mods vinculados \xE0s configura\xE7\xF5es do Thunderstore e BepInEx para importa\xE7\xE3o no r2modman. Mods desvinculados s\xE3o ignorados.",
        skipped: "{count} mod(s) sem link do Thunderstore ser\xE3o ignorados",
        downloadR2z: "Baixe .r2z"
      },
      bepinexConfigs: {
        title: "Configura\xE7\xF5es BepInEx",
        desc: 'Arquivos de configura\xE7\xE3o gerados por mods em <code class="font-mono">config/bepinex/</code>.',
        empty: "Nenhum arquivo de configura\xE7\xE3o encontrado",
        edit: "Editar"
      },
      status: {
        up_to_date: "Atualizado",
        update_available: "Atualiza\xE7\xE3o dispon\xEDvel",
        unknown: "Fonte desconhecida",
        error: "Falha na verifica\xE7\xE3o"
      }
    },
    backups: {
      state: {
        title: "Estado do servidor",
        restoredFrom: "Restaurado de: {name}",
        live: "Servidor no estado <strong>live</strong> \u2014 nenhuma restaura\xE7\xE3o do painel registrada.",
        lastRestore: "\xDAltima restaura\xE7\xE3o: {date}",
        restoreLatest: "Restaurar mais recente",
        undoRestore: "Desfazer a \xFAltima restaura\xE7\xE3o",
        hint: "A restaura\xE7\xE3o sempre reinicia o servidor. Um ponto de verifica\xE7\xE3o autom\xE1tico \xE9 criado antes de cada restaura\xE7\xE3o."
      },
      schedule: {
        title: "Agendamento autom\xE1tico",
        info: 'O cont\xEAiner Valheim copia periodicamente a pasta <code class="text-gray-400">worlds_local/</code> para <code class="text-gray-400">config/backups/</code>. Os arquivos aparecem como <code class="text-gray-400">worlds-YYYYMMDD-HHMMSS.zip</code>. Reten\xE7\xE3o: 30 dias.',
        automatic: "Backups autom\xE1ticos",
        enabled: "Habilitado",
        disabled: "Desabilitado",
        interval: "Intervalo",
        customCron: "Cron personalizado",
        retention: "Reten\xE7\xE3o",
        retentionValue: "30 dias",
        idleLabel: "Backup quando n\xE3o h\xE1 jogadores online",
        idleYes: "Sim \u2013 fa\xE7a backup mesmo quando estiver vazio",
        idleNo: "Somente quando os jogadores est\xE3o online",
        current: "Atual: {value}",
        applyRestart: "Aplicar e reiniciar",
        manual: "Criar backup manual",
        runScheduled: "Execute o trabalho agendado agora",
        runScheduledTitle: "Executa agora o mesmo trabalho executado no intervalo agendado"
      },
      intervalPresets: {
        hourly: "A cada hora",
        "6h": "A cada 6 horas",
        "12h": "A cada 12 horas",
        daily: "Diariamente (00:00)",
        custom: "Personalizado"
      },
      idleLabels: {
        online: "Somente quando os jogadores est\xE3o online",
        empty: "Sim \u2013 mesmo sem jogadores"
      },
      list: {
        title: "Backups armazenados",
        hideCheckpoints: "Ocultar pontos de verifica\xE7\xE3o",
        empty: "Nenhum backup encontrado em config/backups/",
        columns: {
          type: "Tipo",
          name: "Nome",
          date: "Data",
          age: "Idade",
          size: "Tamanho",
          mods: "Mods",
          actions: "A\xE7\xF5es"
        },
        badges: {
          active: "Ativo",
          latest: "Mais recente",
          checkpoint: "Ponto de verifica\xE7\xE3o"
        },
        activeMods: "{count} ativo",
        restoreToHere: "Restaurar aqui",
        details: "Detalhes"
      },
      types: {
        world: {
          label: "Mundo ativo (r\xE1pido)",
          desc: "Somente o mundo em uso (.fwl + .db)."
        },
        full: {
          label: "Completo",
          desc: "Mundos + configura\xE7\xF5es BepInEx + mods + listas + .env."
        },
        configs: {
          label: "Somente configura\xE7\xF5es",
          desc: "Configura\xE7\xF5es BepInEx + listas de jogadores + .env."
        }
      },
      modals: {
        create: {
          title: "Criar backup",
          desc: "Escolha o tipo de backup manual a ser criado agora.",
          creating: "Criando backup..."
        },
        restore: {
          title: "Restaurar c\xF3pia de seguran\xE7a",
          intro: "Restaure o servidor para o estado deste backup:",
          name: "Nome:",
          type: "Tipo:",
          date: "Data:",
          bullets: [
            "O servidor ser\xE1 parado e reiniciado automaticamente",
            "Os arquivos World/config ser\xE3o sobrescritos",
            "Um ponto de verifica\xE7\xE3o do estado atual ser\xE1 criado primeiro"
          ],
          confirm: "Restaurar e reiniciar"
        },
        delete: {
          title: "Excluir backup",
          confirm: "Excluir permanentemente {name}?"
        },
        details: {
          title: "Detalhes do backup",
          loading: "Carregando detalhes...",
          world: "Mundo:",
          build: "Constru\xE7\xE3o de Valheim:",
          inferred: "Metadados inferidos do ZIP \u2014 as vers\xF5es do Thunderstore podem estar indispon\xEDveis.",
          modsTitle: "Mods ({count})",
          noMods: "Nenhum mod registrado neste backup.",
          columns: {
            mod: "Mod",
            package: "Pacote",
            version: "Vers\xE3o",
            state: "Estado"
          },
          contents: "Conte\xFAdo",
          includesWorlds: "Mundos inclu\xEDdos",
          includesDlls: "DLLs de modifica\xE7\xE3o inclu\xEDdas",
          includesEnv: "Arquivo .env inclu\xEDdo",
          hasAdminlist: "Lista de administradores",
          fileCount: "{count} arquivo(s) em ZIP",
          worldsList: "Mundos: {names}"
        }
      },
      contentsNotes: {
        noDlls: "Este backup n\xE3o inclui arquivos mod (.dll) \u2014 a lista abaixo reflete o estado do servidor no momento do backup.",
        configsOnly: "Este backup cont\xE9m apenas mundo/configura\xE7\xE3o \u2014 mods n\xE3o foram inclu\xEDdos. Use backup manual \u2014 completo para um instant\xE2neo com DLLs."
      }
    },
    files: {
      searchPlaceholder: "Pesquisar por nome de arquivo...",
      browser: "Navegador",
      noMatches: "Nenhuma correspond\xEAncia",
      selectFile: "Selecione um arquivo para editar",
      searchSettings: "Configura\xE7\xF5es de pesquisa...",
      form: "Form",
      raw: "Raw",
      scopes: {
        config: "Configura\xE7\xE3o",
        data: "Dados"
      },
      typeFilters: {
        all: "Todos",
        config: "Configura\xE7\xE3o",
        dll: "DLLs",
        plugin: "Plugins",
        world: "Mundos",
        list: "Listas",
        backup: "C\xF3pias de seguran\xE7a",
        log: "Registros"
      },
      tree: {
        emptyFolder: "Pasta vazia",
        inaccessible: "inacess\xEDvel"
      }
    },
    logs: {
      docker: "Docker",
      bepinex: "BepInEx",
      autoRefresh: "Autom\xE1tico (5s)"
    },
    audit: {
      downloadLog: "Baixe o registro completo",
      autoRefresh: "Autom\xE1tico (5s)",
      description: "Log persistente de todas as a\xE7\xF5es (POST/PUT/DELETE) para diagn\xF3stico e recupera\xE7\xE3o de erros.",
      empty: "Nenhum evento registrado",
      columns: {
        time: "Tempo",
        method: "M\xE9todo",
        action: "A\xE7\xE3o",
        status: "Status",
        duration: "Dur.",
        error: "Erro",
        details: "Detalhes"
      },
      modal: {
        title: "Detalhes da auditoria",
        request: "Solicitar",
        response: "Resposta"
      }
    },
    donation: {
      title: "Apoie o projeto",
      pitch: "O Painel Vikinger \xE9 gratuito para uso pessoal. Os patrocinadores ajudam a manter o projeto e o desenvolvimento. Contribuidores com mais de US$ 1/m\xEAs recebem suporte direto do mantenedor. O patroc\xEDnio n\xE3o substitui uma licen\xE7a comercial \u2013 os provedores de hospedagem ainda precisam de uma (veja abaixo).",
      voluntary: {
        title: "Doa\xE7\xF5es volunt\xE1rias",
        desc: "O painel \xE9 gratuito para uso pessoal. Se ajudar voc\xEA, qualquer contribui\xE7\xE3o financia novos recursos, corre\xE7\xF5es e documenta\xE7\xE3o."
      },
      pix: "Pix (Brasil)",
      notConfigured: 'Os links de doa\xE7\xE3o ainda n\xE3o est\xE3o configurados. Defina <code class="text-gray-400">PANEL_DONATION_*</code> no servidor <code class="text-gray-400">.env</code>.',
      commercial: {
        title: "Licenciamento comercial",
        intro: '<strong class="text-gray-200">Provedores de hospedagem</strong> que desejam oferecer este painel aos clientes precisam de uma <strong class="text-gray-200">licen\xE7a comercial</strong>. A revenda e o uso de marca branca sem autoriza\xE7\xE3o violam o {license}.',
        items: [
          "Uso pessoal e contribui\xE7\xE3o de c\xF3digo aberto: gratuito",
          "Hospedagem comercial/revenda: licen\xE7a paga",
          "As doa\xE7\xF5es n\xE3o substituem uma licen\xE7a comercial"
        ],
        requestLicense: "Solicitar licen\xE7a comercial",
        licenseText: "Texto da licen\xE7a",
        contact: "Contato para licenciamento:"
      }
    },
    about: {
      subtitle: "Gerenciador web para um servidor Valheim dockerizado",
      fields: {
        version: "Vers\xE3o",
        build: "Construir",
        commit: "Comprometer-se",
        license: "Licen\xE7a"
      },
      repository: "Reposit\xF3rio",
      whatsNew: "O que h\xE1 de novo",
      changelogEmpty: "Nenhuma entrada no changelog.",
      creditsTitle: "Cr\xE9ditos",
      changelogSections: {
        added: "Adicionado",
        changed: "Alterado",
        deprecated: "Obsoleto",
        removed: "Removido",
        fixed: "Corrigido",
        security: "Seguran\xE7a"
      },
      update: {
        title: "Atualiza\xE7\xE3o do painel",
        upToDate: "Atualizado (v{current})",
        available: "Atualiza\xE7\xE3o dispon\xEDvel: v{latest}",
        viewRelease: "Ver release no GitHub",
        apply: "Atualizar agora",
        updating: "Atualizando\u2026 reiniciando",
        started: "Atualiza\xE7\xE3o iniciada \u2014 a p\xE1gina recarrega quando o container reiniciar."
      },
      credits: {
        valheimDocker: {
          label: "Servidor Valheim no Docker",
          by: "lloesche/valheim-server-docker"
        },
        backend: {
          label: "Back-end",
          by: "FastAPI + Uvicorn"
        },
        frontend: {
          label: "Front-end",
          by: "Alpine.js + Tailwind CSS + Chart.js + CodeMirror"
        }
      }
    },
    resources: {
      noLimit: "Sem limite",
      hostSuffix: "(hospedar)"
    }
  };

  // frontend/locales/de-DE.json
  var de_DE_default = {
    meta: {
      locale: "de-DE",
      appTitle: "Vikinger Panel",
      appSubtitle: "PsyDev Server-Manager"
    },
    nav: {
      sections: {
        painel: "Panel",
        gerenciar: "Verwalten",
        ferramentas: "Werkzeuge",
        suporte: "Support"
      },
      items: {
        dashboard: "\xDCbersicht",
        server: "Server",
        worlds: "Welten",
        mods: "Mods & Config",
        backups: "Backups",
        files: "Dateien",
        logs: "Konsole",
        audit: "Audit",
        help: "Hilfe",
        donation: "Projekt unterst\xFCtzen",
        about: "\xDCber"
      },
      sidebar: {
        containerRunning: "Container l\xE4uft",
        containerStopped: "Container gestoppt"
      },
      refresh: "Aktualisieren"
    },
    common: {
      actions: {
        copy: "Kopie",
        cancel: "Stornieren",
        save: "Speichern",
        delete: "L\xF6schen",
        edit: "Bearbeiten",
        download: "Herunterladen",
        close: "\u2715",
        view: "Sicht",
        ok: "OK",
        send: "Schicken",
        undo: "R\xFCckg\xE4ngig machen",
        redo: "Wiederholen",
        find: "Finden",
        gotIt: "Habe es",
        confirmAndStart: "Best\xE4tigen und starten",
        copyAddress: "Adresse kopieren",
        copyKey: "Schl\xFCssel kopieren",
        copyCode: "Code kopieren",
        copyRequest: "Kopieranfrage",
        copyResponse: "Antwort kopieren",
        copyAll: "Alles kopieren",
        restoreDraft: "Entwurf wiederherstellen",
        discard: "Verwerfen"
      },
      loading: {
        loading: "Laden...",
        loadingEllipsis: "Laden\u2026",
        applying: "Bewerben...",
        saving: "Sparen...",
        restarting: "Neustart...",
        creating: "Erstellen...",
        activating: "Aktivieren...",
        deleting: "L\xF6schen...",
        removing: "Entfernen...",
        uploading: "Hochladen...",
        installing: "Installieren...",
        checking: "\xDCberpr\xFCfung...",
        updating: "Aktualisierung...",
        linking: "Verlinkung...",
        generating: "Generieren...",
        publishing: "Ver\xF6ffentlichung...",
        running: "L\xE4uft...",
        restoring: "Wiederherstellung...",
        undoing: "Verderben...",
        recreatingContainer: "Container wird neu erstellt..."
      },
      status: {
        online: "Online",
        paused: "Angehalten",
        offline: "Offline",
        starting: "Beginnt",
        realTime: "Echtzeit",
        emDash: null,
        yes: "Ja",
        no: "NEIN",
        on: "An",
        off: "Aus",
        enabled: "Erm\xF6glicht",
        disabled: "Deaktiviert",
        active: "Aktiv",
        unlimited: "Unbegrenzt",
        noLimit: "Keine Begrenzung",
        hostSuffix: "(Gastgeber)",
        pending: "(ausstehend)",
        days: "{count} Tage",
        day: "{count} Tag",
        match: "\xFCbereinstimmen",
        matches: "Streichh\xF6lzer",
        matchEs: "\xDCbereinstimmung(en)",
        ofLimit: "der Grenze",
        players: "Spieler",
        mod: "Mod",
        mods: "Mods",
        ms: "ms"
      },
      toasts: {
        copied: "Kopiert!",
        failedToCopy: "Kopieren fehlgeschlagen",
        actionCompleted: "Aktion abgeschlossen",
        fileSaved: "Datei gespeichert!",
        settingsSaved: "Einstellungen gespeichert!",
        listsSaved: "Listen gespeichert! Server wurde neu gestartet, wenn er online war.",
        limitApplied: "Limit angewendet",
        playerLimitSaved: "Spielerlimit gespeichert",
        backupLimitSaved: "Sicherungslimit gespeichert und Bereinigung angewendet",
        updateSettingsSaved: "Update-Einstellungen gespeichert!",
        configSavedRecreated: "Konfiguration gespeichert und Container neu erstellt!",
        backupConfigApplied: "Konfiguration angewendet und Container neu gestartet!",
        worldSettingsSaved: "Welteinstellungen gespeichert",
        worldSettingsSavedRestart: "Einstellungen gespeichert und Server neu gestartet",
        serverConfiguredVanilla: "Server im Vanilla-Modus konfiguriert",
        serverConfiguredBepinex: "Mit BepInEx konfigurierter Server",
        rconPasswordGenerated: "RCON-Passwort generiert \u2013 kopieren Sie es, bevor Sie den Hinweis schlie\xDFen",
        installed: "Installiert: {names}",
        modRemoved: "{name} entfernt",
        modEnabled: "Mod aktiviert",
        modDisabled: "Mod deaktiviert",
        modLinked: "Mod mit Thunderstore verkn\xFCpft",
        modUpdated: "Mod aktualisiert auf v{version}",
        modOnLatest: "Mod ist auf der neuesten Version",
        modUpdateAvailable: "Update verf\xFCgbar: v{installed} \u2192 v{latest}",
        orphanedConfigsRemoved: "{count} verwaiste Konfiguration(en) entfernt",
        r2zDownloaded: ".r2z-Profil heruntergeladen",
        codeCopied: "Code kopiert: {count} Mod(s){skipped}",
        codeCopiedSkipped: "({skipped} Mod(s) \xFCbersprungen)",
        backupCreated: "Backup erstellt: {name}",
        scheduledBackupTriggered: "Geplante Sicherung ausgel\xF6st \u2013 warten Sie ein paar Sekunden.",
        backupRestored: "Backup \u201E{name}\u201C wiederhergestellt \u2013 Server wird neu gestartet.",
        backupRestoredLatest: "Backup \u201E{name}\u201C wiederhergestellt \u2013 Server wird neu gestartet.",
        restoreUndone: "Wiederherstellung r\xFCckg\xE4ngig gemacht \u2013 \u201E{name}\u201C ist aktiv.",
        backupDeleted: "Sicherung \u201E{name}\u201C gel\xF6scht",
        purgeDeleted: "Gel\xF6schte {count} Backup(s)",
        purgeNone: "Keine Backups zum L\xF6schen",
        worldActivated: "Welt \u201E{name}\u201C aktiviert",
        worldCreatedActivated: "Welt \u201E{name}\u201C erstellt und aktiviert",
        worldRegistered: "Welt \u201E{name}\u201C registriert",
        worldDeleted: "Welt \u201E{name}\u201C gel\xF6scht",
        playerKicked: "{label} gekickt",
        playerBanned: "{label} gesperrt",
        playerUnbanned: "{label} entsperrt",
        playerPromoted: "{label} zum Administrator bef\xF6rdert",
        playerDemoted: "{label} aus dem Admin entfernt",
        serverActionCompleted: "Aktion \u201E{action}\u201C abgeschlossen",
        checkRequested: "Scheck angefordert"
      },
      confirm: {
        kickPlayer: "Tritt {label}? Der Spieler kann wieder beitreten.",
        banPlayer: "Verbot {label} ({steamId})? Der Spieler kann nicht beitreten, bis die Sperre aufgehoben wird.",
        removeMod: "Mod {name} entfernen?",
        updateMod: "{name} aktualisieren? M\xF6glicherweise muss der Server neu gestartet werden.",
        removeOrphanedConfig: "Verwaiste Konfiguration {names} entfernen?",
        removeOrphanedConfigs: "{count} verwaiste Konfigurationsdatei(en) entfernen?\n\n{names}",
        activateWorldNew: "Welt \u201E{name}\u201C aktivieren? Der Server wird neu gestartet und eine NEUE (leere) Welt wird erstellt.",
        activateWorld: "Welt \u201E{name}\u201C aktivieren? Der Server wird neu gestartet.",
        deleteWorld: "Welt \u201E{name}\u201C endg\xFCltig l\xF6schen?",
        restoreLatest: "Das neueste Backup wiederherstellen? Der Server wird neu gestartet.",
        undoRestore: "Letzte Wiederherstellung r\xFCckg\xE4ngig machen? Der Server kehrt in den vorherigen Zustand zur\xFCck.",
        applyMemoryLimit: "RAM-Limit auf {label} setzen? Der Container wird neu erstellt und die Verbindung der Spieler wird getrennt."
      },
      errors: {
        invalidSteamId: "Ung\xFCltige Steam-ID \u2013 verwenden Sie 17 Ziffern",
        invalidWorldName: "Ung\xFCltiger Weltname \u2013 verwenden Sie nur Buchstaben, Zahlen, _ und -",
        rconUnavailable: "RCON nicht verf\xFCgbar",
        couldNotLoadUsage: "Die Nutzung konnte nicht geladen werden"
      },
      logEmpty: {
        waitingForOutput: "Warten auf Serverausgabe...",
        noLogsAvailable: "Keine Protokolle verf\xFCgbar."
      },
      editor: {
        unsavedChanges: "Nicht gespeicherte \xC4nderungen",
        localDraftFound: "Lokaler Entwurf gefunden (nicht auf dem Server gespeichert).",
        defaultLabel: "Standard:",
        ctrlSaveSearch: "Strg+S zum Speichern \xB7 Strg+F zum Suchen",
        noMatchingSettings: "Keine passenden Einstellungen"
      },
      language: "Sprache"
    },
    help: {
      categories: {
        "primeiros-passos": {
          label: "Erste Schritte",
          items: [
            {
              q: "Wie treten meine Freunde dem Server bei?",
              a: "Verwenden Sie in Valheim <b>Join via IP</b> und geben Sie <code>YOUR_IP:2456</code> ein (der Standardport ist 2456). Geben Sie dann das Serverpasswort ein. Die aktuelle Adresse erscheint auf der Registerkarte <b>\xDCbersicht</b> im Block \u201EVerbindung herstellen\u201C."
            },
            {
              q: "Wo lege ich den Servernamen und das Passwort fest?",
              a: "Auf der Registerkarte <b>Server</b>. Das Passwort muss mindestens 5 Zeichen lang sein und darf nicht den Servernamen enthalten. Speichern und neu starten, um die Anwendung anzuwenden."
            },
            {
              q: "Der Server wird nicht in der \xF6ffentlichen Liste angezeigt. Was nun?",
              a: "Die \xF6ffentliche Liste von Valheim dauert oft ein paar Minuten und schl\xE4gt manchmal fehl. Bevorzugen Sie <b>Beitritt \xFCber IP</b>. Best\xE4tigen Sie au\xDFerdem, dass <code>SERVER_PUBLIC</code> auf der Registerkarte Server auf <code>true</code> gesetzt ist."
            },
            {
              q: "Muss ich Ports auf meinem Router \xF6ffnen?",
              a: "Ja \u2013 um \xFCber das Internet zu spielen, leiten Sie die UDP-Ports <b>2456\u20132458</b> an den Server-Rechner weiter (Portweiterleitung)."
            },
            {
              q: "Wie aktiviere ich Crossplay (PC + Xbox/Game Pass)?",
              a: "F\xFCgen Sie auf der Registerkarte \u201EServer\u201C <code>-crossplay</code> im Feld <b>Extra arguments</b> hinzu und starten Sie neu."
            }
          ]
        },
        servidor: {
          label: "Server",
          items: [
            {
              q: "Was ist der Unterschied zwischen Start, Stopp, Neustart, Pause und Fortsetzen?",
              a: "<b>Start/Stopp/Neustart</b> Schaltet den gesamten Container ein/aus. <b>Pause/Resume</b> unterbricht nur den Valheim-Prozess im Container (schneller, h\xE4lt den Container am Laufen)."
            },
            {
              q: "Was sind die Listen \u201EAdministratoren\u201C, \u201EGesperrt\u201C und \u201EZugelassen\u201C?",
              a: "Steam-ID-Listen. <b>Admin</b> erh\xE4lt Moderationsbefehle; <b>Gesperrte</b> Spieler k\xF6nnen nicht beitreten; <b>Zul\xE4ssig</b> fungiert als Whitelist (wenn ausgef\xFCllt, k\xF6nnen nur diese IDs beitreten). Verwenden Sie in <b>Overview</b> das Men\xFC <b>Aktionen</b> neben jedem verbundenen Spieler, um ihn zu bewerben, zu kicken oder zu sperren, ohne die Dateien manuell bearbeiten zu m\xFCssen."
            },
            {
              q: "Wie verwende ich die interaktive Konsole des Panels?",
              a: "Der Mod <b>ValheimRcon</b> ist in das Panel (<b>Integrated</b> Abzeichen auf der Registerkarte Mods) integriert. Im <b>Modded (BepInEx)</b> Modus wird das RCON-Passwort bei der ersten Einrichtung automatisch generiert. Konsole und Moderation erfordern aktives BepInEx und aktivierten Mod."
            },
            {
              q: "Wie \xE4ndere ich das RCON-Passwort?",
              a: "Bearbeiten Sie <code>config/bepinex/org.tristan.rcon.cfg</code> (das Feld <code>Password</code>) in der Mods \u2192 ValheimRcon-Konfiguration oder legen Sie <code>PANEL_RCON_PASSWORD</code> in <code>.env</code> fest. Starten Sie den Server nach der \xC4nderung neu."
            },
            {
              q: "Was ist der Unterschied zwischen Kick und Ban?",
              a: "<b>Kick</b> trennt die Verbindung des Spielers sofort, er kann jedoch wieder beitreten. <b>Ban</b> blockiert die Steam-ID auf der Sperrliste, bis Sie die Sperre aufheben. F\xFCr beide ist ValheimRcon aktiviert und ein RCON-Passwort konfiguriert."
            },
            {
              q: "Kann ich ValheimRcon entfernen?",
              a: "Nein \u2013 es ist in das Panel integriert und kann nicht entfernt werden. Sie k\xF6nnen es auf der Registerkarte \u201EMods\u201C <b>deaktivieren</b>; Wenn Sie wieder in den Modded-Modus (BepInEx) wechseln, wird er automatisch wieder aktiviert."
            },
            {
              q: "Wie finde ich die Steam-ID eines Spielers?",
              a: 'Verbundene Spieler werden in der \xDCbersicht mit Namen und Steam-ID angezeigt. F\xFCr Offline-Spieler verwenden Sie <a href="https://steamid.io" target="_blank" rel="noopener">steamid.io</a> und kopieren Sie die <b>steamID64</b> (17 Ziffern).'
            }
          ]
        },
        mundos: {
          label: "Welten",
          items: [
            {
              q: "Wie erschaffe ich eine neue Welt?",
              a: "Geben Sie auf der Registerkarte <b>Welten</b> einen Namen ein und klicken Sie auf <b>Erstellen</b> (bleibt ausstehend) oder <b>Erstellen und aktivieren</b> (schaltet den Server darauf um). Eine Welt wird tats\xE4chlich nur beim ersten Booten generiert."
            },
            {
              q: "Was sind die Voreinstellungen (Easy, Hard, Hardcore...)?",
              a: "Es handelt sich dabei um dieselben Modifikatoren wie bei Valheims Welterstellungsbildschirm, die in der Datei <code>.fwl</code> gespeichert sind. Sie k\xF6nnen eine Voreinstellung verwenden und dennoch einzelne Einstellungen (Kampf, Ressourcen, Raids, Portale, Todesstrafe) \xFCberschreiben."
            },
            {
              q: "Kann ich eine Welt importieren, die ich bereits habe?",
              a: "Ja. Kopieren Sie <code>WorldName.fwl</code> und <code>WorldName.db</code> nach <code>config/worlds_local/</code> (Registerkarte \u201EDateien\u201C oder Docker-Volume) und es wird in der Liste angezeigt."
            },
            {
              q: "L\xF6scht ein Weltwechsel die vorherige?",
              a: "Nein. Durch den Wechsel \xE4ndert sich nur, welche Welt aktiv ist. Der Fortschritt auf anderen Welten bleibt in <code>config/worlds_local/</code> gespeichert."
            }
          ]
        },
        mods: {
          label: "Mods & BepInEx",
          items: [
            {
              q: "Wie installiere ich einen Mod?",
              a: 'F\xFCgen Sie unter <b>Mods & Config</b> eine <a href="https://thunderstore.io/c/valheim/" target="_blank" rel="noopener">Thunderstore</a> URL (Seite, Download-Link oder r2modman) ein und klicken Sie auf \u201EInstallieren\u201C oder laden Sie eine <code>.zip</code>/<code>.dll</code> hoch.'
            },
            {
              q: "Brauchen Spieler den Mod auch?",
              a: "Es kommt auf den Mod an. Serverseitige Mods (z. B. ServerSideMap) laufen nur auf dem Server; Die meisten Gameplay-/UI-Mods m\xFCssen auf dem Client jedes Spielers in derselben Version installiert werden."
            },
            {
              q: "Was ist BepInEx?",
              a: "Es ist der von Valheim verwendete Mod-Loader. Jeder Mod generiert normalerweise eine <code>.cfg</code>-Datei in <code>config/bepinex</code>, die auf der Registerkarte \u201EMods & Konfiguration\u201C bearbeitet werden kann."
            },
            {
              q: "Vanille oder modifiziert?",
              a: "W\xE4hlen Sie beim <b>ersten Start</b> oder auf <b>Server</b> \u2192 <b>Spielaktualisierungen</b> <b>Vanilla</b> (deaktiviert BepInEx und alle Mods) oder <b>Modded</b> (aktiviert BepInEx und integriertes ValheimRcon). Verwenden Sie im Vanilla-Modus <b>Administratoren</b> in den Spielerlisten, um im Spiel als Administrator zu fungieren."
            },
            {
              q: "Wie funktionieren Spielupdates?",
              a: "Der Container verwendet <code>valheim-updater</code> (SteamCMD). Auf der Registerkarte <b>Server</b> k\xF6nnen Sie die automatische Aktualisierung aktivieren, deaktivieren oder auf <b>Jetzt nach Updates suchen</b> klicken. Wenn Mods installiert sind, aktualisieren Sie sie lieber manuell, nachdem Sie die Kompatibilit\xE4t \xFCberpr\xFCft haben."
            },
            {
              q: "K\xF6nnen Updates Mods kaputt machen?",
              a: "Ja. Ein Valheim-Patch erfordert m\xF6glicherweise neue Mod-Versionen. Sichern Sie das Spiel, aktualisieren Sie es und verwenden Sie dann <b>Nach Updates suchen</b> f\xFCr jeden mit Thunderstore verkn\xFCpften Mod."
            },
            {
              q: "Wie aktualisiere ich einen Mod?",
              a: "\xDCber Thunderstore installierte Mods zeigen den Versionsstatus an. Verwenden Sie <b>Nach Updates suchen</b> und, wenn eine neue Version verf\xFCgbar ist, <b>Mod aktualisieren</b>. Hochgeladene Mods m\xFCssen f\xFCr automatische \xDCberpr\xFCfungen <b>mit einer Thunderstore-URL verkn\xFCpft</b> sein."
            },
            {
              q: "Ich habe einen Mod aktiviert/deaktiviert und nichts hat sich ge\xE4ndert.",
              a: "Mod-\xC4nderungen erfordern einen <b>Server-Neustart</b>. Verwenden Sie die Schaltfl\xE4che \u201ENeu starten\u201C in der \xDCbersicht."
            }
          ]
        },
        backups: {
          label: "Backups",
          items: [
            {
              q: "Erfolgen Backups automatisch?",
              a: "Ja. Auf der Registerkarte <b>Backups</b> legen Sie unter <b>Automatischer Zeitplan</b> das Intervall fest. Der Container kopiert <code>worlds_local/</code> nach <code>config/backups/</code> als <code>worlds-*.zip</code> Dateien. Aufbewahrung: 30 Tage."
            },
            {
              q: "Wie kann ich jetzt ein Backup erstellen?",
              a: "Klicken Sie auf <b>Manuelle Sicherung erstellen</b> und w\xE4hlen Sie den Typ: Aktive Welt (schnell), Vollst\xE4ndig oder Nur Konfigurationen."
            },
            {
              q: "Wie kann ich ein Backup wiederherstellen?",
              a: "Klicken Sie in der Backup-Liste an der gew\xFCnschten Stelle auf <b>Hier wiederherstellen</b>. Das Panel erstellt einen Pr\xFCfpunkt, stellt Dateien wieder her und startet den Server neu. Verwenden Sie <b>Auf den neuesten Stand zur\xFCcksetzen</b> oder <b>Letzte Wiederherstellung r\xFCckg\xE4ngig machen</b>, um zur\xFCckzugehen."
            },
            {
              q: "Was ist jetzt f\xFCr den Lauf geplant?",
              a: "L\xF6st manuell denselben Sicherungsauftrag aus, der im konfigurierten Intervall ausgef\xFChrt wird \u2013 anders als <b>Manuelle Sicherung erstellen</b>, bei der Sie den Umfang ausw\xE4hlen k\xF6nnen (weltweit, vollst\xE4ndig oder Konfigurationen)."
            },
            {
              q: "Kann ich den Verbrauch von Festplattensicherungen begrenzen?",
              a: "Ja. Verwenden Sie auf der Registerkarte <b>Server</b> unter <b>Backup-Festplattennutzung</b> das Dropdown-Men\xFC <b>Gesamtsicherungslimit</b>. Lassen Sie es auf <b>Unbegrenzt</b> ohne Obergrenze oder w\xE4hlen Sie eine Gr\xF6\xDFe (1 GB, 2 GB, 10 GB usw.) und klicken Sie auf <b>Sicherungslimit speichern</b>. \xC4lteste Backups werden automatisch entfernt, wenn die Obergrenze \xFCberschritten wird."
            },
            {
              q: "Was bewirkt die Funktion \u201EAlle Backups jetzt l\xF6schen\u201C?",
              a: "Auf der Registerkarte <b>Server</b> werden dadurch alle Sicherungs-ZIP-Dateien in <code>config/backups/</code> unwiderruflich gel\xF6scht, mit Ausnahme von Sicherungen, die an einen aktiven Wiederherstellungs- oder R\xFCckg\xE4ngig-Pr\xFCfpunkt gebunden sind."
            }
          ]
        },
        files: {
          label: "Dateien",
          items: [
            {
              q: "Wie finde ich schnell eine bestimmte Datei?",
              a: "Verwenden Sie auf der Registerkarte <b>Dateien</b> das Suchfeld, um nach Dateinamen zu filtern. Passende Dateien werden f\xFCr einen schnellen Zugriff in einer flachen Liste angezeigt."
            },
            {
              q: "Was sind die Dateitypfilter?",
              a: "Klicken Sie auf Chips wie <b>Config</b>, <b>DLLs</b>, <b>Plugins</b> oder <b>Worlds</b>, um den Baum auf g\xE4ngige Dateitypen einzugrenzen \u2013 n\xFCtzlich, wenn Sie nur ein paar Konfigurationen oder Mod-Dateien bearbeiten m\xFCssen."
            }
          ]
        },
        recursos: {
          label: "Ressourcen & Leistung",
          items: [
            {
              q: "Wie viel RAM ben\xF6tigt der Server?",
              a: "Ein Valheim-Server ben\xF6tigt normalerweise 2\u20134 GB, wobei die Gr\xF6\xDFe mit der Anzahl der Spieler/Mods zunimmt. Passen Sie die Obergrenze auf der Registerkarte <b>Server</b> unter <b>Serverkapazit\xE4t</b> an. Echtzeit-Metriken finden Sie auf <b>\xDCbersicht</b>."
            },
            {
              q: "Wie lege ich das Spielerlimit fest?",
              a: "Auf der Registerkarte <b>Server</b> unter <b>Serverkapazit\xE4t</b>. Vanilla unterst\xFCtzt bis zu 10 Spieler; Dar\xFCber hinaus ben\xF6tigen Sie einen Mod (Valheim Plus oder MaxPlayerCount). Das Panel synchronisiert den Wert mit der .cfg-Datei des Mods, falls installiert."
            },
            {
              q: "F\xFChrt eine \xC4nderung des RAM-Limits dazu, dass Spieler getrennt werden?",
              a: "Ja \u2013 durch die Anwendung eines neuen Limits wird der Container neu erstellt und alle Personen werden online getrennt. Tun Sie dies in ruhigen Stunden."
            }
          ]
        },
        docker: {
          label: "Installation & Docker",
          items: [
            {
              q: "Wie betreibe ich das Panel + den Server?",
              a: "Kopieren Sie <code>.env.example</code> nach <code>.env</code>, passen Sie die Werte an und f\xFChren Sie <code>docker compose up -d</code> aus. Das Panel befindet sich unter <code>http://YOUR_IP:8080</code>."
            },
            {
              q: "Ich erhalte Berechtigungsfehler f\xFCr Ordner.",
              a: "Bei der Ausf\xFChrung \xFCber Docker verwenden Panel und Server denselben Benutzer (UID/GID 1000) und teilen sich Volumes, sodass keine Berechtigungsfehler auftreten sollten. Best\xE4tigen Sie, dass <code>config/</code> und <code>data/</code> zur UID 1000 geh\xF6ren."
            },
            {
              q: "Ist es sicher, docker.sock im Panel zu montieren?",
              a: "Das Panel ben\xF6tigt <code>docker.sock</code> zur Steuerung des Valheim-Containers. Dadurch erh\xE4lt Docker die Kontrolle \xFCber den Panel-Container \u2013 das Panel bleibt in einem privaten Netzwerk/hinter einem Proxy mit Authentifizierung in der Produktion."
            }
          ]
        },
        problemas: {
          label: "Fehlerbehebung",
          items: [
            {
              q: "Wo kann ich sehen, was passiert?",
              a: "\xD6ffnen Sie <b>Console</b> (Docker/BepInEx) im Abschnitt \u201ETools\u201C. Auf der Registerkarte <b>Audit</b> werden alle vom Panel durchgef\xFChrten Aktionen angezeigt. Echtzeit-CPU und RAM sind auf <b>\xDCbersicht</b>."
            },
            {
              q: "Das Panel reagiert nicht / zeigt Fehler 500 an.",
              a: "\xDCberpr\xFCfen Sie Konsole und Audit. Best\xE4tigen Sie, dass Docker ausgef\xFChrt wird und der Container <code>valheim-server</code> vorhanden ist."
            },
            {
              q: "Eine \xC4nderung wurde nicht angewendet.",
              a: "Viele \xC4nderungen (Mods, Listen, laufende Weltkonfiguration) werden erst nach einem Neustart des Servers wirksam."
            }
          ]
        }
      },
      referenceLinks: [
        {
          label: "Offizielles Valheim-Wiki",
          url: "https://valheim.fandom.com/wiki/Valheim_Wiki"
        },
        {
          label: "Thunderstore (Valheim-Mods)",
          url: "https://thunderstore.io/c/valheim/"
        },
        {
          label: "BepInEx (Mod-Loader)",
          url: "https://docs.bepinex.dev/"
        },
        {
          label: "lloesche/valheim-server Docker-Image",
          url: "https://github.com/lloesche/valheim-server-docker"
        },
        {
          label: "Dedizierter Server (offizieller Leitfaden)",
          url: "https://valheim.fandom.com/wiki/Hosting_a_Dedicated_Server"
        }
      ],
      title: "H\xE4ufig gestellte Fragen",
      searchPlaceholder: "FAQ durchsuchen...",
      usefulLinks: "N\xFCtzliche Links"
    },
    worlds: {
      presets: {
        preset: {
          _default: {
            label: "Spielstandard",
            desc: "Keine Modifikatoren \u2013 Vanilla-Erlebnis wie vor dem Hildir's Request-Patch."
          },
          easy: {
            label: "Einfach",
            desc: "Leichtere K\xE4mpfe (leichter Schaden) und seltenere \xDCberf\xE4lle."
          },
          normal: {
            label: "Normal",
            desc: "Entspricht der Standardeinstellung des Spiels \u2013 alle Schieberegler auf \u201ENormal\u201C."
          },
          hard: {
            label: "Hart",
            desc: "Harte K\xE4mpfe und h\xE4ufigere \xDCberf\xE4lle."
          },
          hardcore: {
            label: "Hardcore",
            desc: "Sehr harter Kampf, maximale Todesstrafe, h\xE4ufige \xDCberf\xE4lle, schwierige Portale und keine Karte."
          },
          casual: {
            label: "L\xE4ssig",
            desc: "Sehr einfacher Kampf, leichte Todesstrafe, mehr Ressourcen, keine Raids, Gelegenheitsportale, Events pro Spieler und passive Mobs."
          },
          hammer: {
            label: "Hammermodus",
            desc: "Bauen ohne Materialkosten, deaktivierte Raids und passive Mobs."
          },
          immersive: {
            label: "Immersiv",
            desc: "Portale verboten, Feuer breitet sich \xFCber die ganze Welt aus und keine Karte/Minikarte."
          }
        },
        combat: {
          _default: {
            label: "Voreinstellung verwenden",
            desc: "Kampfschwierigkeit von der ausgew\xE4hlten Voreinstellung \xFCbernehmen."
          },
          veryeasy: {
            label: "Sehr einfach",
            desc: "125 % Spielerschaden, 50 % Feindschaden, Feinde 90 % Geschwindigkeit/Gr\xF6\xDFe."
          },
          easy: {
            label: "Einfach",
            desc: "110 % Spielerschaden, 75 % Feindschaden, Feinde 95 % Geschwindigkeit/Gr\xF6\xDFe."
          },
          normal: {
            label: "Normal",
            desc: "100 % bei allen Kampfparametern. H\xF6here Chance auf hochstufige Gegner auf Schwer/Sehr schwer."
          },
          hard: {
            label: "Hart",
            desc: "85 % Spielerschaden, 150 % Feindschaden, Feinde 110 % Geschwindigkeit/Gr\xF6\xDFe, 120 % Levelaufstiegsrate."
          },
          veryhard: {
            label: "Sehr schwer",
            desc: "70 % Spielerschaden, 200 % Feindschaden, Feinde 120 % Geschwindigkeit/Gr\xF6\xDFe, 140 % Levelaufstiegsrate."
          }
        },
        deathpenalty: {
          _default: {
            label: "Voreinstellung verwenden",
            desc: "Todesstrafe von der ausgew\xE4hlten Voreinstellung \xFCbernehmen."
          },
          casual: {
            label: "L\xE4ssig",
            desc: "Ausr\xFCstung auf Tod gehalten. Der Lagerbestand ist gesunken. F\xE4higkeitsverlust: 1 %."
          },
          veryeasy: {
            label: "Sehr einfach",
            desc: "Lass alles auf den Tod fallen. F\xE4higkeitsverlust: 1 % (weniger als normal)."
          },
          easy: {
            label: "Einfach",
            desc: "Lass alles auf den Tod fallen. F\xE4higkeitsverlust: 2,5 %."
          },
          normal: {
            label: "Normal",
            desc: "Lass alles auf den Tod fallen. F\xE4higkeitsverlust: 5 %."
          },
          hard: {
            label: "Hart",
            desc: "Ausr\xFCstung wurde fallen gelassen, Inventar dauerhaft zerst\xF6rt. F\xE4higkeitsverlust: 7,5 %."
          },
          hardcore: {
            label: "Hardcore",
            desc: "Alle Gegenst\xE4nde und Fertigkeiten gehen mit dem Tod dauerhaft verloren."
          }
        },
        resources: {
          _default: {
            label: "Voreinstellung verwenden",
            desc: "Ressourcenrate von der ausgew\xE4hlten Voreinstellung \xFCbernehmen."
          },
          muchless: {
            label: "Viel weniger",
            desc: "50 % der normalen Mob- und Objekt-Drop-Rate (\u22480,5\xD7)."
          },
          less: {
            label: "Weniger",
            desc: "75 % der normalen Rate (\u22480,75\xD7)."
          },
          normal: {
            label: "Normal",
            desc: "Standardm\xE4\xDFige Spielressourcenrate."
          },
          more: {
            label: "Mehr",
            desc: "150 % der Normalrate (\u22481,5\xD7)."
          },
          muchmore: {
            label: "Viel mehr",
            desc: "200 % der Normalrate (\u22482\xD7)."
          },
          most: {
            label: "Maximal",
            desc: "300 % der Normalrate (\u22483\xD7)."
          }
        },
        raids: {
          _default: {
            label: "Voreinstellung verwenden",
            desc: "Raid-H\xE4ufigkeit von der ausgew\xE4hlten Voreinstellung \xFCbernehmen."
          },
          none: {
            label: "Keiner",
            desc: "EventRate 0 \u2013 Tages\xFCberf\xE4lle deaktiviert. Es kann weiterhin zu n\xE4chtlichen Razzien kommen."
          },
          muchless: {
            label: "Viel weniger",
            desc: "Intervall ~92 Minuten, 10 % Chance \u2013 deutlich weniger \xDCberf\xE4lle."
          },
          less: {
            label: "Weniger",
            desc: "Intervall ~69 Minuten, ~13 % Chance."
          },
          normal: {
            label: "Normal",
            desc: "Intervall ~46 Minuten, 20 % Chance."
          },
          more: {
            label: "Mehr",
            desc: "Intervall ~28 Minuten, ~33 % Chance."
          },
          muchmore: {
            label: "Viel mehr",
            desc: "Intervall ~14 Minuten, ~67 % Chance."
          }
        },
        portals: {
          _default: {
            label: "Voreinstellung verwenden",
            desc: "Portalregeln von der ausgew\xE4hlten Voreinstellung \xFCbernehmen."
          },
          casual: {
            label: "L\xE4ssig",
            desc: "TeleportAll \u2013 fast alles kann durch Portale gehen (au\xDFer gez\xE4hmte Tiere)."
          },
          normal: {
            label: "Normal",
            desc: "Nicht tragbare Gegenst\xE4nde unterliegen den Standardspielregeln."
          },
          hard: {
            label: "Keine Bossportale",
            desc: "Portale sind nicht verf\xFCgbar, solange ein Boss in der Gegend aktiv ist."
          },
          veryhard: {
            label: "Keine Portale",
            desc: "Keine Portale auf der Welt erlaubt."
          }
        }
      },
      flags: {
        nobuildcost: {
          label: "Keine Baukosten",
          desc: "Bauteile verbrauchen keine Materialien. Rezepte m\xFCssen noch entdeckt werden."
        },
        playerevents: {
          label: "Raids pro Spieler",
          desc: "Raids basieren auf dem individuellen Fortschritt jedes Spielers, nicht auf den auf dem Server get\xF6teten Bossen."
        },
        fire: {
          label: "Brandgefahr",
          desc: "Holz kann Feuer fangen und das Feuer breitet sich auf der ganzen Welt aus, nicht nur in Ashlands."
        },
        passivemobs: {
          label: "Passive Feinde",
          desc: "Feinde greifen erst dann an, wenn sie provoziert werden."
        },
        nomap: {
          label: "Keine Karte",
          desc: "Karte und Minikarte deaktiviert \u2013 navigieren Sie nur anhand von Orientierungspunkten."
        }
      },
      fields: {
        preset: "Voreingestellt",
        combat: "Kampf",
        deathpenalty: "Todesstrafe",
        death: "Tod",
        resources: "Ressourcen",
        raids: "\xDCberf\xE4lle",
        portals: "Portale"
      },
      badges: {
        awaitingCreation: "Warten auf die Sch\xF6pfung",
        running: "L\xE4uft",
        active: "Aktiv",
        pending: "Ausstehend",
        configBadge: "{preset} \xB7 Portale: {portals}"
      },
      fallback: {
        gameDefault: "Spielstandard",
        preset: "Voreingestellt"
      },
      ui: {
        createTitle: "Erschaffe eine neue Welt",
        worldNamePlaceholder: "Weltname",
        create: "Erstellen",
        createAndActivate: "Erstellen und aktivieren",
        db: "DB: {value}",
        notCreated: "nicht erstellt",
        configBtn: "Konfig",
        activate: "Aktivieren",
        settingsTitle: "Welteinstellungen",
        settingsDesc: 'In der Datei <span class="font-mono">.fwl</span> gespeicherte Modifikatoren \u2013 entspricht Valheims Welterstellungsbildschirm.',
        refresh: "\u21BB Aktualisieren",
        seed: "Samen",
        uid: "UID",
        fwlFile: ".fwl-Datei",
        saveDb: ".db speichern",
        presetTitle: "Weltvoreinstellung",
        detectedFromFwl: "Aus .fwl erkannt",
        custom: "Brauch",
        effectiveTitle: "Effektive Werte",
        effectiveDesc: "Was wird nach dem Speichern auf die Welt angewendet (Voreinstellung + \xDCberschreibungen).",
        modifiersTitle: "Individuelle Modifikatoren",
        modifiersDesc: "Lassen Sie \u201EVoreinstellung verwenden\u201C, um von der obigen Voreinstellung zu \xFCbernehmen, oder w\xE4hlen Sie einen bestimmten Wert.",
        seedNewWorld: "\u{1F331} Samen (neue Welt)",
        seedPlaceholder: "Optional \u2013 1\u201310 Zeichen",
        seedHint: "Wird nur verwendet, wenn die .fwl-Datei zum ersten Mal erstellt wird.",
        advancedTitle: "Erweiterte Optionen",
        technicalTitle: "Technische Details \u2013 Zeichenfolgen in .fwl gespeichert",
        noModifiers: "Keine Modifikatoren (Vanille / Normale Welt).",
        saveSettings: "Einstellungen speichern",
        saveAndRestart: "Speichern und neu starten",
        backupHint: 'Automatische Sicherung der vorherigen .fwl in <span class="font-mono">panel-data/world_fwl_backups/</span> vor jedem Speichern.',
        restartWarning: "Die Welt l\xE4uft \u2013 starten Sie den Server nach dem Speichern neu, um die .fwl-\xC4nderungen zu \xFCbernehmen."
      }
    },
    console: {
      categories: {
        Server: "Server",
        Moderation: "M\xE4\xDFigung",
        Players: "Spieler",
        Chat: "Chatten",
        Objects: "Objekte",
        World: "Welt"
      },
      commands: {
        save: {
          usage: "speichern",
          desc: "Speichert die aktuelle Welt"
        },
        list: {
          usage: "Liste",
          desc: "Listet alle Befehle auf dem Server auf"
        },
        players: {
          usage: "Spieler",
          desc: "Zeigt Online-Spieler mit Position"
        },
        serverStats: {
          usage: "serverStats",
          desc: "Serverstatistiken (FPS, RAM, Spieler)"
        },
        time: {
          usage: "Zeit",
          desc: "Zeigt Serverzeit und -tag an"
        },
        logs: {
          usage: "Protokolle",
          desc: "Neueste Serverprotokollzeilen"
        },
        consoleCommand: {
          usage: "consoleCommand <command>",
          desc: "F\xFChrt einen Valheim-Konsolenbefehl aus"
        },
        kick: {
          usage: "treten <player|SteamID>",
          desc: "Tritt einen Spieler"
        },
        ban: {
          usage: "verbieten <player|SteamID>",
          desc: "Sperren nach Name oder Steam-ID"
        },
        banSteamId: {
          usage: "banSteamId <SteamID>",
          desc: "Sperren nach Steam-ID"
        },
        unban: {
          usage: "<player|SteamID> entsperren",
          desc: "Entfernt ein Verbot"
        },
        addAdmin: {
          usage: "addAdmin <SteamID>",
          desc: "F\xFCgt einen Administrator hinzu"
        },
        removeAdmin: {
          usage: "RemoveAdmin <SteamID>",
          desc: "Entfernt einen Administrator"
        },
        addPermitted: {
          usage: "addPermitted <SteamID>",
          desc: "F\xFCgt der zul\xE4ssigen Liste hinzu"
        },
        removePermitted: {
          usage: "RemovePermitted <SteamID>",
          desc: "Wird aus der zul\xE4ssigen Liste entfernt"
        },
        adminlist: {
          usage: "Adminliste",
          desc: "Listet Administratoren auf"
        },
        banlist: {
          usage: "Bannliste",
          desc: "Listet gesperrte Spieler auf"
        },
        permitted: {
          usage: "gestattet",
          desc: "Listet zugelassene Spieler auf"
        },
        disconnectAll: {
          usage: "trennenAlle",
          desc: "Trennt alle Spieler"
        },
        give: {
          usage: "gib <player|SteamID> <item> [Optionen]",
          desc: "Gibt einem Spieler einen Gegenstand"
        },
        heal: {
          usage: "heilen <player|SteamID> <health>",
          desc: "Heilt den Spieler auf seinen Gesundheitswert"
        },
        damage: {
          usage: "Schaden <player|SteamID> <damage>",
          desc: "F\xFCgt einem Spieler Schaden zu"
        },
        teleport: {
          usage: "teleportieren <player|SteamID> <x> <y> <z>",
          desc: "Teleportiert einen Spieler"
        },
        findPlayer: {
          usage: "findPlayer <name>",
          desc: "Findet einen Spieler und zeigt Details an"
        },
        say: {
          usage: "sag <message>",
          desc: "Sendet eine Chat-Nachricht (Shout)"
        },
        showMessage: {
          usage: "showMessage <message>",
          desc: "Nachricht auf dem mittleren Bildschirm f\xFCr alle"
        },
        ping: {
          usage: "ping <x> <y> <z>",
          desc: "Kartenping f\xFCr alle"
        },
        spawn: {
          usage: "spawn <prefab> <x> <y> <z> [Optionen]",
          desc: "Erzeugt Objekte/Kreaturen"
        },
        findObjects: {
          usage: "findObjects [Optionen]",
          desc: "Sucht nach Objekten in der Welt"
        },
        addGlobalKey: {
          usage: "addGlobalKey <key>",
          desc: "F\xFCgt einen globalen Schl\xFCssel hinzu (z. B. Boss besiegt)"
        },
        removeGlobalKey: {
          usage: "entferneGlobalKey <key>",
          desc: "Entfernt einen globalen Schl\xFCssel"
        },
        globalKeys: {
          usage: "globalKeys",
          desc: "Listet aktive globale Schl\xFCssel auf"
        }
      },
      hints: {
        bepinexRequired: "Die RCON-Konsole funktioniert nur, wenn BepInEx aktiv ist \u2013 w\xE4hlen Sie \u201EModifiziert\u201C auf der Registerkarte \u201EServer\u201C.",
        modRequired: "Aktivieren Sie den ValheimRcon-Mod unter Mods & Config, um Konsole und Moderation zu verwenden.",
        configPending: "Warten auf RCON-Konfiguration \u2013 starten Sie das Panel oder den Valheim-Server neu.",
        serverStopped: "Starten Sie den Server, um die interaktive Konsole zu verwenden.",
        unavailable: "RCON ist derzeit nicht verf\xFCgbar."
      },
      placeholder: "RCON-Befehl (z. B. Speichern, Auflisten, Kick-Name...)",
      viewCommands: "Verf\xFCgbare Befehle anzeigen",
      inputHints: "Die Registerkarte wird automatisch vervollst\xE4ndigt. \xB7 Versendungen eingeben. Die Ausgabe wird in den Protokollen oben angezeigt",
      moderationActions: "Moderationsaktionen",
      helpModal: {
        title: "RCON-Befehle",
        intro: 'Klicken Sie auf einen Befehl, um die Konsole zu f\xFCllen. Verwenden Sie <code class="text-valheim-gold-light">list</code> auf dem Server, um alle installierten Befehle anzuzeigen.',
        searchPlaceholder: "Suchbefehl...",
        noCommands: "Keine Befehle gefunden.",
        docPrefix: "Vollst\xE4ndige Dokumentation:",
        docLink: "ValheimRcon kein GitHub"
      },
      chart: {
        download: "Herunterladen",
        upload: "Hochladen",
        networkTraffic: "Netzwerkverkehr (Diagramm)"
      }
    },
    setup: {
      title: "Server einrichten",
      subtitle: "W\xE4hlen Sie aus, wie der Valheim-Server ausgef\xFChrt werden soll.",
      serverMode: "Servermodus",
      modes: {
        vanilla: "Vanille",
        bepinex: "Mit Mods (BepInEx)"
      },
      vanillaHint: "Kein BepInEx und keine Mods. F\xFCgen Sie unten Ihre Steam-ID als Administrator hinzu.",
      bepinexHint: "Aktiviert BepInEx, den geb\xFCndelten ValheimRcon-Mod, und generiert das RCON-Passwort automatisch.",
      adminSteamId: "Ihre Steam-ID (Administrator)",
      adminSteamIdPlaceholder: "76561198000000000",
      adminSteamIdHint: "Vorerst optional \u2013 Sie k\xF6nnen es sp\xE4ter unter Server \u2192 Spielerlisten bearbeiten.",
      firstWorld: "Erste Welt (optional)",
      firstWorldPlaceholder: "MeineWelt",
      createAndActivate: "Erschaffe und aktiviere diese Welt",
      rconPassword: {
        title: "Generiertes RCON-Passwort",
        body: "Das Panel hat ValheimRcon konfiguriert. Kopieren Sie das Passwort \u2013 es wird nicht mehr angezeigt.",
        changeHint: 'Zum sp\xE4teren \xC4ndern: Bearbeiten Sie <code class="text-gray-400">config/bepinex/org.tristan.rcon.cfg</code> oder legen Sie <code class="text-gray-400">PANEL_RCON_PASSWORD</code> in .env fest.'
      }
    },
    dashboard: {
      stats: {
        server: "Server",
        activeWorld: "Aktive Welt",
        playersOnline: "Spieler online",
        mods: "Mods",
        port: "Hafen"
      },
      configCorrected: "Konfiguration korrigiert: {from} \u2192 {to}",
      performance: "Leistung",
      metrics: {
        cpu: "CPU",
        ram: "RAM",
        disk: "Scheibe (Valheim)",
        network: "Netzwerk"
      },
      diskBreakdown: {
        game: "Spiel",
        mods: "Mods",
        worlds: "Welten",
        backups: "Backups"
      },
      connect: {
        title: "So verbinden Sie sich",
        intro: 'Verwenden Sie in Valheim <strong class="text-gray-200">Join IP</strong> und geben Sie Folgendes ein:',
        hint: "Das Passwort wird auf der Registerkarte \u201EServer\u201C festgelegt. \xD6ffnen Sie UDP <strong>2456\u20132458</strong> auf Ihrem Router f\xFCr den externen Zugriff."
      },
      players: {
        title: "Verbundene Spieler",
        empty: "Im Moment sind keine Spieler verbunden.",
        admin: "Admin",
        banned: "Verboten",
        actions: "Aktionen \u25BE",
        promote: "Machen Sie Administrator",
        demote: "Administrator entfernen",
        kick: "Kick",
        ban: "Ban",
        unban: "Verbot aufheben"
      },
      quickControls: {
        title: "Schnellsteuerung",
        start: "Start",
        stop: "Stoppen",
        restart: "Neustart",
        pause: "Pause",
        resume: "Wieder aufnehmen",
        backup: "\u{1F4BE} Sicherung"
      },
      console: {
        title: "Serverkonsole (live)"
      },
      supervisor: {
        title: "Aufsicht"
      }
    },
    server: {
      settings: {
        title: "Servereinstellungen (.env)",
        activeWorld: "Aktive Welt",
        password: "Passwort",
        showPassword: "Passwort anzeigen",
        hidePassword: "Passwort verbergen",
        save: "Einstellungen speichern",
        saveAndRestart: "Speichern und neu starten"
      },
      envFields: {
        SERVER_NAME: {
          label: "Servername",
          hint: "Wird in der Serverliste im Spiel angezeigt."
        },
        SERVER_PUBLIC: {
          label: "\xD6ffentlich (wahr/falsch)",
          hint: "true = \xF6ffentlich gelistet; false = nur direkte Verbindung."
        },
        SERVER_ARGS: {
          label: "Zus\xE4tzliche Argumente",
          hint: "Z.B. -crossplay, um Crossplay zu aktivieren."
        }
      },
      capacity: {
        title: "Serverkapazit\xE4t",
        subtitle: "Container-RAM-Limit und maximale Spieleranzahl.",
        wikiGuide: "Wiki-Anleitung",
        ramLimit: "RAM-Grenze",
        current: "Aktuell: {value}",
        applyRamLimit: "Wenden Sie das RAM-Limit an",
        ramWarning: "Durch die Anwendung wird der Container neu erstellt \u2013 verbundene Spieler werden getrennt.",
        playerLimit: "Spielerlimit",
        modSource: "Mod: {name}",
        vanillaMax: "Vanille (max. 10)",
        playersAbove10: "F\xFCr mehr als 10 Spieler ist Valheim Plus oder MaxPlayerCount auf der Registerkarte \u201EMods\u201C erforderlich.",
        savePlayerLimit: "Spielerlimit speichern",
        table: {
          players: "Spieler",
          suggestedRam: "Empfohlener RAM",
          notes: "Notizen"
        }
      },
      playerLists: {
        title: "Spielerlisten",
        vanillaHint: "F\xFCgen Sie im <b>Vanilla</b>-Modus Ihre Steam-ID unter <b>Administratoren</b> hinzu, um Administratorberechtigungen im Spiel zu erhalten (ohne die Panel-RCON-Konsole).",
        admin: "Administratoren (Steam-IDs)",
        banned: "Gesperrt (Steam-IDs)",
        permitted: "Zul\xE4ssig / Whitelist (Steam-IDs)",
        saveLists: "Listen speichern"
      }
    },
    storage: {
      title: "Nutzung der Sicherungsfestplatte",
      intro: 'Optionale Obergrenze f\xFCr <code class="text-gray-400">config/backups/</code> ZIP-Dateien. W\xE4hlen Sie <span class="text-valheim-gold font-medium">Unbegrenzt</span>, um alle Backups aufzubewahren, oder w\xE4hlen Sie eine Gr\xF6\xDFe aus \u2013 die \xE4ltesten Backups werden zuerst gel\xF6scht, wenn das Limit \xFCberschritten wird.',
      totalLimit: "Gesamt-Backup-Limit",
      unlimitedKeep: "Backups werden aufbewahrt, bis der Speicherplatz aufgebraucht ist.",
      oldestDeleted: "Die \xE4ltesten Backups werden zuerst gel\xF6scht, wenn die Nutzung das oben genannte Limit \xFCberschreitet.",
      currentUsage: "Aktuelle Nutzung",
      saveLimit: "Backup-Limit speichern",
      clearAll: "L\xF6schen Sie jetzt alle Backups",
      clearAllHint: "Unumkehrbar \u2013 l\xF6scht alle Sicherungs-ZIP-Dateien mit Ausnahme derjenigen, die an einen aktiven Wiederherstellungs- oder R\xFCckg\xE4ngig-Pr\xFCfpunkt gebunden sind.",
      purgeModal: {
        title: "L\xF6schen Sie alle Backups",
        body: 'Diese Aktion ist <strong>irreversibel</strong>. Jede Sicherungs-ZIP-Datei in <code class="text-gray-400">config/backups/</code> wird gel\xF6scht.',
        preserved: "Sicherungen, die mit einem aktiven Wiederherstellungs- oder R\xFCckg\xE4ngig-Checkpoint verkn\xFCpft sind, bleiben erhalten.",
        deleteAll: "Alles l\xF6schen"
      },
      usageNoLimit: "{used} verwendet (keine Begrenzung)",
      usageOfLimit: "{used} von {limit} GB"
    },
    updates: {
      title: "Spielaktualisierungen",
      subtitle: "Steuern Sie Valheim-Updates \xFCber den Valheim-Updater (SteamCMD).",
      modsWarning: "Valheim-Updates k\xF6nnen Mods besch\xE4digen. Sichern Sie zuerst. \xDCberpr\xFCfen Sie die Kompatibilit\xE4t jedes Mods, nachdem Sie das Spiel aktualisiert haben.",
      serverMode: "Servermodus",
      modeHint: "Vanilla deaktiviert BepInEx und schaltet alle Mods aus. Mit Mods werden BepInEx und das geb\xFCndelte ValheimRcon aktiviert.",
      installedVersion: "Installierte Version",
      build: "Bauen",
      updater: "Updater",
      autoUpdate: "Spiel mit automatischer Aktualisierung",
      onlyWhenEmpty: "Nur wenn der Server leer ist",
      checkInterval: "Intervall pr\xFCfen",
      customCron: "Benutzerdefinierter Cron",
      save: "Speichern",
      saveRecreate: "Container speichern und neu erstellen",
      checkNow: "Suchen Sie jetzt nach Updates",
      presets: {
        "15min": "Alle 15 Minuten",
        "1h": "St\xFCndlich",
        "6h": "Alle 6 Stunden",
        daily: "T\xE4glich (06:00)",
        custom: "Brauch"
      }
    },
    mods: {
      install: {
        title: "Mod installieren",
        upload: "\u{1F4C1} Hochladen (.zip / .dll)",
        urlPlaceholder: "Thunderstore-URL (Seite, Download oder r2modman)",
        installUrl: "Von URL installieren"
      },
      valheimRcon: '<strong class="text-valheim-gold">ValheimRcon</strong> ist mit dem Panel geb\xFCndelt (RCON-Konsole, Kick, Ban und Admin). Es kann nicht entfernt, aber deaktiviert werden. Die Konsolen- und Spieleraktionen erfordern aktives BepInEx und diesen aktivierten Mod.',
      bundled: "Geb\xFCndelt",
      bundledCannotRemove: "Im Lieferumfang enthalten \u2013 kann nicht entfernt werden",
      active: "Aktiv",
      disabled: "Deaktiviert",
      activeConsole: "Aktiv \u2013 Konsole und Moderation verf\xFCgbar",
      disabledConsole: "Deaktiviert: Aktivieren Sie diese Option, um Konsole und Moderation zu verwenden",
      configPrefix: "Konfiguration: {name}",
      noConfig: "Keine Konfiguration",
      version: "Version",
      checkUpdates: "Suchen Sie nach Updates",
      updateMod: "Mod aktualisieren",
      linkThunderstore: "Link Thunderstore",
      linkUrlPlaceholder: "Thunderstore-URL",
      configBtn: "Konfig",
      remove: "Entfernen",
      empty: "Keine Mods installiert",
      orphaned: {
        title: "Verwaiste Konfigurationen",
        desc: "{count} Konfigurationsdateien von entfernten Mods befinden sich noch auf der Festplatte.",
        remove: "Entfernen Sie verwaiste Konfigurationen"
      },
      export: {
        title: "R2modman-Profil exportieren",
        desc: "Exportiert Mods, die mit Thunderstore- und BepInEx-Konfigurationen verkn\xFCpft sind, f\xFCr den Import in r2modman. Nicht verkn\xFCpfte Mods werden \xFCbersprungen.",
        skipped: "{count} Mod(s) ohne Thunderstore-Link werden \xFCbersprungen",
        downloadR2z: "Laden Sie .r2z herunter"
      },
      bepinexConfigs: {
        title: "BepInEx-Konfigurationen",
        desc: 'Konfigurationsdateien, die von Mods in <code class="font-mono">config/bepinex/</code> generiert wurden.',
        empty: "Keine Konfigurationsdateien gefunden",
        edit: "Bearbeiten"
      },
      status: {
        up_to_date: "Auf dem neuesten Stand",
        update_available: "Update verf\xFCgbar",
        unknown: "Unbekannte Quelle",
        error: "Pr\xFCfung fehlgeschlagen"
      }
    },
    backups: {
      state: {
        title: "Serverstatus",
        restoredFrom: "Wiederhergestellt von: {name}",
        live: "Server im Status <strong>live</strong> \u2013 keine Panel-Wiederherstellung aufgezeichnet.",
        lastRestore: "Letzte Wiederherstellung: {date}",
        restoreLatest: "Neueste wiederherstellen",
        undoRestore: "Letzte Wiederherstellung r\xFCckg\xE4ngig machen",
        hint: "Durch die Wiederherstellung wird der Server immer neu gestartet. Vor jeder Wiederherstellung wird ein automatischer Pr\xFCfpunkt erstellt."
      },
      schedule: {
        title: "Automatische Terminplanung",
        info: 'Der Valheim-Container kopiert regelm\xE4\xDFig den Ordner <code class="text-gray-400">worlds_local/</code> nach <code class="text-gray-400">config/backups/</code>. Dateien werden als <code class="text-gray-400">Welten-JJJJMMTT-HHMMSS.zip</code> angezeigt. Aufbewahrung: 30 Tage.',
        automatic: "Automatische Backups",
        enabled: "Erm\xF6glicht",
        disabled: "Deaktiviert",
        interval: "Intervall",
        customCron: "Benutzerdefinierter Cron",
        retention: "Zur\xFCckbehaltung",
        retentionValue: "30 Tage",
        idleLabel: "Backup, wenn keine Spieler online sind",
        idleYes: "Ja \u2013 Backup auch im leeren Zustand",
        idleNo: "Nur wenn Spieler online sind",
        current: "Aktuell: {value}",
        applyRestart: "Anwenden und neu starten",
        manual: "Erstellen Sie ein manuelles Backup",
        runScheduled: "Geplanten Job jetzt ausf\xFChren",
        runScheduledTitle: "F\xFChrt jetzt denselben Job aus, der im geplanten Intervall ausgef\xFChrt wird"
      },
      intervalPresets: {
        hourly: "St\xFCndlich",
        "6h": "Alle 6 Stunden",
        "12h": "Alle 12 Stunden",
        daily: "T\xE4glich (00:00)",
        custom: "Brauch"
      },
      idleLabels: {
        online: "Nur wenn Spieler online sind",
        empty: "Ja \u2013 auch ohne Spieler"
      },
      list: {
        title: "Gespeicherte Backups",
        hideCheckpoints: "Kontrollpunkte ausblenden",
        empty: "Keine Backups in config/backups/ gefunden",
        columns: {
          type: "Typ",
          name: "Name",
          date: "Datum",
          age: "Alter",
          size: "Gr\xF6\xDFe",
          mods: "Mods",
          actions: "Aktionen"
        },
        badges: {
          active: "Aktiv",
          latest: "Letzte",
          checkpoint: "Kontrollpunkt"
        },
        activeMods: "{count} aktiv",
        restoreToHere: "Hierher wiederherstellen",
        details: "Einzelheiten"
      },
      types: {
        world: {
          label: "Aktive Welt (schnell)",
          desc: "Nur die Welt im Einsatz (.fwl + .db)."
        },
        full: {
          label: "Voll",
          desc: "Welten + BepInEx-Konfigurationen + Mods + Listen + .env."
        },
        configs: {
          label: "Nur Konfigurationen",
          desc: "BepInEx-Konfigurationen + Spielerlisten + .env."
        }
      },
      modals: {
        create: {
          title: "Backup erstellen",
          desc: "W\xE4hlen Sie die Art der manuellen Sicherung aus, die Sie jetzt erstellen m\xF6chten.",
          creating: "Backup wird erstellt..."
        },
        restore: {
          title: "Sicherung wiederherstellen",
          intro: "Stellen Sie den Server auf den Zustand dieser Sicherung wieder her:",
          name: "Name:",
          type: "Typ:",
          date: "Datum:",
          bullets: [
            "Der Server wird automatisch gestoppt und neu gestartet",
            "World/config-Dateien werden \xFCberschrieben",
            "Zun\xE4chst wird ein Pr\xFCfpunkt des aktuellen Zustands erstellt"
          ],
          confirm: "Wiederherstellen und neu starten"
        },
        delete: {
          title: "Sicherung l\xF6schen",
          confirm: "{name} dauerhaft l\xF6schen?"
        },
        details: {
          title: "Sicherungsdetails",
          loading: "Details werden geladen...",
          world: "Welt:",
          build: "Valheim-Build:",
          inferred: "Von ZIP abgeleitete Metadaten \u2013 Thunderstore-Versionen sind m\xF6glicherweise nicht verf\xFCgbar.",
          modsTitle: "Mods ({count})",
          noMods: "In diesem Backup sind keine Mods aufgezeichnet.",
          columns: {
            mod: "Mod",
            package: "Paket",
            version: "Version",
            state: "Zustand"
          },
          contents: "Inhalt",
          includesWorlds: "Welten inklusive",
          includesDlls: "Mod-DLLs enthalten",
          includesEnv: ".env-Datei enthalten",
          hasAdminlist: "Admin-Liste",
          fileCount: "{count} Datei(en) im ZIP-Format",
          worldsList: "Welten: {names}"
        }
      },
      contentsNotes: {
        noDlls: "Dieses Backup enth\xE4lt keine Mod-Dateien (.dll) \u2013 die Liste unten spiegelt den Serverstatus zum Zeitpunkt des Backups wider.",
        configsOnly: "Dieses Backup enth\xE4lt nur World/Configs \u2013 Mods waren nicht enthalten. Verwenden Sie \u201EManuelle Sicherung \u2013 Vollst\xE4ndig\u201C f\xFCr einen Snapshot mit DLLs."
      }
    },
    files: {
      searchPlaceholder: "Nach Dateinamen suchen...",
      browser: "Browser",
      noMatches: "Keine \xDCbereinstimmungen",
      selectFile: "W\xE4hlen Sie eine Datei zum Bearbeiten aus",
      searchSettings: "Sucheinstellungen...",
      form: "Form",
      raw: "Raw",
      scopes: {
        config: "Konfig",
        data: "Daten"
      },
      typeFilters: {
        all: "Alle",
        config: "Konfig",
        dll: "DLLs",
        plugin: "Plugins",
        world: "Welten",
        list: "Listen",
        backup: "Backups",
        log: "Protokolle"
      },
      tree: {
        emptyFolder: "Leerer Ordner",
        inaccessible: "unzug\xE4nglich"
      }
    },
    logs: {
      docker: "Docker",
      bepinex: "BepInEx",
      autoRefresh: "Automatisch (5 Sek.)"
    },
    audit: {
      downloadLog: "Laden Sie das vollst\xE4ndige Protokoll herunter",
      autoRefresh: "Automatisch (5 Sek.)",
      description: "Persistentes Protokoll aller Aktionen (POST/PUT/DELETE) zur Diagnose und Fehlerbehebung.",
      empty: "Keine Ereignisse aufgezeichnet",
      columns: {
        time: "Zeit",
        method: "Verfahren",
        action: "Aktion",
        status: "Status",
        duration: "Dauer.",
        error: "Fehler",
        details: "Einzelheiten"
      },
      modal: {
        title: "Pr\xFCfungsdetails",
        request: "Anfrage",
        response: "Antwort"
      }
    },
    donation: {
      title: "Unterst\xFCtzen Sie das Projekt",
      pitch: "Vikinger Panel ist f\xFCr den pers\xF6nlichen Gebrauch kostenlos. Sponsoren tragen dazu bei, das Projekt aufrechtzuerhalten und die Entwicklung voranzutreiben. Mitwirkende ab 1\xA0$/Monat erhalten direkten Support vom Betreuer. Sponsoring ersetzt keine kommerzielle Lizenz \u2013 Hosting-Anbieter ben\xF6tigen weiterhin eine (siehe unten).",
      voluntary: {
        title: "Freiwillige Spenden",
        desc: "Das Panel ist f\xFCr den pers\xF6nlichen Gebrauch kostenlos. Wenn es Ihnen hilft, finanziert jeder Beitrag neue Funktionen, Korrekturen und Dokumentation."
      },
      pix: "Pix (Brasilien)",
      notConfigured: 'Spendenlinks sind noch nicht konfiguriert. Stellen Sie <code class="text-gray-400">PANEL_DONATION_*</code> im Server <code class="text-gray-400">.env</code> ein.',
      commercial: {
        title: "Kommerzielle Lizenzierung",
        intro: '<strong class="text-gray-200">Hosting-Anbieter</strong> die dieses Panel Kunden anbieten m\xF6chten, ben\xF6tigen eine <strong class="text-gray-200">kommerzielle Lizenz</strong>. Weiterverkauf und White-Label-Nutzung ohne Genehmigung versto\xDFen gegen {license}.',
        items: [
          "Pers\xF6nliche Nutzung und Open-Source-Beitrag: kostenlos",
          "Kommerzielles Hosting/Weiterverkauf: kostenpflichtige Lizenz",
          "Spenden ersetzen keine kommerzielle Lizenz"
        ],
        requestLicense: "Fordern Sie eine kommerzielle Lizenz an",
        licenseText: "Lizenztext",
        contact: "Lizenzkontakt:"
      }
    },
    about: {
      subtitle: "Webmanager f\xFCr einen Docker-Valheim-Server",
      fields: {
        version: "Version",
        build: "Bauen",
        commit: "Begehen",
        license: "Lizenz"
      },
      repository: "Repository",
      whatsNew: "Was ist neu",
      changelogEmpty: "Keine Changelog-Eintr\xE4ge.",
      creditsTitle: "Credits",
      changelogSections: {
        added: "Added",
        changed: "Changed",
        deprecated: "Deprecated",
        removed: "Removed",
        fixed: "Fixed",
        security: "Security"
      },
      update: {
        title: "Panel-Update",
        upToDate: "Aktuell (v{current})",
        available: "Update verf\xFCgbar: v{latest}",
        viewRelease: "Release auf GitHub ansehen",
        apply: "Jetzt aktualisieren",
        updating: "Aktualisiere\u2026 Neustart",
        started: "Panel-Update gestartet \u2014 die Seite l\xE4dt neu, wenn der Container neu startet."
      },
      credits: {
        valheimDocker: {
          label: "Valheim-Server in Docker",
          by: "lloesche/valheim-server-docker"
        },
        backend: {
          label: "Backend",
          by: "FastAPI + Uvicorn"
        },
        frontend: {
          label: "Frontend",
          by: "Alpine.js + Tailwind CSS + Chart.js + CodeMirror"
        }
      }
    },
    resources: {
      noLimit: "Keine Begrenzung",
      hostSuffix: "(Gastgeber)"
    }
  };

  // frontend/locales/ru-RU.json
  var ru_RU_default = {
    meta: {
      locale: "ru-RU",
      appTitle: "Vikinger Panel",
      appSubtitle: "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440 \u0441\u0435\u0440\u0432\u0435\u0440\u0430 PsyDev"
    },
    nav: {
      sections: {
        painel: "\u041F\u0430\u043D\u0435\u043B\u044C",
        gerenciar: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435",
        ferramentas: "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B",
        suporte: "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430"
      },
      items: {
        dashboard: "\u041E\u0431\u0437\u043E\u0440",
        server: "\u0421\u0435\u0440\u0432\u0435\u0440",
        worlds: "\u041C\u0438\u0440\u044B",
        mods: "\u041C\u043E\u0434\u044B \u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
        backups: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438",
        files: "\u0424\u0430\u0439\u043B\u044B",
        logs: "\u041A\u043E\u043D\u0441\u043E\u043B\u044C",
        audit: "\u0410\u0443\u0434\u0438\u0442",
        help: "\u0421\u043F\u0440\u0430\u0432\u043A\u0430",
        donation: "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043F\u0440\u043E\u0435\u043A\u0442",
        about: "\u041E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0435"
      },
      sidebar: {
        containerRunning: "\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u0437\u0430\u043F\u0443\u0449\u0435\u043D",
        containerStopped: "\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D"
      },
      refresh: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C"
    },
    common: {
      actions: {
        copy: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
        cancel: "\u041E\u0442\u043C\u0435\u043D\u0430",
        save: "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0442\u044C",
        delete: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
        edit: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
        download: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C",
        close: "\u2715",
        view: "\u0412\u0438\u0434",
        ok: "\u0425\u041E\u0420\u041E\u0428\u041E",
        send: "\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0442\u044C",
        undo: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C",
        redo: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C",
        find: "\u041D\u0430\u0445\u043E\u0434\u0438\u0442\u044C",
        gotIt: "\u041F\u043E\u043D\u044F\u0442\u043D\u043E",
        confirmAndStart: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u0438 \u043D\u0430\u0447\u043D\u0438\u0442\u0435",
        copyAddress: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0430\u0434\u0440\u0435\u0441",
        copyKey: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u043B\u044E\u0447",
        copyCode: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u043E\u0434",
        copyRequest: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0437\u0430\u043F\u0440\u043E\u0441",
        copyResponse: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043E\u0442\u0432\u0435\u0442",
        copyAll: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0432\u0441\u0435",
        restoreDraft: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0447\u0435\u0440\u043D\u043E\u0432\u0438\u043A",
        discard: "\u041E\u0442\u043A\u0430\u0437\u0430\u0442\u044C\u0441\u044F"
      },
      loading: {
        loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...",
        loadingEllipsis: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026",
        applying: "\u041F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0438\u0435...",
        saving: "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435...",
        restarting: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A...",
        creating: "\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435...",
        activating: "\u0410\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u044F...",
        deleting: "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435...",
        removing: "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435...",
        uploading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...",
        installing: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430...",
        checking: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430...",
        updating: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435...",
        linking: "\u0421\u0432\u044F\u0437\u044B\u0432\u0430\u043D\u0438\u0435...",
        generating: "\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435...",
        publishing: "\u0418\u0437\u0434\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439...",
        running: "\u0411\u0435\u0433...",
        restoring: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435...",
        undoing: "\u041E\u0442\u043C\u0435\u043D\u0430...",
        recreatingContainer: "\u0412\u043E\u0441\u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u0430..."
      },
      status: {
        online: "\u041E\u043D\u043B\u0430\u0439\u043D",
        paused: "\u041F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E",
        offline: "\u041E\u0444\u0444\u043B\u0430\u0439\u043D",
        starting: "\u041D\u0430\u0447\u0430\u043B\u043E",
        realTime: "\u0412 \u0440\u0435\u0436\u0438\u043C\u0435 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438",
        emDash: null,
        yes: "\u0414\u0430",
        no: "\u041D\u0435\u0442",
        on: "\u041D\u0430",
        off: "\u0412\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044B\u0439",
        enabled: "\u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E",
        disabled: "\u041D\u0435\u043F\u043E\u043B\u043D\u043E\u0446\u0435\u043D\u043D\u044B\u0439",
        active: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439",
        unlimited: "\u0411\u0435\u0437\u043B\u0438\u043C\u0438\u0442\u043D\u044B\u0439",
        noLimit: "\u0411\u0435\u0437 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0439",
        hostSuffix: "(\u0445\u043E\u0437\u044F\u0438\u043D)",
        pending: "(\u0432 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0438)",
        days: "{count} \u0434\u043D\u0435\u0439",
        day: "{count} \u0434\u0435\u043D\u044C",
        match: "\u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C",
        matches: "\u0441\u043F\u0438\u0447\u043A\u0438",
        matchEs: "\u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0435(\u0430)",
        ofLimit: "\u043B\u0438\u043C\u0438\u0442\u0430",
        players: "\u0438\u0433\u0440\u043E\u043A(\u0438)",
        mod: "\u043C\u043E\u0434",
        mods: "\u043C\u043E\u0434\u044B",
        ms: "ms"
      },
      toasts: {
        copied: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E!",
        failedToCopy: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
        actionCompleted: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E",
        fileSaved: "\u0424\u0430\u0439\u043B \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D!",
        settingsSaved: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B!",
        listsSaved: "\u0421\u043F\u0438\u0441\u043A\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B! \u0421\u0435\u0440\u0432\u0435\u0440 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0449\u0435\u043D, \u0435\u0441\u043B\u0438 \u043E\u043D \u0431\u044B\u043B \u043E\u043D\u043B\u0430\u0439\u043D.",
        limitApplied: "\u041F\u0440\u0438\u043C\u0435\u043D\u0435\u043D \u043B\u0438\u043C\u0438\u0442",
        playerLimitSaved: "\u041B\u0438\u043C\u0438\u0442 \u0438\u0433\u0440\u043E\u043A\u043E\u0432 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D",
        backupLimitSaved: "\u041B\u0438\u043C\u0438\u0442 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0433\u043E \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D, \u043E\u0447\u0438\u0441\u0442\u043A\u0430 \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0430.",
        updateSettingsSaved: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B!",
        configSavedRecreated: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0430, \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u0432\u043E\u0441\u0441\u043E\u0437\u0434\u0430\u043D!",
        backupConfigApplied: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0430 \u0438 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0449\u0435\u043D!",
        worldSettingsSaved: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043C\u0438\u0440\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B.",
        worldSettingsSavedRestart: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B \u0438 \u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0449\u0435\u043D.",
        serverConfiguredVanilla: "\u0421\u0435\u0440\u0432\u0435\u0440 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D \u0432 \u0440\u0435\u0436\u0438\u043C\u0435 Vanilla",
        serverConfiguredBepinex: "\u0421\u0435\u0440\u0432\u0435\u0440 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E BepInEx",
        rconPasswordGenerated: "\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D \u043F\u0430\u0440\u043E\u043B\u044C RCON \u2014 \u0441\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 \u0435\u0433\u043E \u043F\u0435\u0440\u0435\u0434 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u0435\u043C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F.",
        installed: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D: {names}",
        modRemoved: "{name} \u0443\u0434\u0430\u043B\u0435\u043D\u043E",
        modEnabled: "\u041C\u043E\u0434 \u0432\u043A\u043B\u044E\u0447\u0435\u043D",
        modDisabled: "\u041C\u043E\u0434 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D",
        modLinked: "\u041C\u043E\u0434 \u0441\u0432\u044F\u0437\u0430\u043D \u0441 Thunderstore",
        modUpdated: "\u041C\u043E\u0434 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D \u0434\u043E v{version}",
        modOnLatest: "\u041C\u043E\u0434 \u0441\u0442\u043E\u0438\u0442 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0439 \u0432\u0435\u0440\u0441\u0438\u0438",
        modUpdateAvailable: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435: v{installed} \u2192 v{latest}",
        orphanedConfigsRemoved: "{count} \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u043D\u044B\u0435 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438 \u0443\u0434\u0430\u043B\u0435\u043D\u044B",
        r2zDownloaded: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C .r2z \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D",
        codeCopied: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D \u043A\u043E\u0434: {count} \u043C\u043E\u0434(\u044B){skipped}",
        codeCopiedSkipped: "({skipped} \u043C\u043E\u0434(\u044B) \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u044B)",
        backupCreated: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0430: {name}",
        scheduledBackupTriggered: "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0435 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u043E \u2014 \u043F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0435\u043A\u0443\u043D\u0434.",
        backupRestored: '\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F "{name}" \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u200B\u200B\u2014 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A \u0441\u0435\u0440\u0432\u0435\u0440\u0430.',
        backupRestoredLatest: '\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F "{name}" \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u200B\u200B\u2014 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A \u0441\u0435\u0440\u0432\u0435\u0440\u0430.',
        restoreUndone: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043C\u0435\u043D\u0435\u043D\u043E \u2014 \xAB{name}\xBB \u0430\u043A\u0442\u0438\u0432\u0435\u043D.",
        backupDeleted: '\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F "{name}" \u0443\u0434\u0430\u043B\u0435\u043D\u0430.',
        purgeDeleted: "\u0423\u0434\u0430\u043B\u0435\u043D\u044B {count} \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438",
        purgeNone: "\u041D\u0435\u0442 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0445 \u043A\u043E\u043F\u0438\u0439 \u0434\u043B\u044F \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F",
        worldActivated: '\u041C\u0438\u0440 "{name}" \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D',
        worldCreatedActivated: '\u041C\u0438\u0440 "{name}" \u0441\u043E\u0437\u0434\u0430\u043D \u0438 \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D.',
        worldRegistered: '\u041C\u0438\u0440 "{name}" \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D',
        worldDeleted: '\u041C\u0438\u0440 "{name}" \u0443\u0434\u0430\u043B\u0435\u043D.',
        playerKicked: "{label} \u043F\u043D\u0443\u043B",
        playerBanned: "{label} \u0437\u0430\u0431\u0430\u043D\u0435\u043D",
        playerUnbanned: "{label} \u0440\u0430\u0437\u0431\u0430\u043D\u0435\u043D",
        playerPromoted: "{label} \u043F\u043E\u0432\u044B\u0448\u0435\u043D \u0434\u043E \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430",
        playerDemoted: "{label} \u0443\u0434\u0430\u043B\u0435\u043D \u0438\u0437 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430",
        serverActionCompleted: '\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435 "{action}" \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E',
        checkRequested: "\u0417\u0430\u043F\u0440\u043E\u0448\u0435\u043D \u0447\u0435\u043A"
      },
      confirm: {
        kickPlayer: "\u041F\u043D\u0443\u0442\u044C {label}? \u0418\u0433\u0440\u043E\u043A \u043C\u043E\u0436\u0435\u0442 \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F.",
        banPlayer: "\u0417\u0430\u0431\u0430\u043D\u0438\u0442\u044C {label} ({steamId})? \u0418\u0433\u0440\u043E\u043A \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u044C\u0441\u044F, \u043F\u043E\u043A\u0430 \u0435\u0433\u043E \u043D\u0435 \u0440\u0430\u0437\u0431\u0430\u043D\u044F\u0442.",
        removeMod: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043C\u043E\u0434 {name}?",
        updateMod: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C {name}? \u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E, \u043F\u043E\u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u0435\u0440\u0432\u0435\u0440.",
        removeOrphanedConfig: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u043D\u0443\u044E \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044E {names}?",
        removeOrphanedConfigs: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C {count} \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u043D\u044B\u0435 \u0444\u0430\u0439\u043B\u044B \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438?\n\n{names}",
        activateWorldNew: '\u0410\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043C\u0438\u0440 "{name}"? \u0421\u0435\u0440\u0432\u0435\u0440 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0441\u044F \u0438 \u0431\u0443\u0434\u0435\u0442 \u0441\u043E\u0437\u0434\u0430\u043D \u041D\u041E\u0412\u042B\u0419 (\u043F\u0443\u0441\u0442\u043E\u0439) \u043C\u0438\u0440.',
        activateWorld: '\u0410\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043C\u0438\u0440 "{name}"? \u0421\u0435\u0440\u0432\u0435\u0440 \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0441\u044F.',
        deleteWorld: '\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043D\u0430\u0432\u0441\u0435\u0433\u0434\u0430 \u043C\u0438\u0440 "{name}"?',
        restoreLatest: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u044E\u044E \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0443\u044E \u043A\u043E\u043F\u0438\u044E? \u0421\u0435\u0440\u0432\u0435\u0440 \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0441\u044F.",
        undoRestore: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435? \u0421\u0435\u0440\u0432\u0435\u0440 \u0432\u0435\u0440\u043D\u0435\u0442\u0441\u044F \u0432 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0435\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435.",
        applyMemoryLimit: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u041E\u0417\u0423 \u043D\u0430 {label}? \u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u0431\u0443\u0434\u0435\u0442 \u0432\u043E\u0441\u0441\u043E\u0437\u0434\u0430\u043D, \u0430 \u0438\u0433\u0440\u043E\u043A\u0438 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u044B."
      },
      errors: {
        invalidSteamId: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 Steam ID \u2014 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 17 \u0446\u0438\u0444\u0440.",
        invalidWorldName: "\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u043C\u0438\u0440\u043E\u0432\u043E\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u2014 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u0431\u0443\u043A\u0432\u044B, \u0446\u0438\u0444\u0440\u044B, _ \u0438 -.",
        rconUnavailable: "RCON \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D",
        couldNotLoadUsage: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435"
      },
      logEmpty: {
        waitingForOutput: "\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \u0432\u044B\u0432\u043E\u0434\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430...",
        noLogsAvailable: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u0436\u0443\u0440\u043D\u0430\u043B\u043E\u0432."
      },
      editor: {
        unsavedChanges: "\u041D\u0435\u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043D\u044B\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F",
        localDraftFound: "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0447\u0435\u0440\u043D\u043E\u0432\u0438\u043A (\u043D\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0435).",
        defaultLabel: "\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E:",
        ctrlSaveSearch: "Ctrl+S \u0434\u043B\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \xB7 Ctrl+F \u0434\u043B\u044F \u043F\u043E\u0438\u0441\u043A\u0430",
        noMatchingSettings: "\u041D\u0435\u0442 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0445 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A"
      },
      language: "\u042F\u0437\u044B\u043A"
    },
    help: {
      categories: {
        "primeiros-passos": {
          label: "\u041D\u0430\u0447\u0438\u043D\u0430\u044F",
          items: [
            {
              q: "\u041A\u0430\u043A \u043C\u043E\u0438 \u0434\u0440\u0443\u0437\u044C\u044F \u043C\u043E\u0433\u0443\u0442 \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u044C\u0441\u044F \u043A \u0441\u0435\u0440\u0432\u0435\u0440\u0443?",
              a: "\u0412 Valheim \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 <b>Join \u0447\u0435\u0440\u0435\u0437 IP</b> \u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 <code>\u0412\u0410\u0428_IP:2456</code> (\u043F\u043E\u0440\u0442 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u2014 2456). \u0417\u0430\u0442\u0435\u043C \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C \u0441\u0435\u0440\u0432\u0435\u0440\u0430. \u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0430\u0434\u0440\u0435\u0441 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u0442\u0441\u044F \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 <b>\u041E\u0431\u0437\u043E\u0440</b>, \u0432 \u0431\u043B\u043E\u043A\u0435 \xAB\u041A\u0430\u043A \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C\u0441\u044F\xBB."
            },
            {
              q: "\u0413\u0434\u0435 \u043C\u043D\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0438\u043C\u044F \u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u0438 \u043F\u0430\u0440\u043E\u043B\u044C?",
              a: "\u041D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 <b>\u0421\u0435\u0440\u0432\u0435\u0440</b>. \u041F\u0430\u0440\u043E\u043B\u044C \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u043D\u0435 \u043C\u0435\u043D\u0435\u0435 5 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432 \u0438 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0438\u043C\u044F \u0441\u0435\u0440\u0432\u0435\u0440\u0430. \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0435 \u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C."
            },
            {
              q: "\u0421\u0435\u0440\u0432\u0435\u0440 \u043D\u0435 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u0442\u0441\u044F \u0432 \u043E\u0431\u0449\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u043C \u0441\u043F\u0438\u0441\u043A\u0435. \u0427\u0442\u043E \u0442\u0435\u043F\u0435\u0440\u044C?",
              a: "\u041F\u0443\u0431\u043B\u0438\u0447\u043D\u044B\u0439 \u0441\u043F\u0438\u0441\u043E\u043A \u0412\u0430\u043B\u0445\u0435\u0439\u043C\u0430 \u0447\u0430\u0441\u0442\u043E \u0437\u0430\u043D\u0438\u043C\u0430\u0435\u0442 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043C\u0438\u043D\u0443\u0442 \u0438 \u0438\u043D\u043E\u0433\u0434\u0430 \u0442\u0435\u0440\u043F\u0438\u0442 \u043D\u0435\u0443\u0434\u0430\u0447\u0443. \u041F\u0440\u0435\u0434\u043F\u043E\u0447\u0438\u0442\u0430\u044E <b>\u041F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u044F\u0442\u044C\u0441\u044F \u043F\u043E IP</b>. \u0422\u0430\u043A\u0436\u0435 \u0443\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044C, \u0447\u0442\u043E \u0434\u043B\u044F <code>SERVER_PUBLIC</code> \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 <code>true</code> \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \u0421\u0435\u0440\u0432\u0435\u0440."
            },
            {
              q: "\u041D\u0443\u0436\u043D\u043E \u043B\u0438 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0442\u044C \u043F\u043E\u0440\u0442\u044B \u043D\u0430 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0438\u0437\u0430\u0442\u043E\u0440\u0435?",
              a: "\u0414\u0430 \u2014 \u0434\u043B\u044F \u0438\u0433\u0440\u044B \u0447\u0435\u0440\u0435\u0437 \u0418\u043D\u0442\u0435\u0440\u043D\u0435\u0442 \u043F\u0435\u0440\u0435\u043D\u0430\u043F\u0440\u0430\u0432\u044C\u0442\u0435 \u043F\u043E\u0440\u0442\u044B UDP <b>2456\u20132458</b> \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440 (\u043F\u0435\u0440\u0435\u0430\u0434\u0440\u0435\u0441\u0430\u0446\u0438\u044F \u043F\u043E\u0440\u0442\u043E\u0432)."
            },
            {
              q: "\u041A\u0430\u043A \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043A\u0440\u043E\u0441\u0441-\u0438\u0433\u0440\u0443 (\u041F\u041A + Xbox/Game Pass)?",
              a: "\u041D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \u0421\u0435\u0440\u0432\u0435\u0440 \u0434\u043E\u0431\u0430\u0432\u044C\u0442\u0435 <code>-crossplay</code> \u0432 \u043F\u043E\u043B\u0435 <b>\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B</b> \u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435."
            }
          ]
        },
        servidor: {
          label: "\u0421\u0435\u0440\u0432\u0435\u0440",
          items: [
            {
              q: "\u0412 \u0447\u0435\u043C \u0440\u0430\u0437\u043D\u0438\u0446\u0430 \u043C\u0435\u0436\u0434\u0443 \xAB\u041F\u0443\u0441\u043A\xBB, \xAB\u0421\u0442\u043E\u043F\xBB, \xAB\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A\xBB, \xAB\u041F\u0430\u0443\u0437\u0430\xBB \u0438 \xAB\u0412\u043E\u0437\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435\xBB?",
              a: "<b>Start/Stop/Restart</b> \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435/\u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u0432\u0441\u0435\u0433\u043E \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u0430. <b>Pause/Resume</b> \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442 \u043F\u0440\u043E\u0446\u0435\u0441\u0441 Valheim \u0432\u043D\u0443\u0442\u0440\u0438 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u0430 (\u0431\u044B\u0441\u0442\u0440\u0435\u0435, \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0435\u0442 \u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C)."
            },
            {
              q: "\u0427\u0442\u043E \u0442\u0430\u043A\u043E\u0435 \u0441\u043F\u0438\u0441\u043A\u0438 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u043E\u0432, \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D\u043D\u044B\u0445 \u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u043D\u044B\u0445?",
              a: "\u0421\u043F\u0438\u0441\u043A\u0438 \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440\u043E\u0432 Steam. <b>Admin</b> \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442 \u043A\u043E\u043C\u0430\u043D\u0434\u044B \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438; <b>Banned</b> \u0438\u0433\u0440\u043E\u043A\u0438 \u043D\u0435 \u043C\u043E\u0433\u0443\u0442 \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u044C\u0441\u044F; <b>Permited</b> \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043A\u0430\u043A \u0431\u0435\u043B\u044B\u0439 \u0441\u043F\u0438\u0441\u043E\u043A (\u0435\u0441\u043B\u0438 \u043E\u043D \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D, \u043A \u043D\u0435\u043C\u0443 \u043C\u043E\u0433\u0443\u0442 \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u044C\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u0435 \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440\u044B). \u0412 <b>Overview</b> \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043C\u0435\u043D\u044E <b>\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</b> \u0440\u044F\u0434\u043E\u043C \u0441 \u043A\u0430\u0436\u0434\u044B\u043C \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044B\u043C \u0438\u0433\u0440\u043E\u043A\u043E\u043C, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u043E\u0434\u0432\u0438\u0433\u0430\u0442\u044C, \u0443\u0434\u0430\u043B\u044F\u0442\u044C \u0438\u043B\u0438 \u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0438\u0433\u0440\u043E\u043A\u043E\u0432 \u0431\u0435\u0437 \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0444\u0430\u0439\u043B\u043E\u0432 \u0432\u0440\u0443\u0447\u043D\u0443\u044E."
            },
            {
              q: "\u041A\u0430\u043A \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0438\u043D\u0442\u0435\u0440\u0430\u043A\u0442\u0438\u0432\u043D\u0443\u044E \u043A\u043E\u043D\u0441\u043E\u043B\u044C \u043F\u0430\u043D\u0435\u043B\u0438?",
              a: "\u041C\u043E\u0434 <b>ValheimRcon</b> \u0432\u0441\u0442\u0440\u043E\u0435\u043D \u0432 \u043F\u0430\u043D\u0435\u043B\u044C (<b>Integrated</b> \u0437\u043D\u0430\u0447\u043E\u043A \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \xAB\u041C\u043E\u0434\u044B\xBB). \u0412 \u0440\u0435\u0436\u0438\u043C\u0435 <b>Modded (BepInEx)</b> \u043F\u0430\u0440\u043E\u043B\u044C RCON \u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0435\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043F\u0440\u0438 \u043F\u0435\u0440\u0432\u043E\u0439 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0435. \u0414\u043B\u044F \u043A\u043E\u043D\u0441\u043E\u043B\u0438 \u0438 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 BepInEx \u0438 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044B\u0439 \u043C\u043E\u0434."
            },
            {
              q: "\u041A\u0430\u043A \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C RCON?",
              a: "\u041E\u0442\u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u0443\u0439\u0442\u0435 <code>config/bepinex/org.tristan.rcon.cfg</code> (\u043F\u043E\u043B\u0435 <code>Password</code>) \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 \xAB\u041C\u043E\u0434\u044B\xBB \u2192 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F ValheimRcon \u0438\u043B\u0438 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435 <code>PANEL_RCON_PASSWORD</code> \u0432 <code>.env</code>. \u041F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u043E\u0441\u043B\u0435 \u0432\u043D\u0435\u0441\u0435\u043D\u0438\u044F \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439."
            },
            {
              q: "\u0412 \u0447\u0435\u043C \u0440\u0430\u0437\u043D\u0438\u0446\u0430 \u043C\u0435\u0436\u0434\u0443 \u043A\u0438\u043A\u043E\u043C \u0438 \u0431\u0430\u043D\u043E\u043C?",
              a: "<b>Kick</b> \u043D\u0435\u043C\u0435\u0434\u043B\u0435\u043D\u043D\u043E \u043E\u0442\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0438\u0433\u0440\u043E\u043A\u0430, \u043D\u043E \u043E\u043D \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u044C\u0441\u044F \u0441\u043D\u043E\u0432\u0430. <b>Ban</b> \u0431\u043B\u043E\u043A\u0438\u0440\u0443\u0435\u0442 Steam ID \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u0431\u0430\u043D\u043E\u0432, \u043F\u043E\u043A\u0430 \u0432\u044B \u0435\u0433\u043E \u043D\u0435 \u0440\u0430\u0437\u0431\u0430\u043D\u0438\u0442\u0435. \u041E\u0431\u0430 \u0442\u0440\u0435\u0431\u0443\u044E\u0442 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F ValheimRcon \u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u0430\u0440\u043E\u043B\u044F RCON."
            },
            {
              q: "\u041C\u043E\u0433\u0443 \u043B\u0438 \u044F \u0443\u0434\u0430\u043B\u0438\u0442\u044C ValheimRcon?",
              a: "\u041D\u0435\u0442 \u2014 \u043E\u043D \u0432\u0441\u0442\u0440\u043E\u0435\u043D \u0432 \u043F\u0430\u043D\u0435\u043B\u044C \u0438 \u0435\u0433\u043E \u043D\u0435\u043B\u044C\u0437\u044F \u0441\u043D\u044F\u0442\u044C. \u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 <b>\u043E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C</b> \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \xAB\u041C\u043E\u0434\u044B\xBB; \u043A\u043E\u0433\u0434\u0430 \u0432\u044B \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0435\u0442\u0435\u0441\u044C \u043E\u0431\u0440\u0430\u0442\u043D\u043E \u0432 \u0440\u0435\u0436\u0438\u043C Modded (BepInEx), \u043E\u043D \u0441\u043D\u043E\u0432\u0430 \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438."
            },
            {
              q: "\u041A\u0430\u043A \u0443\u0437\u043D\u0430\u0442\u044C Steam ID \u0438\u0433\u0440\u043E\u043A\u0430?",
              a: '\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044B\u0435 \u0438\u0433\u0440\u043E\u043A\u0438 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u044E\u0442\u0441\u044F \u0432 \u043E\u0431\u0437\u043E\u0440\u0435 \u0441 \u0438\u043C\u0435\u043D\u0435\u043C \u0438 Steam ID. \u0414\u043B\u044F \u043E\u0444\u043B\u0430\u0439\u043D-\u0438\u0433\u0440\u043E\u043A\u043E\u0432 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 <a href="https://steamid.io" target="_blank" rel="noopener">steamid.io</a> \u0438 \u0441\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 <b>steamID64</b> (17 \u0446\u0438\u0444\u0440).'
            }
          ]
        },
        mundos: {
          label: "\u041C\u0438\u0440\u044B",
          items: [
            {
              q: "\u041A\u0430\u043A \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u043D\u043E\u0432\u044B\u0439 \u043C\u0438\u0440?",
              a: "\u041D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 <b>Worlds</b> \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 <b>Create</b> (\u043E\u0441\u0442\u0430\u0435\u0442\u0441\u044F \u0432 \u0440\u0435\u0436\u0438\u043C\u0435 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F) \u0438\u043B\u0438 <b>Create & Activate</b> (\u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u043D\u0430 \u043D\u0435\u0433\u043E \u0441\u0435\u0440\u0432\u0435\u0440). \u041D\u0430 \u0441\u0430\u043C\u043E\u043C \u0434\u0435\u043B\u0435 \u043C\u0438\u0440 \u0441\u043E\u0437\u0434\u0430\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0438 \u043F\u0435\u0440\u0432\u043E\u0439 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435."
            },
            {
              q: "\u041A\u0430\u043A\u0438\u0435 \u043F\u0440\u0435\u0441\u0435\u0442\u044B (\u041B\u0435\u0433\u043A\u0438\u0439, \u0421\u043B\u043E\u0436\u043D\u044B\u0439, \u0425\u0430\u0440\u0434\u043A\u043E\u0440...)?",
              a: "\u042D\u0442\u043E \u0442\u0435 \u0436\u0435 \u043C\u043E\u0434\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440\u044B, \u0447\u0442\u043E \u0438 \u043D\u0430 \u044D\u043A\u0440\u0430\u043D\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043C\u0438\u0440\u0430 \u0412\u0430\u043B\u0445\u0435\u0439\u043C\u0430, \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043D\u044B\u0435 \u0432 \u0444\u0430\u0439\u043B\u0435 <code>.fwl</code>. \u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0443 \u0438 \u043F\u0440\u0438 \u044D\u0442\u043E\u043C \u043F\u0435\u0440\u0435\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u0442\u044C \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 (\u0431\u043E\u0439, \u0440\u0435\u0441\u0443\u0440\u0441\u044B, \u0440\u0435\u0439\u0434\u044B, \u043F\u043E\u0440\u0442\u0430\u043B\u044B, \u0441\u043C\u0435\u0440\u0442\u043D\u0430\u044F \u043A\u0430\u0437\u043D\u044C)."
            },
            {
              q: "\u041C\u043E\u0433\u0443 \u043B\u0438 \u044F \u0438\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043C\u0438\u0440, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u0443 \u043C\u0435\u043D\u044F \u0443\u0436\u0435 \u0435\u0441\u0442\u044C?",
              a: "\u0414\u0430. \u0421\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 <code>WorldName.fwl</code> \u0438 <code>WorldName.db</code> \u0432 <code>config/worlds_local/</code> (\u0432\u043A\u043B\u0430\u0434\u043A\u0430 \xAB\u0424\u0430\u0439\u043B\u044B\xBB \u0438\u043B\u0438 \u0442\u043E\u043C Docker), \u0438 \u043E\u043D \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0432 \u0441\u043F\u0438\u0441\u043A\u0435."
            },
            {
              q: "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043C\u0438\u0440\u043E\u0432 \u0443\u0434\u0430\u043B\u044F\u0435\u0442 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439?",
              a: "\u041D\u0435\u0442. \u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043C\u0435\u043D\u044F\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u043C\u0438\u0440; \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0432 \u0434\u0440\u0443\u0433\u0438\u0445 \u043C\u0438\u0440\u0430\u0445 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u0432 <code>config/worlds_local/</code>."
            }
          ]
        },
        mods: {
          label: "\u041C\u043E\u0434\u044B \u0438 \u0411\u0435\u043F\u0438\u043D\u0435\u043A\u0441",
          items: [
            {
              q: "\u041A\u0430\u043A \u043C\u043D\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043C\u043E\u0434?",
              a: '\u0412 <b>Mods & Config</b> \u0432\u0441\u0442\u0430\u0432\u044C\u0442\u0435 <a href="https://thunderstore.io/c/valheim/" target="_blank" rel="noopener">Thunderstore</a> URL-\u0430\u0434\u0440\u0435\u0441 (\u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443, \u0441\u0441\u044B\u043B\u043A\u0443 \u0434\u043B\u044F \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u044F \u0438\u043B\u0438 r2modman) \u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C\xBB \u0438\u043B\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 <code>.zip</code>/<code>.dll</code>.'
            },
            {
              q: "\u0418\u0433\u0440\u043E\u043A\u0430\u043C \u0442\u043E\u0436\u0435 \u043D\u0443\u0436\u0435\u043D \u043C\u043E\u0434?",
              a: "\u042D\u0442\u043E \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043E\u0442 \u043C\u043E\u0434\u0430. \u0421\u0435\u0440\u0432\u0435\u0440\u043D\u044B\u0435 \u043C\u043E\u0434\u044B (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, ServerSideMap) \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u044E\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0435; \u0431\u043E\u043B\u044C\u0448\u0438\u043D\u0441\u0442\u0432\u043E \u043C\u043E\u0434\u043E\u0432 \u0438\u0433\u0440\u043E\u0432\u043E\u0433\u043E \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430 / \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u043E\u0433\u043E \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430 \u0434\u043E\u043B\u0436\u043D\u044B \u0431\u044B\u0442\u044C \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u044B \u043D\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0435 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0438\u0433\u0440\u043E\u043A\u0430 \u043E\u0434\u043D\u043E\u0439 \u0438 \u0442\u043E\u0439 \u0436\u0435 \u0432\u0435\u0440\u0441\u0438\u0438."
            },
            {
              q: "\u0427\u0442\u043E \u0442\u0430\u043A\u043E\u0435 \u0411\u0435\u043F\u0438\u043D\u042D\u043A\u0441?",
              a: "\u042D\u0442\u043E \u0437\u0430\u0433\u0440\u0443\u0437\u0447\u0438\u043A \u043C\u043E\u0434\u043E\u0432, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C\u044B\u0439 Valheim. \u041A\u0430\u0436\u0434\u044B\u0439 \u043C\u043E\u0434 \u043E\u0431\u044B\u0447\u043D\u043E \u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0435\u0442 \u0444\u0430\u0439\u043B <code>.cfg</code> \u0432 <code>config/bepinex</code>, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043C\u043E\u0436\u043D\u043E \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \xAB\u041C\u043E\u0434\u044B \u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438\xBB."
            },
            {
              q: "\u0412\u0430\u043D\u0438\u043B\u044C \u0438\u043B\u0438 \u043C\u043E\u0434\u0438\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439?",
              a: "\u041F\u0440\u0438 <b>\u043F\u0435\u0440\u0432\u043E\u043C \u0437\u0430\u043F\u0443\u0441\u043A\u0435 </b> \u0438\u043B\u0438 <b>Server</b> \u2192 <b>\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0438\u0433\u0440\u044B</b> \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>Vanilla</b> (\u043E\u0442\u043A\u043B\u044E\u0447\u0430\u0435\u0442 BepInEx \u0438 \u0432\u0441\u0435 \u043C\u043E\u0434\u044B) \u0438\u043B\u0438 <b>Modded</b> (\u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 BepInEx \u0438 \u0438\u043D\u0442\u0435\u0433\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 ValheimRcon). \u0412 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u043E\u043C \u0440\u0435\u0436\u0438\u043C\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 <b>Administrators</b> \u0432 \u0441\u043F\u0438\u0441\u043A\u0430\u0445 \u0438\u0433\u0440\u043E\u043A\u043E\u0432, \u0447\u0442\u043E\u0431\u044B \u0441\u0442\u0430\u0442\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u043E\u043C \u0432 \u0438\u0433\u0440\u0435."
            },
            {
              q: "\u041A\u0430\u043A \u0440\u0430\u0431\u043E\u0442\u0430\u044E\u0442 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0438\u0433\u0440\u044B?",
              a: "\u0412 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F <code>valheim-updater</code> (SteamCMD). \u041D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 <b>\u0421\u0435\u0440\u0432\u0435\u0440</b> \u0432\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0430\u0432\u0442\u043E\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435, \u043E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0435\u0433\u043E \u0438\u043B\u0438 \u043D\u0430\u0436\u0430\u0442\u044C <b>\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043D\u0430\u043B\u0438\u0447\u0438\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0439 \u0441\u0435\u0439\u0447\u0430\u0441</b>. \u0415\u0441\u043B\u0438 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u044B \u043C\u043E\u0434\u044B, \u043B\u0443\u0447\u0448\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0442\u044C \u0438\u0445 \u0432\u0440\u0443\u0447\u043D\u0443\u044E \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u0438."
            },
            {
              q: "\u041C\u043E\u0433\u0443\u0442 \u043B\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u043B\u043E\u043C\u0430\u0442\u044C \u043C\u043E\u0434\u044B?",
              a: "\u0414\u0430. \u041F\u0430\u0442\u0447 Valheim \u043C\u043E\u0436\u0435\u0442 \u043F\u043E\u0442\u0440\u0435\u0431\u043E\u0432\u0430\u0442\u044C \u043D\u043E\u0432\u044B\u0445 \u0432\u0435\u0440\u0441\u0438\u0439 \u043C\u043E\u0434\u043E\u0432. \u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0443\u044E \u043A\u043E\u043F\u0438\u044E, \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0438\u0433\u0440\u0443, \u0430 \u0437\u0430\u0442\u0435\u043C \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 <b>\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043D\u0430\u043B\u0438\u0447\u0438\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0439</b> \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u043C\u043E\u0434\u0430, \u0441\u0432\u044F\u0437\u0430\u043D\u043D\u043E\u0433\u043E \u0441 Thunderstore."
            },
            {
              q: "\u041A\u0430\u043A \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043C\u043E\u0434?",
              a: "\u041C\u043E\u0434\u044B, \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043D\u044B\u0435 \u0447\u0435\u0440\u0435\u0437 Thunderstore, \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442 \u0441\u0442\u0430\u0442\u0443\u0441 \u0432\u0435\u0440\u0441\u0438\u0438. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 <b>\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043D\u0430\u043B\u0438\u0447\u0438\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0439</b> \u0438, \u0435\u0441\u043B\u0438 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u043D\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0441\u0438\u044F, <b>Update mod</b>. \u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u0435 \u043C\u043E\u0434\u044B \u0434\u043E\u043B\u0436\u043D\u044B \u0431\u044B\u0442\u044C <b>\u0441\u0432\u044F\u0437\u0430\u043D\u044B</b> \u0441 URL-\u0430\u0434\u0440\u0435\u0441\u043E\u043C Thunderstore \u0434\u043B\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438."
            },
            {
              q: "\u042F \u0432\u043A\u043B\u044E\u0447\u0438\u043B/\u043E\u0442\u043A\u043B\u044E\u0447\u0438\u043B \u043C\u043E\u0434 \u0438 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u043E\u0441\u044C.",
              a: "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043C\u043E\u0434\u0430 \u0442\u0440\u0435\u0431\u0443\u044E\u0442 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A\u0430 <b>\u0441\u0435\u0440\u0432\u0435\u0440\u0430</b>. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \xAB\u041F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C\xBB \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 \xAB\u041E\u0431\u0437\u043E\u0440\xBB."
            }
          ]
        },
        backups: {
          label: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438",
          items: [
            {
              q: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0435 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u0442 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438?",
              a: "\u0414\u0430. \u041D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 <b>\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0435 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435</b> \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 <b>\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435</b> \u0437\u0430\u0434\u0430\u0439\u0442\u0435 \u0438\u043D\u0442\u0435\u0440\u0432\u0430\u043B. \u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u043A\u043E\u043F\u0438\u0440\u0443\u0435\u0442 <code>worlds_local/</code> \u0432 <code>config/backups/</code> \u043A\u0430\u043A \u0444\u0430\u0439\u043B\u044B <code>worlds-*.zip</code>. \u0425\u0440\u0430\u043D\u0435\u043D\u0438\u0435: 30 \u0434\u043D\u0435\u0439."
            },
            {
              q: "\u041A\u0430\u043A \u043C\u043D\u0435 \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0443\u044E \u043A\u043E\u043F\u0438\u044E \u043F\u0440\u044F\u043C\u043E \u0441\u0435\u0439\u0447\u0430\u0441?",
              a: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 <b>\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0443\u044E \u043A\u043E\u043F\u0438\u044E \u0432\u0440\u0443\u0447\u043D\u0443\u044E</b> \u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043F: \u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u043C\u0438\u0440 (\u0431\u044B\u0441\u0442\u0440\u044B\u0439), \u041F\u043E\u043B\u043D\u044B\u0439 \u0438\u043B\u0438 \u0422\u043E\u043B\u044C\u043A\u043E \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438."
            },
            {
              q: "\u041A\u0430\u043A \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0443\u044E \u043A\u043E\u043F\u0438\u044E?",
              a: "\u0412 \u0441\u043F\u0438\u0441\u043A\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0445 \u043A\u043E\u043F\u0438\u0439 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 <b>\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0441\u044E\u0434\u0430</b> \u0432 \u043D\u0443\u0436\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u0435. \u041F\u0430\u043D\u0435\u043B\u044C \u0441\u043E\u0437\u0434\u0430\u0435\u0442 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0443\u044E \u0442\u043E\u0447\u043A\u0443, \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442 \u0444\u0430\u0439\u043B\u044B \u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442 \u0441\u0435\u0440\u0432\u0435\u0440. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 <b>Restore \u0434\u043E \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0439 \u0432\u0435\u0440\u0441\u0438\u0438</b> \u0438\u043B\u0438 <b>\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435</b>, \u0447\u0442\u043E\u0431\u044B \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043D\u0430\u0437\u0430\u0434."
            },
            {
              q: "\u041A\u0430\u043A\u043E\u0439 \u0441\u0435\u0439\u0447\u0430\u0441 \u0437\u0430\u0431\u0435\u0433?",
              a: "\u0412\u0440\u0443\u0447\u043D\u0443\u044E \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442 \u0442\u043E \u0436\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0433\u043E \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u044F\u0435\u0442\u0441\u044F \u0441 \u0437\u0430\u0434\u0430\u043D\u043D\u044B\u043C \u0438\u043D\u0442\u0435\u0440\u0432\u0430\u043B\u043E\u043C \u2014 \u0432 \u043E\u0442\u043B\u0438\u0447\u0438\u0435 \u043E\u0442 <b>\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0435 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0432\u0440\u0443\u0447\u043D\u0443\u044E</b>, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u0435\u0442 \u0432\u0430\u043C \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F (\u0432\u0441\u0435\u043C\u0438\u0440\u043D\u0443\u044E, \u043F\u043E\u043B\u043D\u0443\u044E \u0438\u043B\u0438 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438)."
            },
            {
              q: "\u041C\u043E\u0433\u0443 \u043B\u0438 \u044F \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0438\u0442\u044C \u043E\u0431\u044A\u0435\u043C \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0445 \u043A\u043E\u043F\u0438\u0439 \u0434\u0438\u0441\u043A\u0430?",
              a: "\u0414\u0430. \u041D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 <b>\u0421\u0435\u0440\u0432\u0435\u0440</b> \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 <b>\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0433\u043E \u0434\u0438\u0441\u043A\u0430</b> \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0440\u0430\u0441\u043A\u0440\u044B\u0432\u0430\u044E\u0449\u0438\u0439\u0441\u044F \u0441\u043F\u0438\u0441\u043E\u043A <b>\u041E\u0431\u0449\u0438\u0439 \u043B\u0438\u043C\u0438\u0442 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0445 \u043A\u043E\u043F\u0438\u0439</b>. \u041E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 <b>Unlimited</b> \u0431\u0435\u0437 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F \u0438\u043B\u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0437\u043C\u0435\u0440 (1 \u0413\u0411, 2 \u0413\u0411, 10 \u0413\u0411 \u0438 \u0442.\xA0\u0434.) \u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 <b>\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043B\u0438\u043C\u0438\u0442 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0433\u043E \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F</b>. \u0421\u0430\u043C\u044B\u0435 \u0441\u0442\u0430\u0440\u044B\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438 \u0443\u0434\u0430\u043B\u044F\u044E\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043F\u0440\u0438 \u043F\u0440\u0435\u0432\u044B\u0448\u0435\u043D\u0438\u0438 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F."
            },
            {
              q: "\u0427\u0442\u043E \u0442\u0435\u043F\u0435\u0440\u044C \u0434\u0435\u043B\u0430\u0435\u0442 \u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0432\u0441\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438?",
              a: "\u041D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 <b>Server</b> \u044D\u0442\u043E \u043D\u0435\u043E\u0431\u0440\u0430\u0442\u0438\u043C\u043E \u0443\u0434\u0430\u043B\u044F\u0435\u0442 \u0432\u0441\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 ZIP-\u0444\u0430\u0439\u043B\u044B \u0432 <code>config/backups/</code>, \u0437\u0430 \u0438\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435\u043C \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0445 \u043A\u043E\u043F\u0438\u0439, \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D\u043D\u044B\u0445 \u043A \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0438\u043B\u0438 \u043E\u0442\u043C\u0435\u043D\u044B."
            }
          ]
        },
        files: {
          label: "\u0424\u0430\u0439\u043B\u044B",
          items: [
            {
              q: "\u041A\u0430\u043A \u0431\u044B\u0441\u0442\u0440\u043E \u043D\u0430\u0439\u0442\u0438 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u044B\u0439 \u0444\u0430\u0439\u043B?",
              a: "\u041D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 <b>Files</b> \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043F\u043E\u043B\u0435 \u043F\u043E\u0438\u0441\u043A\u0430 \u0434\u043B\u044F \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u0438 \u043F\u043E \u0438\u043C\u0435\u043D\u0438 \u0444\u0430\u0439\u043B\u0430. \u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 \u0444\u0430\u0439\u043B\u044B \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u044E\u0442\u0441\u044F \u0432 \u0432\u0438\u0434\u0435 \u043F\u043B\u043E\u0441\u043A\u043E\u0433\u043E \u0441\u043F\u0438\u0441\u043A\u0430 \u0434\u043B\u044F \u0431\u044B\u0441\u0442\u0440\u043E\u0433\u043E \u0434\u043E\u0441\u0442\u0443\u043F\u0430."
            },
            {
              q: "\u041A\u0430\u043A\u0438\u0435 \u0444\u0438\u043B\u044C\u0442\u0440\u044B \u0442\u0438\u043F\u043E\u0432 \u0444\u0430\u0439\u043B\u043E\u0432?",
              a: "\u0429\u0435\u043B\u043A\u043D\u0438\u0442\u0435 \u0444\u0438\u0448\u043A\u0438, \u0442\u0430\u043A\u0438\u0435 \u043A\u0430\u043A <b>Config</b>, <b>DLLs</b>, <b>Plugins</b> \u0438\u043B\u0438 <b>Worlds</b>, \u0447\u0442\u043E\u0431\u044B \u0441\u0443\u0437\u0438\u0442\u044C \u0434\u0435\u0440\u0435\u0432\u043E \u0434\u043E \u0440\u0430\u0441\u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0435\u043D\u043D\u044B\u0445 \u0442\u0438\u043F\u043E\u0432 \u0444\u0430\u0439\u043B\u043E\u0432 \u2014 \u043F\u043E\u043B\u0435\u0437\u043D\u043E, \u043A\u043E\u0433\u0434\u0430 \u0432\u0430\u043C \u043D\u0443\u0436\u043D\u043E \u043E\u0442\u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0444\u0430\u0439\u043B\u043E\u0432 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0439 \u0438\u043B\u0438 \u043C\u043E\u0434\u043E\u0432."
            }
          ]
        },
        recursos: {
          label: "\u0420\u0435\u0441\u0443\u0440\u0441\u044B \u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
          items: [
            {
              q: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u043E\u043F\u0435\u0440\u0430\u0442\u0438\u0432\u043D\u043E\u0439 \u043F\u0430\u043C\u044F\u0442\u0438 \u043D\u0443\u0436\u043D\u043E \u0441\u0435\u0440\u0432\u0435\u0440\u0443?",
              a: "\u0421\u0435\u0440\u0432\u0435\u0440 Valheim \u043E\u0431\u044B\u0447\u043D\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 2\u20134 \u0413\u0411, \u0438 \u044D\u0442\u043E\u0442 \u043E\u0431\u044A\u0435\u043C \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u0441 \u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u0438\u0435\u043C \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u0430 \u0438\u0433\u0440\u043E\u043A\u043E\u0432/\u043C\u043E\u0434\u043E\u0432. \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 <b>\u0421\u0435\u0440\u0432\u0435\u0440</b> \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 <b>\u041F\u0440\u043E\u043F\u0443\u0441\u043A\u043D\u0430\u044F \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u044C \u0441\u0435\u0440\u0432\u0435\u0440\u0430</b>. \u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u0438 \u0432 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B \u043D\u0430 <b>Overview</b>."
            },
            {
              q: "\u041A\u0430\u043A \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043B\u0438\u043C\u0438\u0442 \u0438\u0433\u0440\u043E\u043A\u043E\u0432?",
              a: "\u041D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 <b>\u0421\u0435\u0440\u0432\u0435\u0440</b> \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 <b>\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C \u0441\u0435\u0440\u0432\u0435\u0440\u0430</b>. Vanilla \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u0434\u043E 10 \u0438\u0433\u0440\u043E\u043A\u043E\u0432; \u0432\u044B\u0448\u0435 \u044D\u0442\u043E\u0433\u043E \u043D\u0443\u0436\u0435\u043D \u043C\u043E\u0434 (Valheim Plus \u0438\u043B\u0438 MaxPlayerCount). \u041F\u0430\u043D\u0435\u043B\u044C \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0438\u0440\u0443\u0435\u0442 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0441 .cfg \u043C\u043E\u0434\u0430, \u0435\u0441\u043B\u0438 \u043E\u043D \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D."
            },
            {
              q: "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u043B\u0438\u043C\u0438\u0442\u0430 \u043E\u043F\u0435\u0440\u0430\u0442\u0438\u0432\u043D\u043E\u0439 \u043F\u0430\u043C\u044F\u0442\u0438 \u043E\u0442\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0438\u0433\u0440\u043E\u043A\u043E\u0432?",
              a: "\u0414\u0430 \u2014 \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u043D\u043E\u0432\u043E\u0433\u043E \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F \u0432\u043E\u0441\u0441\u043E\u0437\u0434\u0430\u0435\u0442 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u0438 \u043E\u0442\u043A\u043B\u044E\u0447\u0438\u0442 \u0432\u0441\u0435\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439 \u043E\u0442 \u0441\u0435\u0442\u0438. \u0414\u0435\u043B\u0430\u0439\u0442\u0435 \u044D\u0442\u043E \u0432 \u0442\u0438\u0445\u0438\u0435 \u0447\u0430\u0441\u044B."
            }
          ]
        },
        docker: {
          label: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430 \u0438 \u0414\u043E\u043A\u0435\u0440",
          items: [
            {
              q: "\u041A\u0430\u043A \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u043F\u0430\u043D\u0435\u043B\u044C + \u0441\u0435\u0440\u0432\u0435\u0440?",
              a: "\u0421\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 <code>.env.example</code> \u0432 <code>.env</code>, \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0438 \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 <code>docker compose up -d</code>. \u041F\u0430\u043D\u0435\u043B\u044C \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u043F\u043E \u0430\u0434\u0440\u0435\u0441\u0443 <code>http://\u0412\u0410\u0428_IP:8080</code>."
            },
            {
              q: "\u042F \u043F\u043E\u043B\u0443\u0447\u0430\u044E \u043E\u0448\u0438\u0431\u043A\u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u043F\u0430\u043F\u043E\u043A.",
              a: "\u041F\u0440\u0438 \u0440\u0430\u0431\u043E\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 Docker \u043F\u0430\u043D\u0435\u043B\u044C \u0438 \u0441\u0435\u0440\u0432\u0435\u0440 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442 \u043E\u0434\u043D\u043E\u0433\u043E \u0438 \u0442\u043E\u0433\u043E \u0436\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F (UID/GID 1000) \u0438 \u0440\u0430\u0437\u0434\u0435\u043B\u044F\u044E\u0442 \u0442\u043E\u043C\u0430, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043E\u0448\u0438\u0431\u043E\u043A \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0439 \u0432\u043E\u0437\u043D\u0438\u043A\u043D\u0443\u0442\u044C \u043D\u0435 \u0434\u043E\u043B\u0436\u043D\u043E. \u0423\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044C, \u0447\u0442\u043E <code>config/</code> \u0438 <code>data/</code> \u043F\u0440\u0438\u043D\u0430\u0434\u043B\u0435\u0436\u0430\u0442 UID 1000."
            },
            {
              q: "\u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E \u043B\u0438 \u043C\u043E\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C docker.sock \u0432 \u043F\u0430\u043D\u0435\u043B\u044C?",
              a: "\u041F\u0430\u043D\u0435\u043B\u0438 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F <code>docker.sock</code> \u0434\u043B\u044F \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u043E\u043C Valheim. \u042D\u0442\u043E \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442 Docker \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C \u043D\u0430\u0434 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u043E\u043C \u043F\u0430\u043D\u0435\u043B\u0438 \u2014 \u0434\u0435\u0440\u0436\u0438\u0442\u0435 \u043F\u0430\u043D\u0435\u043B\u044C \u0432 \u0447\u0430\u0441\u0442\u043D\u043E\u0439 \u0441\u0435\u0442\u0438 \u0438\u043B\u0438 \u0437\u0430 \u043F\u0440\u043E\u043A\u0441\u0438-\u0441\u0435\u0440\u0432\u0435\u0440\u043E\u043C \u0441 \u0430\u0443\u0442\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0435\u0439 \u0432 \u0440\u0430\u0431\u043E\u0447\u0435\u0439 \u0441\u0440\u0435\u0434\u0435."
            }
          ]
        },
        problemas: {
          label: "\u041F\u043E\u0438\u0441\u043A \u043D\u0435\u0438\u0441\u043F\u0440\u0430\u0432\u043D\u043E\u0441\u0442\u0435\u0439",
          items: [
            {
              q: "\u0413\u0434\u0435 \u044F \u043C\u043E\u0433\u0443 \u0443\u0432\u0438\u0434\u0435\u0442\u044C, \u0447\u0442\u043E \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u0442?",
              a: "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 <b>Console</b> (docker/BepInEx) \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 \xAB\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B\xBB. \u041D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 <b>Audit</b> \u043F\u043E\u043A\u0430\u0437\u0430\u043D\u044B \u0432\u0441\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F, \u0432\u044B\u043F\u043E\u043B\u043D\u044F\u0435\u043C\u044B\u0435 \u043F\u0430\u043D\u0435\u043B\u044C\u044E. \u041F\u0440\u043E\u0446\u0435\u0441\u0441\u043E\u0440 \u0438 \u043E\u043F\u0435\u0440\u0430\u0442\u0438\u0432\u043D\u0430\u044F \u043F\u0430\u043C\u044F\u0442\u044C \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u044B <b>Overview</b>."
            },
            {
              q: "\u041F\u0430\u043D\u0435\u043B\u044C \u043D\u0435 \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442/\u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043E\u0448\u0438\u0431\u043A\u0443 500.",
              a: "\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043A\u043E\u043D\u0441\u043E\u043B\u044C \u0438 \u0430\u0443\u0434\u0438\u0442. \u0423\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044C, \u0447\u0442\u043E Docker \u0437\u0430\u043F\u0443\u0449\u0435\u043D \u0438 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 <code>valheim-server</code> \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442."
            },
            {
              q: "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u043D\u0435 \u0432\u0441\u0442\u0443\u043F\u0438\u043B\u043E \u0432 \u0441\u0438\u043B\u0443.",
              a: "\u041C\u043D\u043E\u0433\u0438\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F (\u043C\u043E\u0434\u044B, \u0441\u043F\u0438\u0441\u043A\u0438, \u0442\u0435\u043A\u0443\u0449\u0438\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043C\u0438\u0440\u0430) \u0432\u0441\u0442\u0443\u043F\u0430\u044E\u0442 \u0432 \u0441\u0438\u043B\u0443 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430."
            }
          ]
        }
      },
      referenceLinks: [
        {
          label: "\u041E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u0430\u044F \u0432\u0438\u043A\u0438 Valheim",
          url: "https://valheim.fandom.com/wiki/Valheim_Wiki"
        },
        {
          label: "Thunderstore (\u043C\u043E\u0434\u044B Valheim)",
          url: "https://thunderstore.io/c/valheim/"
        },
        {
          label: "BepInEx (\u0437\u0430\u0433\u0440\u0443\u0437\u0447\u0438\u043A \u043C\u043E\u0434\u043E\u0432)",
          url: "https://docs.bepinex.dev/"
        },
        {
          label: "lloesche/valheim-server \u043E\u0431\u0440\u0430\u0437 Docker",
          url: "https://github.com/lloesche/valheim-server-docker"
        },
        {
          label: "\u0412\u044B\u0434\u0435\u043B\u0435\u043D\u043D\u044B\u0439 \u0441\u0435\u0440\u0432\u0435\u0440 (\u043E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E)",
          url: "https://valheim.fandom.com/wiki/Hosting_a_Dedicated_Server"
        }
      ],
      title: "\u0427\u0430\u0441\u0442\u043E \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043C\u044B\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B",
      searchPlaceholder: "\u041F\u043E\u0438\u0441\u043A \u0432 \u0447\u0430\u0441\u0442\u043E \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043C\u044B\u0445 \u0432\u043E\u043F\u0440\u043E\u0441\u0430\u0445...",
      usefulLinks: "\u041F\u043E\u043B\u0435\u0437\u043D\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438"
    },
    worlds: {
      presets: {
        preset: {
          _default: {
            label: "\u0418\u0433\u0440\u0430 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E",
            desc: "\u041D\u0438\u043A\u0430\u043A\u0438\u0445 \u043C\u043E\u0434\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440\u043E\u0432 \u2014 \u0432\u0430\u043D\u0438\u043B\u044C\u043D\u044B\u0439 \u043E\u043F\u044B\u0442, \u043A\u0430\u043A \u0438 \u0434\u043E \u043F\u0430\u0442\u0447\u0430 Hildir's Request."
          },
          easy: {
            label: "\u041B\u0435\u0433\u043A\u0438\u0439",
            desc: "\u0411\u043E\u043B\u0435\u0435 \u043B\u0435\u0433\u043A\u0438\u0439 \u0431\u043E\u0439 (\u043B\u0435\u0433\u043A\u0438\u0439 \u0443\u0440\u043E\u043D) \u0438 \u043C\u0435\u043D\u0435\u0435 \u0447\u0430\u0441\u0442\u044B\u0435 \u0440\u0435\u0439\u0434\u044B."
          },
          normal: {
            label: "\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439",
            desc: "\u042D\u043A\u0432\u0438\u0432\u0430\u043B\u0435\u043D\u0442\u043D\u043E \u0438\u0433\u0440\u0435 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u2014 \u0432\u0441\u0435 \u043F\u043E\u043B\u0437\u0443\u043D\u043A\u0438 \u0432 \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E\u043C \u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0438."
          },
          hard: {
            label: "\u0416\u0435\u0441\u0442\u043A\u0438\u0439",
            desc: "\u0416\u0435\u0441\u0442\u043A\u0438\u0439 \u0431\u043E\u0439 \u0438 \u0431\u043E\u043B\u0435\u0435 \u0447\u0430\u0441\u0442\u044B\u0435 \u0440\u0435\u0439\u0434\u044B."
          },
          hardcore: {
            label: "\u0425\u0430\u0440\u0434\u043A\u043E\u0440",
            desc: "\u041E\u0447\u0435\u043D\u044C \u0442\u044F\u0436\u0435\u043B\u044B\u0439 \u0431\u043E\u0439, \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u043C\u0435\u0440\u0442\u043D\u0430\u044F \u043A\u0430\u0437\u043D\u044C, \u0447\u0430\u0441\u0442\u044B\u0435 \u0440\u0435\u0439\u0434\u044B, \u0441\u043B\u043E\u0436\u043D\u044B\u0435 \u043F\u043E\u0440\u0442\u0430\u043B\u044B \u0438 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435 \u043A\u0430\u0440\u0442\u044B."
          },
          casual: {
            label: "\u041F\u043E\u0432\u0441\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0439",
            desc: "\u041E\u0447\u0435\u043D\u044C \u043F\u0440\u043E\u0441\u0442\u043E\u0439 \u0431\u043E\u0439, \u043B\u0435\u0433\u043A\u0430\u044F \u0441\u043C\u0435\u0440\u0442\u043D\u0430\u044F \u043A\u0430\u0437\u043D\u044C, \u0431\u043E\u043B\u044C\u0448\u0435 \u0440\u0435\u0441\u0443\u0440\u0441\u043E\u0432, \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435 \u0440\u0435\u0439\u0434\u043E\u0432, \u0441\u043B\u0443\u0447\u0430\u0439\u043D\u044B\u0445 \u043F\u043E\u0440\u0442\u0430\u043B\u043E\u0432, \u0441\u043E\u0431\u044B\u0442\u0438\u0439 \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0438\u0433\u0440\u043E\u043A\u0430 \u0438 \u043F\u0430\u0441\u0441\u0438\u0432\u043D\u044B\u0445 \u043C\u043E\u0431\u043E\u0432."
          },
          hammer: {
            label: "\u0420\u0435\u0436\u0438\u043C \u043C\u043E\u043B\u043E\u0442\u043A\u0430",
            desc: "\u0421\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E \u0431\u0435\u0437 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044C\u043D\u044B\u0445 \u0437\u0430\u0442\u0440\u0430\u0442, \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u044B \u0440\u0435\u0439\u0434\u044B \u0438 \u043F\u0430\u0441\u0441\u0438\u0432\u043D\u044B\u0435 \u043C\u043E\u0431\u044B."
          },
          immersive: {
            label: "\u0437\u0430\u0445\u0432\u0430\u0442\u044B\u0432\u0430\u044E\u0449\u0438\u0439",
            desc: "\u041F\u043E\u0440\u0442\u0430\u043B\u044B \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D\u044B, \u043E\u0433\u043E\u043D\u044C \u0440\u0430\u0441\u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u043F\u043E \u0432\u0441\u0435\u043C\u0443 \u043C\u0438\u0440\u0443, \u0430 \u043A\u0430\u0440\u0442\u044B/\u043C\u0438\u043D\u0438-\u043A\u0430\u0440\u0442\u044B \u043D\u0435\u0442."
          }
        },
        combat: {
          _default: {
            label: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0435\u0441\u0435\u0442",
            desc: "\u0423\u043D\u0430\u0441\u043B\u0435\u0434\u0443\u0439\u0442\u0435 \u0441\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u0431\u043E\u044F \u043E\u0442 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u0435\u0441\u0435\u0442\u0430."
          },
          veryeasy: {
            label: "\u041E\u0447\u0435\u043D\u044C \u043B\u0435\u0433\u043A\u043E",
            desc: "125% \u0443\u0440\u043E\u043D\u0430 \u0438\u0433\u0440\u043E\u043A\u0443, 50% \u0443\u0440\u043E\u043D\u0430 \u0432\u0440\u0430\u0433\u0430\u043C, \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C/\u0440\u0430\u0437\u043C\u0435\u0440 \u0432\u0440\u0430\u0433\u043E\u0432 90%."
          },
          easy: {
            label: "\u041B\u0435\u0433\u043A\u0438\u0439",
            desc: "110% \u0443\u0440\u043E\u043D\u0430 \u0438\u0433\u0440\u043E\u043A\u0443, 75% \u0443\u0440\u043E\u043D\u0430 \u0432\u0440\u0430\u0433\u0430\u043C, \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C/\u0440\u0430\u0437\u043C\u0435\u0440 \u0432\u0440\u0430\u0433\u043E\u0432 95%."
          },
          normal: {
            label: "\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439",
            desc: "100% \u043F\u043E \u0432\u0441\u0435\u043C \u0431\u043E\u0435\u0432\u044B\u043C \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0430\u043C. \u0411\u043E\u043B\u0435\u0435 \u0432\u044B\u0441\u043E\u043A\u0438\u0439 \u0448\u0430\u043D\u0441 \u043F\u043E\u044F\u0432\u043B\u0435\u043D\u0438\u044F \u0432\u044B\u0441\u043E\u043A\u043E\u0443\u0440\u043E\u0432\u043D\u0435\u0432\u044B\u0445 \u0432\u0440\u0430\u0433\u043E\u0432 \u043D\u0430 \u0441\u043B\u043E\u0436\u043D\u043E\u043C/\u043E\u0447\u0435\u043D\u044C \u0441\u043B\u043E\u0436\u043D\u043E\u043C \u0443\u0440\u043E\u0432\u043D\u0435."
          },
          hard: {
            label: "\u0416\u0435\u0441\u0442\u043A\u0438\u0439",
            desc: "85% \u0443\u0440\u043E\u043D\u0430 \u0438\u0433\u0440\u043E\u043A\u0443, 150% \u0443\u0440\u043E\u043D\u0430 \u0432\u0440\u0430\u0433\u0430\u043C, \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C/\u0440\u0430\u0437\u043C\u0435\u0440 \u0432\u0440\u0430\u0433\u043E\u0432 110%, \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0438\u044F \u0443\u0440\u043E\u0432\u043D\u044F 120%."
          },
          veryhard: {
            label: "\u041E\u0447\u0435\u043D\u044C \u0442\u044F\u0436\u0435\u043B\u043E",
            desc: "70% \u0443\u0440\u043E\u043D\u0430 \u0438\u0433\u0440\u043E\u043A\u0443, 200% \u0443\u0440\u043E\u043D\u0430 \u0432\u0440\u0430\u0433\u0430\u043C, \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C/\u0440\u0430\u0437\u043C\u0435\u0440 \u0432\u0440\u0430\u0433\u043E\u0432 120%, \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0438\u044F \u0443\u0440\u043E\u0432\u043D\u044F 140%."
          }
        },
        deathpenalty: {
          _default: {
            label: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0435\u0441\u0435\u0442",
            desc: "\u041D\u0430\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u044C \u0441\u043C\u0435\u0440\u0442\u043D\u0443\u044E \u043A\u0430\u0437\u043D\u044C \u043E\u0442 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u0435\u0441\u0435\u0442\u0430."
          },
          casual: {
            label: "\u041F\u043E\u0432\u0441\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0439",
            desc: "\u041E\u0431\u043E\u0440\u0443\u0434\u043E\u0432\u0430\u043D\u0438\u0435 \u0445\u0440\u0430\u043D\u0438\u043B\u043E\u0441\u044C \u0434\u043E \u0441\u043C\u0435\u0440\u0442\u0438. \u0418\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u044C \u0443\u043F\u0430\u043B. \u041F\u043E\u0442\u0435\u0440\u044F \u043D\u0430\u0432\u044B\u043A\u043E\u0432: 1%."
          },
          veryeasy: {
            label: "\u041E\u0447\u0435\u043D\u044C \u043B\u0435\u0433\u043A\u043E",
            desc: "\u041E\u0442\u0431\u0440\u043E\u0441\u044C\u0442\u0435 \u0432\u0441\u0435 \u043F\u043E\u0441\u043B\u0435 \u0441\u043C\u0435\u0440\u0442\u0438. \u041F\u043E\u0442\u0435\u0440\u044F \u043D\u0430\u0432\u044B\u043A\u043E\u0432: 1% (\u043C\u0435\u043D\u044C\u0448\u0435 \u043E\u0431\u044B\u0447\u043D\u043E\u0433\u043E)."
          },
          easy: {
            label: "\u041B\u0435\u0433\u043A\u0438\u0439",
            desc: "\u041E\u0442\u0431\u0440\u043E\u0441\u044C\u0442\u0435 \u0432\u0441\u0435 \u043F\u043E\u0441\u043B\u0435 \u0441\u043C\u0435\u0440\u0442\u0438. \u041F\u043E\u0442\u0435\u0440\u044F \u043D\u0430\u0432\u044B\u043A\u043E\u0432: 2,5%."
          },
          normal: {
            label: "\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439",
            desc: "\u041E\u0442\u0431\u0440\u043E\u0441\u044C\u0442\u0435 \u0432\u0441\u0435 \u043F\u043E\u0441\u043B\u0435 \u0441\u043C\u0435\u0440\u0442\u0438. \u041F\u043E\u0442\u0435\u0440\u044F \u043D\u0430\u0432\u044B\u043A\u043E\u0432: 5%."
          },
          hard: {
            label: "\u0416\u0435\u0441\u0442\u043A\u0438\u0439",
            desc: "\u041E\u0431\u043E\u0440\u0443\u0434\u043E\u0432\u0430\u043D\u0438\u0435 \u0432\u044B\u0431\u0440\u043E\u0448\u0435\u043D\u043E, \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u044C \u043E\u043A\u043E\u043D\u0447\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u0443\u043D\u0438\u0447\u0442\u043E\u0436\u0435\u043D. \u041F\u043E\u0442\u0435\u0440\u044F \u043D\u0430\u0432\u044B\u043A\u043E\u0432: 7,5%."
          },
          hardcore: {
            label: "\u0425\u0430\u0440\u0434\u043A\u043E\u0440",
            desc: "\u0412\u0441\u0435 \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u044B \u0438 \u043D\u0430\u0432\u044B\u043A\u0438 \u0431\u0435\u0437\u0432\u043E\u0437\u0432\u0440\u0430\u0442\u043D\u043E \u0442\u0435\u0440\u044F\u044E\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u0441\u043C\u0435\u0440\u0442\u0438."
          }
        },
        resources: {
          _default: {
            label: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0435\u0441\u0435\u0442",
            desc: "\u041D\u0430\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u044C \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0440\u0435\u0441\u0443\u0440\u0441\u0430 \u0438\u0437 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u0435\u0441\u0435\u0442\u0430."
          },
          muchless: {
            label: "\u0413\u043E\u0440\u0430\u0437\u0434\u043E \u043C\u0435\u043D\u044C\u0448\u0435",
            desc: "50% \u043E\u0442 \u043E\u0431\u044B\u0447\u043D\u043E\u0433\u043E \u0448\u0430\u043D\u0441\u0430 \u0432\u044B\u043F\u0430\u0434\u0435\u043D\u0438\u044F \u043C\u043E\u0431\u043E\u0432 \u0438 \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u043E\u0432 (\u22480,5\xD7)."
          },
          less: {
            label: "\u041C\u0435\u043D\u044C\u0448\u0435",
            desc: "75% \u043E\u0442 \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u0438 (\u22480,75\xD7)."
          },
          normal: {
            label: "\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439",
            desc: "\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0438\u0433\u0440\u043E\u0432\u044B\u0445 \u0440\u0435\u0441\u0443\u0440\u0441\u043E\u0432 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E."
          },
          more: {
            label: "\u0411\u043E\u043B\u0435\u0435",
            desc: "150% \u043E\u0442 \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u0438 (\u22481,5\xD7)."
          },
          muchmore: {
            label: "\u0413\u043E\u0440\u0430\u0437\u0434\u043E \u0431\u043E\u043B\u044C\u0448\u0435",
            desc: "200% \u043E\u0442 \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u0438 (\u22482\xD7)."
          },
          most: {
            label: "\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C",
            desc: "300% \u043E\u0442 \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u0438 (\u22483\xD7)."
          }
        },
        raids: {
          _default: {
            label: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0435\u0441\u0435\u0442",
            desc: "\u041D\u0430\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u044C \u0447\u0430\u0441\u0442\u043E\u0442\u0443 \u0440\u0435\u0439\u0434\u043E\u0432 \u0438\u0437 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u0435\u0441\u0435\u0442\u0430."
          },
          none: {
            label: "\u041D\u0438\u043A\u0442\u043E",
            desc: "EventRate 0 \u2014 \u0434\u043D\u0435\u0432\u043D\u044B\u0435 \u0440\u0435\u0439\u0434\u044B \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u044B. \u041D\u043E\u0447\u043D\u044B\u0435 \u0440\u0435\u0439\u0434\u044B \u0432\u0441\u0435 \u0435\u0449\u0435 \u043C\u043E\u0433\u0443\u0442 \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u0442\u044C."
          },
          muchless: {
            label: "\u0413\u043E\u0440\u0430\u0437\u0434\u043E \u043C\u0435\u043D\u044C\u0448\u0435",
            desc: "\u0418\u043D\u0442\u0435\u0440\u0432\u0430\u043B ~92 \u043C\u0438\u043D\u0443\u0442\u044B, \u0432\u0435\u0440\u043E\u044F\u0442\u043D\u043E\u0441\u0442\u044C 10% \u2014 \u0433\u043E\u0440\u0430\u0437\u0434\u043E \u043C\u0435\u043D\u044C\u0448\u0435 \u0440\u0435\u0439\u0434\u043E\u0432."
          },
          less: {
            label: "\u041C\u0435\u043D\u044C\u0448\u0435",
            desc: "\u0418\u043D\u0442\u0435\u0440\u0432\u0430\u043B ~69 \u043C\u0438\u043D\u0443\u0442, \u0432\u0435\u0440\u043E\u044F\u0442\u043D\u043E\u0441\u0442\u044C ~13%."
          },
          normal: {
            label: "\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439",
            desc: "\u0418\u043D\u0442\u0435\u0440\u0432\u0430\u043B ~46 \u043C\u0438\u043D\u0443\u0442, \u0448\u0430\u043D\u0441 20%."
          },
          more: {
            label: "\u0411\u043E\u043B\u0435\u0435",
            desc: "\u0418\u043D\u0442\u0435\u0440\u0432\u0430\u043B ~28 \u043C\u0438\u043D\u0443\u0442, \u0432\u0435\u0440\u043E\u044F\u0442\u043D\u043E\u0441\u0442\u044C ~33%."
          },
          muchmore: {
            label: "\u0413\u043E\u0440\u0430\u0437\u0434\u043E \u0431\u043E\u043B\u044C\u0448\u0435",
            desc: "\u0418\u043D\u0442\u0435\u0440\u0432\u0430\u043B ~14 \u043C\u0438\u043D\u0443\u0442, \u0432\u0435\u0440\u043E\u044F\u0442\u043D\u043E\u0441\u0442\u044C ~67%."
          }
        },
        portals: {
          _default: {
            label: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0435\u0441\u0435\u0442",
            desc: "\u041D\u0430\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u043F\u043E\u0440\u0442\u0430\u043B\u0430 \u0438\u0437 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u043D\u0430\u0431\u043E\u0440\u0430 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A."
          },
          casual: {
            label: "\u041F\u043E\u0432\u0441\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0439",
            desc: "TeleportAll \u2014 \u0447\u0435\u0440\u0435\u0437 \u043F\u043E\u0440\u0442\u0430\u043B\u044B \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u043E\u0445\u043E\u0434\u0438\u0442\u044C \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0432\u0441\u0435 (\u043A\u0440\u043E\u043C\u0435 \u043F\u0440\u0438\u0440\u0443\u0447\u0435\u043D\u043D\u044B\u0445 \u0436\u0438\u0432\u043E\u0442\u043D\u044B\u0445)."
          },
          normal: {
            label: "\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439",
            desc: "\u041D\u0435\u043F\u0435\u0440\u0435\u043D\u043E\u0441\u043D\u044B\u0435 \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u044B \u043F\u043E\u0434\u0447\u0438\u043D\u044F\u044E\u0442\u0441\u044F \u043F\u0440\u0430\u0432\u0438\u043B\u0430\u043C \u0438\u0433\u0440\u044B \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E."
          },
          hard: {
            label: "\u041D\u0435\u0442 \u043F\u043E\u0440\u0442\u0430\u043B\u043E\u0432 \u043A \u0431\u043E\u0441\u0441\u0430\u043C",
            desc: "\u041F\u043E\u0440\u0442\u0430\u043B\u044B \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B, \u043F\u043E\u043A\u0430 \u0432 \u0437\u043E\u043D\u0435 \u0430\u043A\u0442\u0438\u0432\u0435\u043D \u0431\u043E\u0441\u0441."
          },
          veryhard: {
            label: "\u041D\u0435\u0442 \u043F\u043E\u0440\u0442\u0430\u043B\u043E\u0432",
            desc: "\u0412 \u043C\u0438\u0440\u0435 \u043D\u0435\u0442 \u043F\u043E\u0440\u0442\u0430\u043B\u043E\u0432."
          }
        }
      },
      flags: {
        nobuildcost: {
          label: "\u0411\u0435\u0437 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438 \u0441\u0431\u043E\u0440\u043A\u0438",
          desc: "\u0421\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0434\u0435\u0442\u0430\u043B\u0438 \u043D\u0435 \u043F\u043E\u0442\u0440\u0435\u0431\u043B\u044F\u044E\u0442 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u043E\u0432. \u0420\u0435\u0446\u0435\u043F\u0442\u044B \u0435\u0449\u0435 \u043F\u0440\u0435\u0434\u0441\u0442\u043E\u0438\u0442 \u043E\u0442\u043A\u0440\u044B\u0442\u044C."
        },
        playerevents: {
          label: "\u0420\u0435\u0439\u0434\u044B \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0438\u0433\u0440\u043E\u043A\u0430",
          desc: "\u0420\u0435\u0439\u0434\u044B \u043E\u0441\u043D\u043E\u0432\u0430\u043D\u044B \u043D\u0430 \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E\u043C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u0435 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0438\u0433\u0440\u043E\u043A\u0430, \u0430 \u043D\u0435 \u043D\u0430 \u0443\u0431\u0438\u0439\u0441\u0442\u0432\u0435 \u0431\u043E\u0441\u0441\u043E\u0432 \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0435."
        },
        fire: {
          label: "\u041E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C \u043F\u043E\u0436\u0430\u0440\u0430",
          desc: "\u0414\u0435\u0440\u0435\u0432\u043E \u043C\u043E\u0436\u0435\u0442 \u0437\u0430\u0433\u043E\u0440\u0435\u0442\u044C\u0441\u044F, \u0438 \u043E\u0433\u043E\u043D\u044C \u0440\u0430\u0441\u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u043F\u043E \u0432\u0441\u0435\u043C\u0443 \u043C\u0438\u0440\u0443, \u0430 \u043D\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E \u042D\u0448\u043B\u0435\u043D\u0434\u0443."
        },
        passivemobs: {
          label: "\u041F\u0430\u0441\u0441\u0438\u0432\u043D\u044B\u0435 \u0432\u0440\u0430\u0433\u0438",
          desc: "\u0412\u0440\u0430\u0433\u0438 \u043D\u0435 \u0430\u0442\u0430\u043A\u0443\u044E\u0442, \u043F\u043E\u043A\u0430 \u0438\u0445 \u043D\u0435 \u0441\u043F\u0440\u043E\u0432\u043E\u0446\u0438\u0440\u0443\u044E\u0442."
        },
        nomap: {
          label: "\u041D\u0435\u0442 \u043A\u0430\u0440\u0442\u044B",
          desc: "\u041A\u0430\u0440\u0442\u0430 \u0438 \u043C\u0438\u043D\u0438\u043A\u0430\u0440\u0442\u0430 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u044B \u2014 \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E \u043E\u0440\u0438\u0435\u043D\u0442\u0438\u0440\u0430\u043C."
        }
      },
      fields: {
        preset: "\u041F\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430",
        combat: "\u0411\u043E\u0439",
        deathpenalty: "\u0421\u043C\u0435\u0440\u0442\u043D\u0430\u044F \u043A\u0430\u0437\u043D\u044C",
        death: "\u0421\u043C\u0435\u0440\u0442\u044C",
        resources: "\u0420\u0435\u0441\u0443\u0440\u0441\u044B",
        raids: "\u0420\u0435\u0439\u0434\u044B",
        portals: "\u041F\u043E\u0440\u0442\u0430\u043B\u044B"
      },
      badges: {
        awaitingCreation: "\u041E\u0436\u0438\u0434\u0430\u0435\u0442 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F",
        running: "\u0411\u0435\u0433",
        active: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439",
        pending: "\u0412 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0438",
        configBadge: "{preset} \xB7 \u041F\u043E\u0440\u0442\u0430\u043B\u044B: {portals}"
      },
      fallback: {
        gameDefault: "\u0418\u0433\u0440\u0430 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E",
        preset: "\u041F\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430"
      },
      ui: {
        createTitle: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043D\u043E\u0432\u044B\u0439 \u043C\u0438\u0440",
        worldNamePlaceholder: "\u041C\u0438\u0440\u043E\u0432\u043E\u0435 \u0438\u043C\u044F",
        create: "\u0421\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C",
        createAndActivate: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0438 \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
        db: "\u0411\u0414: {value}",
        notCreated: "\u043D\u0435 \u0441\u043E\u0437\u0434\u0430\u043D",
        configBtn: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F",
        activate: "\u0410\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
        settingsTitle: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043C\u0438\u0440\u0430",
        settingsDesc: '\u041C\u043E\u0434\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u0432 \u0444\u0430\u0439\u043B\u0435 <span class="font-mono">.fwl</span> \u2014 \u044D\u043A\u0432\u0438\u0432\u0430\u043B\u0435\u043D\u0442 \u044D\u043A\u0440\u0430\u043D\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043C\u0438\u0440\u0430 \u0432 Valheim.',
        refresh: "\u21BB \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C",
        seed: "\u0421\u0435\u043C\u044F",
        uid: "UID",
        fwlFile: ".fwl-\u0444\u0430\u0439\u043B",
        saveDb: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C .db",
        presetTitle: "\u041F\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430 \u043C\u0438\u0440\u0430",
        detectedFromFwl: "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u043E \u0438\u0437 .fwl",
        custom: "\u041E\u0431\u044B\u0447\u0430\u0439",
        effectiveTitle: "\u042D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F",
        effectiveDesc: "\u0427\u0442\u043E \u0431\u0443\u0434\u0435\u0442 \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u043E \u043A \u043C\u0438\u0440\u0443 \u043F\u043E\u0441\u043B\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F (\u043F\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438 + \u043F\u0435\u0440\u0435\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u044F).",
        modifiersTitle: "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u044B\u0435 \u043C\u043E\u0434\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440\u044B",
        modifiersDesc: "\u041E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440 \xAB\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0443\xBB, \u0447\u0442\u043E\u0431\u044B \u043D\u0430\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0443 \u0432\u044B\u0448\u0435, \u0438\u043B\u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435.",
        seedNewWorld: "\u{1F331} \u0421\u0438\u0434 (\u043D\u043E\u0432\u044B\u0439 \u043C\u0438\u0440)",
        seedPlaceholder: "\u041D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u2014 1\u201310\xA0\u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432.",
        seedHint: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0438 \u043F\u0435\u0440\u0432\u043E\u043C \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0444\u0430\u0439\u043B\u0430 .fwl.",
        advancedTitle: "\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u043D\u044B\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B",
        technicalTitle: "\u0422\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u043E\u0441\u0442\u0438 \u2014 \u0441\u0442\u0440\u043E\u043A\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 .fwl.",
        noModifiers: "\u041D\u0438\u043A\u0430\u043A\u0438\u0445 \u043C\u043E\u0434\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440\u043E\u0432 (\u0432\u0430\u043D\u0438\u043B\u044C\u043D\u044B\u0439/\u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u0438\u0440).",
        saveSettings: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
        saveAndRestart: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C",
        backupHint: '\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0435 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0435\u0433\u043E .fwl \u0432 <span class="font-mono">panel-data/world_fwl_backups/</span> \u043F\u0435\u0440\u0435\u0434 \u043A\u0430\u0436\u0434\u044B\u043C \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435\u043C.',
        restartWarning: "\u041C\u0438\u0440 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u2014 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u043E\u0441\u043B\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F .fwl."
      }
    },
    console: {
      categories: {
        Server: "\u0421\u0435\u0440\u0432\u0435\u0440",
        Moderation: "\u041C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u044F",
        Players: "\u0418\u0433\u0440\u043E\u043A\u0438",
        Chat: "\u0427\u0430\u0442",
        Objects: "\u041E\u0431\u044A\u0435\u043A\u0442\u044B",
        World: "\u041C\u0438\u0440"
      },
      commands: {
        save: {
          usage: "\u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0442\u044C",
          desc: "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043C\u0438\u0440"
        },
        list: {
          usage: "\u0441\u043F\u0438\u0441\u043E\u043A",
          desc: "\u041F\u0435\u0440\u0435\u0447\u0438\u0441\u043B\u044F\u0435\u0442 \u0432\u0441\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u044B \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0435"
        },
        players: {
          usage: "\u0438\u0433\u0440\u043E\u043A\u0438",
          desc: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043E\u043D\u043B\u0430\u0439\u043D-\u0438\u0433\u0440\u043E\u043A\u043E\u0432 \u0441 \u043F\u043E\u0437\u0438\u0446\u0438\u0435\u0439"
        },
        serverStats: {
          usage: "\u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430",
          desc: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430 (FPS, \u041E\u0417\u0423, \u0438\u0433\u0440\u043E\u043A\u0438)"
        },
        time: {
          usage: "\u0432\u0440\u0435\u043C\u044F",
          desc: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0432\u0440\u0435\u043C\u044F \u0438 \u0434\u0435\u043D\u044C \u0441\u0435\u0440\u0432\u0435\u0440\u0430"
        },
        logs: {
          usage: "\u0436\u0443\u0440\u043D\u0430\u043B\u044B",
          desc: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0441\u0442\u0440\u043E\u043A\u0438 \u0436\u0443\u0440\u043D\u0430\u043B\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430"
        },
        consoleCommand: {
          usage: "\u043A\u043E\u043D\u0441\u043E\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043C\u0430\u043D\u0434\u0430 <command>",
          desc: "\u0417\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442 \u043A\u043E\u043D\u0441\u043E\u043B\u044C\u043D\u0443\u044E \u043A\u043E\u043C\u0430\u043D\u0434\u0443 Valheim"
        },
        kick: {
          usage: "\u0443\u0434\u0430\u0440 <player|SteamID>",
          desc: "\u043F\u0438\u043D\u0430\u0435\u0442 \u0438\u0433\u0440\u043E\u043A\u0430"
        },
        ban: {
          usage: "\u0431\u0430\u043D <player|SteamID>",
          desc: "\u0411\u0430\u043D\u044B \u043F\u043E \u0438\u043C\u0435\u043D\u0438 \u0438\u043B\u0438 Steam ID"
        },
        banSteamId: {
          usage: "\u0431\u0430\u043DSteamId <SteamID>",
          desc: "\u0411\u0430\u043D\u044B \u043F\u043E SteamID"
        },
        unban: {
          usage: "\u0440\u0430\u0437\u0431\u0430\u043D\u0438\u0442\u044C <player|SteamID>",
          desc: "\u0421\u043D\u0438\u043C\u0430\u0435\u0442 \u0431\u0430\u043D"
        },
        addAdmin: {
          usage: "\u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 <SteamID>",
          desc: "\u0414\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u0442 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430"
        },
        removeAdmin: {
          usage: "\u0443\u0434\u0430\u043B\u0438\u0442\u044C\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 <SteamID>",
          desc: "\u0423\u0434\u0430\u043B\u044F\u0435\u0442 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430"
        },
        addPermitted: {
          usage: "addPermited <SteamID>",
          desc: "\u0414\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u0442 \u0432 \u0441\u043F\u0438\u0441\u043E\u043A \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u043D\u044B\u0445"
        },
        removePermitted: {
          usage: "\u0443\u0434\u0430\u043B\u0438\u0442\u044C\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u043E <SteamID>",
          desc: "\u0423\u0434\u0430\u043B\u044F\u0435\u0442 \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u043D\u044B\u0445"
        },
        adminlist: {
          usage: "\u0441\u043F\u0438\u0441\u043E\u043A \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u043E\u0432",
          desc: "\u0421\u043F\u0438\u0441\u043A\u0438 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u043E\u0432"
        },
        banlist: {
          usage: "\u0441\u043F\u0438\u0441\u043E\u043A \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D\u043D\u044B\u0445",
          desc: "\u0421\u043F\u0438\u0441\u043A\u0438 \u0437\u0430\u0431\u0430\u043D\u0435\u043D\u043D\u044B\u0445 \u0438\u0433\u0440\u043E\u043A\u043E\u0432"
        },
        permitted: {
          usage: "\u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u043E",
          desc: "\u0421\u043F\u0438\u0441\u043A\u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u043D\u044B\u0445 \u0438\u0433\u0440\u043E\u043A\u043E\u0432"
        },
        disconnectAll: {
          usage: "\u043E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0432\u0441\u0435",
          desc: "\u041E\u0442\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0432\u0441\u0435\u0445 \u0438\u0433\u0440\u043E\u043A\u043E\u0432"
        },
        give: {
          usage: "\u0434\u0430\u0439\u0442\u0435 <player|SteamID> <item> [\u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B]",
          desc: "\u0414\u0430\u0435\u0442 \u043F\u0440\u0435\u0434\u043C\u0435\u0442 \u0438\u0433\u0440\u043E\u043A\u0443"
        },
        heal: {
          usage: "\u0438\u0441\u0446\u0435\u043B\u0438 <player|SteamID> <health>",
          desc: "\u041B\u0435\u0447\u0438\u0442 \u0438\u0433\u0440\u043E\u043A\u0430 \u0434\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u044F"
        },
        damage: {
          usage: "\u0443\u0440\u043E\u043D <player|SteamID> <damage>",
          desc: "\u041D\u0430\u043D\u043E\u0441\u0438\u0442 \u0443\u0440\u043E\u043D \u0438\u0433\u0440\u043E\u043A\u0443"
        },
        teleport: {
          usage: "\u0442\u0435\u043B\u0435\u043F\u043E\u0440\u0442 <player|SteamID> <x> <y> <z>",
          desc: "\u0422\u0435\u043B\u0435\u043F\u043E\u0440\u0442\u0438\u0440\u0443\u0435\u0442 \u0438\u0433\u0440\u043E\u043A\u0430"
        },
        findPlayer: {
          usage: "findPlayer <name>",
          desc: "\u041D\u0430\u0445\u043E\u0434\u0438\u0442 \u0438\u0433\u0440\u043E\u043A\u0430 \u0438 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u043E\u0441\u0442\u0438"
        },
        say: {
          usage: "\u0441\u043A\u0430\u0436\u0438 <message>",
          desc: "\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0432 \u0447\u0430\u0442 (\u043A\u0440\u0438\u043A)"
        },
        showMessage: {
          usage: "showMessage <message>",
          desc: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0432 \u0446\u0435\u043D\u0442\u0440\u0435 \u044D\u043A\u0440\u0430\u043D\u0430 \u0434\u043B\u044F \u0432\u0441\u0435\u0445"
        },
        ping: {
          usage: "\u043F\u0438\u043D\u0433 <x> <y> <z>",
          desc: "\u041A\u0430\u0440\u0442\u0430 \u043F\u0438\u043D\u0433 \u0434\u043B\u044F \u0432\u0441\u0435\u0445"
        },
        spawn: {
          usage: "\u0441\u043F\u0430\u0443\u043D <prefab> <x> <y> <z> [\u043E\u043F\u0446\u0438\u0438]",
          desc: "\u0421\u043E\u0437\u0434\u0430\u0435\u0442 \u043E\u0431\u044A\u0435\u043A\u0442\u044B/\u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0430"
        },
        findObjects: {
          usage: "\u043D\u0430\u0439\u0442\u0438\u041E\u0431\u044A\u0435\u043A\u0442\u044B [\u043E\u043F\u0446\u0438\u0438]",
          desc: "\u041F\u043E\u0438\u0441\u043A \u043E\u0431\u044A\u0435\u043A\u0442\u043E\u0432 \u0432 \u043C\u0438\u0440\u0435"
        },
        addGlobalKey: {
          usage: "\u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044CGlobalKey <key>",
          desc: "\u0414\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u0442 \u0433\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043B\u044E\u0447 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u043F\u043E\u0431\u0435\u0434\u0430 \u043D\u0430\u0434 \u0431\u043E\u0441\u0441\u043E\u043C)"
        },
        removeGlobalKey: {
          usage: "\u0443\u0434\u0430\u043B\u0438\u0442\u044CGlobalKey <key>",
          desc: "\u0423\u0434\u0430\u043B\u044F\u0435\u0442 \u0433\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043B\u044E\u0447"
        },
        globalKeys: {
          usage: "\u0433\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u044B\u0435 \u043A\u043B\u044E\u0447\u0438",
          desc: "\u041F\u0435\u0440\u0435\u0447\u0438\u0441\u043B\u044F\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0433\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u044B\u0435 \u043A\u043B\u044E\u0447\u0438"
        }
      },
      hints: {
        bepinexRequired: "\u041A\u043E\u043D\u0441\u043E\u043B\u044C RCON \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0438 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u043C BepInEx \u2014 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \xAB\u041C\u043E\u0434\u0435\u0440\u043D\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439\xBB \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \xAB\u0421\u0435\u0440\u0432\u0435\u0440\xBB.",
        modRequired: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043C\u043E\u0434 ValheimRcon \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 \xAB\u041C\u043E\u0434\u044B \u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438\xBB, \u0447\u0442\u043E\u0431\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043A\u043E\u043D\u0441\u043E\u043B\u044C \u0438 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u044E.",
        configPending: "\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 RCON \u2014 \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u043F\u0430\u043D\u0435\u043B\u044C \u0438\u043B\u0438 \u0441\u0435\u0440\u0432\u0435\u0440 Valheim.",
        serverStopped: "\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u0441\u0435\u0440\u0432\u0435\u0440, \u0447\u0442\u043E\u0431\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0438\u043D\u0442\u0435\u0440\u0430\u043A\u0442\u0438\u0432\u043D\u0443\u044E \u043A\u043E\u043D\u0441\u043E\u043B\u044C.",
        unavailable: "RCON \u0432 \u0434\u0430\u043D\u043D\u044B\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D."
      },
      placeholder: "\u041A\u043E\u043C\u0430\u043D\u0434\u0430 RCON (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435, \u0441\u043F\u0438\u0441\u043E\u043A, \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0438\u043C\u0435\u043D\u0438...)",
      viewCommands: "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u043A\u043E\u043C\u0430\u043D\u0434",
      inputHints: "\u0410\u0432\u0442\u043E\u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0432\u043A\u043B\u0430\u0434\u043E\u043A \xB7 \u0412\u0432\u043E\u0434 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 \xB7 \u0432\u044B\u0432\u043E\u0434 \u043F\u043E\u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0430\u0445 \u0432\u044B\u0448\u0435",
      moderationActions: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438",
      helpModal: {
        title: "\u041A\u043E\u043C\u0430\u043D\u0434\u044B RCON",
        intro: '\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u0443, \u0447\u0442\u043E\u0431\u044B \u0437\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u043A\u043E\u043D\u0441\u043E\u043B\u044C. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 <code class="text-valheim-gold-light">list</code> \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0435, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043D\u044B\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u044B.',
        searchPlaceholder: "\u041A\u043E\u043C\u0430\u043D\u0434\u0430 \u043F\u043E\u0438\u0441\u043A\u0430...",
        noCommands: "\u041A\u043E\u043C\u0430\u043D\u0434\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B.",
        docPrefix: "\u041F\u043E\u043B\u043D\u0430\u044F \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F:",
        docLink: "ValheimRcon \u043D\u0430 GitHub"
      },
      chart: {
        download: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C",
        upload: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C",
        networkTraffic: "\u0421\u0435\u0442\u0435\u0432\u043E\u0439 \u0442\u0440\u0430\u0444\u0438\u043A (\u0434\u0438\u0430\u0433\u0440\u0430\u043C\u043C\u0430)"
      }
    },
    setup: {
      title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0441\u0435\u0440\u0432\u0435\u0440",
      subtitle: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435, \u043A\u0430\u043A \u0431\u0443\u0434\u0435\u0442 \u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u0441\u0435\u0440\u0432\u0435\u0440 Valheim.",
      serverMode: "\u0420\u0435\u0436\u0438\u043C \u0441\u0435\u0440\u0432\u0435\u0440\u0430",
      modes: {
        vanilla: "\u0412\u0430\u043D\u0438\u043B\u044C",
        bepinex: "\u0421 \u043C\u043E\u0434\u0430\u043C\u0438 (BepInEx)"
      },
      vanillaHint: "\u041D\u0438\u043A\u0430\u043A\u043E\u0433\u043E BepInEx \u0438 \u043D\u0438\u043A\u0430\u043A\u0438\u0445 \u043C\u043E\u0434\u043E\u0432. \u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0441\u0432\u043E\u0439 Steam ID \u0432 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430 \u043D\u0438\u0436\u0435.",
      bepinexHint: "\u0412\u043A\u043B\u044E\u0447\u0430\u0435\u0442 BepInEx, \u0432\u0445\u043E\u0434\u044F\u0449\u0438\u0439 \u0432 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442 \u043C\u043E\u0434 ValheimRcon, \u0438 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0435\u0442 \u043F\u0430\u0440\u043E\u043B\u044C RCON.",
      adminSteamId: "\u0412\u0430\u0448 Steam ID (\u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440)",
      adminSteamIdPlaceholder: "76561198000000000",
      adminSteamIdHint: "\u041D\u0430 \u0434\u0430\u043D\u043D\u044B\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u044D\u0442\u043E \u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u2014 \u0432\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u043E\u0442\u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u043E\u0437\u0436\u0435 \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 \xAB\u0421\u0435\u0440\u0432\u0435\u0440\xBB \u2192 \xAB\u0421\u043F\u0438\u0441\u043A\u0438 \u0438\u0433\u0440\u043E\u043A\u043E\u0432\xBB.",
      firstWorld: "\u041F\u0435\u0440\u0432\u044B\u0439 \u043C\u0438\u0440 (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)",
      firstWorldPlaceholder: "\u041C\u043E\u0439 \u041C\u0438\u0440",
      createAndActivate: "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0438 \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u0443\u0439\u0442\u0435 \u044D\u0442\u043E\u0442 \u043C\u0438\u0440",
      rconPassword: {
        title: "\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C RCON",
        body: "\u041F\u0430\u043D\u0435\u043B\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0438\u043B\u0430 ValheimRcon. \u0421\u043A\u043E\u043F\u0438\u0440\u0443\u0439\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C \u2014 \u043E\u043D \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435 \u0431\u0443\u0434\u0435\u0442 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0442\u044C\u0441\u044F.",
        changeHint: '\u0427\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u043E\u0437\u0436\u0435: \u043E\u0442\u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u0443\u0439\u0442\u0435 <code class="text-gray-400">config/bepinex/org.tristan.rcon.cfg</code> \u0438\u043B\u0438 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435 <code class="text-gray-400">PANEL_RCON_PASSWORD</code> \u0432 .env.'
      }
    },
    dashboard: {
      stats: {
        server: "\u0421\u0435\u0440\u0432\u0435\u0440",
        activeWorld: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u043C\u0438\u0440",
        playersOnline: "\u0418\u0433\u0440\u043E\u043A\u0438 \u043E\u043D\u043B\u0430\u0439\u043D",
        mods: "\u041C\u043E\u0434\u044B",
        port: "\u041F\u043E\u0440\u0442"
      },
      configCorrected: "\u041A\u043E\u043D\u0444\u0438\u0433 \u0438\u0441\u043F\u0440\u0430\u0432\u043B\u0435\u043D: {from} \u2192 {to}",
      performance: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
      metrics: {
        cpu: "CPU",
        ram: "RAM",
        disk: "\u0414\u0438\u0441\u043A (\u0412\u0430\u043B\u044C\u0445\u0435\u0439\u043C)",
        network: "\u0421\u0435\u0442\u044C"
      },
      diskBreakdown: {
        game: "\u0438\u0433\u0440\u0430",
        mods: "\u043C\u043E\u0434\u044B",
        worlds: "\u043C\u0438\u0440\u044B",
        backups: "\u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438"
      },
      connect: {
        title: "\u041A\u0430\u043A \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C\u0441\u044F",
        intro: '\u0412 Valheim \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 <strong class="text-gray-200">Join IP</strong> \u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435:',
        hint: "\u041F\u0430\u0440\u043E\u043B\u044C \u0437\u0430\u0434\u0430\u0435\u0442\u0441\u044F \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \u0421\u0435\u0440\u0432\u0435\u0440. \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 UDP <strong>2456\u20132458</strong> \u043D\u0430 \u0441\u0432\u043E\u0435\u043C \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0438\u0437\u0430\u0442\u043E\u0440\u0435 \u0434\u043B\u044F \u0432\u043D\u0435\u0448\u043D\u0435\u0433\u043E \u0434\u043E\u0441\u0442\u0443\u043F\u0430."
      },
      players: {
        title: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044B\u0435 \u0438\u0433\u0440\u043E\u043A\u0438",
        empty: "\u041D\u0430 \u0434\u0430\u043D\u043D\u044B\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u043D\u0438 \u043E\u0434\u0438\u043D \u0438\u0433\u0440\u043E\u043A \u043D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D.",
        admin: "\u0410\u0434\u043C\u0438\u043D",
        banned: "\u0417\u0430\u043F\u0440\u0435\u0449\u0435\u043D\u043E",
        actions: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u25BE",
        promote: "\u0421\u0434\u0435\u043B\u0430\u0442\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u043E\u043C",
        demote: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430",
        kick: "Kick",
        ban: "Ban",
        unban: "\u0420\u0430\u0437\u0431\u0430\u043D\u0438\u0442\u044C"
      },
      quickControls: {
        title: "\u0411\u044B\u0441\u0442\u0440\u043E\u0435 \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435",
        start: "\u041D\u0430\u0447\u0438\u043D\u0430\u0442\u044C",
        stop: "\u041E\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0442\u044C\u0441\u044F",
        restart: "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A",
        pause: "\u041F\u0430\u0443\u0437\u0430",
        resume: "\u0420\u0435\u0437\u044E\u043C\u0435",
        backup: "\u{1F4BE} \u0420\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0435 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435"
      },
      console: {
        title: "\u041A\u043E\u043D\u0441\u043E\u043B\u044C \u0441\u0435\u0440\u0432\u0435\u0440\u0430 (\u0436\u0438\u0432\u0430\u044F)"
      },
      supervisor: {
        title: "\u0441\u0443\u043F\u0435\u0440\u0432\u0430\u0439\u0437\u0435\u0440"
      }
    },
    server: {
      settings: {
        title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0435\u0440\u0432\u0435\u0440\u0430 (.env)",
        activeWorld: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u043C\u0438\u0440",
        password: "\u041F\u0430\u0440\u043E\u043B\u044C",
        showPassword: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C",
        hidePassword: "\u0421\u043A\u0440\u044B\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C",
        save: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
        saveAndRestart: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C"
      },
      envFields: {
        SERVER_NAME: {
          label: "\u0418\u043C\u044F \u0441\u0435\u0440\u0432\u0435\u0440\u0430",
          hint: "\u041E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u0442\u0441\u044F \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u0438\u0433\u0440\u043E\u0432\u044B\u0445 \u0441\u0435\u0440\u0432\u0435\u0440\u043E\u0432."
        },
        SERVER_PUBLIC: {
          label: "\u041F\u0443\u0431\u043B\u0438\u0447\u043D\u044B\u0439 (\u0438\u0441\u0442\u0438\u043D\u0430/\u043B\u043E\u0436\u044C)",
          hint: "true = \u043E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u043E \u043F\u0443\u0431\u043B\u0438\u0447\u043D\u043E; false = \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u044F\u043C\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435."
        },
        SERVER_ARGS: {
          label: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440. -crossplay, \u0447\u0442\u043E\u0431\u044B \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043A\u0440\u043E\u0441\u0441-\u0438\u0433\u0440\u0443."
        }
      },
      capacity: {
        title: "\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C \u0441\u0435\u0440\u0432\u0435\u0440\u0430",
        subtitle: "\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043E\u043F\u0435\u0440\u0430\u0442\u0438\u0432\u043D\u043E\u0439 \u043F\u0430\u043C\u044F\u0442\u0438 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u0430 \u0438 \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0438\u0433\u0440\u043E\u043A\u043E\u0432.",
        wikiGuide: "\u0412\u0438\u043A\u0438-\u043F\u0443\u0442\u0435\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C",
        ramLimit: "\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u041E\u0417\u0423",
        current: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439: {value}",
        applyRamLimit: "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u041E\u0417\u0423",
        ramWarning: "\u041F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u043F\u0435\u0440\u0435\u0441\u043E\u0437\u0434\u0430\u0435\u0442 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u2014 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044B\u0435 \u0438\u0433\u0440\u043E\u043A\u0438 \u0431\u0443\u0434\u0443\u0442 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u044B.",
        playerLimit: "\u041B\u0438\u043C\u0438\u0442 \u0438\u0433\u0440\u043E\u043A\u043E\u0432",
        modSource: "\u041C\u043E\u0434: {name}",
        vanillaMax: "\u0412\u0430\u043D\u0438\u043B\u044C (\u043C\u0430\u043A\u0441. 10)",
        playersAbove10: "\u0414\u043B\u044F \u0431\u043E\u043B\u0435\u0435 10 \u0438\u0433\u0440\u043E\u043A\u043E\u0432 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F Valheim Plus \u0438\u043B\u0438 MaxPlayerCount \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \xAB\u041C\u043E\u0434\u044B\xBB.",
        savePlayerLimit: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043B\u0438\u043C\u0438\u0442 \u0438\u0433\u0440\u043E\u043A\u043E\u0432",
        table: {
          players: "\u0418\u0433\u0440\u043E\u043A\u0438",
          suggestedRam: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u043C\u0430\u044F \u043E\u043F\u0435\u0440\u0430\u0442\u0438\u0432\u043D\u0430\u044F \u043F\u0430\u043C\u044F\u0442\u044C",
          notes: "\u041F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u044F"
        }
      },
      playerLists: {
        title: "\u0421\u043F\u0438\u0441\u043A\u0438 \u0438\u0433\u0440\u043E\u043A\u043E\u0432",
        vanillaHint: "\u0412 \u0440\u0435\u0436\u0438\u043C\u0435 <b>Vanilla</b> \u0434\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0441\u0432\u043E\u0439 Steam ID \u0432 \u0440\u0430\u0437\u0434\u0435\u043B <b>\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u044B</b> \u0434\u043B\u044F \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043F\u0440\u0430\u0432 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430 \u0432 \u0438\u0433\u0440\u0435 (\u0431\u0435\u0437 \u043F\u0430\u043D\u0435\u043B\u0438 \u043A\u043E\u043D\u0441\u043E\u043B\u0438 RCON).",
        admin: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u044B (Steam ID)",
        banned: "\u0417\u0430\u0431\u0430\u043D\u0435\u043D (\u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440\u044B Steam)",
        permitted: "\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u043E/\u0431\u0435\u043B\u044B\u0439 \u0441\u043F\u0438\u0441\u043E\u043A (Steam ID)",
        saveLists: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0441\u043F\u0438\u0441\u043A\u0438"
      }
    },
    storage: {
      title: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0433\u043E \u0434\u0438\u0441\u043A\u0430",
      intro: '\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043D\u0430 <code class="text-gray-400">config/backups/</code> ZIP-\u0444\u0430\u0439\u043B\u044B. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <span class="text-valheim-gold font-medium">Unlimited</span>, \u0447\u0442\u043E\u0431\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0432\u0441\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438, \u0438\u043B\u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0437\u043C\u0435\u0440 \u2014 \u043F\u0440\u0438 \u043F\u0440\u0435\u0432\u044B\u0448\u0435\u043D\u0438\u0438 \u043B\u0438\u043C\u0438\u0442\u0430 \u0441\u0430\u043C\u044B\u0435 \u0441\u0442\u0430\u0440\u044B\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438 \u0443\u0434\u0430\u043B\u044F\u044E\u0442\u0441\u044F \u043F\u0435\u0440\u0432\u044B\u043C\u0438.',
      totalLimit: "\u041E\u0431\u0449\u0438\u0439 \u043B\u0438\u043C\u0438\u0442 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0433\u043E \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F",
      unlimitedKeep: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438 \u0445\u0440\u0430\u043D\u044F\u0442\u0441\u044F \u0434\u043E \u0442\u0435\u0445 \u043F\u043E\u0440, \u043F\u043E\u043A\u0430 \u043D\u0435 \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u0442\u0441\u044F \u043C\u0435\u0441\u0442\u043E \u043D\u0430 \u0434\u0438\u0441\u043A\u0435.",
      oldestDeleted: "\u0421\u0430\u043C\u044B\u0435 \u0441\u0442\u0430\u0440\u044B\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438 \u0443\u0434\u0430\u043B\u044F\u044E\u0442\u0441\u044F \u0432 \u043F\u0435\u0440\u0432\u0443\u044E \u043E\u0447\u0435\u0440\u0435\u0434\u044C, \u043A\u043E\u0433\u0434\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0435\u0442 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0439 \u0432\u044B\u0448\u0435 \u043F\u0440\u0435\u0434\u0435\u043B.",
      currentUsage: "\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435",
      saveLimit: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043B\u0438\u043C\u0438\u0442 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0433\u043E \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F",
      clearAll: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0432\u0441\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438 \u0441\u0435\u0439\u0447\u0430\u0441",
      clearAllHint: "\u041D\u0435\u043E\u0431\u0440\u0430\u0442\u0438\u043C\u044B\u0439 \u2014 \u0443\u0434\u0430\u043B\u044F\u0435\u0442 \u0432\u0441\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 ZIP-\u0444\u0430\u0439\u043B\u044B, \u043A\u0440\u043E\u043C\u0435 \u0442\u0435\u0445, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D\u044B \u043A \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0438\u043B\u0438 \u043E\u0442\u043C\u0435\u043D\u044B.",
      purgeModal: {
        title: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0432\u0441\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438",
        body: '\u042D\u0442\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 <strong>irreversible</strong>. \u0412\u0441\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 ZIP-\u0444\u0430\u0439\u043B\u044B \u0432 <code class="text-gray-400">config/backups/</code> \u0431\u0443\u0434\u0443\u0442 \u0443\u0434\u0430\u043B\u0435\u043D\u044B.',
        preserved: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438, \u0441\u0432\u044F\u0437\u0430\u043D\u043D\u044B\u0435 \u0441 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u043E\u0439 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0438\u043B\u0438 \u043E\u0442\u043C\u0435\u043D\u044B, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F.",
        deleteAll: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u0441\u0435"
      },
      usageNoLimit: "{used} \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u043E (\u0431\u0435\u0437 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0439)",
      usageOfLimit: "{used} \u0438\u0437 {limit} \u0413\u0411"
    },
    updates: {
      title: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0438\u0433\u0440\u044B",
      subtitle: "\u0423\u043F\u0440\u0430\u0432\u043B\u044F\u0439\u0442\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F\u043C\u0438 Valheim \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E valheim-updater (SteamCMD).",
      modsWarning: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F Valheim \u043C\u043E\u0433\u0443\u0442 \u043D\u0430\u0440\u0443\u0448\u0438\u0442\u044C \u0440\u0430\u0431\u043E\u0442\u0443 \u043C\u043E\u0434\u043E\u0432. \u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u0434\u0435\u043B\u0430\u0439\u0442\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0443\u044E \u043A\u043E\u043F\u0438\u044E. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u043C\u043E\u0434\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0438\u0433\u0440\u044B.",
      serverMode: "\u0420\u0435\u0436\u0438\u043C \u0441\u0435\u0440\u0432\u0435\u0440\u0430",
      modeHint: "Vanilla \u043E\u0442\u043A\u043B\u044E\u0447\u0430\u0435\u0442 BepInEx \u0438 \u0432\u0441\u0435 \u043C\u043E\u0434\u044B. \u0421 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u043C\u043E\u0434\u043E\u0432 \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442\u0441\u044F BepInEx \u0438 \u0432\u0445\u043E\u0434\u044F\u0449\u0438\u0439 \u0432 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442 ValheimRcon.",
      installedVersion: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043D\u0430\u044F \u0432\u0435\u0440\u0441\u0438\u044F",
      build: "\u0421\u0442\u0440\u043E\u0438\u0442\u044C",
      updater: "\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0439",
      autoUpdate: "\u0410\u0432\u0442\u043E\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0438\u0433\u0440\u044B",
      onlyWhenEmpty: "\u0422\u043E\u043B\u044C\u043A\u043E \u043A\u043E\u0433\u0434\u0430 \u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u0443\u0441\u0442",
      checkInterval: "\u0418\u043D\u0442\u0435\u0440\u0432\u0430\u043B \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438",
      customCron: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 cron",
      save: "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0442\u044C",
      saveRecreate: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438 \u0432\u043E\u0441\u0441\u043E\u0437\u0434\u0430\u0442\u044C \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440",
      checkNow: "\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043D\u0430\u043B\u0438\u0447\u0438\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0439 \u0441\u0435\u0439\u0447\u0430\u0441",
      presets: {
        "15min": "\u041A\u0430\u0436\u0434\u044B\u0435 15 \u043C\u0438\u043D\u0443\u0442",
        "1h": "\u041A\u0430\u0436\u0434\u044B\u0439 \u0447\u0430\u0441",
        "6h": "\u041A\u0430\u0436\u0434\u044B\u0435 6 \u0447\u0430\u0441\u043E\u0432",
        daily: "\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u043E (06:00)",
        custom: "\u041E\u0431\u044B\u0447\u0430\u0439"
      }
    },
    mods: {
      install: {
        title: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043C\u043E\u0434",
        upload: "\u{1F4C1} \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 (.zip/.dll)",
        urlPlaceholder: "URL-\u0430\u0434\u0440\u0435\u0441 Thunderstore (\u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430, \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0438\u043B\u0438 r2modman)",
        installUrl: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0441 URL-\u0430\u0434\u0440\u0435\u0441\u0430"
      },
      valheimRcon: '<strong class="text-valheim-gold">ValheimRcon</strong> \u0438\u0434\u0435\u0442 \u0432 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0435 \u0441 \u043F\u0430\u043D\u0435\u043B\u044C\u044E (\u043A\u043E\u043D\u0441\u043E\u043B\u044C RCON, \u043A\u0438\u043A, \u0431\u0430\u043D \u0438 \u0430\u0434\u043C\u0438\u043D). \u0415\u0433\u043E \u043D\u0435\u043B\u044C\u0437\u044F \u0443\u0434\u0430\u043B\u0438\u0442\u044C, \u043D\u043E \u043C\u043E\u0436\u043D\u043E \u043E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C. \u0414\u043B\u044F \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439 \u043A\u043E\u043D\u0441\u043E\u043B\u0438 \u0438 \u0438\u0433\u0440\u043E\u043A\u0430 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 BepInEx \u0438 \u044D\u0442\u043E\u0442 \u043C\u043E\u0434.',
      bundled: "\u0412 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0435",
      bundledCannotRemove: "\u0412 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0435 \u2014 \u043D\u0435\u043B\u044C\u0437\u044F \u0443\u0434\u0430\u043B\u0438\u0442\u044C",
      active: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439",
      disabled: "\u041D\u0435\u043F\u043E\u043B\u043D\u043E\u0446\u0435\u043D\u043D\u044B\u0439",
      activeConsole: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u2014 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u043A\u043E\u043D\u0441\u043E\u043B\u044C \u0438 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u044F.",
      disabledConsole: "\u041E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u2014 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u043D\u0441\u043E\u043B\u0438 \u0438 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u044E.",
      configPrefix: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F: {name}",
      noConfig: "\u041D\u0435\u0442 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438",
      version: "\u0412\u0435\u0440\u0441\u0438\u044F",
      checkUpdates: "\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043D\u0430\u043B\u0438\u0447\u0438\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0439",
      updateMod: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043C\u043E\u0434",
      linkThunderstore: "\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 Thunderstore",
      linkUrlPlaceholder: "URL-\u0430\u0434\u0440\u0435\u0441 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430 Thunderstore",
      configBtn: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F",
      remove: "\u0423\u0434\u0430\u043B\u044F\u0442\u044C",
      empty: "\u041C\u043E\u0434\u044B \u043D\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u044B",
      orphaned: {
        title: "\u041F\u043E\u0442\u0435\u0440\u044F\u043D\u043D\u044B\u0435 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438",
        desc: "{count} \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u0444\u0430\u0439\u043B\u044B \u0438\u0437 \u0443\u0434\u0430\u043B\u0435\u043D\u043D\u044B\u0445 \u043C\u043E\u0434\u043E\u0432 \u0432\u0441\u0435 \u0435\u0449\u0435 \u043D\u0430\u0445\u043E\u0434\u044F\u0442\u0441\u044F \u043D\u0430 \u0434\u0438\u0441\u043A\u0435.",
        remove: "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u043D\u044B\u0445 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0439"
      },
      export: {
        title: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u0444\u0438\u043B\u044C r2modman",
        desc: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u0443\u0435\u0442 \u043C\u043E\u0434\u044B, \u0441\u0432\u044F\u0437\u0430\u043D\u043D\u044B\u0435 \u0441 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F\u043C\u0438 Thunderstore \u0438 BepInEx, \u0434\u043B\u044F \u0438\u043C\u043F\u043E\u0440\u0442\u0430 \u0432 r2modman. \u041D\u0435\u0441\u0432\u044F\u0437\u0430\u043D\u043D\u044B\u0435 \u043C\u043E\u0434\u044B \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430\u044E\u0442\u0441\u044F.",
        skipped: "\u041C\u043E\u0434\u044B {count} \u0431\u0435\u0437 \u0441\u0441\u044B\u043B\u043A\u0438 \u043D\u0430 Thunderstore \u0431\u0443\u0434\u0443\u0442 \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u044B.",
        downloadR2z: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C .r2z"
      },
      bepinexConfigs: {
        title: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438 \u0411\u0435\u043F\u0438\u043D\u0435\u043A\u0441",
        desc: '\u0424\u0430\u0439\u043B\u044B \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438, \u0441\u043E\u0437\u0434\u0430\u043D\u043D\u044B\u0435 \u043C\u043E\u0434\u0430\u043C\u0438, \u043D\u0430\u0445\u043E\u0434\u044F\u0442\u0441\u044F \u0432 <code class="font-mono">config/bepinex/</code>.',
        empty: "\u0424\u0430\u0439\u043B\u044B \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B",
        edit: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C"
      },
      status: {
        up_to_date: "\u0414\u043E \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0435\u0433\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438",
        update_available: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435",
        unknown: "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A",
        error: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"
      }
    },
    backups: {
      state: {
        title: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0441\u0435\u0440\u0432\u0435\u0440\u0430",
        restoredFrom: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E \u0441: {name}",
        live: "\u0421\u0435\u0440\u0432\u0435\u0440 \u0432 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0438 <strong>live</strong> \u2014 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0430\u043D\u0435\u043B\u0438 \u043D\u0435 \u0437\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043E.",
        lastRestore: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435: {date}",
        restoreLatest: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u044E\u044E \u0432\u0435\u0440\u0441\u0438\u044E",
        undoRestore: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435",
        hint: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0432\u0441\u0435\u0433\u0434\u0430 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442 \u0441\u0435\u0440\u0432\u0435\u0440. \u041F\u0435\u0440\u0435\u0434 \u043A\u0430\u0436\u0434\u044B\u043C \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435\u043C \u0441\u043E\u0437\u0434\u0430\u0435\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F \u0442\u043E\u0447\u043A\u0430."
      },
      schedule: {
        title: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435",
        info: '\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 Valheim \u043F\u0435\u0440\u0438\u043E\u0434\u0438\u0447\u0435\u0441\u043A\u0438 \u043A\u043E\u043F\u0438\u0440\u0443\u0435\u0442 \u043F\u0430\u043F\u043A\u0443 <code class="text-gray-400">worlds_local/</code> \u0432 <code class="text-gray-400">config/backups/</code>. \u0424\u0430\u0439\u043B\u044B \u0438\u043C\u0435\u044E\u0442 \u0432\u0438\u0434 <code class="text-gray-400">worlds-\u0413\u0413\u0413\u0413\u041C\u041C\u0414\u0414-\u0427\u0427\u041C\u041C\u0421\u0421.zip</code>. \u0425\u0440\u0430\u043D\u0435\u043D\u0438\u0435: 30 \u0434\u043D\u0435\u0439.',
        automatic: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0435 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435",
        enabled: "\u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E",
        disabled: "\u041D\u0435\u043F\u043E\u043B\u043D\u043E\u0446\u0435\u043D\u043D\u044B\u0439",
        interval: "\u0418\u043D\u0442\u0435\u0440\u0432\u0430\u043B",
        customCron: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 cron",
        retention: "\u0423\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435",
        retentionValue: "30 \u0434\u043D\u0435\u0439",
        idleLabel: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0435 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435, \u043A\u043E\u0433\u0434\u0430 \u043D\u0435\u0442 \u0438\u0433\u0440\u043E\u043A\u043E\u0432 \u043E\u043D\u043B\u0430\u0439\u043D",
        idleYes: "\u0414\u0430 \u2014 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0435 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435, \u0434\u0430\u0436\u0435 \u0435\u0441\u043B\u0438 \u043E\u043D\u043E \u043F\u0443\u0441\u0442\u043E",
        idleNo: "\u0422\u043E\u043B\u044C\u043A\u043E \u043A\u043E\u0433\u0434\u0430 \u0438\u0433\u0440\u043E\u043A\u0438 \u043E\u043D\u043B\u0430\u0439\u043D",
        current: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439: {value}",
        applyRestart: "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C",
        manual: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0443\u044E \u043A\u043E\u043F\u0438\u044E \u0432\u0440\u0443\u0447\u043D\u0443\u044E",
        runScheduled: "\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0437\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435 \u0441\u0435\u0439\u0447\u0430\u0441",
        runScheduledTitle: "\u0422\u0435\u043F\u0435\u0440\u044C \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F \u0442\u043E \u0436\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u044F\u0435\u0442\u0441\u044F \u0432 \u0437\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0438\u043D\u0442\u0435\u0440\u0432\u0430\u043B."
      },
      intervalPresets: {
        hourly: "\u041A\u0430\u0436\u0434\u044B\u0439 \u0447\u0430\u0441",
        "6h": "\u041A\u0430\u0436\u0434\u044B\u0435 6 \u0447\u0430\u0441\u043E\u0432",
        "12h": "\u041A\u0430\u0436\u0434\u044B\u0435 12 \u0447\u0430\u0441\u043E\u0432",
        daily: "\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u043E (00:00)",
        custom: "\u041E\u0431\u044B\u0447\u0430\u0439"
      },
      idleLabels: {
        online: "\u0422\u043E\u043B\u044C\u043A\u043E \u043A\u043E\u0433\u0434\u0430 \u0438\u0433\u0440\u043E\u043A\u0438 \u043E\u043D\u043B\u0430\u0439\u043D",
        empty: "\u0414\u0430, \u0434\u0430\u0436\u0435 \u0431\u0435\u0437 \u0438\u0433\u0440\u043E\u043A\u043E\u0432"
      },
      list: {
        title: "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043D\u044B\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438",
        hideCheckpoints: "\u0421\u043A\u0440\u044B\u0442\u044C \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u044B\u0435 \u0442\u043E\u0447\u043A\u0438",
        empty: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B \u0432 config/backups/",
        columns: {
          type: "\u0422\u0438\u043F",
          name: "\u0418\u043C\u044F",
          date: "\u0414\u0430\u0442\u0430",
          age: "\u0412\u043E\u0437\u0440\u0430\u0441\u0442",
          size: "\u0420\u0430\u0437\u043C\u0435\u0440",
          mods: "\u041C\u043E\u0434\u044B",
          actions: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F"
        },
        badges: {
          active: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439",
          latest: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439",
          checkpoint: "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u043E-\u043F\u0440\u043E\u043F\u0443\u0441\u043A\u043D\u043E\u0439 \u043F\u0443\u043D\u043A\u0442"
        },
        activeMods: "{count} \u0430\u043A\u0442\u0438\u0432\u0435\u043D",
        restoreToHere: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0441\u044E\u0434\u0430",
        details: "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u043E\u0441\u0442\u0438"
      },
      types: {
        world: {
          label: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u043C\u0438\u0440 (\u0431\u044B\u0441\u0442\u0440\u043E)",
          desc: "\u0422\u043E\u043B\u044C\u043A\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C\u044B\u0439 \u043C\u0438\u0440 (.fwl + .db)."
        },
        full: {
          label: "\u041F\u043E\u043B\u043D\u044B\u0439",
          desc: "\u041C\u0438\u0440\u044B + \u043A\u043E\u043D\u0444\u0438\u0433\u0438 BepInEx + \u043C\u043E\u0434\u044B + \u0441\u043F\u0438\u0441\u043A\u0438 + .env."
        },
        configs: {
          label: "\u0422\u043E\u043B\u044C\u043A\u043E \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438",
          desc: "\u041A\u043E\u043D\u0444\u0438\u0433\u0438 BepInEx+\u0441\u043F\u0438\u0441\u043A\u0438 \u0438\u0433\u0440\u043E\u043A\u043E\u0432+.env."
        }
      },
      modals: {
        create: {
          title: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0443\u044E \u043A\u043E\u043F\u0438\u044E",
          desc: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043F \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0439 \u043A\u043E\u043F\u0438\u0438 \u0432\u0440\u0443\u0447\u043D\u0443\u044E, \u043A\u043E\u0442\u043E\u0440\u0443\u044E \u043D\u0443\u0436\u043D\u043E \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441.",
          creating: "\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0439 \u043A\u043E\u043F\u0438\u0438..."
        },
        restore: {
          title: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0443\u044E \u043A\u043E\u043F\u0438\u044E",
          intro: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435 \u0441\u0435\u0440\u0432\u0435\u0440 \u0434\u043E \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u044D\u0442\u043E\u0439 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0439 \u043A\u043E\u043F\u0438\u0438:",
          name: "\u0418\u043C\u044F:",
          type: "\u0422\u0438\u043F:",
          date: "\u0414\u0430\u0442\u0430:",
          bullets: [
            "\u0421\u0435\u0440\u0432\u0435\u0440 \u0431\u0443\u0434\u0435\u0442 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0449\u0435\u043D \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438",
            "\u0424\u0430\u0439\u043B\u044B \u043C\u0438\u0440\u0430/\u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438 \u0431\u0443\u0434\u0443\u0442 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0438\u0441\u0430\u043D\u044B.",
            "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0431\u0443\u0434\u0435\u0442 \u0441\u043E\u0437\u0434\u0430\u043D\u0430 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u0430\u044F \u0442\u043E\u0447\u043A\u0430 \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F."
          ],
          confirm: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C"
        },
        delete: {
          title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0443\u044E \u043A\u043E\u043F\u0438\u044E",
          confirm: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C {name} \u043D\u0430\u0432\u0441\u0435\u0433\u0434\u0430?"
        },
        details: {
          title: "\u0421\u0432\u0435\u0434\u0435\u043D\u0438\u044F \u043E \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u043C \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0438",
          loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0435\u0442\u0430\u043B\u0435\u0439...",
          world: "\u041C\u0438\u0440:",
          build: "\u0421\u0431\u043E\u0440\u043A\u0430 \u0412\u0430\u043B\u0445\u0435\u0439\u043C\u0430:",
          inferred: "\u041C\u0435\u0442\u0430\u0434\u0430\u043D\u043D\u044B\u0435, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043D\u044B\u0435 \u0438\u0437 ZIP \u2014 \u0432\u0435\u0440\u0441\u0438\u0438 Thunderstore \u043C\u043E\u0433\u0443\u0442 \u0431\u044B\u0442\u044C \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B.",
          modsTitle: "\u041C\u043E\u0434\u044B ({count})",
          noMods: "\u0412 \u044D\u0442\u043E\u0439 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0439 \u043A\u043E\u043F\u0438\u0438 \u043D\u0435 \u0437\u0430\u043F\u0438\u0441\u0430\u043D\u043E \u043D\u0438\u043A\u0430\u043A\u0438\u0445 \u043C\u043E\u0434\u043E\u0432.",
          columns: {
            mod: "\u041C\u043E\u0434",
            package: "\u0423\u043F\u0430\u043A\u043E\u0432\u043A\u0430",
            version: "\u0412\u0435\u0440\u0441\u0438\u044F",
            state: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435"
          },
          contents: "\u0421\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435",
          includesWorlds: "\u041C\u0438\u0440\u044B \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u044B",
          includesDlls: "\u0412\u043A\u043B\u044E\u0447\u0435\u043D\u044B DLL-\u043C\u043E\u0434\u0443\u043B\u0438",
          includesEnv: ".env-\u0444\u0430\u0439\u043B \u0432\u043A\u043B\u044E\u0447\u0435\u043D",
          hasAdminlist: "\u0421\u043F\u0438\u0441\u043E\u043A \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u043E\u0432",
          fileCount: "{count} \u0444\u0430\u0439\u043B(\u044B) \u0432 ZIP",
          worldsList: "\u041C\u0438\u0440\u044B: {names}"
        }
      },
      contentsNotes: {
        noDlls: "\u042D\u0442\u0430 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F \u043D\u0435 \u0432\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0444\u0430\u0439\u043B\u044B \u043C\u043E\u0434\u043E\u0432 (.dll) \u2014 \u0441\u043F\u0438\u0441\u043E\u043A \u043D\u0438\u0436\u0435 \u043E\u0442\u0440\u0430\u0436\u0430\u0435\u0442 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0433\u043E \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F.",
        configsOnly: "\u042D\u0442\u0430 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u043C\u0438\u0440/\u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438 \u2014 \u043C\u043E\u0434\u044B \u043D\u0435 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u044B. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u043E\u0435 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0432\u0440\u0443\u0447\u043D\u0443\u044E \u2014 \u043F\u043E\u043B\u043D\u043E\u0435 \u0434\u043B\u044F \u043C\u043E\u043C\u0435\u043D\u0442\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0441\u043D\u0438\u043C\u043A\u0430 \u0441 DLL."
      }
    },
    files: {
      searchPlaceholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0438\u043C\u0435\u043D\u0438 \u0444\u0430\u0439\u043B\u0430...",
      browser: "\u0411\u0440\u0430\u0443\u0437\u0435\u0440",
      noMatches: "\u041D\u0435\u0442 \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0439",
      selectFile: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u0434\u043B\u044F \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F",
      searchSettings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u043E\u0438\u0441\u043A\u0430...",
      form: "Form",
      raw: "Raw",
      scopes: {
        config: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F",
        data: "\u0414\u0430\u043D\u043D\u044B\u0435"
      },
      typeFilters: {
        all: "\u0412\u0441\u0435",
        config: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F",
        dll: "\u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0438 DLL",
        plugin: "Plugins",
        world: "\u041C\u0438\u0440\u044B",
        list: "\u0421\u043F\u0438\u0441\u043A\u0438",
        backup: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438",
        log: "\u0416\u0443\u0440\u043D\u0430\u043B\u044B"
      },
      tree: {
        emptyFolder: "\u041F\u0443\u0441\u0442\u0430\u044F \u043F\u0430\u043F\u043A\u0430",
        inaccessible: "\u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0439"
      }
    },
    logs: {
      docker: "\u0414\u043E\u043A\u0435\u0440",
      bepinex: "\u0411\u0435\u043F\u0418\u043D\u042D\u043A\u0441",
      autoRefresh: "\u0410\u0432\u0442\u043E (5 \u0441)"
    },
    audit: {
      downloadLog: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043F\u043E\u043B\u043D\u044B\u0439 \u0436\u0443\u0440\u043D\u0430\u043B",
      autoRefresh: "\u0410\u0432\u0442\u043E (5 \u0441)",
      description: "\u041F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u044B\u0439 \u0436\u0443\u0440\u043D\u0430\u043B \u0432\u0441\u0435\u0445 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439 (POST/PUT/DELETE) \u0434\u043B\u044F \u0434\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0438 \u0438 \u0443\u0441\u0442\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u043E\u0448\u0438\u0431\u043E\u043A.",
      empty: "\u041D\u0438\u043A\u0430\u043A\u0438\u0445 \u0441\u043E\u0431\u044B\u0442\u0438\u0439 \u043D\u0435 \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E",
      columns: {
        time: "\u0412\u0440\u0435\u043C\u044F",
        method: "\u041C\u0435\u0442\u043E\u0434",
        action: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
        status: "\u0421\u0442\u0430\u0442\u0443\u0441",
        duration: "\u0414\u0443\u0440.",
        error: "\u041E\u0448\u0438\u0431\u043A\u0430",
        details: "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u043E\u0441\u0442\u0438"
      },
      modal: {
        title: "\u0414\u0435\u0442\u0430\u043B\u0438 \u0430\u0443\u0434\u0438\u0442\u0430",
        request: "\u0417\u0430\u043F\u0440\u043E\u0441",
        response: "\u041E\u0442\u0432\u0435\u0442"
      }
    },
    donation: {
      title: "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043F\u0440\u043E\u0435\u043A\u0442",
      pitch: "Vikinger Panel \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u0430 \u0434\u043B\u044F \u043B\u0438\u0447\u043D\u043E\u0433\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F. \u0421\u043F\u043E\u043D\u0441\u043E\u0440\u044B \u043F\u043E\u043C\u043E\u0433\u0430\u044E\u0442 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u0435\u043A\u0442 \u0438 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0442\u044C \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0443. \u0423\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u0438 \u0441 \u043E\u043F\u043B\u0430\u0442\u043E\u0439 \u0431\u043E\u043B\u0435\u0435 1 \u0434\u043E\u043B\u043B\u0430\u0440\u0430 \u0432 \u043C\u0435\u0441\u044F\u0446 \u043F\u043E\u043B\u0443\u0447\u0430\u044E\u0442 \u043F\u0440\u044F\u043C\u0443\u044E \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0443 \u043E\u0442 \u0441\u043E\u043F\u0440\u043E\u0432\u043E\u0436\u0434\u0430\u044E\u0449\u0435\u0433\u043E. \u0421\u043F\u043E\u043D\u0441\u043E\u0440\u0441\u0442\u0432\u043E \u043D\u0435 \u0437\u0430\u043C\u0435\u043D\u044F\u0435\u0442 \u043A\u043E\u043C\u043C\u0435\u0440\u0447\u0435\u0441\u043A\u0443\u044E \u043B\u0438\u0446\u0435\u043D\u0437\u0438\u044E \u2014 \u043E\u043D\u0430 \u0432\u0441\u0435 \u0440\u0430\u0432\u043D\u043E \u043D\u0443\u0436\u043D\u0430 \u0445\u043E\u0441\u0442\u0438\u043D\u0433-\u043F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u0430\u043C (\u0441\u043C. \u043D\u0438\u0436\u0435).",
      voluntary: {
        title: "\u0414\u043E\u0431\u0440\u043E\u0432\u043E\u043B\u044C\u043D\u044B\u0435 \u043F\u043E\u0436\u0435\u0440\u0442\u0432\u043E\u0432\u0430\u043D\u0438\u044F",
        desc: "\u041F\u0430\u043D\u0435\u043B\u044C \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u0430 \u0434\u043B\u044F \u043B\u0438\u0447\u043D\u043E\u0433\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F. \u0415\u0441\u043B\u0438 \u044D\u0442\u043E \u0432\u0430\u043C \u043F\u043E\u043C\u043E\u0436\u0435\u0442, \u043B\u044E\u0431\u043E\u0439 \u0432\u043A\u043B\u0430\u0434 \u043F\u043E\u0439\u0434\u0435\u0442 \u043D\u0430 \u0444\u0438\u043D\u0430\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043D\u043E\u0432\u044B\u0445 \u0444\u0443\u043D\u043A\u0446\u0438\u0439, \u0438\u0441\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0439 \u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u0438."
      },
      pix: "\u041F\u0438\u043A\u0441 (\u0411\u0440\u0430\u0437\u0438\u043B\u0438\u044F)",
      notConfigured: '\u0421\u0441\u044B\u043B\u043A\u0438 \u0434\u043B\u044F \u043F\u043E\u0436\u0435\u0440\u0442\u0432\u043E\u0432\u0430\u043D\u0438\u0439 \u0435\u0449\u0435 \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u044B. \u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435 <code class="text-gray-400">PANEL_DONATION_*</code> \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0435 <code class="text-gray-400">.env</code>.',
      commercial: {
        title: "\u041A\u043E\u043C\u043C\u0435\u0440\u0447\u0435\u0441\u043A\u043E\u0435 \u043B\u0438\u0446\u0435\u043D\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435",
        intro: '<strong class="text-gray-200">\u0425\u043E\u0441\u0442\u0438\u043D\u0433-\u043F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u0430\u043C</strong>, \u0436\u0435\u043B\u0430\u044E\u0449\u0438\u043C \u043F\u0440\u0435\u0434\u043B\u0430\u0433\u0430\u0442\u044C \u044D\u0442\u0443 \u043F\u0430\u043D\u0435\u043B\u044C \u043A\u043B\u0438\u0435\u043D\u0442\u0430\u043C, \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u0430 <strong class="text-gray-200">\u043A\u043E\u043C\u043C\u0435\u0440\u0447\u0435\u0441\u043A\u0430\u044F \u043B\u0438\u0446\u0435\u043D\u0437\u0438\u044F</strong>. \u041F\u0435\u0440\u0435\u043F\u0440\u043E\u0434\u0430\u0436\u0430 \u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \xABwhite-label\xBB \u0431\u0435\u0437 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u044F \u043D\u0430\u0440\u0443\u0448\u0430\u044E\u0442 {license}.',
        items: [
          "\u041B\u0438\u0447\u043D\u043E\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0438 \u0432\u043A\u043B\u0430\u0434 \u0441 \u043E\u0442\u043A\u0440\u044B\u0442\u044B\u043C \u0438\u0441\u0445\u043E\u0434\u043D\u044B\u043C \u043A\u043E\u0434\u043E\u043C: \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E.",
          "\u041A\u043E\u043C\u043C\u0435\u0440\u0447\u0435\u0441\u043A\u0438\u0439 \u0445\u043E\u0441\u0442\u0438\u043D\u0433/\u043F\u0435\u0440\u0435\u043F\u0440\u043E\u0434\u0430\u0436\u0430: \u043F\u043B\u0430\u0442\u043D\u0430\u044F \u043B\u0438\u0446\u0435\u043D\u0437\u0438\u044F",
          "\u041F\u043E\u0436\u0435\u0440\u0442\u0432\u043E\u0432\u0430\u043D\u0438\u044F \u043D\u0435 \u0437\u0430\u043C\u0435\u043D\u044F\u044E\u0442 \u043A\u043E\u043C\u043C\u0435\u0440\u0447\u0435\u0441\u043A\u0443\u044E \u043B\u0438\u0446\u0435\u043D\u0437\u0438\u044E"
        ],
        requestLicense: "\u0417\u0430\u043F\u0440\u043E\u0441\u0438\u0442\u044C \u043A\u043E\u043C\u043C\u0435\u0440\u0447\u0435\u0441\u043A\u0443\u044E \u043B\u0438\u0446\u0435\u043D\u0437\u0438\u044E",
        licenseText: "\u0422\u0435\u043A\u0441\u0442 \u043B\u0438\u0446\u0435\u043D\u0437\u0438\u0438",
        contact: "\u041B\u0438\u0446\u0435\u043D\u0437\u0438\u043E\u043D\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0430\u043A\u0442:"
      }
    },
    about: {
      subtitle: "\u0412\u0435\u0431-\u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440 \u0434\u043B\u044F \u0434\u043E\u043A\u0435\u0440\u0438\u0437\u043E\u0432\u0430\u043D\u043D\u043E\u0433\u043E \u0441\u0435\u0440\u0432\u0435\u0440\u0430 Valheim",
      fields: {
        version: "\u0412\u0435\u0440\u0441\u0438\u044F",
        build: "\u0421\u0442\u0440\u043E\u0438\u0442\u044C",
        commit: "\u0421\u043E\u0432\u0435\u0440\u0448\u0438\u0442\u044C",
        license: "\u041B\u0438\u0446\u0435\u043D\u0437\u0438\u044F"
      },
      repository: "\u0420\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0438\u0439",
      whatsNew: "\u0427\u0442\u043E \u043D\u043E\u0432\u043E\u0433\u043E",
      changelogEmpty: "\u041D\u0435\u0442 \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439.",
      creditsTitle: "\u041A\u0440\u0435\u0434\u0438\u0442\u044B",
      changelogSections: {
        added: "Added",
        changed: "Changed",
        deprecated: "Deprecated",
        removed: "Removed",
        fixed: "Fixed",
        security: "Security"
      },
      update: {
        title: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0430\u043D\u0435\u043B\u0438",
        upToDate: "\u0410\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u0430\u044F \u0432\u0435\u0440\u0441\u0438\u044F (v{current})",
        available: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435: v{latest}",
        viewRelease: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0440\u0435\u043B\u0438\u0437 \u043D\u0430 GitHub",
        apply: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441",
        updating: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435\u2026 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A",
        started: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u043E \u2014 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A\u0430 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u0430."
      },
      credits: {
        valheimDocker: {
          label: "\u0421\u0435\u0440\u0432\u0435\u0440 Valheim \u0432 Docker",
          by: "lloesche/valheim-server-docker"
        },
        backend: {
          label: "\u0411\u044D\u043A\u044D\u043D\u0434",
          by: "\u0424\u0430\u0441\u0442API + \u042E\u0432\u0438\u043A\u043E\u0440\u043D"
        },
        frontend: {
          label: "\u0412\u043D\u0435\u0448\u043D\u0438\u0439 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441",
          by: "Alpine.js + Tailwind CSS + Chart.js + CodeMirror"
        }
      }
    },
    resources: {
      noLimit: "\u0411\u0435\u0437 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0439",
      hostSuffix: "(\u0445\u043E\u0437\u044F\u0438\u043D)"
    }
  };

  // frontend/locales/es-ES.json
  var es_ES_default = {
    meta: {
      locale: "es-ES",
      appTitle: "Vikinger Panel",
      appSubtitle: "Gestor de servidor PsyDev"
    },
    nav: {
      sections: {
        painel: "Panel",
        gerenciar: "Gestionar",
        ferramentas: "Herramientas",
        suporte: "Soporte"
      },
      items: {
        dashboard: "Resumen",
        server: "Servidor",
        worlds: "Mundos",
        mods: "Mods y config",
        backups: "Copias de seguridad",
        files: "Archivos",
        logs: "Consola",
        audit: "Auditor\xEDa",
        help: "Ayuda",
        donation: "Apoya el proyecto",
        about: "Acerca de"
      },
      sidebar: {
        containerRunning: "Contenedor en ejecuci\xF3n",
        containerStopped: "Contenedor detenido"
      },
      refresh: "Actualizar"
    },
    common: {
      actions: {
        copy: "Copiar",
        cancel: "Cancelar",
        save: "Ahorrar",
        delete: "Borrar",
        edit: "Editar",
        download: "Descargar",
        close: "\u2715",
        view: "Vista",
        ok: "DE ACUERDO",
        send: "Enviar",
        undo: "Deshacer",
        redo: "Rehacer",
        find: "Encontrar",
        gotIt: "Entiendo",
        confirmAndStart: "Confirmar y comenzar",
        copyAddress: "Copiar direcci\xF3n",
        copyKey: "Copiar clave",
        copyCode: "Copiar c\xF3digo",
        copyRequest: "Solicitud de copia",
        copyResponse: "Copiar respuesta",
        copyAll: "Copiar todo",
        restoreDraft: "Restaurar borrador",
        discard: "Desechar"
      },
      loading: {
        loading: "Cargando...",
        loadingEllipsis: "Cargando\u2026",
        applying: "Aplicando...",
        saving: "Ahorro...",
        restarting: "Reiniciando...",
        creating: "Creando...",
        activating: "Activando...",
        deleting: "Eliminando...",
        removing: "Eliminando...",
        uploading: "Subiendo...",
        installing: "Instalando...",
        checking: "De cheques...",
        updating: "Actualizando...",
        linking: "Enlace...",
        generating: "Generando...",
        publishing: "Publicaci\xF3n...",
        running: "Correr...",
        restoring: "Restaurando...",
        undoing: "Ruina...",
        recreatingContainer: "Recreando contenedor..."
      },
      status: {
        online: "En l\xEDnea",
        paused: "En pausa",
        offline: "Desconectado",
        starting: "A partir de",
        realTime: "en tiempo real",
        emDash: null,
        yes: "S\xED",
        no: "No",
        on: "En",
        off: "Apagado",
        enabled: "Activado",
        disabled: "Desactivado",
        active: "Activo",
        unlimited: "Ilimitado",
        noLimit: "Sin l\xEDmite",
        hostSuffix: "(anfitri\xF3n)",
        pending: "(pendiente)",
        days: "{count} d\xEDas",
        day: "{count} d\xEDa",
        match: "f\xF3sforo",
        matches: "partidos",
        matchEs: "partidos)",
        ofLimit: "de limite",
        players: "jugador(es)",
        mod: "mod",
        mods: "mods",
        ms: "ms"
      },
      toasts: {
        copied: "\xA1Copiado!",
        failedToCopy: "No se pudo copiar",
        actionCompleted: "Acci\xF3n completada",
        fileSaved: "\xA1Archivo guardado!",
        settingsSaved: "\xA1Configuraci\xF3n guardada!",
        listsSaved: "\xA1Listas guardadas! El servidor se reinici\xF3 si estaba en l\xEDnea.",
        limitApplied: "L\xEDmite aplicado",
        playerLimitSaved: "L\xEDmite de jugadores guardado",
        backupLimitSaved: "L\xEDmite de copia de seguridad guardado y limpieza aplicada",
        updateSettingsSaved: "\xA1Actualizaci\xF3n de configuraci\xF3n guardada!",
        configSavedRecreated: "\xA1Configuraci\xF3n guardada y contenedor recreado!",
        backupConfigApplied: "\xA1Configuraci\xF3n aplicada y contenedor reiniciado!",
        worldSettingsSaved: "Configuraci\xF3n mundial guardada",
        worldSettingsSavedRestart: "Configuraci\xF3n guardada y servidor reiniciado",
        serverConfiguredVanilla: "Servidor configurado en modo Vanilla",
        serverConfiguredBepinex: "Servidor configurado con BepInEx",
        rconPasswordGenerated: "Contrase\xF1a RCON generada: c\xF3piela antes de cerrar el aviso",
        installed: "Instalado: {names}",
        modRemoved: "{name} eliminado",
        modEnabled: "Mod habilitado",
        modDisabled: "Mod deshabilitado",
        modLinked: "Mod vinculado a Thunderstore",
        modUpdated: "Mod actualizado a v{version}",
        modOnLatest: "Mod est\xE1 en la \xFAltima versi\xF3n.",
        modUpdateAvailable: "Actualizaci\xF3n disponible: v{installed} \u2192 v{latest}",
        orphanedConfigsRemoved: "{count} configuraciones hu\xE9rfanas eliminadas",
        r2zDownloaded: "Perfil .r2z descargado",
        codeCopied: "C\xF3digo copiado: {count} mod(s){skipped}",
        codeCopiedSkipped: "({skipped} mod(s) omitidos)",
        backupCreated: "Copia de seguridad creada: {name}",
        scheduledBackupTriggered: "Se activ\xF3 la copia de seguridad programada: espere unos segundos.",
        backupRestored: 'Copia de seguridad "{name}" restaurada: reinicio del servidor.',
        backupRestoredLatest: 'Copia de seguridad "{name}" restaurada: reinicio del servidor.',
        restoreUndone: 'Restauraci\xF3n deshecha: "{name}" est\xE1 activo.',
        backupDeleted: 'Copia de seguridad "{name}" eliminada',
        purgeDeleted: "Copias de seguridad {count} eliminadas",
        purgeNone: "No hay copias de seguridad para eliminar",
        worldActivated: 'Mundo "{name}" activado',
        worldCreatedActivated: 'Mundo "{name}" creado y activado',
        worldRegistered: 'Mundo "{name}" registrado',
        worldDeleted: 'Mundo "{name}" eliminado',
        playerKicked: "{label} pateado",
        playerBanned: "{label} prohibido",
        playerUnbanned: "{label} no baneado",
        playerPromoted: "{label} ascendido a administrador",
        playerDemoted: "{label} eliminado del administrador",
        serverActionCompleted: 'Acci\xF3n "{action}" completada',
        checkRequested: "Cheque solicitado"
      },
      confirm: {
        kickPlayer: "\xBFPatear a {label}? El jugador puede volver a unirse.",
        banPlayer: "\xBFProhibir {label} ({steamId})? El jugador no puede unirse hasta que sea liberado.",
        removeMod: "\xBFQuitar mod {name}?",
        updateMod: "\xBFActualizar {name}? Es posible que sea necesario reiniciar el servidor.",
        removeOrphanedConfig: "\xBFEliminar la configuraci\xF3n hu\xE9rfana {names}?",
        removeOrphanedConfigs: "\xBFEliminar {count} archivos de configuraci\xF3n hu\xE9rfanos?\n\n{names}",
        activateWorldNew: '\xBFActivar el mundo "{name}"? El servidor se reiniciar\xE1 y se crear\xE1 un mundo NUEVO (vac\xEDo).',
        activateWorld: '\xBFActivar el mundo "{name}"? El servidor se reiniciar\xE1.',
        deleteWorld: '\xBFEliminar permanentemente el mundo "{name}"?',
        restoreLatest: "\xBFRestaurar la \xFAltima copia de seguridad? El servidor se reiniciar\xE1.",
        undoRestore: "\xBFDeshacer la \xFAltima restauraci\xF3n? El servidor volver\xE1 al estado anterior.",
        applyMemoryLimit: "\xBFEstablecer l\xEDmite de RAM en {label}? Se recrear\xE1 el contenedor y los jugadores se desconectar\xE1n."
      },
      errors: {
        invalidSteamId: "ID de Steam no v\xE1lido: utiliza 17 d\xEDgitos",
        invalidWorldName: "Nombre mundial no v\xE1lido: use solo letras, n\xFAmeros, _ y -",
        rconUnavailable: "RCON no disponible",
        couldNotLoadUsage: "No se pudo cargar el uso"
      },
      logEmpty: {
        waitingForOutput: "Esperando la salida del servidor...",
        noLogsAvailable: "No hay registros disponibles."
      },
      editor: {
        unsavedChanges: "Cambios no guardados",
        localDraftFound: "Se encontr\xF3 un borrador local (no guardado en el servidor).",
        defaultLabel: "Por defecto:",
        ctrlSaveSearch: "Ctrl+S para guardar \xB7 Ctrl+F para buscar",
        noMatchingSettings: "No hay configuraciones coincidentes"
      },
      language: "Idioma"
    },
    help: {
      categories: {
        "primeiros-passos": {
          label: "Empezando",
          items: [
            {
              q: "\xBFC\xF3mo se unen mis amigos al servidor?",
              a: "En Valheim, use <b>\xDAnase a trav\xE9s de IP</b> e ingrese <code>YOUR_IP:2456</code> (el puerto predeterminado es 2456). Luego ingrese la contrase\xF1a del servidor. La direcci\xF3n actual aparece en la pesta\xF1a <b>Overview</b>, en el bloque \u201CC\xF3mo conectarse\u201D."
            },
            {
              q: "\xBFD\xF3nde configuro el nombre y la contrase\xF1a del servidor?",
              a: "En la pesta\xF1a <b>Servidor</b>. La contrase\xF1a debe tener al menos 5 caracteres y no puede contener el nombre del servidor. Guarde y reinicie para aplicar."
            },
            {
              q: "El servidor no aparece en la lista p\xFAblica. \xBFY ahora qu\xE9?",
              a: "La lista p\xFAblica de Valheim suele tardar unos minutos y, en ocasiones, falla. Prefiere <b>\xDAnete a trav\xE9s de IP</b>. Tambi\xE9n confirme que <code>SERVER_PUBLIC</code> est\xE9 configurado en <code>true</code> en la pesta\xF1a Servidor."
            },
            {
              q: "\xBFNecesito abrir puertos en mi enrutador?",
              a: "S\xED, para jugar a trav\xE9s de Internet, reenv\xEDe los puertos UDP <b>2456\u20132458</b> a la m\xE1quina servidor (reenv\xEDo de puertos)."
            },
            {
              q: "\xBFC\xF3mo habilito el juego cruzado (PC + Xbox/Game Pass)?",
              a: "En la pesta\xF1a Servidor, agregue <code>-crossplay</code> en el campo <b>Argumentos adicionales</b> y reinicie."
            }
          ]
        },
        servidor: {
          label: "Servidor",
          items: [
            {
              q: "\xBFCu\xE1l es la diferencia entre Iniciar, Detener, Reiniciar, Pausar y Reanudar?",
              a: "<b>Iniciar/Detener/Reiniciar</b> enciende/apaga todo el contenedor. <b>Pausa/Reanudar</b> solo suspende el proceso de Valheim dentro del contenedor (m\xE1s r\xE1pido, mantiene el contenedor en funcionamiento)."
            },
            {
              q: "\xBFQu\xE9 son las listas de Administradores, Prohibidos y Permitidos?",
              a: "Listas de ID de Steam. <b>Admin</b> obtiene comandos de moderaci\xF3n; <b>Banned</b> los jugadores no pueden unirse; <b>Permitted</b> funciona como una lista blanca (si se completa, solo esas identificaciones pueden unirse). En <b>Resumen</b>, usa el men\xFA <b>Acciones</b> junto a cada jugador conectado para promocionar, expulsar o prohibir sin editar archivos manualmente."
            },
            {
              q: "\xBFC\xF3mo uso la consola interactiva del panel?",
              a: "El mod <b>ValheimRcon</b> est\xE1 integrado en el panel (<b>Integrated</b> insignia en la pesta\xF1a Mods). En el modo <b>Modded (BepInEx)</b>, la contrase\xF1a RCON se genera autom\xE1ticamente en la primera configuraci\xF3n. La consola y la moderaci\xF3n requieren BepInEx activo y el mod habilitado."
            },
            {
              q: "\xBFC\xF3mo cambio la contrase\xF1a de RCON?",
              a: "Edite <code>config/bepinex/org.tristan.rcon.cfg</code> (el campo <code>Password</code>) en Mods \u2192 ValheimRcon config, o configure <code>PANEL_RCON_PASSWORD</code> en <code>.env</code>. Reinicie el servidor despu\xE9s de realizar el cambio."
            },
            {
              q: "\xBFCu\xE1l es la diferencia entre patear y prohibir?",
              a: "<b>Kick</b> desconecta al jugador inmediatamente, pero puede volver a unirse. <b>Ban</b> bloquea el ID de Steam en la lista de baneos hasta que los desbanques. Ambos requieren ValheimRcon habilitado y una contrase\xF1a RCON configurada."
            },
            {
              q: "\xBFPuedo eliminar ValheimRcon?",
              a: "No, est\xE1 integrado en el panel y no se puede quitar. Puedes <b>desactivarlo</b> en la pesta\xF1a Mods; cuando vuelve al modo Modificado (BepInEx), se vuelve a habilitar autom\xE1ticamente."
            },
            {
              q: "\xBFC\xF3mo encuentro el ID de Steam de un jugador?",
              a: 'Los jugadores conectados aparecen en Descripci\xF3n general con nombre e ID de Steam. Para jugadores sin conexi\xF3n, use <a href="https://steamid.io" target="_blank" rel="noopener">steamid.io</a> y copie <b>steamID64</b> (17 d\xEDgitos).'
            }
          ]
        },
        mundos: {
          label: "Mundos",
          items: [
            {
              q: "\xBFC\xF3mo creo un mundo nuevo?",
              a: "En la pesta\xF1a <b>Worlds</b>, ingresa un nombre y haz clic en <b>Create</b> (permanece pendiente) o <b>Create & Activate</b> (cambia el servidor). En realidad, un mundo solo se genera en el primer arranque."
            },
            {
              q: "\xBFCu\xE1les son los ajustes preestablecidos (F\xE1cil, Dif\xEDcil, Incondicional...)?",
              a: "Son los mismos modificadores que la pantalla de creaci\xF3n del mundo de Valheim, guardados en el archivo <code>.fwl</code>. Puedes usar un ajuste preestablecido y aun as\xED anular configuraciones individuales (combate, recursos, incursiones, portales, pena de muerte)."
            },
            {
              q: "\xBFPuedo importar un mundo que ya tengo?",
              a: "S\xED. Copie <code>WorldName.fwl</code> y <code>WorldName.db</code> a <code>config/worlds_local/</code> (pesta\xF1a Archivos o volumen Docker) y aparecer\xE1 en la lista."
            },
            {
              q: "\xBFCambiar de mundo elimina el anterior?",
              a: "No. Cambiar solo cambia qu\xE9 mundo est\xE1 activo; El progreso en otros mundos permanece guardado en <code>config/worlds_local/</code>."
            }
          ]
        },
        mods: {
          label: "Mods & BepInEx",
          items: [
            {
              q: "\xBFC\xF3mo instalo un mod?",
              a: 'En <b>Mods & Config</b>, pegue una URL <a href="https://thunderstore.io/c/valheim/" target="_blank" rel="noopener">Thunderstore</a> (p\xE1gina, enlace de descarga o r2modman) y haga clic en Instalar, o cargue un <code>.zip</code>/<code>.dll</code>.'
            },
            {
              q: "\xBFLos jugadores tambi\xE9n necesitan el mod?",
              a: "Depende del mod. Las modificaciones del lado del servidor (por ejemplo, ServerSideMap) se ejecutan solo en el servidor; la mayor\xEDa de las modificaciones de juego/UI deben instalarse en el cliente de cada jugador en la misma versi\xF3n."
            },
            {
              q: "\xBFQu\xE9 es BepInEx?",
              a: "Es el cargador de mods utilizado por Valheim. Cada mod generalmente genera un archivo <code>.cfg</code> en <code>config/bepinex</code>, editable en la pesta\xF1a Mods & Config."
            },
            {
              q: "\xBFVainilla o modificado?",
              a: "En <b>primer lanzamiento</b> o en <b>Servidor</b> \u2192 <b>Actualizaciones del juego</b>, elige <b>Vanilla</b> (deshabilita BepInEx y todas las modificaciones) o <b>Modded</b> (habilita BepInEx y ValheimRcon integrado). En el modo b\xE1sico, usa <b>Administradores</b> en las listas de jugadores para ser administrador del juego."
            },
            {
              q: "\xBFC\xF3mo funcionan las actualizaciones del juego?",
              a: "El contenedor utiliza <code>valheim-updater</code> (SteamCMD). En la pesta\xF1a <b>Servidor</b> puede habilitar la actualizaci\xF3n autom\xE1tica, deshabilitarla o hacer clic en <b>Buscar actualizaciones ahora</b>. Con los mods instalados, prefiera actualizar manualmente despu\xE9s de verificar la compatibilidad."
            },
            {
              q: "\xBFPueden las actualizaciones romper las modificaciones?",
              a: "S\xED. Un parche de Valheim puede requerir nuevas versiones de mod. Haz una copia de seguridad, actualiza el juego y luego usa <b>Buscar actualizaciones</b> en cada mod vinculado a Thunderstore."
            },
            {
              q: "\xBFC\xF3mo actualizo un mod?",
              a: "Los mods instalados a trav\xE9s de Thunderstore muestran el estado de la versi\xF3n. Utilice <b>Buscar actualizaciones</b> y, si hay una nueva versi\xF3n disponible, <b>Actualizar mod</b>. Los mods cargados deben estar <b>vinculados</b> a una URL de Thunderstore para realizar comprobaciones autom\xE1ticas."
            },
            {
              q: "Habilit\xE9/deshabilit\xE9 un mod y nada cambi\xF3.",
              a: "Los cambios de mod requieren un <b>reinicio del servidor</b>. Utilice el bot\xF3n Reiniciar en Descripci\xF3n general."
            }
          ]
        },
        backups: {
          label: "Copias de seguridad",
          items: [
            {
              q: "\xBFLas copias de seguridad son autom\xE1ticas?",
              a: "S\xED. En la pesta\xF1a <b>Copias de seguridad</b>, en <b>Programaci\xF3n autom\xE1tica</b>, establece el intervalo. El contenedor copia <code>worlds_local/</code> a <code>config/backups/</code> como archivos <code>worlds-*.zip</code>. Retenci\xF3n: 30 d\xEDas."
            },
            {
              q: "\xBFC\xF3mo hago una copia de seguridad ahora mismo?",
              a: "Haga clic en <b>Crear copia de seguridad manual</b> y elija el tipo: Mundo activo (r\xE1pido), Completo o Solo configuraciones."
            },
            {
              q: "\xBFC\xF3mo restauro una copia de seguridad?",
              a: "En la lista de copias de seguridad, haga clic en <b>Restaurar aqu\xED</b> en el punto deseado. El panel crea un punto de control, restaura archivos y reinicia el servidor. Utilice <b>Restaurar al \xFAltimo</b> o <b>Deshacer la \xFAltima restauraci\xF3n</b> para volver."
            },
            {
              q: "\xBFQu\xE9 est\xE1 programado Run ahora?",
              a: "Activa manualmente el mismo trabajo de copia de seguridad que se ejecuta en el intervalo configurado, diferente de <b>Crear copia de seguridad manual</b>, que le permite elegir el alcance (mundial, completo o configuraciones)."
            },
            {
              q: "\xBFPuedo limitar la cantidad de copias de seguridad en disco que se utilizan?",
              a: "S\xED. En la pesta\xF1a <b>Servidor</b>, en <b>Uso del disco de respaldo</b>, use el men\xFA desplegable <b>L\xEDmite total de respaldo</b>. D\xE9jelo en <b>Ilimitado</b> sin l\xEDmite, o elija un tama\xF1o (1 GB, 2 GB, 10 GB, etc.) y haga clic en <b>Guardar l\xEDmite de copia de seguridad</b>. Las copias de seguridad m\xE1s antiguas se eliminan autom\xE1ticamente cuando se excede el l\xEDmite."
            },
            {
              q: "\xBFQu\xE9 hace Borrar todas las copias de seguridad ahora?",
              a: "En la pesta\xF1a <b>Servidor</b>, esto elimina irreversiblemente cada archivo ZIP de respaldo en <code>config/backups/</code>, excepto los respaldos vinculados a una restauraci\xF3n activa o un punto de control de deshacer."
            }
          ]
        },
        files: {
          label: "Archivos",
          items: [
            {
              q: "\xBFC\xF3mo encuentro un archivo espec\xEDfico r\xE1pidamente?",
              a: "En la pesta\xF1a <b>Archivos</b>, utilice el cuadro de b\xFAsqueda para filtrar por nombre de archivo. Los archivos coincidentes aparecen en una lista plana para un acceso r\xE1pido."
            },
            {
              q: "\xBFCu\xE1les son los filtros de tipo de archivo?",
              a: "Haga clic en chips como <b>Config</b>, <b>DLLs</b>, <b>Plugins</b> o <b>Worlds</b> para limitar el \xE1rbol a tipos de archivos comunes, lo que resulta \xFAtil cuando solo necesita editar algunas configuraciones o archivos mod."
            }
          ]
        },
        recursos: {
          label: "Recursos y rendimiento",
          items: [
            {
              q: "\xBFCu\xE1nta RAM necesita el servidor?",
              a: "Un servidor Valheim normalmente utiliza de 2 a 4 GB, y aumenta con m\xE1s jugadores/mods. Ajuste el l\xEDmite en la pesta\xF1a <b>Servidor</b> bajo <b>Capacidad del servidor</b>. Las m\xE9tricas en tiempo real est\xE1n en <b>Overview</b>."
            },
            {
              q: "\xBFC\xF3mo configuro el l\xEDmite de jugadores?",
              a: "En la pesta\xF1a <b>Servidor</b> bajo <b>Capacidad del servidor</b>. Vanilla admite hasta 10 jugadores; encima de eso necesitas un mod (Valheim Plus o MaxPlayerCount). El panel sincroniza el valor con el .cfg del mod si est\xE1 instalado."
            },
            {
              q: "\xBFCambiar el l\xEDmite de RAM desconecta a los jugadores?",
              a: "S\xED, al aplicar un nuevo l\xEDmite se recrea el contenedor y se desconecta a cualquiera que est\xE9 en l\xEDnea. Haga esto durante las horas de tranquilidad."
            }
          ]
        },
        docker: {
          label: "Instalaci\xF3n y ventana acoplable",
          items: [
            {
              q: "\xBFC\xF3mo ejecuto el panel + servidor?",
              a: "Copie <code>.env.example</code> a <code>.env</code>, ajuste los valores y ejecute <code>docker compose up -d</code>. El panel est\xE1 en <code>http://YOUR_IP:8080</code>."
            },
            {
              q: "Recibo errores de permiso en las carpetas.",
              a: "Cuando se ejecuta a trav\xE9s de Docker, el panel y el servidor usan el mismo usuario (UID/GID 1000) y comparten vol\xFAmenes, por lo que no deber\xEDan ocurrir errores de permisos. Confirme que <code>config/</code> y <code>data/</code> pertenecen al UID 1000."
            },
            {
              q: "\xBFEs seguro montar docker.sock en el panel?",
              a: "El panel necesita <code>docker.sock</code> para controlar el contenedor Valheim. Esto otorga a Docker control sobre el contenedor del panel: mantenga el panel en una red privada/detr\xE1s de un proxy con autenticaci\xF3n en producci\xF3n."
            }
          ]
        },
        problemas: {
          label: "Soluci\xF3n de problemas",
          items: [
            {
              q: "\xBFD\xF3nde veo lo que est\xE1 pasando?",
              a: "Abra <b>Console</b> (docker/BepInEx) en la secci\xF3n Herramientas. La pesta\xF1a <b>Auditor\xEDa</b> muestra todas las acciones tomadas por el panel. La CPU y la RAM en tiempo real est\xE1n en <b>Overview</b>."
            },
            {
              q: "El panel no responde/muestra el error 500.",
              a: "Verifique la consola y audite. Confirme que Docker se est\xE9 ejecutando y que el contenedor <code>valheim-server</code> exista."
            },
            {
              q: "No se aplic\xF3 un cambio.",
              a: "Muchos cambios (modificaciones, listas, configuraci\xF3n mundial en ejecuci\xF3n) solo entran en vigor despu\xE9s de reiniciar el servidor."
            }
          ]
        }
      },
      referenceLinks: [
        {
          label: "Wiki oficial de Valheim",
          url: "https://valheim.fandom.com/wiki/Valheim_Wiki"
        },
        {
          label: "Thunderstore (modificaciones de Valheim)",
          url: "https://thunderstore.io/c/valheim/"
        },
        {
          label: "BepInEx (cargador de mods)",
          url: "https://docs.bepinex.dev/"
        },
        {
          label: "Imagen Docker del servidor lloesche/valheim",
          url: "https://github.com/lloesche/valheim-server-docker"
        },
        {
          label: "Servidor dedicado (gu\xEDa oficial)",
          url: "https://valheim.fandom.com/wiki/Hosting_a_Dedicated_Server"
        }
      ],
      title: "Preguntas frecuentes",
      searchPlaceholder: "Buscar preguntas frecuentes...",
      usefulLinks: "Enlaces \xFAtiles"
    },
    worlds: {
      presets: {
        preset: {
          _default: {
            label: "Predeterminado del juego",
            desc: "Sin modificadores: experiencia b\xE1sica, como antes del parche Hildir's Request."
          },
          easy: {
            label: "F\xE1cil",
            desc: "Combates m\xE1s ligeros (da\xF1o f\xE1cil) e incursiones menos frecuentes."
          },
          normal: {
            label: "Normal",
            desc: "Equivalente al valor predeterminado del juego: todos los controles deslizantes en Normal."
          },
          hard: {
            label: "Duro",
            desc: "Duros combates y incursiones m\xE1s frecuentes."
          },
          hardcore: {
            label: "Duro",
            desc: "Combate muy duro, pena de muerte m\xE1xima, incursiones frecuentes, portales dif\xEDciles y sin mapa."
          },
          casual: {
            label: "Casual",
            desc: "Combate muy f\xE1cil, pena de muerte leve, m\xE1s recursos, sin incursiones, portales casuales, eventos por jugador y mobs pasivos."
          },
          hammer: {
            label: "Modo martillo",
            desc: "Construcci\xF3n sin coste de material, incursiones desactivadas y mobs pasivos."
          },
          immersive: {
            label: "inmersivo",
            desc: "Portales prohibidos, el fuego se propaga por todo el mundo y sin mapa/minimapa."
          }
        },
        combat: {
          _default: {
            label: "Usar preajuste",
            desc: "Hereda la dificultad de combate del ajuste preestablecido seleccionado."
          },
          veryeasy: {
            label: "muy facil",
            desc: "125% de da\xF1o al jugador, 50% de da\xF1o al enemigo, enemigos 90% de velocidad/tama\xF1o."
          },
          easy: {
            label: "F\xE1cil",
            desc: "110% de da\xF1o al jugador, 75% de da\xF1o al enemigo, enemigos 95% de velocidad/tama\xF1o."
          },
          normal: {
            label: "Normal",
            desc: "100% en todos los par\xE1metros de combate. Mayor probabilidad de enemigos de alto nivel en Dif\xEDcil/Muy dif\xEDcil."
          },
          hard: {
            label: "Duro",
            desc: "85% de da\xF1o al jugador, 150% de da\xF1o al enemigo, enemigos 110% de velocidad/tama\xF1o, 120% de tasa de subida de nivel."
          },
          veryhard: {
            label: "muy duro",
            desc: "70% de da\xF1o al jugador, 200% de da\xF1o al enemigo, enemigos 120% de velocidad/tama\xF1o, 140% de tasa de subida de nivel."
          }
        },
        deathpenalty: {
          _default: {
            label: "Usar preajuste",
            desc: "Hereda la pena de muerte del ajuste preestablecido seleccionado."
          },
          casual: {
            label: "Casual",
            desc: "Equipo mantenido al morir. El inventario cay\xF3. P\xE9rdida de habilidad: 1%."
          },
          veryeasy: {
            label: "muy facil",
            desc: "Deja todo al morir. P\xE9rdida de habilidad: 1% (menos de lo normal)."
          },
          easy: {
            label: "F\xE1cil",
            desc: "Deja todo al morir. P\xE9rdida de habilidad: 2,5%."
          },
          normal: {
            label: "Normal",
            desc: "Deja todo al morir. P\xE9rdida de habilidad: 5%."
          },
          hard: {
            label: "Duro",
            desc: "Equipo ca\xEDdo, inventario destruido permanentemente. P\xE9rdida de habilidad: 7,5%."
          },
          hardcore: {
            label: "Duro",
            desc: "Todos los elementos y habilidades se pierden permanentemente al morir."
          }
        },
        resources: {
          _default: {
            label: "Usar preajuste",
            desc: "Hereda la tasa de recursos del valor preestablecido seleccionado."
          },
          muchless: {
            label: "Mucho menos",
            desc: "50% de la tasa normal de ca\xEDda de objetos y mafias (\u22480,5\xD7)."
          },
          less: {
            label: "Menos",
            desc: "75% de la tasa normal (\u22480,75\xD7)."
          },
          normal: {
            label: "Normal",
            desc: "Tasa de recursos del juego predeterminada."
          },
          more: {
            label: "M\xE1s",
            desc: "150% de la tarifa normal (\u22481,5\xD7)."
          },
          muchmore: {
            label: "mucho mas",
            desc: "200% de la tarifa normal (\u22482\xD7)."
          },
          most: {
            label: "M\xE1ximo",
            desc: "300% de la tarifa normal (\u22483\xD7)."
          }
        },
        raids: {
          _default: {
            label: "Usar preajuste",
            desc: "Hereda la frecuencia de incursi\xF3n del ajuste preestablecido seleccionado."
          },
          none: {
            label: "Ninguno",
            desc: "EventRate 0: incursiones diurnas deshabilitadas. Es posible que todav\xEDa se produzcan redadas nocturnas."
          },
          muchless: {
            label: "Mucho menos",
            desc: "Intervalo ~92 min, 10 % de probabilidad: muchas menos incursiones."
          },
          less: {
            label: "Menos",
            desc: "Intervalo ~69 min, ~13 % de probabilidad."
          },
          normal: {
            label: "Normal",
            desc: "Intervalo ~46 min, 20 % de probabilidad."
          },
          more: {
            label: "M\xE1s",
            desc: "Intervalo ~28 min, ~33% de probabilidad."
          },
          muchmore: {
            label: "mucho mas",
            desc: "Intervalo ~14 min, ~67 % de probabilidad."
          }
        },
        portals: {
          _default: {
            label: "Usar preajuste",
            desc: "Hereda las reglas del portal del ajuste preestablecido seleccionado."
          },
          casual: {
            label: "Casual",
            desc: "TeleportAll: casi todo puede pasar por portales (excepto los animales domesticados)."
          },
          normal: {
            label: "Normal",
            desc: "Los art\xEDculos no port\xE1tiles siguen las reglas del juego predeterminadas."
          },
          hard: {
            label: "Sin portales de jefes",
            desc: "Los portales no est\xE1n disponibles mientras un jefe est\xE1 activo en el \xE1rea."
          },
          veryhard: {
            label: "Sin portales",
            desc: "No se permiten portales en el mundo."
          }
        }
      },
      flags: {
        nobuildcost: {
          label: "Sin costo de construcci\xF3n",
          desc: "Las piezas de construcci\xF3n no consumen materiales. A\xFAn quedan recetas por descubrir."
        },
        playerevents: {
          label: "Incursiones por jugador",
          desc: "Incursiones basadas en el progreso individual de cada jugador, no en jefes asesinados en el servidor."
        },
        fire: {
          label: "Peligro de incendio",
          desc: "La madera puede incendiarse y el fuego se propaga por todo el mundo, no s\xF3lo en Ashlands."
        },
        passivemobs: {
          label: "Enemigos pasivos",
          desc: "Los enemigos no atacan hasta que se les provoca."
        },
        nomap: {
          label: "Sin mapa",
          desc: "Mapa y minimapa deshabilitados: navega solo por puntos de referencia."
        }
      },
      fields: {
        preset: "Programar",
        combat: "Combatir",
        deathpenalty: "Pena de muerte",
        death: "Muerte",
        resources: "Recursos",
        raids: "Redadas",
        portals: "Portales"
      },
      badges: {
        awaitingCreation: "Esperando la creaci\xF3n",
        running: "Correr",
        active: "Activo",
        pending: "Pendiente",
        configBadge: "{preset} \xB7 Portales: {portals}"
      },
      fallback: {
        gameDefault: "Predeterminado del juego",
        preset: "Programar"
      },
      ui: {
        createTitle: "crear nuevo mundo",
        worldNamePlaceholder: "nombre mundial",
        create: "Crear",
        createAndActivate: "Crear y activar",
        db: "DB: {value}",
        notCreated: "no creado",
        configBtn: "configuraci\xF3n",
        activate: "Activar",
        settingsTitle: "Configuraci\xF3n mundial",
        settingsDesc: 'Modificadores guardados en el archivo <span class="font-mono">.fwl</span>, equivalente a la pantalla de creaci\xF3n del mundo de Valheim.',
        refresh: "\u21BB Actualizar",
        seed: "Semilla",
        uid: "UID",
        fwlFile: "archivo .fwl",
        saveDb: "Guardar .db",
        presetTitle: "Preajuste mundial",
        detectedFromFwl: "Detectado desde .fwl",
        custom: "Costumbre",
        effectiveTitle: "Valores efectivos",
        effectiveDesc: "Qu\xE9 se aplicar\xE1 al mundo despu\xE9s de guardar (preestablecido + anulaciones).",
        modifiersTitle: "Modificadores individuales",
        modifiersDesc: "Deje en \xABUsar ajuste preestablecido\xBB para heredar del ajuste preestablecido anterior, o elija un valor espec\xEDfico.",
        seedNewWorld: "\u{1F331} Semilla (nuevo mundo)",
        seedPlaceholder: "Opcional: de 1 a 10 caracteres",
        seedHint: "Se utiliza \xFAnicamente al crear el archivo .fwl por primera vez.",
        advancedTitle: "Opciones avanzadas",
        technicalTitle: "Detalles t\xE9cnicos: cadenas guardadas en .fwl",
        noModifiers: "Sin modificadores (vainilla / mundo normal).",
        saveSettings: "Guardar configuraci\xF3n",
        saveAndRestart: "Guardar y reiniciar",
        backupHint: 'Copia de seguridad autom\xE1tica del .fwl anterior en <span class="font-mono">panel-data/world_fwl_backups/</span> antes de cada guardado.',
        restartWarning: "El mundo se est\xE1 ejecutando: reinicie el servidor despu\xE9s de guardar para aplicar los cambios .fwl."
      }
    },
    console: {
      categories: {
        Server: "Servidor",
        Moderation: "Moderaci\xF3n",
        Players: "Jugadores",
        Chat: "Charlar",
        Objects: "Objetos",
        World: "Mundo"
      },
      commands: {
        save: {
          usage: "ahorrar",
          desc: "Salva el mundo actual."
        },
        list: {
          usage: "lista",
          desc: "Enumera todos los comandos en el servidor."
        },
        players: {
          usage: "jugadores",
          desc: "Muestra jugadores en l\xEDnea con posici\xF3n."
        },
        serverStats: {
          usage: "estad\xEDsticas del servidor",
          desc: "Estad\xEDsticas del servidor (FPS, RAM, jugadores)"
        },
        time: {
          usage: "tiempo",
          desc: "Muestra la hora y el d\xEDa del servidor."
        },
        logs: {
          usage: "registros",
          desc: "\xDAltimas l\xEDneas de registro del servidor"
        },
        consoleCommand: {
          usage: "consolaComando <command>",
          desc: "Ejecuta un comando de la consola Valheim"
        },
        kick: {
          usage: "patada <player|SteamID>",
          desc: "Patea a un jugador"
        },
        ban: {
          usage: "prohibir <player|SteamID>",
          desc: "Prohibiciones por nombre o ID de Steam"
        },
        banSteamId: {
          usage: "banSteamId<SteamID>",
          desc: "Prohibiciones por ID de Steam"
        },
        unban: {
          usage: "desbloquear <player|SteamID>",
          desc: "Elimina una prohibici\xF3n"
        },
        addAdmin: {
          usage: "agregarAdmin <SteamID>",
          desc: "Agrega un administrador"
        },
        removeAdmin: {
          usage: "eliminarAdmin <SteamID>",
          desc: "Elimina un administrador"
        },
        addPermitted: {
          usage: "agregarPermitido <SteamID>",
          desc: "Se agrega a la lista permitida"
        },
        removePermitted: {
          usage: "eliminarPermitido <SteamID>",
          desc: "Elimina de la lista de permitidos"
        },
        adminlist: {
          usage: "lista de administradores",
          desc: "Administradores de listas"
        },
        banlist: {
          usage: "lista de prohibici\xF3n",
          desc: "Listas de jugadores prohibidos"
        },
        permitted: {
          usage: "permitido",
          desc: "Listas de jugadores permitidos"
        },
        disconnectAll: {
          usage: "desconectar todo",
          desc: "Desconecta a todos los jugadores"
        },
        give: {
          usage: "dar <player|SteamID> <item> [opciones]",
          desc: "Le da un objeto a un jugador."
        },
        heal: {
          usage: "sanar <player|SteamID> <health>",
          desc: "Cura al jugador al valor de salud."
        },
        damage: {
          usage: "da\xF1o <player|SteamID> <damage>",
          desc: "Inflige da\xF1o a un jugador."
        },
        teleport: {
          usage: "teletransportarse <player|SteamID> <x> <y> <z>",
          desc: "Teletransporta a un jugador"
        },
        findPlayer: {
          usage: "encontrar jugador <name>",
          desc: "Encuentra un jugador y muestra detalles."
        },
        say: {
          usage: "di <message>",
          desc: "Env\xEDa un mensaje de chat (gritar)"
        },
        showMessage: {
          usage: "mostrar mensaje <message>",
          desc: "Mensaje en la pantalla central para todos"
        },
        ping: {
          usage: "hacer ping <x> <y> <z>",
          desc: "Ping de mapas para todos"
        },
        spawn: {
          usage: "generar <prefab> <x> <y> <z> [opciones]",
          desc: "Genera objetos/criaturas"
        },
        findObjects: {
          usage: "buscarObjetos [opciones]",
          desc: "B\xFAsquedas de objetos en el mundo."
        },
        addGlobalKey: {
          usage: "agregarGlobalKey <key>",
          desc: "Agrega una clave global (por ejemplo, jefe derrotado)"
        },
        removeGlobalKey: {
          usage: "eliminarGlobalKey <key>",
          desc: "Elimina una clave global"
        },
        globalKeys: {
          usage: "claves globales",
          desc: "Enumera las claves globales activas"
        }
      },
      hints: {
        bepinexRequired: "La consola RCON solo funciona con BepInEx activo; elija Modificado en la pesta\xF1a Servidor.",
        modRequired: "Habilite el mod ValheimRcon en Mods & Config para usar la consola y la moderaci\xF3n.",
        configPending: "Esperando la configuraci\xF3n de RCON: reinicie el panel o el servidor Valheim.",
        serverStopped: "Inicie el servidor para utilizar la consola interactiva.",
        unavailable: "RCON no est\xE1 disponible en este momento."
      },
      placeholder: "Comando RCON (por ejemplo, guardar, enumerar, expulsar nombre...)",
      viewCommands: "Ver comandos disponibles",
      inputHints: "La pesta\xF1a se completa autom\xE1ticamente \xB7 Ingresar env\xEDos \xB7 la salida aparece en los registros anteriores",
      moderationActions: "Acciones de moderaci\xF3n",
      helpModal: {
        title: "Comandos RCON",
        intro: 'Haga clic en un comando para llenar la consola. Utilice <code class="text-valheim-gold-light">list</code> en el servidor para ver todos los comandos instalados.',
        searchPlaceholder: "Comando de b\xFAsqueda...",
        noCommands: "No se encontraron comandos.",
        docPrefix: "Documentaci\xF3n completa:",
        docLink: "ValheimRcon en GitHub"
      },
      chart: {
        download: "Descargar",
        upload: "Subir",
        networkTraffic: "Tr\xE1fico de red (gr\xE1fico)"
      }
    },
    setup: {
      title: "Configurar servidor",
      subtitle: "Elija c\xF3mo se ejecutar\xE1 el servidor Valheim.",
      serverMode: "Modo servidor",
      modes: {
        vanilla: "Vainilla",
        bepinex: "Con modificaciones (BepInEx)"
      },
      vanillaHint: "Sin BepInEx ni modificaciones. A\xF1ade tu ID de Steam como administrador a continuaci\xF3n.",
      bepinexHint: "Habilita BepInEx, el mod ValheimRcon incluido, y genera la contrase\xF1a RCON autom\xE1ticamente.",
      adminSteamId: "Tu ID de Steam (administrador)",
      adminSteamIdPlaceholder: "76561198000000000",
      adminSteamIdHint: "Opcional por ahora: puedes editarlo m\xE1s tarde en Servidor \u2192 Listas de jugadores.",
      firstWorld: "Primer mundo (opcional)",
      firstWorldPlaceholder: "Mi mundo",
      createAndActivate: "Crea y activa este mundo.",
      rconPassword: {
        title: "Contrase\xF1a RCON generada",
        body: "El panel ha configurado ValheimRcon. Copie la contrase\xF1a; no se volver\xE1 a mostrar.",
        changeHint: 'Para cambiar m\xE1s tarde: edite <code class="text-gray-400">config/bepinex/org.tristan.rcon.cfg</code> o configure <code class="text-gray-400">PANEL_RCON_PASSWORD</code> en .env.'
      }
    },
    dashboard: {
      stats: {
        server: "Servidor",
        activeWorld: "Mundo Activo",
        playersOnline: "Jugadores en l\xEDnea",
        mods: "Mods",
        port: "Puerto"
      },
      configCorrected: "Configuraci\xF3n corregida: {from} \u2192 {to}",
      performance: "Actuaci\xF3n",
      metrics: {
        cpu: "CPU",
        ram: "RAM",
        disk: "Disco (Valheim)",
        network: "Red"
      },
      diskBreakdown: {
        game: "juego",
        mods: "mods",
        worlds: "mundos",
        backups: "copias de seguridad"
      },
      connect: {
        title: "C\xF3mo conectarse",
        intro: 'En Valheim, use <strong class="text-gray-200">Join IP</strong> e ingrese:',
        hint: "La contrase\xF1a se establece en la pesta\xF1a Servidor. Abra UDP <strong>2456\u20132458</strong> en su enrutador para acceso externo."
      },
      players: {
        title: "Jugadores conectados",
        empty: "No hay jugadores conectados en este momento.",
        admin: "Administraci\xF3n",
        banned: "Prohibido",
        actions: "Acciones \u25BE",
        promote: "Hacer administrador",
        demote: "Eliminar administrador",
        kick: "Kick",
        ban: "Ban",
        unban: "Desbanear"
      },
      quickControls: {
        title: "Controles r\xE1pidos",
        start: "Comenzar",
        stop: "Detener",
        restart: "Reanudar",
        pause: "Pausa",
        resume: "Reanudar",
        backup: "\u{1F4BE} Copia de seguridad"
      },
      console: {
        title: "Consola del servidor (en vivo)"
      },
      supervisor: {
        title: "Supervisor"
      }
    },
    server: {
      settings: {
        title: "Configuraci\xF3n del servidor (.env)",
        activeWorld: "Mundo Activo",
        password: "Contrase\xF1a",
        showPassword: "Mostrar contrase\xF1a",
        hidePassword: "Ocultar contrase\xF1a",
        save: "Guardar configuraci\xF3n",
        saveAndRestart: "Guardar y reiniciar"
      },
      envFields: {
        SERVER_NAME: {
          label: "Nombre del servidor",
          hint: "Se muestra en la lista de servidores del juego."
        },
        SERVER_PUBLIC: {
          label: "P\xFAblico (verdadero/falso)",
          hint: "verdadero = listado p\xFAblicamente; false = solo conexi\xF3n directa."
        },
        SERVER_ARGS: {
          label: "Argumentos adicionales",
          hint: "P.ej. -crossplay para habilitar el juego cruzado."
        }
      },
      capacity: {
        title: "Capacidad del servidor",
        subtitle: "L\xEDmite de RAM del contenedor y recuento m\xE1ximo de jugadores.",
        wikiGuide: "gu\xEDa wiki",
        ramLimit: "l\xEDmite de RAM",
        current: "Actual: {value}",
        applyRamLimit: "Aplicar l\xEDmite de RAM",
        ramWarning: "La aplicaci\xF3n recrea el contenedor: los jugadores conectados se desconectar\xE1n.",
        playerLimit: "L\xEDmite de jugadores",
        modSource: "Mod: {name}",
        vanillaMax: "Vainilla (m\xE1x. 10)",
        playersAbove10: "M\xE1s de 10 jugadores requieren Valheim Plus o MaxPlayerCount en la pesta\xF1a Mods.",
        savePlayerLimit: "Guardar l\xEDmite de jugadores",
        table: {
          players: "Jugadores",
          suggestedRam: "RAM sugerida",
          notes: "Notas"
        }
      },
      playerLists: {
        title: "Listas de jugadores",
        vanillaHint: "En el modo <b>Vanilla</b>, agrega tu ID de Steam en <b>Administrators</b> para obtener permisos de administrador en el juego (sin el panel de la consola RCON).",
        admin: "Administradores (ID de Steam)",
        banned: "Prohibido (ID de Steam)",
        permitted: "Permitido/lista blanca (ID de Steam)",
        saveLists: "Guardar listas"
      }
    },
    storage: {
      title: "Uso del disco de respaldo",
      intro: 'L\xEDmite opcional en archivos ZIP <code class="text-gray-400">config/backups/</code>. Elija <span class="text-valheim-gold font-medium">Ilimitado</span> para conservar todas las copias de seguridad o elija un tama\xF1o: las copias de seguridad m\xE1s antiguas se eliminan primero cuando se excede el l\xEDmite.',
      totalLimit: "L\xEDmite total de respaldo",
      unlimitedKeep: "Las copias de seguridad se conservan hasta que se agota el espacio en disco.",
      oldestDeleted: "Las copias de seguridad m\xE1s antiguas se eliminan primero cuando el uso excede el l\xEDmite anterior.",
      currentUsage: "Uso actual",
      saveLimit: "Guardar l\xEDmite de copia de seguridad",
      clearAll: "Borrar todas las copias de seguridad ahora",
      clearAllHint: "Irreversible: elimina todos los archivos ZIP de respaldo, excepto aquellos vinculados a un punto de control de restauraci\xF3n o deshacer activo.",
      purgeModal: {
        title: "Borrar todas las copias de seguridad",
        body: 'Esta acci\xF3n es <strong>irreversible</strong>. Se eliminar\xE1n todos los archivos ZIP de respaldo en <code class="text-gray-400">config/backups/</code>.',
        preserved: "Se conservan las copias de seguridad vinculadas a un punto de control de restauraci\xF3n o deshacer activo.",
        deleteAll: "eliminar todo"
      },
      usageNoLimit: "{used} usado (sin l\xEDmite)",
      usageOfLimit: "{used} de {limit} GB"
    },
    updates: {
      title: "Actualizaciones del juego",
      subtitle: "Controle las actualizaciones de Valheim a trav\xE9s del actualizador de Valheim (SteamCMD).",
      modsWarning: "Las actualizaciones de Valheim pueden romper las modificaciones. Primero haz una copia de seguridad. Comprueba la compatibilidad de cada mod despu\xE9s de actualizar el juego.",
      serverMode: "Modo servidor",
      modeHint: "Vanilla desactiva BepInEx y desactiva todas las modificaciones. Con mods se habilita BepInEx y el ValheimRcon incluido.",
      installedVersion: "Versi\xF3n instalada",
      build: "Construir",
      updater: "Actualizador",
      autoUpdate: "Juego de actualizaci\xF3n autom\xE1tica",
      onlyWhenEmpty: "S\xF3lo cuando el servidor est\xE1 vac\xEDo",
      checkInterval: "Intervalo de control",
      customCron: "cron personalizado",
      save: "Ahorrar",
      saveRecreate: "Guardar y recrear contenedor",
      checkNow: "Busque actualizaciones ahora",
      presets: {
        "15min": "Cada 15 minutos",
        "1h": "Cada hora",
        "6h": "Cada 6 horas",
        daily: "Diariamente (06:00)",
        custom: "Costumbre"
      }
    },
    mods: {
      install: {
        title: "Instalar mod",
        upload: "\u{1F4C1} Subir (.zip / .dll)",
        urlPlaceholder: "URL de Thunderstore (p\xE1gina, descarga o r2modman)",
        installUrl: "Instalar desde URL"
      },
      valheimRcon: '<strong class="text-valheim-gold">ValheimRcon</strong> se incluye con el panel (consola RCON, kick, ban y admin). No se puede eliminar, pero se puede desactivar. Las acciones de la consola y del jugador requieren BepInEx activo y este mod habilitado.',
      bundled: "incluido",
      bundledCannotRemove: "Incluido: no se puede eliminar",
      active: "Activo",
      disabled: "Desactivado",
      activeConsole: "Activo: consola y moderaci\xF3n disponibles",
      disabledConsole: "Deshabilitado: habilite para usar la consola y la moderaci\xF3n",
      configPrefix: "Configuraci\xF3n: {name}",
      noConfig: "Sin configuraci\xF3n",
      version: "Versi\xF3n",
      checkUpdates: "Buscar actualizaciones",
      updateMod: "Actualizar modo",
      linkThunderstore: "Enlace Thunderstore",
      linkUrlPlaceholder: "URL de la tienda Thunder",
      configBtn: "configuraci\xF3n",
      remove: "Eliminar",
      empty: "No hay modificaciones instaladas",
      orphaned: {
        title: "Configuraciones hu\xE9rfanas",
        desc: "{count} los archivos de configuraci\xF3n de los mods eliminados todav\xEDa est\xE1n en el disco.",
        remove: "Eliminar configuraciones hu\xE9rfanas"
      },
      export: {
        title: "Exportar perfil de r2modman",
        desc: "Exporta mods vinculados a configuraciones de Thunderstore y BepInEx para importar en r2modman. Se omiten las modificaciones no vinculadas.",
        skipped: "Se omitir\xE1n los {count} mod(s) sin un enlace Thunderstore",
        downloadR2z: "Descargar .r2z"
      },
      bepinexConfigs: {
        title: "Configuraciones de BepInEx",
        desc: 'Archivos de configuraci\xF3n generados por mods en <code class="font-mono">config/bepinex/</code>.',
        empty: "No se encontraron archivos de configuraci\xF3n",
        edit: "Editar"
      },
      status: {
        up_to_date: "A hoy",
        update_available: "Actualizaci\xF3n disponible",
        unknown: "Fuente desconocida",
        error: "Verificaci\xF3n fallida"
      }
    },
    backups: {
      state: {
        title: "Estado del servidor",
        restoredFrom: "Restaurado desde: {name}",
        live: "Servidor en estado <strong>live</strong>: no se registr\xF3 ninguna restauraci\xF3n del panel.",
        lastRestore: "\xDAltima restauraci\xF3n: {date}",
        restoreLatest: "Restaurar lo \xFAltimo",
        undoRestore: "Deshacer la \xFAltima restauraci\xF3n",
        hint: "Restaurar siempre reinicia el servidor. Se crea un punto de control autom\xE1tico antes de cada restauraci\xF3n."
      },
      schedule: {
        title: "Programaci\xF3n autom\xE1tica",
        info: 'El contenedor Valheim copia peri\xF3dicamente la carpeta <code class="text-gray-400">worlds_local/</code> a <code class="text-gray-400">config/backups/</code>. Los archivos aparecen como <code class="text-gray-400">worlds-AAAAMMDD-HHMMSS.zip</code>. Retenci\xF3n: 30 d\xEDas.',
        automatic: "Copias de seguridad autom\xE1ticas",
        enabled: "Activado",
        disabled: "Desactivado",
        interval: "Intervalo",
        customCron: "cron personalizado",
        retention: "Retenci\xF3n",
        retentionValue: "30 dias",
        idleLabel: "Copia de seguridad cuando no hay jugadores en l\xEDnea",
        idleYes: "S\xED, haga una copia de seguridad incluso cuando est\xE9 vac\xEDo",
        idleNo: "S\xF3lo cuando los jugadores est\xE1n en l\xEDnea",
        current: "Actual: {value}",
        applyRestart: "Aplicar y reiniciar",
        manual: "Crear copia de seguridad manual",
        runScheduled: "Ejecute el trabajo programado ahora",
        runScheduledTitle: "Ahora ejecuta el mismo trabajo que se ejecuta en el intervalo programado."
      },
      intervalPresets: {
        hourly: "Cada hora",
        "6h": "Cada 6 horas",
        "12h": "Cada 12 horas",
        daily: "Diariamente (00:00)",
        custom: "Costumbre"
      },
      idleLabels: {
        online: "S\xF3lo cuando los jugadores est\xE1n en l\xEDnea",
        empty: "S\xED, incluso sin jugadores"
      },
      list: {
        title: "Copias de seguridad almacenadas",
        hideCheckpoints: "Ocultar puntos de control",
        empty: "No se encontraron copias de seguridad en config/backups/",
        columns: {
          type: "Tipo",
          name: "Nombre",
          date: "Fecha",
          age: "Edad",
          size: "Tama\xF1o",
          mods: "Mods",
          actions: "Comportamiento"
        },
        badges: {
          active: "Activo",
          latest: "El \xFAltimo",
          checkpoint: "Control"
        },
        activeMods: "{count} activo",
        restoreToHere: "Restaurar hasta aqu\xED",
        details: "Detalles"
      },
      types: {
        world: {
          label: "Mundo activo (r\xE1pido)",
          desc: "S\xF3lo el mundo en uso (.fwl + .db)."
        },
        full: {
          label: "Lleno",
          desc: "Mundos + configuraciones de BepInEx + mods + listas + .env."
        },
        configs: {
          label: "Solo configuraciones",
          desc: "Configs de BepInEx + listas de jugadores + .env."
        }
      },
      modals: {
        create: {
          title: "Crear copia de seguridad",
          desc: "Elija el tipo de copia de seguridad manual para crear ahora.",
          creating: "Creando copia de seguridad..."
        },
        restore: {
          title: "Restaurar copia de seguridad",
          intro: "Restaure el servidor al estado de esta copia de seguridad:",
          name: "Nombre:",
          type: "Tipo:",
          date: "Fecha:",
          bullets: [
            "El servidor se detendr\xE1 y reiniciar\xE1 autom\xE1ticamente.",
            "Los archivos world/config se sobrescribir\xE1n",
            "Primero se crear\xE1 un punto de control del estado actual."
          ],
          confirm: "Restaurar y reiniciar"
        },
        delete: {
          title: "Eliminar copia de seguridad",
          confirm: "\xBFEliminar permanentemente {name}?"
        },
        details: {
          title: "Detalles de la copia de seguridad",
          loading: "Cargando detalles...",
          world: "Mundo:",
          build: "Construcci\xF3n de Valheim:",
          inferred: "Metadatos inferidos de ZIP: es posible que las versiones de Thunderstore no est\xE9n disponibles.",
          modsTitle: "Mods ({count})",
          noMods: "No hay modificaciones registradas en esta copia de seguridad.",
          columns: {
            mod: "Mod",
            package: "Paquete",
            version: "Versi\xF3n",
            state: "Estado"
          },
          contents: "Contenido",
          includesWorlds: "Mundos incluidos",
          includesDlls: "Mod DLL incluidos",
          includesEnv: "Archivo .env incluido",
          hasAdminlist: "Lista de administradores",
          fileCount: "{count} archivo(s) en ZIP",
          worldsList: "Mundos: {names}"
        }
      },
      contentsNotes: {
        noDlls: "Esta copia de seguridad no incluye archivos mod (.dll); la siguiente lista refleja el estado del servidor en el momento de la copia de seguridad.",
        configsOnly: "Esta copia de seguridad contiene solo mundo/configuraciones; las modificaciones no se incluyeron. Utilice copia de seguridad manual: completa para una instant\xE1nea con archivos DLL."
      }
    },
    files: {
      searchPlaceholder: "Buscar por nombre de archivo...",
      browser: "Navegador",
      noMatches: "No hay coincidencias",
      selectFile: "Seleccione un archivo para editar",
      searchSettings: "Configuraci\xF3n de b\xFAsqueda...",
      form: "Form",
      raw: "Raw",
      scopes: {
        config: "configuraci\xF3n",
        data: "Datos"
      },
      typeFilters: {
        all: "Todo",
        config: "configuraci\xF3n",
        dll: "DLL",
        plugin: "Plugins",
        world: "Mundos",
        list: "Liza",
        backup: "Copias de seguridad",
        log: "Registros"
      },
      tree: {
        emptyFolder: "carpeta vacia",
        inaccessible: "inaccesible"
      }
    },
    logs: {
      docker: "Docker",
      bepinex: "BepInEx",
      autoRefresh: "Autom\xE1tico (5s)"
    },
    audit: {
      downloadLog: "Descargar registro completo",
      autoRefresh: "Autom\xE1tico (5s)",
      description: "Registro persistente de todas las acciones (POST/PUT/DELETE) para diagn\xF3stico y recuperaci\xF3n de errores.",
      empty: "No se registraron eventos",
      columns: {
        time: "Tiempo",
        method: "M\xE9todo",
        action: "Acci\xF3n",
        status: "Estado",
        duration: "Dur.",
        error: "Error",
        details: "Detalles"
      },
      modal: {
        title: "Detalles de la auditor\xEDa",
        request: "Pedido",
        response: "Respuesta"
      }
    },
    donation: {
      title: "Apoya el proyecto",
      pitch: "Vikinger Panel es gratuito para uso personal. Los patrocinadores ayudan a mantener el proyecto y a mantener el desarrollo. Los contribuyentes que ganan $1+/mes obtienen soporte directo del mantenedor. El patrocinio no reemplaza una licencia comercial; los proveedores de alojamiento a\xFAn necesitan una (ver m\xE1s abajo).",
      voluntary: {
        title: "Donaciones voluntarias",
        desc: "El panel es gratuito para uso personal. Si le ayuda, cualquier contribuci\xF3n financia nuevas funciones, correcciones y documentaci\xF3n."
      },
      pix: "Pix (Brasil)",
      notConfigured: 'Los enlaces de donaci\xF3n a\xFAn no est\xE1n configurados. Establezca <code class="text-gray-400">PANEL_DONATION_*</code> en el servidor <code class="text-gray-400">.env</code>.',
      commercial: {
        title: "Licencia comercial",
        intro: '<strong class="text-gray-200">Los proveedores de hosting</strong> que quieran ofrecer este panel a los clientes necesitan una <strong class="text-gray-200">licencia comercial</strong>. La reventa y el uso de marca blanca sin autorizaci\xF3n violan el {license}.',
        items: [
          "Uso personal y contribuci\xF3n de c\xF3digo abierto: gratis",
          "Alojamiento comercial/reventa: licencia paga",
          "Las donaciones no reemplazan una licencia comercial."
        ],
        requestLicense: "Solicitar licencia comercial",
        licenseText: "Texto de licencia",
        contact: "Contacto de licencia:"
      }
    },
    about: {
      subtitle: "Administrador web para un servidor Valheim acoplado",
      fields: {
        version: "Versi\xF3n",
        build: "Construir",
        commit: "Comprometerse",
        license: "Licencia"
      },
      repository: "Repositorio",
      whatsNew: "Qu\xE9 hay de nuevo",
      changelogEmpty: "No hay entradas en el changelog.",
      creditsTitle: "Cr\xE9ditos",
      changelogSections: {
        added: "Added",
        changed: "Changed",
        deprecated: "Deprecated",
        removed: "Removed",
        fixed: "Fixed",
        security: "Security"
      },
      update: {
        title: "Actualizaci\xF3n del panel",
        upToDate: "Actualizado (v{current})",
        available: "Actualizaci\xF3n disponible: v{latest}",
        viewRelease: "Ver release en GitHub",
        apply: "Actualizar ahora",
        updating: "Actualizando\u2026 reiniciando",
        started: "Actualizaci\xF3n iniciada \u2014 la p\xE1gina se recargar\xE1 al reiniciar el contenedor."
      },
      credits: {
        valheimDocker: {
          label: "Servidor Valheim en Docker",
          by: "lloesche/valheim-servidor-docker"
        },
        backend: {
          label: "backend",
          by: "API r\xE1pida + Uvicorn"
        },
        frontend: {
          label: "Interfaz",
          by: "Alpine.js + Tailwind CSS + Chart.js + CodeMirror"
        }
      }
    },
    resources: {
      noLimit: "Sin l\xEDmite",
      hostSuffix: "(anfitri\xF3n)"
    }
  };

  // frontend/js/i18n/index.js
  var LOCALE_STORAGE_KEY = "vikinger-panel-locale";
  var FALLBACK_LOCALE = "en-US";
  var SUPPORTED_LOCALES = [
    { code: "en-US", label: "English", nativeName: "English", dir: "ltr" },
    { code: "pt-BR", label: "Portuguese (Brazil)", nativeName: "Portugu\xEAs (Brasil)", dir: "ltr" },
    { code: "de-DE", label: "German", nativeName: "Deutsch", dir: "ltr" },
    { code: "ru-RU", label: "Russian", nativeName: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", dir: "ltr" },
    { code: "es-ES", label: "Spanish", nativeName: "Espa\xF1ol", dir: "ltr" }
  ];
  var MESSAGES = {
    "en-US": en_US_default,
    "pt-BR": pt_BR_default,
    "de-DE": de_DE_default,
    "ru-RU": ru_RU_default,
    "es-ES": es_ES_default
  };
  var SUPPORTED_CODES = new Set(SUPPORTED_LOCALES.map((l) => l.code));
  var _locale = FALLBACK_LOCALE;
  var _localeVersion = 0;
  var _onChange = null;
  function isSupported(code) {
    return SUPPORTED_CODES.has(code);
  }
  function resolveLocale(apiDefault) {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && isSupported(stored)) return stored;
    } catch {
    }
    if (apiDefault && isSupported(apiDefault)) return apiDefault;
    return FALLBACK_LOCALE;
  }
  function lookup(messages, key) {
    if (!messages || !key) return void 0;
    const parts = key.split(".");
    let cur = messages;
    for (const part of parts) {
      if (cur == null || typeof cur !== "object") return void 0;
      cur = cur[part];
    }
    return cur;
  }
  function interpolate(text, params) {
    if (!params || typeof text !== "string") return text;
    return text.replace(
      /\{(\w+)\}/g,
      (_, name) => params[name] !== void 0 && params[name] !== null ? String(params[name]) : `{${name}}`
    );
  }
  function getLocale() {
    return _locale;
  }
  function getLocaleVersion() {
    return _localeVersion;
  }
  function getMessages(locale = _locale) {
    return MESSAGES[locale] || MESSAGES[FALLBACK_LOCALE];
  }
  function t(key, params, locale = _locale) {
    let value = lookup(getMessages(locale), key);
    if (value === void 0 && locale !== FALLBACK_LOCALE) {
      value = lookup(MESSAGES[FALLBACK_LOCALE], key);
    }
    if (value === void 0) return key;
    if (typeof value === "string") return interpolate(value, params);
    return value;
  }
  function tHtml(key, params) {
    return t(key, params);
  }
  function tObj(key, locale = _locale) {
    const value = t(key, null, locale);
    return value === key ? lookup(MESSAGES[FALLBACK_LOCALE], key) : value;
  }
  function setLocale(locale, { persist = true } = {}) {
    const next = isSupported(locale) ? locale : FALLBACK_LOCALE;
    if (next === _locale) return;
    _locale = next;
    _localeVersion += 1;
    if (persist) {
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, next);
      } catch {
      }
    }
    document.documentElement.lang = next;
    document.title = t("meta.appTitle");
    _onChange?.();
  }
  function initI18n(apiDefault, onChange) {
    _onChange = onChange;
    _locale = resolveLocale(apiDefault);
    document.documentElement.lang = _locale;
    document.title = t("meta.appTitle");
  }
  function createI18nMixin(onChange) {
    const translate = t;
    const translateHtml = tHtml;
    const translateObj = tObj;
    return {
      locale: FALLBACK_LOCALE,
      localeVersion: 0,
      locales: SUPPORTED_LOCALES,
      initI18nFromApi(apiDefault) {
        initI18n(apiDefault, () => {
          this.locale = getLocale();
          this.localeVersion = getLocaleVersion();
          this.syncNetChartLabels?.();
          onChange?.call(this);
        });
        this.locale = getLocale();
        this.localeVersion = getLocaleVersion();
      },
      t(key, params) {
        void this.localeVersion;
        return translate(key, params);
      },
      tHtml(key, params) {
        void this.localeVersion;
        return translateHtml(key, params);
      },
      tObj(key) {
        void this.localeVersion;
        return translateObj(key);
      },
      setLocale(code) {
        setLocale(code);
        this.locale = getLocale();
        this.localeVersion = getLocaleVersion();
        this.syncNetChartLabels?.();
      }
    };
  }

  // frontend/js/helpers.js
  function formatRateTick(bps) {
    if (!bps || bps <= 0) return "0 B/s";
    if (bps >= 1024 * 1024) return (bps / (1024 * 1024)).toFixed(1) + " MB/s";
    if (bps >= 1024) return (bps / 1024).toFixed(1) + " KB/s";
    return Math.round(bps) + " B/s";
  }
  var helpers = {
    statusLabel(s) {
      const map = {
        running: this.t("common.status.online"),
        stopped: this.t("common.status.paused"),
        offline: this.t("common.status.offline"),
        starting: this.t("common.status.starting")
      };
      return map[s] || s;
    },
    escapeHtml(text) {
      return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    },
    logMessageClass(msg) {
      if (/Success!|^OK$|World loaded|Listening|connected|Game server connected/i.test(msg)) return "log-success";
      if (/ERROR|Failed|Fatal|Exception/i.test(msg)) return "log-error";
      if (/Update state|verifying install|progress:/i.test(msg)) return "log-warn";
      if (/^\.d\.\./.test(msg)) return "log-muted";
      return "log-default";
    },
    formatLogLine(line) {
      const legacy = line.match(/^(\[[^\]]+\])\s+(\[[^\]]+\])\s+(.*)$/);
      if (legacy) {
        const msgCls2 = this.logMessageClass(legacy[3]);
        return `<span class="log-ts">${this.escapeHtml(legacy[1])}</span> <span class="log-msg ${msgCls2}">${this.escapeHtml(legacy[3])}</span>`;
      }
      const match = line.match(/^(\[[^\]]+\])\s+(.*)$/);
      if (match) {
        const msgCls2 = this.logMessageClass(match[2]);
        return `<span class="log-ts">${this.escapeHtml(match[1])}</span> <span class="log-msg ${msgCls2}">${this.escapeHtml(match[2])}</span>`;
      }
      const msgCls = this.logMessageClass(line);
      return `<span class="log-msg ${msgCls}">${this.escapeHtml(line)}</span>`;
    },
    formatLogHtml(text, emptyLabel) {
      if (emptyLabel === void 0) {
        emptyLabel = this.t("common.logEmpty.waitingForOutput");
      }
      if (!text) {
        return `<span class="log-line log-empty">${this.escapeHtml(emptyLabel)}</span>`;
      }
      return text.split("\n").filter((line) => line.length > 0).map((line) => `<span class="log-line">${this.formatLogLine(line)}</span>`).join("\n");
    },
    formatSize(bytes) {
      if (!bytes) return "0 B";
      const units = ["B", "KB", "MB", "GB"];
      let i = 0;
      while (bytes >= 1024 && i < 3) {
        bytes /= 1024;
        i++;
      }
      return bytes.toFixed(i ? 1 : 0) + " " + units[i];
    },
    formatBytes(bytes) {
      if (bytes == null || bytes === 0) return "0 B";
      const units = ["B", "KB", "MB", "GB", "TB"];
      let v = bytes;
      let i = 0;
      while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i++;
      }
      return (i ? v.toFixed(1) : Math.round(v)) + " " + units[i];
    },
    formatDate(iso) {
      if (!iso) return this.t("common.status.emDash");
      try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        const locale = this.locale || getLocale();
        return d.toLocaleString(locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
      } catch {
        return iso;
      }
    },
    formatRate(bps) {
      if (!bps || bps <= 0) return "0 B/s";
      if (bps >= 1024 * 1024) return (bps / (1024 * 1024)).toFixed(1) + " MB/s";
      if (bps >= 1024) return (bps / 1024).toFixed(1) + " KB/s";
      return bps + " B/s";
    },
    pctBarClass(pct) {
      const p = pct ?? 0;
      if (p >= 85) return "danger";
      if (p >= 60) return "warn";
      return "ok";
    }
  };

  // frontend/js/nav.js
  var icons = {
    dashboard: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>',
    server: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>',
    mods: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>',
    worlds: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    backups: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>',
    files: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>',
    logs: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    audit: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>',
    help: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    donation: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>',
    about: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  };
  var nav = {
    navSections: [
      {
        id: "painel",
        labelKey: "nav.sections.painel",
        items: [{ id: "dashboard", labelKey: "nav.items.dashboard", icon: icons.dashboard }]
      },
      {
        id: "gerenciar",
        labelKey: "nav.sections.gerenciar",
        items: [
          { id: "server", labelKey: "nav.items.server", icon: icons.server },
          { id: "worlds", labelKey: "nav.items.worlds", icon: icons.worlds },
          { id: "mods", labelKey: "nav.items.mods", icon: icons.mods },
          { id: "backups", labelKey: "nav.items.backups", icon: icons.backups }
        ]
      },
      {
        id: "ferramentas",
        labelKey: "nav.sections.ferramentas",
        items: [
          { id: "files", labelKey: "nav.items.files", icon: icons.files },
          { id: "logs", labelKey: "nav.items.logs", icon: icons.logs },
          { id: "audit", labelKey: "nav.items.audit", icon: icons.audit }
        ]
      },
      {
        id: "suporte",
        labelKey: "nav.sections.suporte",
        items: [
          { id: "help", labelKey: "nav.items.help", icon: icons.help },
          { id: "donation", labelKey: "nav.items.donation", icon: icons.donation },
          { id: "about", labelKey: "nav.items.about", icon: icons.about }
        ]
      }
    ],
    initNav() {
    },
    visibleSections() {
      void this.localeVersion;
      return this.navSections.map((section) => ({
        ...section,
        label: this.t(section.labelKey),
        items: section.items.map((item) => ({
          ...item,
          label: this.t(item.labelKey)
        }))
      }));
    },
    allNavItems() {
      return this.visibleSections().flatMap((s) => s.items);
    },
    pageTitle() {
      return this.allNavItems().find((i) => i.id === this.page)?.label || "";
    },
    goToPage(id) {
      this.page = id;
      this.onPageChange();
    }
  };

  // frontend/js/state/dashboard.js
  var dashboard = {
    status: {},
    metrics: {},
    players: { count: 0, players: [], online: false },
    playerLists: { admin: [], banned: [], permitted: [] },
    playersExpanded: false,
    playerMenuOpen: null,
    metricsChartExpanded: false,
    metricsLoading: false,
    metricsPollCount: 0,
    dashLogs: "",
    actionPending: null,
    netChartInstance: null,
    metricsInterval: null,
    async loadDashboardData() {
      await this.refreshStatus();
      await Promise.all([this.loadPlayers(), this.loadPlayerLists(), this.loadConsoleStatus()]);
      await this.loadDashLogs();
    },
    async refreshStatus() {
      return this.withBusy("refreshStatus", async () => {
        try {
          this.status = await this.api("GET", "/api/status");
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async loadPlayerLists() {
      try {
        this.playerLists = await this.api("GET", "/api/config/serverlists");
      } catch (e) {
      }
    },
    async loadPlayers() {
      try {
        this.players = await this.api("GET", "/api/players");
        const count = this.players.count ?? 0;
        const listLen = (this.players.players || []).length;
        this.playersExpanded = count > 0 || listLen > 0;
      } catch (e) {
      }
    },
    isPlayerAdmin(steamId) {
      return (this.playerLists.admin || []).includes(String(steamId));
    },
    isPlayerBanned(steamId) {
      return (this.playerLists.banned || []).includes(String(steamId));
    },
    togglePlayerMenu(steamId) {
      const sid = String(steamId);
      this.playerMenuOpen = this.playerMenuOpen === sid ? null : sid;
    },
    closePlayerMenu() {
      this.playerMenuOpen = null;
    },
    playerActionLabel(action, steamId) {
      void this.localeVersion;
      if (action === "promote") {
        return this.isPlayerAdmin(steamId) ? this.t("dashboard.players.demote") : this.t("dashboard.players.promote");
      }
      if (action === "ban") {
        return this.isPlayerBanned(steamId) ? this.t("dashboard.players.unban") : this.t("dashboard.players.ban");
      }
      if (action === "kick") return this.t("dashboard.players.kick");
      return action;
    },
    async playerAction(steamId, name, action) {
      const sid = String(steamId);
      const label = name && name !== sid ? name : sid;
      this.closePlayerMenu();
      if (action === "kick") {
        if (!confirm(this.t("common.confirm.kickPlayer", { label }))) return;
      } else if (action === "ban" && !this.isPlayerBanned(sid)) {
        if (!confirm(this.t("common.confirm.banPlayer", { label, steamId: sid }))) return;
      } else if (action === "promote") {
        action = this.isPlayerAdmin(sid) ? "demote" : "promote";
      } else if (action === "ban") {
        action = this.isPlayerBanned(sid) ? "unban" : "ban";
      }
      return this.withBusy(`playerAction:${sid}:${action}`, async () => {
        try {
          const data = await this.api("POST", `/api/players/${encodeURIComponent(sid)}/action`, { action });
          const messages = {
            kick: this.t("common.toasts.playerKicked", { label }),
            ban: this.t("common.toasts.playerBanned", { label }),
            unban: this.t("common.toasts.playerUnbanned", { label }),
            promote: this.t("common.toasts.playerPromoted", { label }),
            demote: this.t("common.toasts.playerDemoted", { label })
          };
          this.toast(messages[action] || this.t("common.toasts.actionCompleted"));
          if (data.synced) {
            this.playerLists[data.synced.kind] = data.synced.ids;
          } else {
            await this.loadPlayerLists();
          }
          await this.loadPlayers();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async serverAction(action) {
      return this.withBusy(`server:${action}`, async () => {
        try {
          await this.api("POST", `/api/server/${action}`);
          this.toast(this.t("common.toasts.serverActionCompleted", { action }));
          setTimeout(() => this.refreshStatus(), 2e3);
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    cpuPercent() {
      return this.metrics.cpu?.percent ?? 0;
    },
    connectAddress() {
      const port = this.status.config?.server_port || "2456";
      const host = window.location.hostname || "YOUR_IP";
      return `${host}:${port}`;
    },
    async loadDashLogs() {
      try {
        const el = this.$refs.dashConsole;
        const wasAtBottom = this.isLogAtBottom(el);
        const prevScrollTop = el?.scrollTop ?? 0;
        const data = await this.api("GET", "/api/logs?lines=40&source=docker");
        this.dashLogs = data.logs || "";
        this.restoreLogScroll("dashConsole", wasAtBottom, prevScrollTop);
      } catch (e) {
      }
    },
    isLogAtBottom(el, threshold = 40) {
      if (!el) return true;
      return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    },
    restoreLogScroll(ref, wasAtBottom, prevScrollTop) {
      this.$nextTick(() => {
        const el = this.$refs[ref];
        if (!el) return;
        el.scrollTop = wasAtBottom ? el.scrollHeight : prevScrollTop;
      });
    },
    metricsActive() {
      return this.page === "dashboard";
    },
    startMetricsPolling() {
      if (this.metricsInterval) return;
      this.metricsLoading = true;
      this.metricsPollCount = 0;
      this.loadMetrics(false);
      this.metricsInterval = setInterval(() => {
        if (!this.metricsActive()) return;
        this.metricsPollCount += 1;
        const full = this.metricsChartExpanded || this.metricsPollCount % 6 === 0;
        this.loadMetrics(!full);
      }, 5e3);
    },
    stopMetricsPolling() {
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
        this.metricsInterval = null;
      }
    },
    onMetricsChartToggle() {
      this.metricsChartExpanded = !this.metricsChartExpanded;
      if (this.metricsChartExpanded) {
        this.$nextTick(() => {
          this.ensureNetChart();
          this.loadMetrics(false);
        });
      }
    },
    ensureNetChart() {
      if (typeof Chart === "undefined") return false;
      const canvas = this.$refs.netChartCanvas;
      if (!canvas) return false;
      if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return false;
      if (this.netChartInstance) {
        this.syncNetChartLabels();
        return true;
      }
      const ctx = canvas.getContext("2d");
      this.netChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            { label: this.t("console.chart.download"), data: [], borderColor: "#4ade80", backgroundColor: "rgba(74, 222, 128, 0.12)", fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2 },
            { label: this.t("console.chart.upload"), data: [], borderColor: "#fbbf24", backgroundColor: "rgba(251, 191, 36, 0.12)", fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: { intersect: false, mode: "index" },
          scales: {
            x: { display: true, ticks: { maxTicksLimit: 8, color: "#6b7280", font: { size: 10 }, maxRotation: 0 }, grid: { color: "rgba(42, 61, 53, 0.45)" } },
            y: { beginAtZero: true, suggestedMin: 0, suggestedMax: 1024, ticks: { color: "#6b7280", font: { size: 10 }, callback: (v) => formatRateTick(v) }, grid: { color: "rgba(42, 61, 53, 0.45)" } }
          },
          plugins: {
            legend: { labels: { color: "#9ca3af", boxWidth: 12, font: { size: 11 } } },
            tooltip: { callbacks: { label: (ctx2) => `${ctx2.dataset.label}: ${formatRateTick(ctx2.parsed.y)}` } }
          }
        }
      });
      return true;
    },
    syncNetChartLabels() {
      if (!this.netChartInstance) return;
      void this.localeVersion;
      this.netChartInstance.data.datasets[0].label = this.t("console.chart.download");
      this.netChartInstance.data.datasets[1].label = this.t("console.chart.upload");
      this.netChartInstance.update("none");
    },
    pushNetChartPoint(rx, tx) {
      if (!this.netChartInstance) return;
      const labels = this.netChartInstance.data.labels;
      const rxData = this.netChartInstance.data.datasets[0].data;
      const txData = this.netChartInstance.data.datasets[1].data;
      const t2 = (/* @__PURE__ */ new Date()).toLocaleTimeString(this.locale || "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      labels.push(t2);
      rxData.push(Number(rx) || 0);
      txData.push(Number(tx) || 0);
      const maxPoints = 60;
      while (labels.length > maxPoints) {
        labels.shift();
        rxData.shift();
        txData.shift();
      }
      const peak = Math.max(...rxData, ...txData, 512);
      this.netChartInstance.options.scales.y.suggestedMax = Math.ceil(peak * 1.25);
      this.netChartInstance.update("none");
    },
    async loadMetrics(light = true) {
      try {
        const url = light ? "/api/metrics?light=1" : "/api/metrics";
        const prevDisk = this.metrics.disk;
        const data = await this.api("GET", url);
        if (light && data.disk?.total_bytes == null && prevDisk?.total_bytes != null) {
          data.disk = prevDisk;
        }
        this.metrics = data;
        this.metricsLoading = false;
        if (!this.metricsActive()) return;
        if (this.metricsChartExpanded) {
          await this.$nextTick();
          if (this.ensureNetChart()) {
            this.pushNetChartPoint(this.metrics.network?.rx_bps, this.metrics.network?.tx_bps);
            this.netChartInstance.resize();
          }
        }
      } catch (e) {
        this.metricsLoading = false;
      }
    }
  };

  // frontend/js/state/resources.js
  var resources = {
    memoryConfig: { gb: null, unlimited: true, slider_max: 29 },
    memoryGb: 29,
    memorySliderLabel() {
      void this.localeVersion;
      if (this.memoryGb >= (this.memoryConfig.slider_max || 29)) return this.t("resources.noLimit");
      return `${this.memoryGb} GB`;
    },
    memoryLimitLabel() {
      void this.localeVersion;
      if (this.memoryConfig.unlimited && !this.metrics.memory?.limit_gb) {
        const host = this.formatBytes(this.metrics.memory?.limit_bytes);
        return host ? `${host} ${this.t("resources.hostSuffix")}` : this.t("resources.noLimit");
      }
      const gb = this.metrics.memory?.limit_gb ?? this.memoryConfig.gb;
      if (gb) return `${gb} GB`;
      return this.formatBytes(this.metrics.memory?.limit_bytes) || this.t("resources.noLimit");
    },
    memoryGbForApi() {
      const max = this.memoryConfig.slider_max || 29;
      return this.memoryGb >= max ? null : this.memoryGb;
    },
    syncMemorySliderFromConfig() {
      if (this.memoryConfig.unlimited) {
        this.memoryGb = this.memoryConfig.slider_max || 29;
      } else if (this.memoryConfig.gb) {
        this.memoryGb = this.memoryConfig.gb;
      }
    },
    async loadMemoryConfig() {
      try {
        const data = await this.api("GET", "/api/resources/memory");
        this.memoryConfig = data;
        this.syncMemorySliderFromConfig();
      } catch (e) {
      }
    }
  };

  // frontend/js/state/server.js
  var ENV_FIELD_KEYS = ["SERVER_NAME", "SERVER_PUBLIC", "SERVER_ARGS"];
  var LIST_KEYS = ["admin", "banned", "permitted"];
  var server = {
    envValues: {},
    listValues: { admin: "", banned: "", permitted: "" },
    listEditorDirty: { admin: false, banned: false, permitted: false },
    showServerPass: false,
    selectedWorld: "",
    capacity: {
      max_players: 10,
      max_players_cap: 10,
      mod_source: null,
      suggested_ram_gb: 4,
      warning: null,
      suggestions: [],
      crossplay: false
    },
    maxPlayers: 10,
    getEnvFields() {
      void this.localeVersion;
      const fields = this.tObj("server.envFields") || {};
      return ENV_FIELD_KEYS.map((key) => ({
        key,
        label: fields[key]?.label || key,
        hint: fields[key]?.hint || ""
      }));
    },
    getServerLists() {
      void this.localeVersion;
      const lists = this.tObj("server.playerLists") || {};
      return LIST_KEYS.map((key) => ({
        key,
        label: lists[key] || key
      }));
    },
    async loadServerPage() {
      await this.loadWorlds();
      await this.loadUpdatesPage();
      await this.loadEnv();
      await Promise.all([this.loadMemoryConfig(), this.loadCapacity(), this.loadStorageLimits()]);
      this.selectedWorld = this.envValues.WORLD_NAME || this.worlds.find((w) => w.active)?.name || "";
      this.$nextTick(() => this.mountListEditors());
    },
    async loadCapacity() {
      try {
        const data = await this.api("GET", "/api/config/capacity");
        this.capacity = data;
        this.maxPlayers = data.max_players ?? 10;
        if (data.memory_gb != null) {
          this.memoryConfig.gb = data.memory_gb;
          this.memoryConfig.unlimited = data.memory_unlimited;
        }
        if (data.memory_slider_max) this.memoryConfig.slider_max = data.memory_slider_max;
        this.syncMemorySliderFromConfig();
      } catch (e) {
        this.toast(e.message, "error");
      }
    },
    isSuggestionActive(row) {
      const n = this.maxPlayers ?? 10;
      return n >= row.players_min && n <= row.players_max;
    },
    async applyMemoryLimit() {
      const gb = this.memoryGbForApi();
      const label = gb ? `${gb} GB` : this.t("common.status.noLimit");
      if (!confirm(this.t("common.confirm.applyMemoryLimit", { label }))) return;
      return this.withBusy("applyMemory", async () => {
        try {
          const data = await this.api("PUT", "/api/config/capacity", {
            memory_gb: gb ?? (this.memoryConfig.slider_max || 29),
            apply_memory: true
          });
          if (data.memory_warning) this.toast(data.memory_warning, "error");
          this.toast(data.message || this.t("common.toasts.limitApplied"));
          await this.loadCapacity();
          await this.loadMemoryConfig();
          await this.refreshStatus();
          setTimeout(() => this.loadMetrics(false), 3e3);
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async saveMaxPlayers() {
      return this.withBusy("saveMaxPlayers", async () => {
        try {
          const data = await this.api("PUT", "/api/config/capacity", { max_players: this.maxPlayers });
          this.capacity = { ...this.capacity, ...data };
          this.maxPlayers = data.max_players ?? this.maxPlayers;
          if (data.warning) this.toast(data.warning, "error");
          this.toast(data.message || this.t("common.toasts.playerLimitSaved"));
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async loadEnv() {
      try {
        const data = await this.api("GET", "/api/config/env");
        this.envValues = data.values || {};
        const lists = await this.api("GET", "/api/config/serverlists");
        for (const k of ["admin", "banned", "permitted"]) {
          this.listValues[k] = (lists[k] || []).join("\n");
        }
        this.$nextTick(() => this.mountListEditors());
      } catch (e) {
        this.toast(e.message, "error");
      }
    },
    mountListEditors() {
      if (typeof window.PanelEditor === "undefined") return;
      for (const key of ["admin", "banned", "permitted"]) {
        const el = document.getElementById(`list-editor-${key}`);
        if (!el) continue;
        const path = `serverlist:${key}`;
        const content = this.listValues[key] || "";
        window.PanelEditor.mount(`list-${key}`, el, {
          path,
          content,
          minHeight: "120px",
          onSave: async (text) => {
            this.listValues[key] = text;
            await this.saveServerLists();
          },
          onDirtyChange: (dirty) => {
            this.listEditorDirty[key] = dirty;
          }
        });
      }
    },
    listEditorUndo(key) {
      window.PanelEditor?.get(`list-${key}`)?.undo();
    },
    listEditorRedo(key) {
      window.PanelEditor?.get(`list-${key}`)?.redo();
    },
    async saveEnv(restart = false) {
      return this.withBusy(restart ? "saveEnvRestart" : "saveEnv", async () => {
        try {
          await this.api("PUT", "/api/config/env", { values: this.envValues });
          this.toast(this.t("common.toasts.settingsSaved"));
          if (restart) await this.serverAction("restart");
          await this.loadCapacity();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async saveServerLists() {
      return this.withBusy("saveServerLists", async () => {
        try {
          for (const k of ["admin", "banned", "permitted"]) {
            const editor = window.PanelEditor?.get(`list-${k}`);
            const text = editor ? editor.getContent() : this.listValues[k] || "";
            this.listValues[k] = text;
            const ids = text.split("\n").map((s) => s.trim()).filter(Boolean);
            await this.api("PUT", `/api/config/serverlists/${k}`, { ids });
            editor?.setContent(text, { markSaved: true });
          }
          this.toast(this.t("common.toasts.listsSaved"));
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async onWorldSelectChange() {
      const name = this.selectedWorld;
      if (!name || name === this.envValues.WORLD_NAME) return;
      await this.switchWorld(name);
      if (this.envValues.WORLD_NAME !== name) this.selectedWorld = this.envValues.WORLD_NAME || name;
    }
  };

  // frontend/js/state/worlds.js
  var MODIFIER_FIELDS = ["preset", "combat", "deathpenalty", "resources", "raids", "portals"];
  var FLAG_KEYS = ["nobuildcost", "playerevents", "fire", "passivemobs", "nomap"];
  var FIELD_KEYS = ["combat", "deathpenalty", "resources", "raids", "portals"];
  var FIELD_ICONS = { combat: "\u2694\uFE0F", deathpenalty: "\u{1F480}", resources: "\u{1FAB5}", raids: "\u{1F525}", portals: "\u{1F300}" };
  function catalogFromI18n(tObj2, field) {
    const raw = tObj2?.[field] || {};
    return Object.entries(raw).map(([value, meta]) => ({
      value: value === "_default" ? "" : value,
      label: meta.label,
      desc: meta.desc
    }));
  }
  var worlds = {
    worlds: [],
    newWorldName: "",
    createWorldActivate: false,
    worldConfigName: "",
    worldConfigForm: {},
    worldConfigMeta: null,
    worldConfigSummary: null,
    worldConfigEffective: null,
    worldConfigInferredPreset: "",
    worldConfigPresetDetected: false,
    worldConfigModifierStrings: [],
    worldConfigFlagsActive: {},
    worldConfigWarnings: [],
    worldConfigRequiresRestart: false,
    getWorldModifierCatalog() {
      void this.localeVersion;
      const presets = this.tObj("worlds.presets") || {};
      const out = {};
      for (const field of MODIFIER_FIELDS) {
        out[field] = catalogFromI18n(presets, field);
      }
      return out;
    },
    getWorldConfigFields() {
      void this.localeVersion;
      const labels = this.tObj("worlds.fields") || {};
      return FIELD_KEYS.map((key) => ({
        key,
        label: labels[key] || key,
        icon: FIELD_ICONS[key]
      }));
    },
    getWorldConfigFlags() {
      void this.localeVersion;
      const flags = this.tObj("worlds.flags") || {};
      return FLAG_KEYS.filter((key) => flags[key]).map((key) => ({
        key,
        label: flags[key].label,
        desc: flags[key].desc
      }));
    },
    async loadWorldsPage() {
      await this.loadWorlds();
      if (!this.worldConfigName && this.worlds.length) {
        this.worldConfigName = this.worlds.find((w) => w.active)?.name || this.worlds[0].name;
      }
      await this.loadWorldConfig();
    },
    async loadWorlds() {
      try {
        const data = await this.api("GET", "/api/worlds");
        this.worlds = data.worlds || [];
      } catch (e) {
        this.toast(e.message, "error");
      }
    },
    async switchWorld(name) {
      const world = this.worlds.find((w) => w.name === name);
      const isNew = world && world.pending && !world.has_db;
      const msg = isNew ? this.t("common.confirm.activateWorldNew", { name }) : this.t("common.confirm.activateWorld", { name });
      if (!confirm(msg)) return;
      return this.withBusy(`switchWorld:${name}`, async () => {
        try {
          await this.api("POST", "/api/worlds/switch", { world_name: name });
          this.toast(this.t("common.toasts.worldActivated", { name }));
          await this.loadWorlds();
          await this.refreshStatus();
          if (this.page === "server") {
            this.selectedWorld = name;
            this.envValues.WORLD_NAME = name;
          }
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async createWorld(activate = false) {
      if (!this.newWorldName) return;
      const act = activate || this.createWorldActivate;
      return this.withBusy(act ? "createWorldActivate" : "createWorld", async () => {
        try {
          await this.api("POST", `/api/worlds/create?name=${encodeURIComponent(this.newWorldName)}&activate=${act}`);
          const name = this.newWorldName;
          this.toast(act ? this.t("common.toasts.worldCreatedActivated", { name }) : this.t("common.toasts.worldRegistered", { name }));
          this.newWorldName = "";
          this.createWorldActivate = false;
          await this.loadWorlds();
          if (act) await this.refreshStatus();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async deleteWorld(name) {
      if (!confirm(this.t("common.confirm.deleteWorld", { name }))) return;
      return this.withBusy(`deleteWorld:${name}`, async () => {
        try {
          await this.api("DELETE", `/api/worlds/${encodeURIComponent(name)}`);
          this.toast(this.t("common.toasts.worldDeleted", { name }));
          await this.loadWorlds();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    worldBadge(world) {
      if (world.running && !world.has_db) return this.t("worlds.badges.awaitingCreation");
      if (world.running) return this.t("worlds.badges.running");
      if (world.active) return this.t("worlds.badges.active");
      if (world.pending) return this.t("worlds.badges.pending");
      return "";
    },
    worldConfigBadge(world) {
      const s = world.config_summary;
      if (!s) return "";
      const preset = this.worldOptionLabel("preset", s.preset || "normal");
      const portals = this.worldOptionLabel("portals", s.portals || "normal");
      return this.t("worlds.badges.configBadge", { preset, portals });
    },
    worldDbLabel(world) {
      void this.localeVersion;
      const value = world.has_db ? this.formatSize(world.db_size) : this.t("worlds.ui.notCreated");
      return this.t("worlds.ui.db", { value });
    },
    worldOptionLabel(field, value) {
      const v = value ?? "";
      const item = (this.getWorldModifierCatalog()[field] || []).find((o) => o.value === v);
      if (item) return item.label;
      if (!v) return field === "preset" ? this.t("worlds.fallback.gameDefault") : this.t("worlds.fallback.preset");
      return v;
    },
    worldOptionDesc(field, value) {
      const v = value ?? "";
      const item = (this.getWorldModifierCatalog()[field] || []).find((o) => o.value === v);
      return item?.desc || "";
    },
    worldFieldDesc(field) {
      const val = this.worldConfigForm[field] ?? "";
      return this.worldOptionDesc(field, val);
    },
    worldPresetDesc() {
      return this.worldOptionDesc("preset", this.worldConfigForm.preset ?? "");
    },
    worldEffectiveRows() {
      void this.localeVersion;
      const eff = this.computeWorldEffective();
      const labels = this.tObj("worlds.fields") || {};
      return [
        { key: "preset", label: labels.preset || this.t("worlds.fields.preset"), value: eff.preset },
        { key: "combat", label: labels.combat || this.t("worlds.fields.combat"), value: eff.combat },
        { key: "deathpenalty", label: labels.death || labels.deathpenalty || this.t("worlds.fields.death"), value: eff.deathpenalty },
        { key: "resources", label: labels.resources || this.t("worlds.fields.resources"), value: eff.resources },
        { key: "raids", label: labels.raids || this.t("worlds.fields.raids"), value: eff.raids },
        { key: "portals", label: labels.portals || this.t("worlds.fields.portals"), value: eff.portals }
      ];
    },
    computeWorldEffective() {
      const form = this.worldConfigForm || {};
      const preset = (form.preset || "").toLowerCase();
      const eff = { combat: "normal", deathpenalty: "normal", resources: "normal", raids: "normal", portals: "normal" };
      if (preset === "easy") {
        eff.combat = "easy";
        eff.raids = "less";
      } else if (preset === "hard") {
        eff.combat = "hard";
        eff.raids = "more";
      } else if (preset === "hardcore") {
        eff.combat = "veryhard";
        eff.deathpenalty = "hardcore";
        eff.raids = "more";
        eff.portals = "hard";
      } else if (preset === "casual") {
        eff.combat = "veryeasy";
        eff.deathpenalty = "casual";
        eff.resources = "more";
        eff.raids = "none";
        eff.portals = "casual";
      } else if (preset === "hammer") {
        eff.raids = "none";
      } else if (preset === "immersive") {
        eff.portals = "veryhard";
      }
      if (form.combat) eff.combat = form.combat;
      if (form.deathpenalty) eff.deathpenalty = form.deathpenalty;
      if (form.resources) eff.resources = form.resources;
      if (form.raids) eff.raids = form.raids;
      if (form.portals) eff.portals = form.portals;
      return { preset: preset || "normal", ...eff };
    },
    selectWorldPreset(value) {
      this.worldConfigForm.preset = value;
      this.worldConfigPresetDetected = false;
    },
    openWorldConfig(name) {
      this.worldConfigName = name;
      this.page = "worlds";
      this.$nextTick(() => {
        this.loadWorldConfig();
        this.$refs.worldConfigPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    defaultWorldConfigForm() {
      return { preset: "", combat: "", deathpenalty: "", resources: "", raids: "", portals: "", seed: "", nobuildcost: null, playerevents: null, fire: null, passivemobs: null, nomap: null };
    },
    async loadWorldConfig() {
      if (!this.worldConfigName) return;
      return this.withBusy("loadWorldConfig", async () => {
        try {
          const data = await this.api("GET", `/api/worlds/${encodeURIComponent(this.worldConfigName)}/config`);
          this.worldConfigMeta = data.meta || null;
          this.worldConfigSummary = data.summary || data.effective || null;
          this.worldConfigEffective = data.effective || data.summary || null;
          this.worldConfigInferredPreset = data.inferred_preset || "";
          this.worldConfigModifierStrings = data.modifier_strings || [];
          this.worldConfigFlagsActive = data.flags || {};
          this.worldConfigWarnings = data.warnings || [];
          this.worldConfigRequiresRestart = !!data.requires_restart;
          const form = { ...this.defaultWorldConfigForm(), ...data.config || {} };
          this.worldConfigPresetDetected = !data.config?.preset && !!data.inferred_preset;
          if (!form.preset && this.worldConfigInferredPreset) {
            form.preset = this.worldConfigInferredPreset;
          }
          this.worldConfigForm = form;
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async saveWorldConfig(restart = false) {
      const key = restart ? "saveWorldConfigRestart" : "saveWorldConfig";
      return this.withBusy(key, async () => {
        try {
          const payload = { config: this.worldConfigForm, restart };
          const data = await this.api("PUT", `/api/worlds/${encodeURIComponent(this.worldConfigName)}/config`, payload);
          this.toast(restart ? this.t("common.toasts.worldSettingsSavedRestart") : this.t("common.toasts.worldSettingsSaved"));
          this.worldConfigRequiresRestart = !!data.requires_restart;
          this.worldConfigEffective = data.effective || data.summary || null;
          this.worldConfigInferredPreset = data.inferred_preset || "";
          this.worldConfigModifierStrings = data.modifier_strings || [];
          this.worldConfigFlagsActive = data.flags || {};
          await this.loadWorlds();
          await this.loadWorldConfig();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    }
  };

  // frontend/js/state/mods.js
  var mods = {
    mods: [],
    modUrl: "",
    bepinexConfigs: [],
    exportSkipped: 0,
    orphanedConfigs: [],
    orphanedConfigsCount: 0,
    async loadModsPage() {
      await this.loadUpdatesConfig();
      await this.loadMods();
      await this.loadBepinexConfigs();
      await this.loadOrphanedConfigs();
      this.updateExportSkipped();
    },
    updateExportSkipped() {
      this.exportSkipped = this.mods.filter((m) => m.update_status === "unknown").length;
    },
    async loadMods() {
      try {
        const data = await this.api("GET", "/api/mods");
        this.mods = data.mods || [];
        this.updateExportSkipped();
      } catch (e) {
        this.toast(e.message, "error");
      }
    },
    async loadBepinexConfigs() {
      try {
        const data = await this.api("GET", "/api/bepinex/configs");
        this.bepinexConfigs = data.configs || [];
      } catch (e) {
        this.toast(e.message, "error");
      }
    },
    async loadOrphanedConfigs() {
      try {
        const data = await this.api("GET", "/api/bepinex/orphaned-configs");
        this.orphanedConfigs = data.configs || [];
        this.orphanedConfigsCount = data.count || 0;
      } catch (e) {
        this.toast(e.message, "error");
      }
    },
    async cleanupOrphanedConfigs() {
      const count = this.orphanedConfigsCount;
      if (!count) return;
      const names = this.orphanedConfigs.map((c) => c.name).join(", ");
      const msg = count === 1 ? this.t("common.confirm.removeOrphanedConfig", { names }) : this.t("common.confirm.removeOrphanedConfigs", { count, names });
      if (!confirm(msg)) return;
      return this.withBusy("cleanupOrphanedConfigs", async () => {
        try {
          const data = await this.api("DELETE", "/api/bepinex/orphaned-configs", {});
          this.toast(this.t("common.toasts.orphanedConfigsRemoved", { count: data.count }));
          await this.loadBepinexConfigs();
          await this.loadOrphanedConfigs();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async uploadMod(event) {
      const file = event.target.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      await this.withBusy("uploadMod", async () => {
        try {
          const data = await this.api("POST", "/api/mods/upload", fd);
          this.toast(this.t("common.toasts.installed", { names: data.installed.join(", ") }));
          await this.loadMods();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
      event.target.value = "";
    },
    async installModUrl() {
      if (!this.modUrl) return;
      return this.withBusy("installModUrl", async () => {
        try {
          const data = await this.api("POST", "/api/mods/install-url", { url: this.modUrl });
          this.toast(this.t("common.toasts.installed", { names: data.installed.join(", ") }));
          this.modUrl = "";
          await this.loadMods();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async deleteMod(name) {
      if (!confirm(this.t("common.confirm.removeMod", { name }))) return;
      return this.withBusy(`deleteMod:${name}`, async () => {
        try {
          await this.api("DELETE", `/api/mods/${encodeURIComponent(name)}`);
          this.toast(this.t("common.toasts.modRemoved", { name }));
          await this.loadMods();
          await this.loadOrphanedConfigs();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async toggleMod(name, enabled) {
      return this.withBusy(`toggleMod:${name}`, async () => {
        try {
          const data = await this.api("POST", `/api/mods/${encodeURIComponent(name)}/toggle`, { enabled });
          this.toast(data.message || (enabled ? this.t("common.toasts.modEnabled") : this.t("common.toasts.modDisabled")));
          await this.loadMods();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    modStatusLabel(status) {
      void this.localeVersion;
      const key = `mods.status.${status}`;
      const val = this.t(key);
      return val !== key ? val : status;
    },
    modEnabledStatusLabel(mod) {
      void this.localeVersion;
      if (mod.protected) {
        return mod.enabled ? this.t("mods.activeConsole") : this.t("mods.disabledConsole");
      }
      return mod.enabled ? this.t("mods.active") : this.t("mods.disabled");
    },
    modConfigLabel(mod) {
      void this.localeVersion;
      return mod.config ? this.t("mods.configPrefix", { name: mod.config }) : this.t("mods.noConfig");
    },
    modStatusClass(status) {
      return {
        up_to_date: "text-green-500",
        update_available: "text-amber-400",
        unknown: "text-gray-500",
        error: "text-red-400"
      }[status] || "text-gray-500";
    },
    async checkModUpdate(name) {
      return this.withBusy(`checkModUpdate:${name}`, async () => {
        try {
          const data = await this.api("POST", `/api/mods/${encodeURIComponent(name)}/check-update`);
          const msg = data.update_available ? this.t("common.toasts.modUpdateAvailable", { installed: data.installed_version, latest: data.latest_version }) : this.t("common.toasts.modOnLatest");
          this.toast(msg);
          await this.loadMods();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async updateMod(name) {
      if (!confirm(this.t("common.confirm.updateMod", { name }))) return;
      return this.withBusy(`updateMod:${name}`, async () => {
        try {
          const data = await this.api("POST", `/api/mods/${encodeURIComponent(name)}/update`);
          this.toast(data.message || this.t("common.toasts.modUpdated", { version: data.version }));
          await this.loadMods();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async linkModThunderstore(name) {
      if (!this.modLinkUrl) return;
      return this.withBusy(`linkMod:${name}`, async () => {
        try {
          await this.api("POST", `/api/mods/${encodeURIComponent(name)}/link`, { url: this.modLinkUrl });
          this.toast(this.t("common.toasts.modLinked"));
          this.cancelModLink();
          await this.loadMods();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async downloadR2zExport() {
      return this.withBusy("downloadR2zExport", async () => {
        try {
          const res = await fetch("/api/mods/export-r2z");
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Error ${res.status}`);
          }
          const blob = await res.blob();
          const disposition = res.headers.get("Content-Disposition") || "";
          const match = disposition.match(/filename="([^"]+)"/);
          const filename = match ? match[1] : "profile.r2z";
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
          this.toast(this.t("common.toasts.r2zDownloaded"));
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async copyR2modmanCode() {
      return this.withBusy("copyR2modmanCode", async () => {
        try {
          const data = await this.api("POST", "/api/mods/export-code");
          await navigator.clipboard.writeText(data.code);
          const skipped = data.skipped ? this.t("common.toasts.codeCopiedSkipped", { skipped: data.skipped }) : "";
          this.toast(this.t("common.toasts.codeCopied", { count: data.mods_count, skipped }));
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    }
  };

  // frontend/js/state/updates.js
  var updates = {
    updateConfig: {},
    updateStatus: {},
    bepinexEnabled: true,
    gameVersion: {},
    updateIntervalPreset: "15min",
    updateCronCustom: "*/15 * * * *",
    modLinkUrl: "",
    modLinkTarget: null,
    getUpdateIntervalPresets() {
      void this.localeVersion;
      const presets = this.tObj("updates.presets") || {};
      const crons = {
        "15min": "*/15 * * * *",
        "1h": "0 * * * *",
        "6h": "0 */6 * * *",
        daily: "0 6 * * *",
        custom: ""
      };
      return Object.keys(crons).map((id) => ({
        id,
        label: presets[id] || id,
        cron: crons[id]
      }));
    },
    cronFromUpdatePreset() {
      if (this.updateIntervalPreset === "custom") return this.updateCronCustom;
      const preset = this.getUpdateIntervalPresets().find((p) => p.id === this.updateIntervalPreset);
      return preset?.cron || "*/15 * * * *";
    },
    syncUpdatePresetFromCron(cron) {
      const match = this.getUpdateIntervalPresets().find((p) => p.cron && p.cron === cron);
      if (match) {
        this.updateIntervalPreset = match.id;
      } else {
        this.updateIntervalPreset = "custom";
        this.updateCronCustom = cron;
      }
    },
    async loadUpdatesPage() {
      await Promise.all([this.loadUpdatesConfig(), this.loadUpdatesStatus()]);
    },
    async loadUpdatesConfig() {
      try {
        const data = await this.api("GET", "/api/updates/config");
        this.updateConfig = data.values || {};
        this.bepinexEnabled = data.bepinex ?? true;
        this.gameVersion = data.game_version || {};
        this.syncUpdatePresetFromCron(this.updateConfig.UPDATE_CRON || "*/15 * * * *");
      } catch (e) {
        this.toast(e.message, "error");
      }
    },
    async loadUpdatesStatus() {
      try {
        this.updateStatus = await this.api("GET", "/api/updates/status");
      } catch (e) {
        this.toast(e.message, "error");
      }
    },
    updateConfigPayload() {
      return {
        UPDATE_AUTO: this.updateConfig.UPDATE_AUTO ?? "true",
        UPDATE_IF_IDLE: this.updateConfig.UPDATE_IF_IDLE ?? "true",
        UPDATE_CRON: this.cronFromUpdatePreset()
      };
    },
    async saveUpdateConfig(restart = false) {
      return this.withBusy(restart ? "saveUpdateConfigRestart" : "saveUpdateConfig", async () => {
        try {
          const data = await this.api("PUT", "/api/updates/config", {
            values: this.updateConfigPayload(),
            bepinex: this.bepinexEnabled,
            restart
          });
          this.toast(restart ? this.t("common.toasts.configSavedRecreated") : this.t("common.toasts.updateSettingsSaved"));
          if (data.mode_result?.rcon?.created && data.mode_result.rcon.password) {
            this.setupRconPassword = data.mode_result.rcon.password;
          }
          await this.loadUpdatesPage();
          if (this.page === "mods") await this.loadMods();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async checkGameUpdate() {
      return this.withBusy("checkGameUpdate", async () => {
        try {
          const data = await this.api("POST", "/api/updates/check");
          this.toast(data.message || this.t("common.toasts.checkRequested"));
          await this.loadUpdatesStatus();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    showModsWarning() {
      return (this.updateStatus?.mods_warning ?? false) || this.mods?.length > 0;
    },
    openModLink(name) {
      this.modLinkTarget = name;
      this.modLinkUrl = "";
    },
    cancelModLink() {
      this.modLinkTarget = null;
      this.modLinkUrl = "";
    }
  };

  // frontend/js/state/backups.js
  var backups = {
    backups: [],
    backupConfig: {},
    backupState: { active: null, restored_at: null, undo: null, undo_of: null },
    backupIntervalPreset: "hourly",
    backupCronCustom: "0 * * * *",
    backupModalOpen: false,
    restoreModalOpen: false,
    restoreTarget: null,
    deleteBackupModalOpen: false,
    deleteBackupTarget: null,
    backupDetailsModalOpen: false,
    backupDetailsTarget: null,
    backupDetails: null,
    backupDetailsLoading: false,
    hideCheckpoints: true,
    getBackupTypes() {
      void this.localeVersion;
      const types = this.tObj("backups.types") || {};
      return ["world", "full", "configs"].filter((id) => types[id]).map((id) => ({
        id,
        label: types[id].label,
        desc: types[id].desc
      }));
    },
    getBackupIntervalPresets() {
      void this.localeVersion;
      const presets = this.tObj("backups.intervalPresets") || {};
      const crons = {
        hourly: "0 * * * *",
        "6h": "0 */6 * * *",
        "12h": "0 */12 * * *",
        daily: "0 0 * * *",
        custom: ""
      };
      return Object.keys(crons).map((id) => ({
        id,
        label: presets[id] || id,
        cron: crons[id]
      }));
    },
    cronFromPreset() {
      if (this.backupIntervalPreset === "custom") return this.backupCronCustom;
      const preset = this.getBackupIntervalPresets().find((p) => p.id === this.backupIntervalPreset);
      return preset?.cron || "0 * * * *";
    },
    syncBackupPresetFromCron(cron) {
      const match = this.getBackupIntervalPresets().find((p) => p.cron && p.cron === cron);
      if (match) {
        this.backupIntervalPreset = match.id;
      } else {
        this.backupIntervalPreset = "custom";
        this.backupCronCustom = cron;
      }
    },
    visibleBackups() {
      if (!this.hideCheckpoints) return this.backups;
      return this.backups.filter((b) => !b.is_checkpoint);
    },
    backupIdleLabel() {
      void this.localeVersion;
      const labels = this.tObj("backups.idleLabels") || {};
      return this.backupConfig.BACKUPS_IF_IDLE === "false" ? labels.online || this.t("backups.idleLabels.online") : labels.empty || this.t("backups.idleLabels.empty");
    },
    async loadBackups() {
      try {
        const data = await this.api("GET", "/api/backups");
        this.backups = data.backups || [];
        this.backupConfig = data.config || {};
        this.backupState = data.state || { active: null, restored_at: null, undo: null, undo_of: null };
        this.syncBackupPresetFromCron(this.backupConfig.BACKUPS_CRON || "0 * * * *");
      } catch (e) {
        this.toast(e.message, "error");
      }
    },
    backupConfigPayload() {
      return {
        BACKUPS: this.backupConfig.BACKUPS ?? "true",
        BACKUPS_CRON: this.cronFromPreset(),
        BACKUPS_MAX_AGE: "30",
        BACKUPS_MAX_COUNT: this.backupConfig.BACKUPS_MAX_COUNT ?? "0",
        BACKUPS_IF_IDLE: this.backupConfig.BACKUPS_IF_IDLE ?? "true"
      };
    },
    async saveBackupConfig() {
      return this.withBusy("saveBackupConfig", async () => {
        try {
          await this.api("PUT", "/api/backups/config", { values: this.backupConfigPayload(), restart: true });
          this.toast(this.t("common.toasts.backupConfigApplied"));
          await this.loadBackups();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    openBackupModal() {
      this.backupModalOpen = true;
    },
    closeBackupModal() {
      this.backupModalOpen = false;
    },
    restoreModalBullets() {
      void this.localeVersion;
      const bullets = this.tObj("backups.modals.restore.bullets");
      return Array.isArray(bullets) ? bullets : [];
    },
    openRestoreModal(backup) {
      this.restoreTarget = backup;
      this.restoreModalOpen = true;
    },
    closeRestoreModal() {
      this.restoreModalOpen = false;
      this.restoreTarget = null;
    },
    openDeleteBackupModal(backup) {
      this.deleteBackupTarget = backup;
      this.deleteBackupModalOpen = true;
    },
    closeDeleteBackupModal() {
      this.deleteBackupModalOpen = false;
      this.deleteBackupTarget = null;
    },
    formatModsCount(backup) {
      if (!backup || backup.mods_count === null || backup.mods_count === void 0) return "\u2014";
      const n = backup.mods_count;
      return `${n} ${n === 1 ? this.t("common.status.mod") : this.t("common.status.mods")}`;
    },
    openBackupDetailsModal(backup) {
      this.backupDetailsTarget = backup;
      this.backupDetails = null;
      this.backupDetailsModalOpen = true;
      this.loadBackupDetails(backup.name);
    },
    closeBackupDetailsModal() {
      this.backupDetailsModalOpen = false;
      this.backupDetailsTarget = null;
      this.backupDetails = null;
      this.backupDetailsLoading = false;
    },
    async loadBackupDetails(name) {
      this.backupDetailsLoading = true;
      try {
        this.backupDetails = await this.api("GET", `/api/backups/${encodeURIComponent(name)}/details`);
      } catch (e) {
        this.toast(e.message, "error");
        this.closeBackupDetailsModal();
      } finally {
        this.backupDetailsLoading = false;
      }
    },
    backupDetailsMods() {
      return this.backupDetails?.manifest?.mods?.items || [];
    },
    backupDetailsContentsNote() {
      const contents = this.backupDetails?.manifest?.contents;
      if (!contents) return "";
      if (contents.includes_mods_dlls) return "";
      if (this.backupDetails?.mods_count > 0) {
        return this.t("backups.contentsNotes.noDlls");
      }
      return this.t("backups.contentsNotes.configsOnly");
    },
    async createBackup(type) {
      return this.withBusy(`createBackup:${type}`, async () => {
        try {
          const data = await this.api("POST", "/api/backups/create", { type });
          this.toast(this.t("common.toasts.backupCreated", { name: data.name }));
          this.backupModalOpen = false;
          if (this.page === "backups") await this.loadBackups();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async triggerBackup() {
      return this.withBusy("triggerBackup", async () => {
        try {
          await this.api("POST", "/api/backups/trigger");
          this.toast(this.t("common.toasts.scheduledBackupTriggered"));
          setTimeout(() => this.loadBackups(), 3e3);
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async confirmRestoreBackup() {
      if (!this.restoreTarget) return;
      const name = this.restoreTarget.name;
      return this.withBusy(`restoreBackup:${name}`, async () => {
        try {
          await this.api("POST", `/api/backups/${encodeURIComponent(name)}/restore`);
          this.toast(this.t("common.toasts.backupRestored", { name }));
          this.closeRestoreModal();
          await this.loadBackups();
          await this.refreshStatus();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async restoreLatestBackup() {
      if (!confirm(this.t("common.confirm.restoreLatest"))) return;
      return this.withBusy("restoreLatest", async () => {
        try {
          const data = await this.api("POST", "/api/backups/restore-latest");
          this.toast(this.t("common.toasts.backupRestoredLatest", { name: data.active }));
          await this.loadBackups();
          await this.refreshStatus();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async restoreUndoBackup() {
      if (!confirm(this.t("common.confirm.undoRestore"))) return;
      return this.withBusy("restoreUndo", async () => {
        try {
          const data = await this.api("POST", "/api/backups/restore-undo");
          this.toast(this.t("common.toasts.restoreUndone", { name: data.active }));
          await this.loadBackups();
          await this.refreshStatus();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    async confirmDeleteBackup() {
      if (!this.deleteBackupTarget) return;
      const name = this.deleteBackupTarget.name;
      return this.withBusy(`deleteBackup:${name}`, async () => {
        try {
          await this.api("DELETE", `/api/backups/${encodeURIComponent(name)}`);
          this.toast(this.t("common.toasts.backupDeleted", { name }));
          this.closeDeleteBackupModal();
          await this.loadBackups();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    backupDownloadUrl(name) {
      return `/api/backups/${encodeURIComponent(name)}/download`;
    }
  };

  // frontend/js/state/files.js
  var FOLDER_SVG = '<svg class="file-tree-svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1.5 3.5A1.5 1.5 0 0 1 3 2h3.172a1.5 1.5 0 0 1 1.06.44L8.5 3.5H13A1.5 1.5 0 0 1 14.5 5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1.5 12V3.5z"/></svg>';
  var FILE_SVG = '<svg class="file-tree-svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 1.5A1.5 1.5 0 0 1 5.5 0h4.172a1.5 1.5 0 0 1 1.06.44l2.828 2.828A1.5 1.5 0 0 1 14 4.828V12.5A1.5 1.5 0 0 1 12.5 14h-8A1.5 1.5 0 0 1 3 12.5v-11zM5.5 1a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V5h-2.5A1.5 1.5 0 0 1 9.5 3.5V1H5.5z"/></svg>';
  var CHEVRON_SVG = '<svg class="file-tree-chevron-svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z"/></svg>';
  var BEPINEX_CFG_PREFIX = "config/bepinex/";
  var BEPINEX_PROTECTED_CFG = /* @__PURE__ */ new Set(["BepInEx.cfg", "org.tristan.rcon.cfg"]);
  var LIST_FILES = /* @__PURE__ */ new Set(["adminlist.txt", "bannedlist.txt", "permittedlist.txt"]);
  var FILE_SCOPE_IDS = ["config", "data"];
  var FILE_TYPE_FILTER_IDS = ["", "config", "dll", "plugin", "world", "list", "backup", "log"];
  var FILE_TYPE_FILTER_KEYS = {
    "": "all",
    config: "config",
    dll: "dll",
    plugin: "plugin",
    world: "world",
    list: "list",
    backup: "backup",
    log: "log"
  };
  var files = {
    fileScope: "config",
    fileTree: [],
    fileExpandedPaths: {},
    fileSearchQuery: "",
    fileTypeFilter: "",
    editPath: "",
    editContent: "",
    fileEditorDirty: false,
    fileEditorDraftPending: false,
    cfgEditorMode: "raw",
    cfgDocument: null,
    cfgStructured: false,
    cfgSavedSnapshot: "",
    cfgSearchQuery: "",
    cfgExpandedSections: {},
    getFileScopes() {
      void this.localeVersion;
      return FILE_SCOPE_IDS.map((id) => ({
        id,
        label: this.t(`files.scopes.${id}`)
      }));
    },
    getFileTypeFilters() {
      void this.localeVersion;
      return FILE_TYPE_FILTER_IDS.map((id) => ({
        id,
        label: this.t(`files.typeFilters.${FILE_TYPE_FILTER_KEYS[id]}`)
      }));
    },
    async _fetchFileTree() {
      try {
        const data = await this.api("GET", `/api/files/tree?scope=${this.fileScope}`);
        this.fileTree = data.tree || [];
        this.fileExpandedPaths = {};
        if (this.editPath && !this.editPath.startsWith(`${this.fileScope}/`)) {
          this.editPath = "";
          this.editContent = "";
          window.PanelEditor?.destroy("file");
        }
      } catch (e) {
        this.toast(e.message, "error");
      }
    },
    async loadFileTree() {
      return this.withBusy(`fileScope:${this.fileScope}`, async () => {
        await this._fetchFileTree();
      });
    },
    setFileTypeFilter(id) {
      this.fileTypeFilter = id;
      this.syncFileSearchExpansion();
    },
    fileSearchActive() {
      const q = (this.fileSearchQuery || "").trim();
      return !!q || !!this.fileTypeFilter;
    },
    classifyFileItem(item) {
      if (item.type !== "file") return null;
      const path = (item.path || "").toLowerCase();
      const name = (item.name || "").toLowerCase();
      const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
      if (this.isBepinexPluginCfg(item.path)) return "config";
      if (ext === ".dll") return "dll";
      if (path.includes("/plugins/")) return "plugin";
      if (ext === ".fwl" || ext === ".db" || path.includes("worlds_local/")) return "world";
      if (LIST_FILES.has(name)) return "list";
      if (ext === ".zip" && path.includes("backups/")) return "backup";
      if (ext === ".log") return "log";
      return null;
    },
    isBepinexPluginCfg(path) {
      if (!path || !path.startsWith(BEPINEX_CFG_PREFIX)) return false;
      const name = path.slice(BEPINEX_CFG_PREFIX.length);
      if (!name.endsWith(".cfg") || name.includes("/")) return false;
      return !BEPINEX_PROTECTED_CFG.has(name);
    },
    fileMatchesFilter(item) {
      if (item.type !== "file") return false;
      const q = (this.fileSearchQuery || "").trim().toLowerCase();
      const typeFilter = this.fileTypeFilter || "";
      if (typeFilter && this.classifyFileItem(item) !== typeFilter) return false;
      if (!q) return true;
      const name = (item.name || "").toLowerCase();
      const path = (item.path || "").toLowerCase();
      return name.includes(q) || path.includes(q);
    },
    filterFileTree(tree, query, typeFilter) {
      void query;
      void typeFilter;
      if (!this.fileSearchActive()) return tree;
      const out = [];
      for (const item of tree || []) {
        if (item.type === "dir") {
          const children = this.filterFileTree(item.children || [], query, typeFilter);
          if (children.length) {
            out.push({ ...item, children });
          }
        } else if (this.fileMatchesFilter(item)) {
          out.push(item);
        }
      }
      return out;
    },
    filteredFileTree() {
      return this.filterFileTree(this.fileTree, this.fileSearchQuery, this.fileTypeFilter);
    },
    _collectExpandPaths(items, acc = /* @__PURE__ */ new Set()) {
      for (const item of items || []) {
        if (item.type === "dir") {
          acc.add(item.path);
          this._collectExpandPaths(item.children, acc);
        }
      }
      return acc;
    },
    syncFileSearchExpansion() {
      if (!this.fileSearchActive()) return;
      const paths = this._collectExpandPaths(this.filteredFileTree());
      const next = { ...this.fileExpandedPaths };
      for (const p of paths) next[p] = true;
      this.fileExpandedPaths = next;
    },
    fileSearchMatchCount() {
      let count = 0;
      const walk = (items) => {
        for (const item of items || []) {
          if (item.type === "file") count += 1;
          else if (item.type === "dir") walk(item.children);
        }
      };
      walk(this.filteredFileTree());
      return count;
    },
    flatFileMatches() {
      const matches = [];
      const walk = (items) => {
        for (const item of items || []) {
          if (item.type === "file") matches.push(item);
          else if (item.type === "dir") walk(item.children);
        }
      };
      walk(this.filteredFileTree());
      return matches;
    },
    isFileFolderExpanded(path) {
      return !!this.fileExpandedPaths[path];
    },
    toggleFileFolder(path) {
      const next = { ...this.fileExpandedPaths };
      if (next[path]) delete next[path];
      else next[path] = true;
      this.fileExpandedPaths = next;
    },
    renderTree(items, depth = 0, _expanded = null, _selected = null) {
      void _expanded;
      void _selected;
      if (!items?.length) {
        if (depth === 0 && this.fileSearchActive()) {
          return `<p class="file-tree-empty">${this.escapeHtml(this.t("files.noMatches"))}</p>`;
        }
        return depth === 0 ? `<p class="file-tree-empty">${this.escapeHtml(this.t("files.tree.emptyFolder"))}</p>` : "";
      }
      const cls = depth === 0 ? "file-tree" : "file-tree-children";
      let html = `<div class="${cls}">`;
      for (const item of items) {
        html += this.renderTreeItem(item, depth);
      }
      html += `</div>`;
      return html;
    },
    renderTreeItem(item, depth) {
      const pad = depth * 14;
      const name = this.escapeHtml(item.name);
      if (item.type === "dir") {
        const expanded = this.isFileFolderExpanded(item.path);
        const chevronCls = expanded ? "file-tree-chevron is-expanded" : "file-tree-chevron";
        let html = `<button type="button" class="file-tree-row file-tree-folder" data-path="${this.escapeHtml(item.path)}" style="--file-depth:${pad}px"><span class="${chevronCls}">${CHEVRON_SVG}</span><span class="file-tree-icon file-tree-icon-folder">${FOLDER_SVG}</span><span class="file-tree-name">${name}</span></button>`;
        if (expanded && item.children?.length) {
          html += this.renderTree(item.children, depth + 1);
        }
        return html;
      }
      if (item.type === "broken") {
        return `<div class="file-tree-row file-tree-broken" style="--file-depth:${pad}px"><span class="file-tree-chevron file-tree-chevron-spacer"></span><span class="file-tree-name text-red-400">${name} (${this.escapeHtml(item.error || this.t("files.tree.inaccessible"))})</span></div>`;
      }
      const selected = this.editPath === item.path ? " file-tree-row--selected" : "";
      return `<button type="button" class="file-tree-row file-tree-file${selected}" data-path="${this.escapeHtml(item.path)}" style="--file-depth:${pad}px"><span class="file-tree-chevron file-tree-chevron-spacer"></span><span class="file-tree-icon file-tree-icon-file">${FILE_SVG}</span><span class="file-tree-name">${name}</span><span class="file-tree-meta">${this.formatSize(item.size)}</span></button>`;
    },
    async editFile(path) {
      try {
        const data = await this.api("GET", `/api/files/read?path=${encodeURIComponent(path)}`);
        this.editPath = path;
        this.editContent = data.content;
        this.cfgDocument = null;
        this.cfgStructured = false;
        this.cfgEditorMode = "raw";
        this.cfgSearchQuery = "";
        this.cfgExpandedSections = {};
        if (this.isBepinexPluginCfg(path)) {
          try {
            const parsed = await this.api("GET", `/api/bepinex/configs/parse?path=${encodeURIComponent(path)}`);
            if (parsed.structured && parsed.document?.sections?.length) {
              this.cfgDocument = parsed.document;
              this.cfgStructured = true;
              this.cfgEditorMode = "form";
              this.cfgSavedSnapshot = JSON.stringify(parsed.document);
              const expanded = {};
              for (const sec of parsed.document.sections) expanded[sec.name] = true;
              this.cfgExpandedSections = expanded;
            }
          } catch {
          }
        }
        if (this.page !== "files") {
          this.page = "files";
        }
        await this.$nextTick();
        if (this.cfgEditorMode === "raw") {
          await this.mountFileEditor(data.content);
        } else {
          window.PanelEditor?.destroy("file");
          const el = document.getElementById("file-editor-host");
          if (el) el.innerHTML = "";
        }
      } catch (e) {
        this.toast(e.message, "error");
      }
    },
    onFileTreeClick(event) {
      const folderRow = event.target.closest(".file-tree-folder");
      if (folderRow?.dataset.path) {
        this.toggleFileFolder(folderRow.dataset.path);
        return;
      }
      const fileRow = event.target.closest(".file-tree-file");
      if (fileRow?.dataset.path) {
        this.editFile(fileRow.dataset.path);
      }
    },
    async switchCfgEditorMode(mode) {
      if (mode === this.cfgEditorMode) return;
      if (mode === "raw") {
        if (this.cfgStructured && this.cfgDocument) {
          try {
            const updates2 = this.collectCfgUpdates();
            if (updates2.length) {
              const data = await this.api("PUT", "/api/bepinex/configs/apply", {
                path: this.editPath,
                updates: updates2
              });
              this.editContent = data.content;
            }
          } catch (e) {
            this.toast(e.message, "error");
            return;
          }
        }
        this.cfgEditorMode = "raw";
        await this.$nextTick();
        await this.mountFileEditor(this.editContent);
        if (this.cfgSearchQuery) this.fileEditorOpenSearch(this.cfgSearchQuery);
        return;
      }
      if (mode === "form" && this.cfgStructured) {
        const editor = window.PanelEditor?.get("file");
        if (editor) this.editContent = editor.getContent();
        window.PanelEditor?.destroy("file");
        try {
          const parsed = await this.api("POST", "/api/bepinex/configs/parse", {
            path: this.editPath,
            content: this.editContent
          });
          if (parsed.structured && parsed.document?.sections?.length) {
            this.cfgDocument = parsed.document;
            this.cfgSavedSnapshot = JSON.stringify(parsed.document);
            this.fileEditorDirty = false;
          }
        } catch (e) {
          this.toast(e.message, "error");
          this.cfgEditorMode = "raw";
          await this.$nextTick();
          await this.mountFileEditor(this.editContent);
          return;
        }
        this.cfgEditorMode = "form";
      }
    },
    cfgInputKind(setting) {
      const type = (setting.type || "").toLowerCase();
      if (setting.acceptable?.length) return "select";
      if (type === "boolean") return "boolean";
      if (["int32", "int64", "uint32", "uint64", "int", "long"].includes(type)) return "integer";
      if (["single", "double", "float", "decimal"].includes(type)) return "number";
      return "text";
    },
    cfgSettingMatchesSearch(setting, sectionName) {
      const q = (this.cfgSearchQuery || "").trim().toLowerCase();
      if (!q) return true;
      const hay = [
        setting.label,
        setting.key,
        setting.type,
        setting.default,
        setting.value,
        sectionName
      ].join(" ").toLowerCase();
      return hay.includes(q);
    },
    filteredCfgSections() {
      if (!this.cfgDocument?.sections) return [];
      return this.cfgDocument.sections.map((sec) => ({
        ...sec,
        settings: (sec.settings || []).filter((s) => this.cfgSettingMatchesSearch(s, sec.name))
      })).filter((sec) => sec.settings.length > 0);
    },
    cfgFormMatchCount() {
      let n = 0;
      for (const sec of this.filteredCfgSections()) n += sec.settings.length;
      return n;
    },
    isCfgSectionExpanded(name) {
      return !!this.cfgExpandedSections[name];
    },
    toggleCfgSection(name) {
      const next = { ...this.cfgExpandedSections };
      next[name] = !next[name];
      this.cfgExpandedSections = next;
    },
    onCfgValueChange() {
      const snap = JSON.stringify(this.cfgDocument);
      this.fileEditorDirty = snap !== this.cfgSavedSnapshot;
    },
    collectCfgUpdates() {
      const updates2 = [];
      for (const sec of this.cfgDocument?.sections || []) {
        for (const setting of sec.settings || []) {
          updates2.push({
            section: sec.name,
            key: setting.key,
            value: String(setting.value ?? "")
          });
        }
      }
      return updates2;
    },
    setCfgValue(setting, value) {
      setting.value = String(value ?? "");
    },
    fileEditorOpenSearch(query = "") {
      const q = query || this.cfgSearchQuery || "";
      window.PanelEditor?.get("file")?.openSearch(q);
    },
    onFileEditorSearchInput() {
      if (this.cfgEditorMode === "raw") {
        this.fileEditorOpenSearch(this.cfgSearchQuery);
      }
    },
    async waitForPanelEditor(timeoutMs = 8e3) {
      if (typeof window.PanelEditor !== "undefined") return true;
      return new Promise((resolve) => {
        const start = Date.now();
        const onReady = () => {
          cleanup();
          resolve(true);
        };
        const tick = () => {
          if (typeof window.PanelEditor !== "undefined") {
            cleanup();
            resolve(true);
            return;
          }
          if (Date.now() - start >= timeoutMs) {
            cleanup();
            resolve(false);
            return;
          }
          setTimeout(tick, 50);
        };
        const cleanup = () => window.removeEventListener("panel-editor-ready", onReady);
        window.addEventListener("panel-editor-ready", onReady);
        tick();
      });
    },
    async mountFileEditor(content) {
      const el = document.getElementById("file-editor-host");
      if (!el) return;
      const ready = await this.waitForPanelEditor();
      if (!ready) return;
      window.PanelEditor.destroy("file");
      el.innerHTML = "";
      this.fileEditorDraftPending = false;
      const draft = window.PanelEditor.loadDraft(this.editPath);
      if (draft && draft.content !== content) {
        this.fileEditorDraftPending = true;
      }
      window.PanelEditor.mount("file", el, {
        path: this.editPath,
        content,
        minHeight: "400px",
        onSave: async (text) => {
          this.editContent = text;
          await this.saveFile();
        },
        onDirtyChange: (dirty) => {
          this.fileEditorDirty = dirty;
        }
      });
    },
    fileEditorUndo() {
      window.PanelEditor?.get("file")?.undo();
    },
    fileEditorRedo() {
      window.PanelEditor?.get("file")?.redo();
    },
    restoreFileDraft() {
      window.PanelEditor?.get("file")?.restoreDraftFromStorage();
      this.fileEditorDraftPending = false;
    },
    discardFileDraft() {
      window.PanelEditor?.get("file")?.discardDraft();
      this.fileEditorDraftPending = false;
    },
    async saveFile() {
      return this.withBusy("saveFile", async () => {
        try {
          if (this.cfgEditorMode === "form" && this.cfgStructured && this.cfgDocument) {
            const updates2 = this.collectCfgUpdates();
            const data = await this.api("PUT", "/api/bepinex/configs/apply", {
              path: this.editPath,
              updates: updates2
            });
            this.editContent = data.content;
            this.cfgSavedSnapshot = JSON.stringify(this.cfgDocument);
            this.fileEditorDirty = false;
            this.fileEditorDraftPending = false;
            window.PanelEditor?.clearDraft(this.editPath);
            this.toast(this.t("common.toasts.fileSaved"));
            return;
          }
          const editor = window.PanelEditor?.get("file");
          const content = editor ? editor.getContent() : this.editContent;
          await this.api("PUT", `/api/files/write?path=${encodeURIComponent(this.editPath)}`, { content });
          this.editContent = content;
          editor?.setContent(content, { markSaved: true });
          this.fileEditorDirty = false;
          this.fileEditorDraftPending = false;
          this.toast(this.t("common.toasts.fileSaved"));
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    }
  };

  // frontend/js/state/logs.js
  var logs = {
    logs: "",
    logSource: "docker",
    logAutoRefresh: true,
    async loadLogs() {
      return this.withBusy("loadLogs", async () => {
        try {
          const el = this.$refs.logConsole;
          const wasAtBottom = this.isLogAtBottom(el);
          const prevScrollTop = el?.scrollTop ?? 0;
          const data = await this.api("GET", `/api/logs?lines=200&source=${this.logSource}`);
          this.logs = data.logs || "";
          this.restoreLogScroll("logConsole", wasAtBottom, prevScrollTop);
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    }
  };

  // frontend/js/state/console-commands.js
  var RCON_COMMANDS = [
    { name: "save", usage: "save", descKey: "console.commands.save.desc", categoryKey: "console.categories.Server", playerArg: false },
    { name: "list", usage: "list", descKey: "console.commands.list.desc", categoryKey: "console.categories.Server", playerArg: false },
    { name: "players", usage: "players", descKey: "console.commands.players.desc", categoryKey: "console.categories.Server", playerArg: false },
    { name: "serverStats", usage: "serverStats", descKey: "console.commands.serverStats.desc", categoryKey: "console.categories.Server", playerArg: false },
    { name: "time", usage: "time", descKey: "console.commands.time.desc", categoryKey: "console.categories.Server", playerArg: false },
    { name: "logs", usage: "logs", descKey: "console.commands.logs.desc", categoryKey: "console.categories.Server", playerArg: false },
    { name: "consoleCommand", usage: "consoleCommand <command>", descKey: "console.commands.consoleCommand.desc", categoryKey: "console.categories.Server", playerArg: false },
    { name: "kick", usage: "kick <player|SteamID>", descKey: "console.commands.kick.desc", categoryKey: "console.categories.Moderation", playerArg: true },
    { name: "ban", usage: "ban <player|SteamID>", descKey: "console.commands.ban.desc", categoryKey: "console.categories.Moderation", playerArg: true },
    { name: "banSteamId", usage: "banSteamId <SteamID>", descKey: "console.commands.banSteamId.desc", categoryKey: "console.categories.Moderation", playerArg: true },
    { name: "unban", usage: "unban <player|SteamID>", descKey: "console.commands.unban.desc", categoryKey: "console.categories.Moderation", playerArg: true },
    { name: "addAdmin", usage: "addAdmin <SteamID>", descKey: "console.commands.addAdmin.desc", categoryKey: "console.categories.Moderation", playerArg: true },
    { name: "removeAdmin", usage: "removeAdmin <SteamID>", descKey: "console.commands.removeAdmin.desc", categoryKey: "console.categories.Moderation", playerArg: true },
    { name: "addPermitted", usage: "addPermitted <SteamID>", descKey: "console.commands.addPermitted.desc", categoryKey: "console.categories.Moderation", playerArg: true },
    { name: "removePermitted", usage: "removePermitted <SteamID>", descKey: "console.commands.removePermitted.desc", categoryKey: "console.categories.Moderation", playerArg: true },
    { name: "adminlist", usage: "adminlist", descKey: "console.commands.adminlist.desc", categoryKey: "console.categories.Moderation", playerArg: false },
    { name: "banlist", usage: "banlist", descKey: "console.commands.banlist.desc", categoryKey: "console.categories.Moderation", playerArg: false },
    { name: "permitted", usage: "permitted", descKey: "console.commands.permitted.desc", categoryKey: "console.categories.Moderation", playerArg: false },
    { name: "disconnectAll", usage: "disconnectAll", descKey: "console.commands.disconnectAll.desc", categoryKey: "console.categories.Moderation", playerArg: false },
    { name: "give", usage: "give <player|SteamID> <item> [options]", descKey: "console.commands.give.desc", categoryKey: "console.categories.Players", playerArg: true },
    { name: "heal", usage: "heal <player|SteamID> <health>", descKey: "console.commands.heal.desc", categoryKey: "console.categories.Players", playerArg: true },
    { name: "damage", usage: "damage <player|SteamID> <damage>", descKey: "console.commands.damage.desc", categoryKey: "console.categories.Players", playerArg: true },
    { name: "teleport", usage: "teleport <player|SteamID> <x> <y> <z>", descKey: "console.commands.teleport.desc", categoryKey: "console.categories.Players", playerArg: true },
    { name: "findPlayer", usage: "findPlayer <name>", descKey: "console.commands.findPlayer.desc", categoryKey: "console.categories.Players", playerArg: true },
    { name: "say", usage: "say <message>", descKey: "console.commands.say.desc", categoryKey: "console.categories.Chat", playerArg: false },
    { name: "showMessage", usage: "showMessage <message>", descKey: "console.commands.showMessage.desc", categoryKey: "console.categories.Chat", playerArg: false },
    { name: "ping", usage: "ping <x> <y> <z>", descKey: "console.commands.ping.desc", categoryKey: "console.categories.Chat", playerArg: false },
    { name: "spawn", usage: "spawn <prefab> <x> <y> <z> [options]", descKey: "console.commands.spawn.desc", categoryKey: "console.categories.Objects", playerArg: false },
    { name: "findObjects", usage: "findObjects [options]", descKey: "console.commands.findObjects.desc", categoryKey: "console.categories.Objects", playerArg: false },
    { name: "addGlobalKey", usage: "addGlobalKey <key>", descKey: "console.commands.addGlobalKey.desc", categoryKey: "console.categories.World", playerArg: false },
    { name: "removeGlobalKey", usage: "removeGlobalKey <key>", descKey: "console.commands.removeGlobalKey.desc", categoryKey: "console.categories.World", playerArg: false },
    { name: "globalKeys", usage: "globalKeys", descKey: "console.commands.globalKeys.desc", categoryKey: "console.categories.World", playerArg: false }
  ];
  function localizeCommands(t2) {
    return RCON_COMMANDS.map((cmd) => ({
      ...cmd,
      desc: t2(cmd.descKey),
      category: t2(cmd.categoryKey)
    }));
  }
  var COMMAND_BY_NAME = Object.fromEntries(RCON_COMMANDS.map((c) => [c.name.toLowerCase(), c]));
  function longestCommonPrefix(strings) {
    if (!strings.length) return "";
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (!strings[i].toLowerCase().startsWith(prefix.toLowerCase())) {
        prefix = prefix.slice(0, -1);
        if (!prefix) return "";
      }
    }
    return prefix;
  }
  function matchCommands(prefix) {
    const p = prefix.toLowerCase();
    return RCON_COMMANDS.filter((c) => c.name.toLowerCase().startsWith(p)).map((c) => c.name);
  }
  function playerTargets(players) {
    const list = players?.players || players || [];
    if (!Array.isArray(list)) return [];
    const targets = [];
    for (const p of list) {
      if (p.name) targets.push(String(p.name));
      if (p.steam_id) targets.push(String(p.steam_id));
    }
    return [...new Set(targets)];
  }
  function matchPlayers(prefix, players) {
    const p = prefix.toLowerCase();
    return playerTargets(players).filter((t2) => t2.toLowerCase().startsWith(p));
  }
  function parseInput(input) {
    const trimmed = (input || "").trimEnd();
    const endsWithSpace = /\s$/.test(input || "");
    const parts = trimmed.split(/\s+/).filter(Boolean);
    return { trimmed, endsWithSpace, parts };
  }
  function buildFromParts(parts, endsWithSpace) {
    if (!parts.length) return "";
    const body = parts.join(" ");
    return endsWithSpace ? body + " " : body;
  }
  function getConsoleCompletions(input, players, cycleState) {
    const { trimmed, endsWithSpace, parts } = parseInput(input);
    if (!trimmed && !endsWithSpace) return null;
    let matches = [];
    let replaceIndex = 0;
    let baseParts = [...parts];
    if (parts.length === 0 || parts.length === 1 && !endsWithSpace) {
      const prefix2 = parts[0] || "";
      matches = matchCommands(prefix2);
      replaceIndex = 0;
      baseParts = prefix2 ? [prefix2] : [];
    } else {
      const cmdName = parts[0].toLowerCase();
      const cmd = COMMAND_BY_NAME[cmdName];
      if (!cmd) return null;
      if (cmd.playerArg) {
        const argIndex = endsWithSpace ? parts.length : parts.length - 1;
        const prefix2 = endsWithSpace ? "" : parts[parts.length - 1] || "";
        if (argIndex === 1) {
          matches = matchPlayers(prefix2, players);
          replaceIndex = 1;
          baseParts = endsWithSpace ? [...parts, ""] : [...parts];
          if (endsWithSpace) baseParts.pop();
        } else {
          return null;
        }
      } else if (!endsWithSpace && parts.length === 1) {
        matches = matchCommands(parts[0]);
        replaceIndex = 0;
      } else {
        return null;
      }
    }
    if (!matches.length) return null;
    const prev = cycleState;
    const sameInput = prev && prev.input === input;
    let index = 0;
    if (sameInput && prev.matches?.length === matches.length && prev.matches.every((m, i) => m === matches[i])) {
      index = ((prev.index ?? 0) + 1) % matches.length;
    }
    const prefix = baseParts[replaceIndex] || "";
    const lcp = longestCommonPrefix(matches);
    let chosen = matches[index];
    if (matches.length > 1 && lcp.length > prefix.length && index === 0 && !sameInput) {
      chosen = lcp;
    }
    const newParts = [...baseParts];
    while (newParts.length <= replaceIndex) newParts.push("");
    newParts[replaceIndex] = chosen;
    const addTrailingSpace = replaceIndex === 0 && COMMAND_BY_NAME[chosen.toLowerCase()] && !COMMAND_BY_NAME[chosen.toLowerCase()].playerArg && chosen.length === matches[index]?.length;
    let text = buildFromParts(newParts, addTrailingSpace || replaceIndex > 0 && chosen === matches[index]);
    if (replaceIndex > 0 && chosen === matches[index] && !text.endsWith(" ")) {
      text += " ";
    }
    return { text, matches, cycleIndex: index };
  }
  function getConsoleGhostSuffix(input, players) {
    const { trimmed, endsWithSpace, parts } = parseInput(input);
    if (!trimmed || endsWithSpace) return "";
    if (parts.length === 1) {
      const matches2 = matchCommands(parts[0]);
      if (matches2.length !== 1) return "";
      const rest = matches2[0].slice(parts[0].length);
      return rest;
    }
    const cmd = COMMAND_BY_NAME[parts[0]?.toLowerCase()];
    if (!cmd?.playerArg || parts.length !== 2) return "";
    const prefix = parts[1] || "";
    const matches = matchPlayers(prefix, players);
    if (matches.length !== 1) return "";
    return matches[0].slice(prefix.length);
  }
  function groupCommandsByCategory(commands, search) {
    const q = (search || "").trim().toLowerCase();
    const filtered = q ? commands.filter(
      (c) => c.name.toLowerCase().includes(q) || c.usage.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    ) : commands;
    const groups = {};
    for (const cmd of filtered) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return Object.entries(groups).map(([category, items]) => ({ category, items }));
  }

  // frontend/js/state/console.js
  var console = {
    rconStatus: {
      available: false,
      plugin_installed: false,
      mod_enabled: false,
      configured: false,
      container_running: false
    },
    consoleInput: "",
    consoleSending: false,
    consoleHelpModalOpen: false,
    consoleHelpSearch: "",
    consoleCompleteCycle: null,
    async loadConsoleStatus() {
      try {
        this.rconStatus = await this.api("GET", "/api/console/status");
      } catch (e) {
        this.rconStatus = {
          available: false,
          plugin_installed: false,
          mod_enabled: false,
          configured: false,
          container_running: false
        };
      }
    },
    async sendConsoleCommand() {
      const command = (this.consoleInput || "").trim();
      if (!command || this.consoleSending) return;
      if (!this.rconStatus.available) {
        this.toast(this.consoleStatusHint() || this.t("common.errors.rconUnavailable"), "error");
        return;
      }
      this.consoleInput = "";
      this.consoleCompleteCycle = null;
      this.consoleSending = true;
      try {
        await this.api("POST", "/api/console/command", { command });
        await this.refreshConsoleLogs();
      } catch (e) {
        this.toast(e.message, "error");
      } finally {
        this.consoleSending = false;
      }
    },
    async refreshConsoleLogs() {
      if (this.page === "dashboard" && typeof this.loadDashLogs === "function") {
        await this.loadDashLogs();
        setTimeout(() => this.loadDashLogs(), 600);
      } else if (this.page === "logs" && typeof this.loadLogs === "function") {
        await this.loadLogs();
        setTimeout(() => this.loadLogs(), 600);
      }
    },
    onConsoleKeydown(e) {
      if (e.key === "Escape") {
        this.consoleCompleteCycle = null;
        return;
      }
      if (e.key !== "Tab") return;
      e.preventDefault();
      const players = this.players?.players || [];
      const result = getConsoleCompletions(
        this.consoleInput,
        players,
        this.consoleCompleteCycle?.input === this.consoleInput ? this.consoleCompleteCycle : null
      );
      if (!result) return;
      this.consoleInput = result.text;
      this.consoleCompleteCycle = {
        input: result.text,
        matches: result.matches,
        index: result.cycleIndex
      };
    },
    consoleGhostSuffix() {
      const players = this.players?.players || [];
      return getConsoleGhostSuffix(this.consoleInput, players);
    },
    openConsoleHelpModal() {
      this.consoleHelpSearch = "";
      this.consoleHelpModalOpen = true;
    },
    closeConsoleHelpModal() {
      this.consoleHelpModalOpen = false;
    },
    consoleCommandsByCategory() {
      void this.localeVersion;
      return groupCommandsByCategory(localizeCommands((k) => this.t(k)), this.consoleHelpSearch);
    },
    insertConsoleCommand(usage) {
      this.consoleInput = usage;
      this.consoleCompleteCycle = null;
      this.closeConsoleHelpModal();
      this.$nextTick(() => {
        document.querySelector(".console-input:not(:disabled)")?.focus();
      });
    },
    consoleStatusHint() {
      if (this.rconStatus.available) return "";
      void this.localeVersion;
      if (!this.rconStatus.bepinex_enabled) {
        return this.t("console.hints.bepinexRequired");
      }
      if (!this.rconStatus.mod_enabled) {
        return this.t("console.hints.modRequired");
      }
      if (!this.rconStatus.configured) {
        return this.t("console.hints.configPending");
      }
      if (!this.rconStatus.container_running) {
        return this.t("console.hints.serverStopped");
      }
      return this.t("console.hints.unavailable");
    }
  };

  // frontend/js/state/audit.js
  var audit = {
    audit: [],
    auditAutoRefresh: false,
    auditEntry: null,
    auditModalOpen: false,
    async loadAudit() {
      return this.withBusy("loadAudit", async () => {
        try {
          const data = await this.api("GET", "/api/audit?lines=200");
          this.audit = data.entries || [];
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    openAuditModal(entry) {
      this.auditEntry = entry;
      this.auditModalOpen = true;
    },
    closeAuditModal() {
      this.auditModalOpen = false;
      this.auditEntry = null;
    },
    auditRequestJson(entry) {
      if (!entry) return "";
      return JSON.stringify({ method: entry.method, path: entry.path, params: entry.params || {}, body: entry.request_body ?? null }, null, 2);
    },
    auditResponseJson(entry) {
      if (!entry) return "";
      return JSON.stringify({ status: entry.status, duration_ms: entry.duration_ms, error: entry.error || null, body: entry.response_body ?? null }, null, 2);
    },
    auditFullJson(entry) {
      if (!entry) return "";
      return JSON.stringify(entry, null, 2);
    }
  };

  // frontend/js/state/help.js
  var FAQ_CATEGORY_IDS = [
    "primeiros-passos",
    "servidor",
    "mundos",
    "mods",
    "backups",
    "files",
    "recursos",
    "docker",
    "problemas"
  ];
  var help = {
    faqSearch: "",
    faqOpen: {},
    getFaqCategories() {
      void this.localeVersion;
      const raw = this.tObj("help.categories") || {};
      return FAQ_CATEGORY_IDS.filter((id) => raw[id]).map((id) => ({
        id,
        label: raw[id].label,
        items: raw[id].items || []
      }));
    },
    getReferenceLinks() {
      void this.localeVersion;
      return this.tObj("help.referenceLinks") || [];
    },
    faqToggle(key) {
      this.faqOpen[key] = !this.faqOpen[key];
    },
    faqFilteredCategories() {
      const term = (this.faqSearch || "").trim().toLowerCase();
      const cats = this.getFaqCategories();
      if (!term) return cats;
      return cats.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) => it.q.toLowerCase().includes(term) || it.a.toLowerCase().includes(term)
        )
      })).filter((cat) => cat.items.length > 0);
    }
  };

  // frontend/js/state/donation.js
  var donation = {
    donationInfo: {
      links: [],
      pix_key: "",
      commercial_email: "",
      commercial_url: "",
      license: "",
      license_url: ""
    },
    getDonationPitch() {
      void this.localeVersion;
      return this.t("donation.pitch");
    },
    async loadDonationInfo() {
      try {
        const v = await this.api("GET", "/api/version");
        this.donationInfo = {
          links: v.donation?.links || [],
          pix_key: v.donation?.pix_key || "",
          commercial_email: v.donation?.commercial_email || "",
          commercial_url: v.donation?.commercial_url || "",
          license: v.license || "",
          license_url: v.license_url || ""
        };
      } catch {
      }
    },
    hasDonationOptions() {
      return (this.donationInfo.links || []).length > 0 || !!this.donationInfo.pix_key;
    }
  };

  // frontend/js/state/about.js
  var CREDIT_KEYS = ["valheimDocker", "backend", "frontend"];
  var CHANGELOG_SECTION_ORDER = ["Added", "Changed", "Deprecated", "Removed", "Fixed", "Security"];
  var about = {
    versionInfo: {
      version: "",
      commit: "",
      build_date: "",
      repo_url: "",
      license: "",
      changelog: [],
      default_locale: "en-US"
    },
    panelUpdate: {
      current: "",
      latest: "",
      update_available: false,
      can_update: false,
      deploy_mode: "",
      release_url: "",
      message: "",
      error: ""
    },
    panelUpdating: false,
    getChangelogHighlights() {
      const entries = this.versionInfo.changelog || [];
      return entries.map((entry) => ({
        version: entry.version,
        sections: CHANGELOG_SECTION_ORDER.filter((name) => entry.sections?.[name]?.length).map((name) => ({
          name,
          label: this.t(`about.changelogSections.${name.toLowerCase()}`) || name,
          items: entry.sections[name]
        }))
      })).filter((e) => e.sections.length);
    },
    changelogSectionLabel(section) {
      return this.t(`about.changelogSections.${String(section).toLowerCase()}`) || section;
    },
    getCredits() {
      void this.localeVersion;
      const raw = this.tObj("about.credits") || {};
      return CREDIT_KEYS.filter((k) => raw[k]).map((key) => ({
        label: raw[key].label,
        by: raw[key].by
      }));
    },
    async loadVersion() {
      try {
        this.versionInfo = await this.api("GET", "/api/version");
      } catch (e) {
      }
      await this.checkPanelUpdate();
    },
    async checkPanelUpdate() {
      try {
        this.panelUpdate = await this.api("GET", "/api/panel/update/check");
      } catch (e) {
        this.panelUpdate = { ...this.panelUpdate, error: e.message || String(e) };
      }
    },
    async applyPanelUpdate() {
      if (!this.panelUpdate.can_update || this.panelUpdating) return;
      return this.withBusy("panelUpdate", async () => {
        this.panelUpdating = true;
        try {
          const body = this.panelUpdate.latest ? { version: this.panelUpdate.latest } : {};
          await this.api("POST", "/api/panel/update", body);
          this.toast(this.t("about.update.started"));
        } catch (e) {
          this.panelUpdating = false;
          this.toast(e.message, "error");
        }
      });
    }
  };

  // frontend/js/state/setup.js
  var setup = {
    setupStatus: { completed: true, needs_wizard: false },
    setupWizardOpen: false,
    setupMode: "bepinex",
    setupAdminSteamId: "",
    setupWorldName: "",
    setupActivateWorld: true,
    setupRconPassword: null,
    async loadSetupStatus() {
      try {
        this.setupStatus = await this.api("GET", "/api/setup/status");
        this.setupWizardOpen = !!this.setupStatus.needs_wizard;
        if (this.setupStatus.mode) {
          this.setupMode = this.setupStatus.mode;
        }
      } catch (e) {
        this.toast(e.message, "error");
      }
    },
    async completeSetup() {
      if (this.setupMode === "vanilla" && this.setupAdminSteamId) {
        const sid = this.setupAdminSteamId.trim();
        if (!/^\d{17}$/.test(sid)) {
          this.toast(this.t("common.errors.invalidSteamId"), "error");
          return;
        }
      }
      if (this.setupWorldName.trim()) {
        const name = this.setupWorldName.trim();
        if (!/^[A-Za-z0-9_-]+$/.test(name)) {
          this.toast(this.t("common.errors.invalidWorldName"), "error");
          return;
        }
      }
      return this.withBusy("completeSetup", async () => {
        try {
          const data = await this.api("POST", "/api/setup/complete", {
            mode: this.setupMode,
            admin_steam_id: this.setupMode === "vanilla" ? this.setupAdminSteamId.trim() || null : null,
            world_name: this.setupWorldName.trim() || null,
            activate_world: this.setupActivateWorld
          });
          this.setupWizardOpen = false;
          this.setupStatus = { completed: true, needs_wizard: false, mode: data.mode };
          if (data.rcon_password) {
            this.setupRconPassword = data.rcon_password;
            this.toast(this.t("common.toasts.rconPasswordGenerated"), "success");
          } else {
            this.toast(data.mode === "vanilla" ? this.t("common.toasts.serverConfiguredVanilla") : this.t("common.toasts.serverConfiguredBepinex"));
          }
          this.bepinexEnabled = data.bepinex;
          await this.loadDashboardData();
          await this.loadWorlds();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    dismissRconPassword() {
      this.setupRconPassword = null;
    }
  };

  // frontend/js/state/storage.js
  var storage = {
    storageData: null,
    storageLoadError: null,
    backupStorageMaxGb: 0,
    backupStoragePresets: [
      { value: 1, label: "1 GB" },
      { value: 2, label: "2 GB" },
      { value: 5, label: "5 GB" },
      { value: 10, label: "10 GB" },
      { value: 20, label: "20 GB" },
      { value: 50, label: "50 GB" },
      { value: 100, label: "100 GB" }
    ],
    purgeAllBackupsModalOpen: false,
    backupStorageLimitEnabled() {
      return this.backupStorageMaxGb > 0;
    },
    _resolveBackupMaxGb(maxGb) {
      const preset = this.backupStoragePresets.find((p) => p.value === maxGb);
      return preset ? preset.value : maxGb;
    },
    async loadStorageLimits() {
      this.storageLoadError = null;
      try {
        const data = await this.api("GET", "/api/storage");
        this.storageData = data;
        const cfg = data.limits?.backups || { enabled: false, max_gb: null };
        if (!cfg.enabled || cfg.max_gb == null) {
          this.backupStorageMaxGb = 0;
        } else {
          this.backupStorageMaxGb = this._resolveBackupMaxGb(cfg.max_gb);
        }
      } catch (e) {
        this.storageLoadError = this.t("common.errors.couldNotLoadUsage");
        this.toast(e.message, "error");
      }
    },
    backupStorageLimitLabel() {
      void this.localeVersion;
      if (!this.backupStorageLimitEnabled()) return this.t("common.status.unlimited");
      return `${this.backupStorageMaxGb} GB`;
    },
    backupStorageUsedLabel() {
      if (this.storageLoadError) return this.storageLoadError;
      if (!this.storageData) return this.t("common.loading.loadingEllipsis");
      return this.formatBytes(this.backupStorageStatus().used_bytes);
    },
    backupStorageUsageDetail() {
      if (this.storageLoadError) return "";
      if (!this.storageData) return this.t("common.loading.loadingEllipsis");
      const used = this.formatBytes(this.backupStorageStatus().used_bytes);
      if (!this.backupStorageLimitEnabled()) {
        return this.t("storage.usageNoLimit", { used });
      }
      return this.t("storage.usageOfLimit", { used, limit: this.backupStorageMaxGb });
    },
    backupStorageStatus() {
      return this.storageData?.categories?.backups || {
        used_bytes: 0,
        max_bytes: null,
        percent: null,
        enabled: false
      };
    },
    backupStorageMaxBytes() {
      const status = this.backupStorageStatus();
      if (status.max_bytes) return status.max_bytes;
      if (!this.backupStorageLimitEnabled()) return null;
      return this.backupStorageMaxGb * 1024 ** 3;
    },
    backupStoragePct() {
      const status = this.backupStorageStatus();
      if (status.percent != null && status.max_bytes) return status.percent;
      const maxBytes = this.backupStorageMaxBytes();
      if (!maxBytes) return null;
      return Math.round(status.used_bytes / maxBytes * 1e3) / 10;
    },
    backupStorageBarClass() {
      return this.pctBarClass(this.backupStoragePct());
    },
    async saveBackupStorageLimit() {
      return this.withBusy("saveBackupStorageLimit", async () => {
        try {
          const maxGb = Number(this.backupStorageMaxGb);
          const payload = {
            backups: {
              enabled: maxGb > 0,
              max_gb: maxGb > 0 ? maxGb : null
            }
          };
          await this.api("PUT", "/api/storage/limits", payload);
          this.toast(this.t("common.toasts.backupLimitSaved"));
          await this.loadStorageLimits();
          if (this.page === "dashboard") await this.loadMetrics(false);
          if (this.page === "backups") await this.loadBackups();
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    openPurgeAllBackupsModal() {
      this.purgeAllBackupsModalOpen = true;
    },
    closePurgeAllBackupsModal() {
      this.purgeAllBackupsModalOpen = false;
    },
    async confirmPurgeAllBackups() {
      return this.withBusy("purgeAllBackups", async () => {
        try {
          const data = await this.api("POST", "/api/backups/purge-all", { confirm: true });
          const count = (data.deleted || []).length;
          this.toast(count ? this.t("common.toasts.purgeDeleted", { count }) : this.t("common.toasts.purgeNone"));
          this.closePurgeAllBackupsModal();
          await this.loadStorageLimits();
          if (this.page === "backups") await this.loadBackups();
          if (this.page === "dashboard") await this.loadMetrics(false);
        } catch (e) {
          this.toast(e.message, "error");
        }
      });
    },
    diskLimitPct(category) {
      const limits = this.metrics?.disk?.limits?.[category];
      if (!limits?.max_bytes) return null;
      return limits.percent ?? Math.round(limits.used_bytes / limits.max_bytes * 1e3) / 10;
    },
    backupsDiskLimitActive() {
      return !!this.metrics?.disk?.limits?.backups?.max_bytes;
    }
  };

  // frontend/js/main.js
  function panel() {
    const core = {
      page: "dashboard",
      loading: false,
      toasts: [],
      // ── Core network + UX ──
      async api(method, url, body) {
        const opts = { method, headers: {} };
        if (body && !(body instanceof FormData)) {
          opts.headers["Content-Type"] = "application/json";
          opts.body = JSON.stringify(body);
        } else if (body) {
          opts.body = body;
        }
        const res = await fetch(url, opts);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || data.message || `Error ${res.status}`);
        return data;
      },
      toast(msg, type = "success") {
        this.toasts.push({ msg, type });
        setTimeout(() => this.toasts.shift(), 4e3);
      },
      async copyText(text) {
        try {
          await navigator.clipboard.writeText(text);
          this.toast(this.t("common.toasts.copied"));
        } catch (e) {
          this.toast(this.t("common.toasts.failedToCopy"), "error");
        }
      },
      // ── Lifecycle ──
      async init() {
        this.actionPending = null;
        this.initNav();
        await this.loadVersion();
        this.initI18nFromApi(this.versionInfo.default_locale || "en-US");
        await this.loadSetupStatus();
        await this.loadDashboardData();
        await this.loadMemoryConfig();
        if (this.page === "dashboard") this.startMetricsPolling();
        setInterval(() => {
          if (this.page === "dashboard") {
            this.refreshStatus();
            this.loadPlayers();
            this.loadPlayerLists();
          }
        }, 1e4);
        setInterval(() => {
          if (this.page === "dashboard") this.loadDashLogs();
        }, 5e3);
        setInterval(() => {
          if (this.page === "logs" && this.logAutoRefresh) this.loadLogs();
        }, 5e3);
        setInterval(() => {
          if (this.page === "audit" && this.auditAutoRefresh) this.loadAudit();
        }, 5e3);
      },
      async onPageChange() {
        if (this.metricsActive()) {
          this.startMetricsPolling();
          this.$nextTick(() => {
            this.ensureNetChart();
            if (this.netChartInstance) this.netChartInstance.resize();
          });
        } else {
          this.stopMetricsPolling();
        }
        if (this.page === "server") await this.loadServerPage();
        if (this.page === "mods") await this.loadModsPage();
        if (this.page === "worlds") await this.loadWorldsPage();
        if (this.page === "backups") await this.loadBackups();
        if (this.page === "files") {
          await this._fetchFileTree();
          this.$nextTick(() => {
            if (this.editPath && this.cfgEditorMode === "raw" && this.editContent) {
              this.mountFileEditor(this.editContent);
            }
          });
        }
        if (this.page === "logs") {
          await this.loadLogs();
          await this.loadConsoleStatus();
        }
        if (this.page === "audit") await this.loadAudit();
        if (this.page === "about") await this.loadVersion();
        if (this.page === "donation") {
          await this.loadVersion();
          await this.loadDonationInfo();
        }
        if (this.page !== "files" && this.page !== "server") {
          window.PanelEditor?.destroy("file");
          window.PanelEditor?.destroy("list-admin");
          window.PanelEditor?.destroy("list-banned");
          window.PanelEditor?.destroy("list-permitted");
        }
      },
      async withBusy(key, fn) {
        if (this.actionPending) return;
        this.actionPending = key;
        try {
          return await fn.call(this);
        } finally {
          this.actionPending = null;
        }
      },
      isBusy(key) {
        return this.actionPending === key;
      },
      isBusyGroup(...keys) {
        return keys.includes(this.actionPending);
      },
      isBusyPrefix(prefix) {
        const k = this.actionPending;
        return !!k && k.startsWith(prefix);
      }
    };
    return Object.assign(
      {},
      createI18nMixin(),
      helpers,
      nav,
      dashboard,
      resources,
      server,
      worlds,
      mods,
      updates,
      backups,
      files,
      logs,
      console,
      audit,
      help,
      donation,
      about,
      setup,
      storage,
      core
    );
  }
  window.panel = panel;
})();
