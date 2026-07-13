import {
  RCON_COMMANDS,
  getConsoleCompletions,
  getConsoleGhostSuffix,
  groupCommandsByCategory,
  localizeCommands,
} from "./console-commands.js";

export const console = {
  rconStatus: {
    available: false,
    plugin_installed: false,
    mod_enabled: false,
    configured: false,
    container_running: false,
  },
  consoleInput: "",
  consoleSending: false,
  consoleHelpModalOpen: false,
  consoleHelpSearch: "",
  consoleCompleteCycle: null,

  async loadConsoleStatus() {
    try {
      this.rconStatus = await this.api("GET", "/api/console/status");
    } catch (e) {
      this.rconStatus = {
        available: false,
        plugin_installed: false,
        mod_enabled: false,
        configured: false,
        container_running: false,
      };
    }
  },

  async sendConsoleCommand() {
    const command = (this.consoleInput || "").trim();
    if (!command || this.consoleSending) return;
    if (!this.rconStatus.available) {
      this.toast(this.consoleStatusHint() || this.t("common.errors.rconUnavailable"), "error");
      return;
    }
    this.consoleInput = "";
    this.consoleCompleteCycle = null;
    this.consoleSending = true;
    try {
      await this.api("POST", "/api/console/command", { command });
      await this.refreshConsoleLogs();
    } catch (e) {
      this.toast(e.message, "error");
    } finally {
      this.consoleSending = false;
    }
  },

  async refreshConsoleLogs() {
    if (this.page === "dashboard" && typeof this.loadDashLogs === "function") {
      await this.loadDashLogs();
      setTimeout(() => this.loadDashLogs(), 600);
    } else if (this.page === "logs" && typeof this.loadLogs === "function") {
      await this.loadLogs();
      setTimeout(() => this.loadLogs(), 600);
    }
  },

  onConsoleKeydown(e) {
    if (e.key === "Escape") {
      this.consoleCompleteCycle = null;
      return;
    }
    if (e.key !== "Tab") return;
    e.preventDefault();
    const players = this.players?.players || [];
    const result = getConsoleCompletions(
      this.consoleInput,
      players,
      this.consoleCompleteCycle?.input === this.consoleInput ? this.consoleCompleteCycle : null,
    );
    if (!result) return;
    this.consoleInput = result.text;
    this.consoleCompleteCycle = {
      input: result.text,
      matches: result.matches,
      index: result.cycleIndex,
    };
  },

  consoleGhostSuffix() {
    const players = this.players?.players || [];
    return getConsoleGhostSuffix(this.consoleInput, players);
  },

  openConsoleHelpModal() {
    this.consoleHelpSearch = "";
    this.consoleHelpModalOpen = true;
  },

  closeConsoleHelpModal() {
    this.consoleHelpModalOpen = false;
  },

  consoleCommandsByCategory() {
    void this.localeVersion;
    return groupCommandsByCategory(localizeCommands((k) => this.t(k)), this.consoleHelpSearch);
  },

  insertConsoleCommand(usage) {
    this.consoleInput = usage;
    this.consoleCompleteCycle = null;
    this.closeConsoleHelpModal();
    this.$nextTick(() => {
      document.querySelector(".console-input:not(:disabled)")?.focus();
    });
  },

  consoleStatusHint() {
    if (this.rconStatus.available) return "";
    void this.localeVersion;
    if (!this.rconStatus.bepinex_enabled) {
      return this.t("console.hints.bepinexRequired");
    }
    if (!this.rconStatus.mod_enabled) {
      return this.t("console.hints.modRequired");
    }
    if (!this.rconStatus.configured) {
      return this.t("console.hints.configPending");
    }
    if (!this.rconStatus.container_running) {
      return this.t("console.hints.serverStopped");
    }
    return this.t("console.hints.unavailable");
  },
};
