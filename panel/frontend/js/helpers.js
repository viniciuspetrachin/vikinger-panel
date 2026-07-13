// Formatting + log rendering helpers (mixed into the Alpine component).

import { getLocale } from "./i18n/index.js";

export function formatRateTick(bps) {
  if (!bps || bps <= 0) return "0 B/s";
  if (bps >= 1024 * 1024) return (bps / (1024 * 1024)).toFixed(1) + " MB/s";
  if (bps >= 1024) return (bps / 1024).toFixed(1) + " KB/s";
  return Math.round(bps) + " B/s";
}

export const helpers = {
  statusLabel(s) {
    const map = {
      running: this.t("common.status.online"),
      stopped: this.t("common.status.paused"),
      offline: this.t("common.status.offline"),
      starting: this.t("common.status.starting"),
    };
    return map[s] || s;
  },

  escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
      const msgCls = this.logMessageClass(legacy[3]);
      return `<span class="log-ts">${this.escapeHtml(legacy[1])}</span> `
        + `<span class="log-msg ${msgCls}">${this.escapeHtml(legacy[3])}</span>`;
    }
    const match = line.match(/^(\[[^\]]+\])\s+(.*)$/);
    if (match) {
      const msgCls = this.logMessageClass(match[2]);
      return `<span class="log-ts">${this.escapeHtml(match[1])}</span> `
        + `<span class="log-msg ${msgCls}">${this.escapeHtml(match[2])}</span>`;
    }
    const msgCls = this.logMessageClass(line);
    return `<span class="log-msg ${msgCls}">${this.escapeHtml(line)}</span>`;
  },

  formatLogHtml(text, emptyLabel) {
    if (emptyLabel === undefined) {
      emptyLabel = this.t("common.logEmpty.waitingForOutput");
    }
    if (!text) {
      return `<span class="log-line log-empty">${this.escapeHtml(emptyLabel)}</span>`;
    }
    return text.split("\n")
      .filter((line) => line.length > 0)
      .map((line) => `<span class="log-line">${this.formatLogLine(line)}</span>`)
      .join("\n");
  },

  formatSize(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (bytes >= 1024 && i < 3) { bytes /= 1024; i++; }
    return bytes.toFixed(i ? 1 : 0) + " " + units[i];
  },

  formatBytes(bytes) {
    if (bytes == null || bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let v = bytes;
    let i = 0;
    while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
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
  },
};
