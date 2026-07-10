// Help: data-driven FAQ + search + reference links.

export const help = {
  faqSearch: "",
  faqOpen: {},

  faqCategories: [
    {
      id: "primeiros-passos",
      label: "Getting started",
      items: [
        { q: "How do my friends join the server?", a: "In Valheim, use <b>Join via IP</b> and enter <code>YOUR_IP:2456</code> (the default port is 2456). Then enter the server password. The current address appears on the <b>Overview</b> tab, in the “How to connect” block." },
        { q: "Where do I set the server name and password?", a: "On the <b>Server</b> tab. The password must be at least 5 characters and cannot contain the server name. Save and restart to apply." },
        { q: "The server doesn't show up in the public list. What now?", a: "Valheim's public list often takes a few minutes and sometimes fails. Prefer <b>Join via IP</b>. Also confirm that <code>SERVER_PUBLIC</code> is set to <code>true</code> on the Server tab." },
        { q: "Do I need to open ports on my router?", a: "Yes — to play over the internet, forward UDP ports <b>2456–2458</b> to the server machine (port forwarding)." },
        { q: "How do I enable crossplay (PC + Xbox/Game Pass)?", a: "On the Server tab, add <code>-crossplay</code> in the <b>Extra arguments</b> field and restart." },
      ],
    },
    {
      id: "servidor",
      label: "Server",
      items: [
        { q: "What's the difference between Start, Stop, Restart, Pause, and Resume?", a: "<b>Start/Stop/Restart</b> turn the entire container on/off. <b>Pause/Resume</b> only suspend the Valheim process inside the container (faster, keeps the container running)." },
        { q: "What are the Administrators, Banned, and Permitted lists?", a: "Steam ID lists. <b>Admin</b> gets moderation commands; <b>Banned</b> players cannot join; <b>Permitted</b> works as a whitelist (if filled, only those IDs can join). On <b>Overview</b>, use the <b>Actions</b> menu next to each connected player to promote, kick, or ban without editing files manually." },
        { q: "How do I use the panel's interactive console?", a: "The <b>ValheimRcon</b> mod is built into the panel (<b>Integrated</b> badge on the Mods tab). In <b>Modded (BepInEx)</b> mode, the RCON password is generated automatically on first setup. Console and moderation require BepInEx active and the mod enabled." },
        { q: "How do I change the RCON password?", a: "Edit <code>config/bepinex/org.tristan.rcon.cfg</code> (the <code>Password</code> field) on Mods → ValheimRcon config, or set <code>PANEL_RCON_PASSWORD</code> in <code>.env</code>. Restart the server after changing." },
        { q: "What's the difference between kick and ban?", a: "<b>Kick</b> disconnects the player immediately, but they can rejoin. <b>Ban</b> blocks the Steam ID on the ban list until you unban them. Both require ValheimRcon enabled and an RCON password configured." },
        { q: "Can I remove ValheimRcon?", a: "No — it is integrated into the panel and cannot be removed. You can <b>disable</b> it on the Mods tab; when you switch back to Modded (BepInEx) mode, it is re-enabled automatically." },
        { q: "How do I find a player's Steam ID?", a: "Connected players appear on Overview with name and Steam ID. For offline players, use <a href=\"https://steamid.io\" target=\"_blank\" rel=\"noopener\">steamid.io</a> and copy the <b>steamID64</b> (17 digits)." },
      ],
    },
    {
      id: "mundos",
      label: "Worlds",
      items: [
        { q: "How do I create a new world?", a: "On the <b>Worlds</b> tab, enter a name and click <b>Create</b> (stays pending) or <b>Create & Activate</b> (switches the server to it). A world is only actually generated on first boot." },
        { q: "What are the presets (Easy, Hard, Hardcore...)?", a: "They are the same modifiers as Valheim's world creation screen, saved in the <code>.fwl</code> file. You can use a preset and still override individual settings (combat, resources, raids, portals, death penalty)." },
        { q: "Can I import a world I already have?", a: "Yes. Copy <code>WorldName.fwl</code> and <code>WorldName.db</code> to <code>config/worlds_local/</code> (Files tab or Docker volume) and it will appear in the list." },
        { q: "Does switching worlds delete the previous one?", a: "No. Switching only changes which world is active; progress on other worlds remains saved in <code>config/worlds_local/</code>." },
      ],
    },
    {
      id: "mods",
      label: "Mods & BepInEx",
      items: [
        { q: "How do I install a mod?", a: "On <b>Mods & Config</b>, paste a <a href=\"https://thunderstore.io/c/valheim/\" target=\"_blank\" rel=\"noopener\">Thunderstore</a> URL (page, download link, or r2modman) and click Install, or upload a <code>.zip</code>/<code>.dll</code>." },
        { q: "Do players need the mod too?", a: "It depends on the mod. Server-side mods (e.g. ServerSideMap) run only on the server; most gameplay/UI mods must be installed on each player's client at the same version." },
        { q: "What is BepInEx?", a: "It is the mod loader used by Valheim. Each mod usually generates a <code>.cfg</code> file in <code>config/bepinex</code>, editable on the Mods & Config tab." },
        { q: "Vanilla or modded?", a: "On <b>first launch</b> or on <b>Server</b> → <b>Game updates</b>, choose <b>Vanilla</b> (disables BepInEx and all mods) or <b>Modded</b> (enables BepInEx and integrated ValheimRcon). In vanilla mode, use <b>Administrators</b> in Player Lists to be admin in-game." },
        { q: "How do game updates work?", a: "The container uses <code>valheim-updater</code> (SteamCMD). On the <b>Server</b> tab you can enable auto-update, disable it, or click <b>Check for updates now</b>. With mods installed, prefer updating manually after checking compatibility." },
        { q: "Can updates break mods?", a: "Yes. A Valheim patch may require new mod versions. Back up, update the game, then use <b>Check for updates</b> on each Thunderstore-linked mod." },
        { q: "How do I update a mod?", a: "Mods installed via Thunderstore show version status. Use <b>Check for updates</b> and, if a new version is available, <b>Update mod</b>. Uploaded mods must be <b>linked</b> to a Thunderstore URL for automatic checks." },
        { q: "I enabled/disabled a mod and nothing changed.", a: "Mod changes require a <b>server restart</b>. Use the Restart button on Overview." },
      ],
    },
    {
      id: "backups",
      label: "Backups",
      items: [
        { q: "Are backups automatic?", a: "Yes. On the <b>Backups</b> tab, under <b>Automatic schedule</b>, you set the interval. The container copies <code>worlds_local/</code> to <code>config/backups/</code> as <code>worlds-*.zip</code> files. Retention: 30 days." },
        { q: "How do I back up right now?", a: "Click <b>Create manual backup</b> and choose the type: Active world (quick), Full, or Configs only." },
        { q: "How do I restore a backup?", a: "In the backup list, click <b>Restore to here</b> on the desired point. The panel creates a checkpoint, restores files, and restarts the server. Use <b>Restore to latest</b> or <b>Undo last restore</b> to go back." },
        { q: "What is Run scheduled now?", a: "Manually triggers the same backup job that runs on the configured interval — different from <b>Create manual backup</b>, which lets you choose scope (world, full, or configs)." },
        { q: "Can I limit how much disk backups use?", a: "Yes. On the <b>Server</b> tab, under <b>Backup disk usage</b>, enable the limit and set a maximum size in GB. When exceeded, the oldest backups are deleted first (disabled by default)." },
        { q: "What does Clear all backups now do?", a: "On the <b>Server</b> tab, this irreversibly deletes every backup ZIP in <code>config/backups/</code>, except backups tied to an active restore or undo checkpoint." },
      ],
    },
    {
      id: "files",
      label: "Files",
      items: [
        { q: "How do I find a specific file quickly?", a: "On the <b>Files</b> tab, use the search box to filter by file name. Matching files appear in a flat list for fast access." },
        { q: "What are the file type filters?", a: "Click chips such as <b>Config</b>, <b>DLLs</b>, <b>Plugins</b>, or <b>Worlds</b> to narrow the tree to common file types — useful when you only need to edit a few configs or mod files." },
      ],
    },
    {
      id: "recursos",
      label: "Resources & performance",
      items: [
        { q: "How much RAM does the server need?", a: "A Valheim server typically uses 2–4 GB, increasing with more players/mods. Adjust the cap on the <b>Server</b> tab under <b>Server capacity</b>. Real-time metrics are on <b>Overview</b>." },
        { q: "How do I set the player limit?", a: "On the <b>Server</b> tab under <b>Server capacity</b>. Vanilla supports up to 10 players; above that you need a mod (Valheim Plus or MaxPlayerCount). The panel syncs the value to the mod's .cfg if installed." },
        { q: "Does changing the RAM limit disconnect players?", a: "Yes — applying a new limit recreates the container and disconnects anyone online. Do this during quiet hours." },
      ],
    },
    {
      id: "docker",
      label: "Installation & Docker",
      items: [
        { q: "How do I run the panel + server?", a: "Copy <code>.env.example</code> to <code>.env</code>, adjust values, and run <code>docker compose up -d</code>. The panel is at <code>http://YOUR_IP:8080</code>." },
        { q: "I'm getting permission errors on folders.", a: "When running via Docker, the panel and server use the same user (UID/GID 1000) and share volumes, so permission errors should not occur. Confirm that <code>config/</code> and <code>data/</code> belong to UID 1000." },
        { q: "Is it safe to mount docker.sock in the panel?", a: "The panel needs <code>docker.sock</code> to control the Valheim container. This grants Docker control to the panel container — keep the panel on a private network/behind a proxy with authentication in production." },
      ],
    },
    {
      id: "problemas",
      label: "Troubleshooting",
      items: [
        { q: "Where do I see what's happening?", a: "Open <b>Logs</b> (docker/BepInEx) in the Tools section. The <b>Audit</b> tab shows all actions taken by the panel. Real-time CPU and RAM are on <b>Overview</b>." },
        { q: "The panel is unresponsive / showing error 500.", a: "Check Logs and Audit. Confirm Docker is running and the <code>valheim-server</code> container exists." },
        { q: "A change didn't apply.", a: "Many changes (mods, lists, running world config) only take effect after restarting the server." },
      ],
    },
  ],

  referenceLinks: [
    { label: "Official Valheim Wiki", url: "https://valheim.fandom.com/wiki/Valheim_Wiki" },
    { label: "Thunderstore (Valheim mods)", url: "https://thunderstore.io/c/valheim/" },
    { label: "BepInEx (mod loader)", url: "https://docs.bepinex.dev/" },
    { label: "lloesche/valheim-server Docker image", url: "https://github.com/lloesche/valheim-server-docker" },
    { label: "Dedicated server (official guide)", url: "https://valheim.fandom.com/wiki/Hosting_a_Dedicated_Server" },
  ],

  faqToggle(key) {
    this.faqOpen[key] = !this.faqOpen[key];
  },

  faqFilteredCategories() {
    const term = (this.faqSearch || "").trim().toLowerCase();
    if (!term) return this.faqCategories;
    return this.faqCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) => it.q.toLowerCase().includes(term) || it.a.toLowerCase().includes(term),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  },
};
