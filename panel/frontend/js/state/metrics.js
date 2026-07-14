// Metrics page: historical Chart.js series (1h/24h/7d) with a container /
// aggregate toggle, plus the small live sparkline used on the Overview cockpit.

export const metricsPage = {
  metricsRange: "1h",
  metricsContainer: "valheim-server",
  metricsHistory: [],
  metricsHistLoading: false,
  histChartInstance: null,
  liveSparkline: [],

  metricsRanges() {
    void this.localeVersion;
    return [
      { id: "1h", label: this.t("metricsPage.ranges.1h") },
      { id: "24h", label: this.t("metricsPage.ranges.24h") },
      { id: "7d", label: this.t("metricsPage.ranges.7d") },
    ];
  },

  metricsContainers() {
    void this.localeVersion;
    return [
      { id: "valheim-server", label: this.t("metricsPage.containers.server") },
      { id: "vikinger-panel", label: this.t("metricsPage.containers.panel") },
    ];
  },

  async loadMetricsPage() {
    await this.loadMetricsHistory();
  },

  async loadMetricsHistory() {
    this.metricsHistLoading = true;
    try {
      const data = await this.api(
        "GET",
        `/api/metrics/history?range=${this.metricsRange}&container=${encodeURIComponent(this.metricsContainer)}`,
      );
      this.metricsHistory = data.samples || [];
      this.$nextTick(() => this.renderHistChart());
    } catch (e) {
      this.toast(e.message, "error");
    } finally {
      this.metricsHistLoading = false;
    }
  },

  setMetricsRange(r) {
    this.metricsRange = r;
    this.loadMetricsHistory();
  },

  setMetricsContainer(c) {
    this.metricsContainer = c;
    this.loadMetricsHistory();
  },

  renderHistChart() {
    if (typeof Chart === "undefined") return;
    const canvas = this.$refs.histChartCanvas;
    if (!canvas || canvas.offsetWidth === 0) return;
    const rows = this.metricsHistory;
    const labels = rows.map((s) =>
      new Date((s.ts || 0) * 1000).toLocaleTimeString(this.locale || "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    const cpu = rows.map((s) => (s.cpu_limit != null ? s.cpu_limit : 0));
    const mem = rows.map((s) => (s.mem_percent != null ? s.mem_percent : 0));

    if (this.histChartInstance) {
      this.histChartInstance.data.labels = labels;
      this.histChartInstance.data.datasets[0].data = cpu;
      this.histChartInstance.data.datasets[1].data = mem;
      this.histChartInstance.data.datasets[0].label = this.t("metricsPage.cpu");
      this.histChartInstance.data.datasets[1].label = this.t("metricsPage.memory");
      this.histChartInstance.update("none");
      return;
    }

    this.histChartInstance = new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: this.t("metricsPage.cpu"), data: cpu, borderColor: "#e8c547", backgroundColor: "rgba(232,197,71,0.12)", fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
          { label: this.t("metricsPage.memory"), data: mem, borderColor: "#60a5fa", backgroundColor: "rgba(96,165,250,0.12)", fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { intersect: false, mode: "index" },
        scales: {
          x: { ticks: { maxTicksLimit: 8, color: "#8a8f98", font: { size: 10 }, maxRotation: 0 }, grid: { color: "rgba(128,128,128,0.15)" } },
          y: { beginAtZero: true, suggestedMax: 100, ticks: { color: "#8a8f98", font: { size: 10 }, callback: (v) => `${v}%` }, grid: { color: "rgba(128,128,128,0.15)" } },
        },
        plugins: { legend: { labels: { color: "#9ca3af", boxWidth: 12, font: { size: 11 } } } },
      },
    });
  },

  // Small live sparkline for the Overview cockpit (SVG polyline, no chart lib).
  pushLiveMetricSample(m) {
    const v = m?.cpu?.percent ?? 0;
    this.liveSparkline.push(Number(v) || 0);
    while (this.liveSparkline.length > 40) this.liveSparkline.shift();
  },

  sparklinePoints() {
    const data = this.liveSparkline;
    if (!data.length) return "";
    const w = 100;
    const h = 28;
    const max = Math.max(...data, 10);
    const step = data.length > 1 ? w / (data.length - 1) : w;
    return data
      .map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`)
      .join(" ");
  },
};
