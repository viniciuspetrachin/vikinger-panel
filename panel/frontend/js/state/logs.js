// Logs (avançado): docker / BepInEx + buffer de sessão, busca e filtros.

import { filterLogLines, mergeLogBuffer } from "../log-filters.js";

export const LOG_REFRESH_STORAGE_KEY = "vikinger-log-refresh-mode";
export const LOG_SCROLL_PINNED_KEY = "vikinger-log-scroll-pinned";
export const LOG_REFRESH_INTERVALS = {
  normal: 5000,
  realtime: 1000,
};

function readStoredLogRefreshMode() {
  try {
    const raw = localStorage.getItem(LOG_REFRESH_STORAGE_KEY);
    if (raw === "off" || raw === "normal" || raw === "realtime") return raw;
  } catch { /* private mode / SSR */ }
  return "normal";
}

function readStoredLogScrollPinned() {
  try {
    const raw = localStorage.getItem(LOG_SCROLL_PINNED_KEY);
    if (raw === "0" || raw === "false") return false;
    if (raw === "1" || raw === "true") return true;
  } catch { /* private mode / SSR */ }
  return true;
}

export const logs = {
  logs: "",
  logSource: "docker",
  logRefreshMode: readStoredLogRefreshMode(),
  logsLoading: false,
  logSearch: "",
  logHideNoise: true,
  logCategory: "all",
  logFetchLines: 800,
  logBuffer: [],
  logBufferMax: 5000,
  logMatchCount: 0,
  logScrollPinned: readStoredLogScrollPinned(),
  _logPollTimer: null,

  get logAutoRefresh() {
    return this.logRefreshMode !== "off";
  },

  logRefreshIntervalMs() {
    return LOG_REFRESH_INTERVALS[this.logRefreshMode] || LOG_REFRESH_INTERVALS.normal;
  },

  logRefreshOverheadHint() {
    if (this.logRefreshMode === "off") return "";
    const key = this.logRefreshMode === "realtime"
      ? "logs.refreshOverhead.realtime"
      : "logs.refreshOverhead.normal";
    return this.t(key);
  },

  initLogRefresh() {
    this.logRefreshMode = readStoredLogRefreshMode();
  },

  onLogRefreshModeChange() {
    try {
      localStorage.setItem(LOG_REFRESH_STORAGE_KEY, this.logRefreshMode);
    } catch { /* ignore */ }
    this.startLogPolling();
  },

  stopLogPolling() {
    if (this._logPollTimer) {
      clearTimeout(this._logPollTimer);
      this._logPollTimer = null;
    }
  },

  startLogPolling() {
    this.stopLogPolling();
    if (this.logRefreshMode === "off" || this.page !== "console") return;

    const delay = this.logRefreshIntervalMs();
    const tick = async () => {
      if (this.page !== "console" || this.logRefreshMode === "off") return;
      await this.loadLogs();
      if (this.page === "console" && this.logRefreshMode !== "off") {
        this._logPollTimer = setTimeout(tick, this.logRefreshIntervalMs());
      }
    };
    this._logPollTimer = setTimeout(tick, delay);
  },

  filteredLogLines() {
    const lines = filterLogLines(this.logBuffer, {
      hideNoise: this.logHideNoise,
      category: this.logCategory,
      search: this.logSearch,
    });
    this.logMatchCount = lines.length;
    return lines;
  },

  logsDisplayText() {
    return this.filteredLogLines().join("\n");
  },

  clearLogBuffer() {
    this.logBuffer = [];
    this.logs = "";
    this.logMatchCount = 0;
  },

  onLogSourceChange() {
    this.clearLogBuffer();
    this.loadLogs();
  },

  onLogFilterChange() {
    this.logs = this.logsDisplayText();
    this.restoreLogScroll("logConsole", false, 0);
  },

  persistLogScrollPinned() {
    try {
      localStorage.setItem(LOG_SCROLL_PINNED_KEY, this.logScrollPinned ? "1" : "0");
    } catch { /* ignore */ }
  },

  toggleLogScrollPinned() {
    this.logScrollPinned = !this.logScrollPinned;
    this.persistLogScrollPinned();
    if (this.logScrollPinned) {
      this.restoreLogScroll("logConsole", true, 0);
    }
  },

  onLogConsoleScroll() {
    if (!this.logScrollPinned) return;
    const el = this.$refs.logConsole;
    if (!el || this.isLogAtBottom(el)) return;
    this.logScrollPinned = false;
    this.persistLogScrollPinned();
  },

  isLogAtBottom(el, threshold = 40) {
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  },

  restoreLogScroll(ref, wasAtBottom, prevScrollTop) {
    this.$nextTick(() => {
      const el = this.$refs[ref];
      if (!el) return;
      const stickToBottom = ref === "logConsole" && this.logScrollPinned;
      el.scrollTop = stickToBottom || wasAtBottom ? el.scrollHeight : prevScrollTop;
    });
  },

  focusLogSearch() {
    this.$nextTick(() => this.$refs.logSearchInput?.focus());
  },

  onLogKeydown(e) {
    if (this.page !== "console") return;
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      this.focusLogSearch();
    }
  },

  async loadLogs() {
    if (this.logsLoading) return;
    this.logsLoading = true;
    try {
      const el = this.$refs.logConsole;
      const wasAtBottom = this.isLogAtBottom(el);
      const prevScrollTop = el?.scrollTop ?? 0;
      const data = await this.api(
        "GET",
        `/api/logs?lines=${this.logFetchLines}&source=${this.logSource}`,
      );
      this.logBuffer = mergeLogBuffer(
        this.logBuffer,
        data.logs || "",
        this.logBufferMax,
      );
      this.logs = this.logsDisplayText();
      this.restoreLogScroll("logConsole", wasAtBottom, prevScrollTop);
    } catch (e) { this.toast(e.message, "error"); }
    finally { this.logsLoading = false; }
  },
};
