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
import { files } from "./state/files.js";
import { logs } from "./state/logs.js";
import { console as consoleState } from "./state/console.js";
import { audit } from "./state/audit.js";
import { help } from "./state/help.js";
import { donation } from "./state/donation.js";
import { about } from "./state/about.js";
import { setup } from "./state/setup.js";
import { storage } from "./state/storage.js";

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
      setInterval(() => { if (this.page === "dashboard") { this.refreshStatus(); this.loadPlayers(); this.loadPlayerLists(); } }, 10000);
      setInterval(() => { if (this.page === "dashboard") this.loadDashLogs(); }, 5000);
      setInterval(() => { if (this.page === "logs" && this.logAutoRefresh) this.loadLogs(); }, 5000);
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
    files,
    logs,
    consoleState,
    audit,
    help,
    donation,
    about,
    setup,
    storage,
    core,
  );
}

window.panel = panel;
