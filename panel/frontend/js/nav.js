// Sidebar information architecture.
//
// Primary nav is a flat list of destinations. "Config" is a hub whose
// sub-sections (server, worlds, messages, schedule, files, audit,
// help, about, donation) are reached through an in-page subnav.
// Discord alerts live as a primary sidebar item (easy to find / extend).

const icons = {
  dashboard: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>',
  players: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a3 3 0 10-2.5-4.66"/></svg>',
  mods: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>',
  map: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>',
  backups: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>',
  console: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
  metrics: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3v18h18M7 14l3-3 3 3 5-6"/></svg>',
  config: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  server: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>',
  worlds: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  files: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>',
  audit: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>',
  help: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  messages: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>',
  // Discord-style chat glyph for the alerts / Discord primary nav item.
  discord: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.1.1 0 00-.07.03c-.18.33-.39.76-.53 1.09a16.1 16.1 0 00-4.8 0c-.14-.34-.37-.76-.54-1.09-.02-.01-.04-.02-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02C2.87 9.08 2.13 12.72 2.5 16.33c0 .02.01.04.03.05a16.3 16.3 0 004.92 2.49c.03.01.06 0 .07-.02.38-.52.72-1.07 1.01-1.64.02-.04 0-.08-.04-.1-.54-.2-1.05-.45-1.54-.73-.04-.02-.04-.08-.01-.11.1-.08.21-.16.31-.24.02-.01.05-.01.07 0a11.8 11.8 0 0010.05 0c.02-.01.05-.01.07 0 .1.09.21.17.31.25.04.03.04.09-.01.11-.49.28-1 .53-1.54.73-.04.02-.05.06-.04.1.3.57.64 1.12 1.01 1.64.02.02.05.03.08.02a16.3 16.3 0 004.93-2.49c.02-.01.03-.03.03-.05.45-4.17-.74-7.78-3.13-11-.01-.01-.02-.02-.04-.02zM8.52 14.18c-.98 0-1.79-.9-1.79-2.01s.79-2.01 1.79-2.01 1.81.9 1.79 2.01c0 1.11-.81 2.01-1.79 2.01zm6.96 0c-.98 0-1.79-.9-1.79-2.01s.79-2.01 1.79-2.01 1.81.9 1.79 2.01c0 1.11-.81 2.01-1.79 2.01z"/></svg>',
  schedule: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  donation: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>',
  about: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
};

// Sub-sections reachable under Config (alerts/Discord is primary nav).
const CONFIG_PAGES = ["server", "worlds", "messages", "schedule", "files", "audit", "help", "about", "donation"];

export const nav = {
  navPrimary: [
    { id: "dashboard", labelKey: "nav.items.overview", icon: icons.dashboard },
    { id: "players", labelKey: "nav.items.players", icon: icons.players },
    { id: "mods", labelKey: "nav.items.mods", icon: icons.mods },
    { id: "map", labelKey: "nav.items.map", icon: icons.map, badgeKey: "nav.badges.beta" },
    { id: "backups", labelKey: "nav.items.backups", icon: icons.backups },
    { id: "console", labelKey: "nav.items.console", icon: icons.console },
    { id: "metrics", labelKey: "nav.items.metrics", icon: icons.metrics },
    { id: "alerts", labelKey: "nav.items.discord", icon: icons.discord },
    { id: "config", labelKey: "nav.items.config", icon: icons.config },
  ],

  configTabs: [
    { id: "server", labelKey: "nav.items.server", icon: icons.server },
    { id: "worlds", labelKey: "nav.items.worlds", icon: icons.worlds },
    { id: "messages", labelKey: "nav.items.messages", icon: icons.messages },
    { id: "schedule", labelKey: "nav.items.schedule", icon: icons.schedule },
    { id: "files", labelKey: "nav.items.files", icon: icons.files },
    { id: "audit", labelKey: "nav.items.audit", icon: icons.audit },
    { id: "help", labelKey: "nav.items.help", icon: icons.help },
    { id: "about", labelKey: "nav.items.about", icon: icons.about },
    { id: "donation", labelKey: "nav.items.donation", icon: icons.donation },
  ],

  sidebarOpen: false,
  lastConfigTab: "server",

  initNav() {},

  configPages() {
    return CONFIG_PAGES;
  },

  isConfigPage(id = this.page) {
    return CONFIG_PAGES.includes(id);
  },

  visiblePrimary() {
    void this.localeVersion;
    return this.navPrimary.map((item) => ({
      ...item,
      label: this.t(item.labelKey),
      badge: item.badgeKey ? this.t(item.badgeKey) : "",
    }));
  },

  visibleConfigTabs() {
    void this.localeVersion;
    return this.configTabs.map((item) => ({ ...item, label: this.t(item.labelKey) }));
  },

  isPrimaryActive(id) {
    if (id === "config") return this.isConfigPage();
    return this.page === id;
  },

  allNavItems() {
    return [...this.navPrimary, ...this.configTabs].map((item) => ({
      ...item,
      label: this.t(item.labelKey),
    }));
  },

  pageTitle() {
    void this.localeVersion;
    if (this.isConfigPage()) return this.t("nav.items.config");
    return this.allNavItems().find((i) => i.id === this.page)?.label || "";
  },

  configTabTitle() {
    void this.localeVersion;
    return this.configTabs.find((i) => i.id === this.page)?.labelKey
      ? this.t(this.configTabs.find((i) => i.id === this.page).labelKey)
      : "";
  },

  goToPage(id) {
    if (id === "config") {
      id = CONFIG_PAGES.includes(this.lastConfigTab) ? this.lastConfigTab : "server";
    }
    if (CONFIG_PAGES.includes(id)) this.lastConfigTab = id;
    this.page = id;
    this.sidebarOpen = false;
    this.onPageChange();
  },

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  },
};
