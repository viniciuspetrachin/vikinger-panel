import { formatRateTick } from "../helpers.js";

export const dashboard = {
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
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async loadPlayerLists() {
    try {
      this.playerLists = await this.api("GET", "/api/config/serverlists");
    } catch (e) { /* silencioso no dashboard */ }
  },

  async loadPlayers() {
    try {
      this.players = await this.api("GET", "/api/players");
      const count = this.players.count ?? 0;
      const listLen = (this.players.players || []).length;
      this.playersExpanded = count > 0 || listLen > 0;
    } catch (e) { /* silencioso no dashboard */ }
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
      return this.isPlayerAdmin(steamId)
        ? this.t("dashboard.players.demote")
        : this.t("dashboard.players.promote");
    }
    if (action === "ban") {
      return this.isPlayerBanned(steamId)
        ? this.t("dashboard.players.unban")
        : this.t("dashboard.players.ban");
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
          demote: this.t("common.toasts.playerDemoted", { label }),
        };
        this.toast(messages[action] || this.t("common.toasts.actionCompleted"));
        if (data.synced) {
          this.playerLists[data.synced.kind] = data.synced.ids;
        } else {
          await this.loadPlayerLists();
        }
        await this.loadPlayers();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async serverAction(action) {
    return this.withBusy(`server:${action}`, async () => {
      try {
        await this.api("POST", `/api/server/${action}`);
        const toastKey = action === "recreate"
          ? "common.toasts.configSavedRecreated"
          : "common.toasts.serverActionCompleted";
        this.toast(this.t(toastKey, { action }));
        setTimeout(() => this.refreshStatus(), 2000);
      } catch (e) { this.toast(e.message, "error"); }
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
    } catch (e) { /* silencioso no dashboard */ }
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
    return this.page === "dashboard" || this.page === "metrics";
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
    }, 5000);
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
          { label: this.t("console.chart.upload"), data: [], borderColor: "#fbbf24", backgroundColor: "rgba(251, 191, 36, 0.12)", fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { intersect: false, mode: "index" },
        scales: {
          x: { display: true, ticks: { maxTicksLimit: 8, color: "#6b7280", font: { size: 10 }, maxRotation: 0 }, grid: { color: "rgba(42, 61, 53, 0.45)" } },
          y: { beginAtZero: true, suggestedMin: 0, suggestedMax: 1024, ticks: { color: "#6b7280", font: { size: 10 }, callback: (v) => formatRateTick(v) }, grid: { color: "rgba(42, 61, 53, 0.45)" } },
        },
        plugins: {
          legend: { labels: { color: "#9ca3af", boxWidth: 12, font: { size: 11 } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatRateTick(ctx.parsed.y)}` } },
        },
      },
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
    const t = new Date().toLocaleTimeString(this.locale || "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    labels.push(t);
    rxData.push(Number(rx) || 0);
    txData.push(Number(tx) || 0);
    const maxPoints = 60;
    while (labels.length > maxPoints) { labels.shift(); rxData.shift(); txData.shift(); }
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
  },
};
