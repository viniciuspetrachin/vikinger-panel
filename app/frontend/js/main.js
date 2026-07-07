import { helpers } from "./helpers.js";
import { nav } from "./nav.js";
import { dashboard } from "./state/dashboard.js";
import { resources } from "./state/resources.js";
import { server } from "./state/server.js";
import { worlds } from "./state/worlds.js";
import { mods } from "./state/mods.js";
import { backups } from "./state/backups.js";
import { files } from "./state/files.js";
import { logs } from "./state/logs.js";
import { audit } from "./state/audit.js";
import { help } from "./state/help.js";
import { about } from "./state/about.js";

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
      if (!res.ok) throw new Error(data.detail || data.message || `Erro ${res.status}`);
      return data;
    },

    toast(msg, type = "success") {
      this.toasts.push({ msg, type });
      setTimeout(() => this.toasts.shift(), 4000);
    },

    async copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.toast("Copiado!");
      } catch (e) {
        this.toast("Falha ao copiar", "error");
      }
    },

    // ── Lifecycle ──
    async init() {
      this.actionPending = null;
      this.initNav();
      await this.loadDashboardData();
      await this.loadMemoryConfig();
      await this.loadVersion();
      setInterval(() => { if (this.page === "dashboard") { this.refreshStatus(); this.loadPlayers(); } }, 10000);
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
      if (this.page === "resources") {
        await this.loadMemoryConfig();
        this.$nextTick(() => this.startMetricsPolling());
      }
      if (this.page === "files") {
        await this.loadFileTree();
        this.$nextTick(() => {
          if (this.editPath && this.editContent) this.mountFileEditor(this.editContent);
        });
      }
      if (this.page === "logs") await this.loadLogs();
      if (this.page === "audit") await this.loadAudit();
      if (this.page === "about") await this.loadVersion();

      if (this.page !== "files" && this.page !== "server") {
        window.PanelEditor?.destroy("file");
        window.PanelEditor?.destroy("list-admin");
        window.PanelEditor?.destroy("list-banned");
        window.PanelEditor?.destroy("list-permitted");
      }
    },
  };

  const panelData = Object.assign(
    {},
    helpers,
    nav,
    dashboard,
    resources,
    server,
    worlds,
    mods,
    backups,
    files,
    logs,
    audit,
    help,
    about,
    core,
  );

  panelData.withBusy = async function (key, fn) {
    if (panelData.actionPending) return;
    panelData.actionPending = key;
    try {
      return await fn.call(panelData);
    } finally {
      panelData.actionPending = null;
    }
  };

  panelData.isBusy = function (key) {
    return panelData.actionPending === key;
  };

  return panelData;
}

window.panel = panel;
