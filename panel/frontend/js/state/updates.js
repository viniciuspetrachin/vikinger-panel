// Atualizações do jogo e modo vanilla/modded (aba Mods).

export const updates = {
  updateConfig: {},
  updateStatus: {},
  bepinexEnabled: true,
  gameVersion: {},
  updateIntervalPreset: "15min",
  updateCronCustom: "*/15 * * * *",
  modLinkUrl: "",
  modLinkTarget: null,

  updateIntervalPresets: [
    { id: "15min", label: "A cada 15 minutos", cron: "*/15 * * * *" },
    { id: "1h", label: "A cada hora", cron: "0 * * * *" },
    { id: "6h", label: "A cada 6 horas", cron: "0 */6 * * *" },
    { id: "daily", label: "Diário (06:00)", cron: "0 6 * * *" },
    { id: "custom", label: "Personalizado", cron: "" },
  ],

  cronFromUpdatePreset() {
    if (this.updateIntervalPreset === "custom") return this.updateCronCustom;
    const preset = this.updateIntervalPresets.find((p) => p.id === this.updateIntervalPreset);
    return preset?.cron || "*/15 * * * *";
  },

  syncUpdatePresetFromCron(cron) {
    const match = this.updateIntervalPresets.find((p) => p.cron && p.cron === cron);
    if (match) {
      this.updateIntervalPreset = match.id;
    } else {
      this.updateIntervalPreset = "custom";
      this.updateCronCustom = cron;
    }
  },

  async loadUpdatesPage() {
    await Promise.all([this.loadUpdatesConfig(), this.loadUpdatesStatus()]);
  },

  async loadUpdatesConfig() {
    try {
      const data = await this.api("GET", "/api/updates/config");
      this.updateConfig = data.values || {};
      this.bepinexEnabled = data.bepinex ?? true;
      this.gameVersion = data.game_version || {};
      this.syncUpdatePresetFromCron(this.updateConfig.UPDATE_CRON || "*/15 * * * *");
    } catch (e) { this.toast(e.message, "error"); }
  },

  async loadUpdatesStatus() {
    try {
      this.updateStatus = await this.api("GET", "/api/updates/status");
    } catch (e) { this.toast(e.message, "error"); }
  },

  updateConfigPayload() {
    return {
      UPDATE_AUTO: this.updateConfig.UPDATE_AUTO ?? "true",
      UPDATE_IF_IDLE: this.updateConfig.UPDATE_IF_IDLE ?? "true",
      UPDATE_CRON: this.cronFromUpdatePreset(),
    };
  },

  async saveUpdateConfig(restart = false) {
    return this.withBusy(restart ? "saveUpdateConfigRestart" : "saveUpdateConfig", async () => {
      try {
        const data = await this.api("PUT", "/api/updates/config", {
          values: this.updateConfigPayload(),
          bepinex: this.bepinexEnabled,
          restart,
        });
        this.toast(restart ? "Config salva e container recriado!" : "Config de atualizações salva!");
        if (data.mode_result?.rcon?.created && data.mode_result.rcon.password) {
          this.setupRconPassword = data.mode_result.rcon.password;
        }
        await this.loadUpdatesPage();
        if (this.page === "mods") await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async checkGameUpdate() {
    return this.withBusy("checkGameUpdate", async () => {
      try {
        const data = await this.api("POST", "/api/updates/check");
        this.toast(data.message || "Verificação solicitada");
        await this.loadUpdatesStatus();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  showModsWarning() {
    return (this.updateStatus?.mods_warning ?? false) || (this.mods?.length > 0);
  },

  openModLink(name) {
    this.modLinkTarget = name;
    this.modLinkUrl = "";
  },

  cancelModLink() {
    this.modLinkTarget = null;
    this.modLinkUrl = "";
  },
};
