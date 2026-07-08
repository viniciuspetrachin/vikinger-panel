import { formatRateTick } from "../helpers.js";

export const dashboard = {
  status: {},
  metrics: {},
  players: { count: 0, players: [], online: false },
  playerLists: { admin: [], banned: [], permitted: [] },
  playersExpanded: false,
  metricsChartExpanded: false,
  metricsLoading: false,
  metricsPollCount: 0,
  dashLogs: "",
  actionPending: null,
  netChartInstance: null,
  metricsInterval: null,

  async loadDashboardData() {
    await this.refreshStatus();
    await Promise.all([this.loadPlayers(), this.loadPlayerLists()]);
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

  async updatePlayerList(kind, ids) {
    await this.api("PUT", `/api/config/serverlists/${kind}`, { ids });
    this.playerLists[kind] = ids;
  },

  async togglePlayerAdmin(steamId) {
    const sid = String(steamId);
    return this.withBusy(`playerAdmin:${sid}`, async () => {
      try {
        const ids = [...(this.playerLists.admin || [])];
        const idx = ids.indexOf(sid);
        if (idx >= 0) {
          ids.splice(idx, 1);
          await this.updatePlayerList("admin", ids);
          this.toast(`${sid} removido de administradores`);
        } else {
          ids.push(sid);
          await this.updatePlayerList("admin", ids);
          this.toast(`${sid} promovido a administrador`);
        }
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async togglePlayerBan(steamId, name) {
    const sid = String(steamId);
    const label = name && name !== sid ? name : sid;
    if (this.isPlayerBanned(sid)) {
      return this.withBusy(`playerBan:${sid}`, async () => {
        try {
          const ids = (this.playerLists.banned || []).filter((id) => id !== sid);
          await this.updatePlayerList("banned", ids);
          this.toast(`${label} desbanido`);
        } catch (e) { this.toast(e.message, "error"); }
      });
    }
    if (!confirm(`Banir ${label} (${sid})? O jogador será desconectado na próxima reinicialização.`)) return;
    return this.withBusy(`playerBan:${sid}`, async () => {
      try {
        const ids = [...(this.playerLists.banned || [])];
        if (!ids.includes(sid)) ids.push(sid);
        await this.updatePlayerList("banned", ids);
        this.toast(`${label} banido`);
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async serverAction(action) {
    return this.withBusy(`server:${action}`, async () => {
      try {
        await this.api("POST", `/api/server/${action}`);
        this.toast(`Ação "${action}" executada`);
        setTimeout(() => this.refreshStatus(), 2000);
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  cpuPercent() {
    return this.metrics.cpu?.percent ?? 0;
  },

  connectAddress() {
    const port = this.status.config?.server_port || "2456";
    const host = window.location.hostname || "SEU_IP";
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
    return this.page === "dashboard";
  },

  startMetricsPolling() {
    if (this.metricsInterval) return;
    this.metricsLoading = true;
    this.metricsPollCount = 0;
    this.loadMetrics(true);
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
    if (this.netChartInstance) return true;

    const ctx = canvas.getContext("2d");
    this.netChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          { label: "Download", data: [], borderColor: "#4ade80", backgroundColor: "rgba(74, 222, 128, 0.12)", fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2 },
          { label: "Upload", data: [], borderColor: "#fbbf24", backgroundColor: "rgba(251, 191, 36, 0.12)", fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2 },
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

  pushNetChartPoint(rx, tx) {
    if (!this.netChartInstance) return;
    const labels = this.netChartInstance.data.labels;
    const rxData = this.netChartInstance.data.datasets[0].data;
    const txData = this.netChartInstance.data.datasets[1].data;
    const t = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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
      this.metrics = await this.api("GET", url);
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
