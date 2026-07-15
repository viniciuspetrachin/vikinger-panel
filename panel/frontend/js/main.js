import { createI18nMixin } from "./i18n/index.js";
import { helpers } from "./helpers.js";
import { nav } from "./nav.js";
import { dashboard } from "./state/dashboard.js";
import { resources } from "./state/resources.js";
import { server } from "./state/server.js";
import { worlds } from "./state/worlds.js";
import { mods } from "./state/mods.js";
import { updates } from "./state/updates.js";
import { backups } from "./state/backups.js";
import { messages } from "./state/messages.js";
import { files } from "./state/files.js";
import { logs } from "./state/logs.js";
import { console as consoleState } from "./state/console.js";
import { audit } from "./state/audit.js";
import { pagination } from "./state/pagination.js";
import { help } from "./state/help.js";
import { donation } from "./state/donation.js";
import { about } from "./state/about.js";
import { setup } from "./state/setup.js";
import { storage } from "./state/storage.js";
import { theme } from "./state/theme.js";
import { ws } from "./state/ws.js";
import { metricsPage } from "./state/metrics.js";
import { mapPage } from "./state/map.js";
import { alerts } from "./state/alerts.js";
import { schedule } from "./state/schedule.js";

function panel() {
  const core = {
    page: "dashboard",
    loading: false,
    pageLoading: {},
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
      setTimeout(() => this.toasts.shift(), 4000);
    },

    async copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.toast(this.t("common.toasts.copied"));
      } catch (e) {
        this.toast(this.t("common.toasts.failedToCopy"), "error");
      }
    },

    /** Soft page-load flag (does not block withBusy). Stale data stays visible. */
    async withPageLoad(key, fn) {
      this.pageLoading = { ...this.pageLoading, [key]: true };
      try {
        return await fn.call(this);
      } finally {
        this.pageLoading = { ...this.pageLoading, [key]: false };
      }
    },

    isPageLoading(key) {
      return !!this.pageLoading?.[key];
    },

    // ── Lifecycle ──
    async init() {
      this.actionPending = null;
      this.initTheme();
      this.initNav();
      await this.loadVersion();
      this.initI18nFromApi(this.versionInfo.default_locale || "en-US");
      // Open live socket early; REST fills the gap until the first frame.
      this.initLive();
      await Promise.all([
        this.loadSetupStatus(),
        this.loadDashboardData(),
        this.loadMemoryConfig(),
      ]);
      if (this.metricsActive()) this.startMetricsPolling();
      // REST polling as a fallback for when the live socket is unavailable.
      setInterval(() => {
        if (this.liveActive()) return;
        if (this.page === "dashboard" || this.page === "players") {
          this.refreshStatus();
          this.loadPlayers();
          this.loadPlayerLists();
        }
      }, 10000);
      setInterval(() => { if (this.page === "console" && this.logAutoRefresh) this.loadLogs(); }, 5000);
      setInterval(() => { if (this.page === "audit" && this.auditAutoRefresh) this.loadAudit(); }, 5000);
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
      if (this.page === "messages") await this.loadAutoMessages();
      if (this.page === "players") {
        await this.withPageLoad("players", async () => {
          await Promise.all([
            this.loadPlayers(),
            this.loadPlayerLists(),
            this.loadConsoleStatus(),
          ]);
        });
      }
      if (this.page === "map") await this.loadMapPage();
      if (this.page === "metrics") {
        await this.loadMetricsHistory();
      }
      if (this.page === "alerts") await this.loadAlerts();
      if (this.page === "schedule") await this.loadSchedule();
      if (this.page === "files") {
        await this._fetchFileTree();
        this.$nextTick(() => {
          if (this.editPath && this.cfgEditorMode === "raw" && this.editContent) {
            this.mountFileEditor(this.editContent);
          }
        });
      }
      if (this.page === "console") {
        await this.withPageLoad("console", async () => {
          await Promise.all([this.loadLogs(), this.loadConsoleStatus()]);
        });
      }
      if (this.page === "audit") await this.loadAudit();
      if (this.page === "about") await this.loadAboutPage();
      if (this.page === "donation") {
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
    },
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
    messages,
    files,
    logs,
    consoleState,
    audit,
    pagination,
    help,
    donation,
    about,
    setup,
    storage,
    theme,
    ws,
    metricsPage,
    mapPage,
    alerts,
    schedule,
    core,
  );
}

window.panel = panel;
