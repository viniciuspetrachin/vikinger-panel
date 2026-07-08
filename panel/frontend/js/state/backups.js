// Backups automáticos e manuais.

export const backups = {
  backups: [],
  backupConfig: {},
  backupIntervalPreset: "hourly",
  backupCronCustom: "0 * * * *",
  backupModalOpen: false,
  backupTypes: [
    { id: "world", label: "Mundo ativo (rápido)", desc: "Apenas o mundo em uso (.fwl + .db)." },
    { id: "full", label: "Completo", desc: "Mundos + configs BepInEx + mods + listas + .env." },
    { id: "configs", label: "Somente configs", desc: "Configs BepInEx + listas de jogadores + .env." },
  ],
  backupIntervalPresets: [
    { id: "hourly", label: "A cada hora", cron: "0 * * * *" },
    { id: "6h", label: "A cada 6 horas", cron: "0 */6 * * *" },
    { id: "12h", label: "A cada 12 horas", cron: "0 */12 * * *" },
    { id: "daily", label: "Diário (00:00)", cron: "0 0 * * *" },
    { id: "custom", label: "Personalizado", cron: "" },
  ],

  cronFromPreset() {
    if (this.backupIntervalPreset === "custom") return this.backupCronCustom;
    const preset = this.backupIntervalPresets.find((p) => p.id === this.backupIntervalPreset);
    return preset?.cron || "0 * * * *";
  },

  syncBackupPresetFromCron(cron) {
    const match = this.backupIntervalPresets.find((p) => p.cron && p.cron === cron);
    if (match) {
      this.backupIntervalPreset = match.id;
    } else {
      this.backupIntervalPreset = "custom";
      this.backupCronCustom = cron;
    }
  },

  async loadBackups() {
    try {
      const data = await this.api("GET", "/api/backups");
      this.backups = data.backups || [];
      this.backupConfig = data.config || {};
      this.syncBackupPresetFromCron(this.backupConfig.BACKUPS_CRON || "0 * * * *");
    } catch (e) { this.toast(e.message, "error"); }
  },

  backupConfigPayload() {
    return {
      BACKUPS: this.backupConfig.BACKUPS ?? "true",
      BACKUPS_CRON: this.cronFromPreset(),
      BACKUPS_MAX_AGE: "30",
      BACKUPS_MAX_COUNT: this.backupConfig.BACKUPS_MAX_COUNT ?? "0",
      BACKUPS_IF_IDLE: this.backupConfig.BACKUPS_IF_IDLE ?? "true",
    };
  },

  async saveBackupConfig(restart = false) {
    return this.withBusy(restart ? "saveBackupConfigRestart" : "saveBackupConfig", async () => {
      try {
        await this.api("PUT", "/api/backups/config", { values: this.backupConfigPayload(), restart });
        this.toast(restart ? "Config salva e container reiniciado!" : "Config de backup salva!");
        await this.loadBackups();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  openBackupModal() { this.backupModalOpen = true; },
  closeBackupModal() { this.backupModalOpen = false; },

  async createBackup(type) {
    return this.withBusy(`createBackup:${type}`, async () => {
      try {
        const data = await this.api("POST", "/api/backups/create", { type });
        this.toast(`Backup criado: ${data.name}`);
        this.backupModalOpen = false;
        if (this.page === "backups") await this.loadBackups();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async triggerBackup() {
    return this.withBusy("triggerBackup", async () => {
      try {
        await this.api("POST", "/api/backups/trigger");
        this.toast("Backup automático solicitado!");
        setTimeout(() => this.loadBackups(), 3000);
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async deleteBackup(name) {
    if (!confirm(`Apagar backup "${name}"?`)) return;
    return this.withBusy(`deleteBackup:${name}`, async () => {
      try {
        await this.api("DELETE", `/api/backups/${encodeURIComponent(name)}`);
        this.toast(`Backup "${name}" apagado`);
        await this.loadBackups();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  backupDownloadUrl(name) {
    return `/api/backups/${encodeURIComponent(name)}/download`;
  },
};
