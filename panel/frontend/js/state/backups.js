// Backups automáticos e manuais.

export const backups = {
  backups: [],
  backupConfig: {},
  backupState: { active: null, restored_at: null, undo: null, undo_of: null },
  backupIntervalPreset: "hourly",
  backupCronCustom: "0 * * * *",
  backupModalOpen: false,
  restoreModalOpen: false,
  restoreTarget: null,
  deleteBackupModalOpen: false,
  deleteBackupTarget: null,
  backupDetailsModalOpen: false,
  backupDetailsTarget: null,
  backupDetails: null,
  backupDetailsLoading: false,
  hideCheckpoints: true,
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

  visibleBackups() {
    if (!this.hideCheckpoints) return this.backups;
    return this.backups.filter((b) => !b.is_checkpoint);
  },

  backupIdleLabel() {
    return this.backupConfig.BACKUPS_IF_IDLE === "false"
      ? "Só com jogadores online"
      : "Sim — mesmo sem jogadores";
  },

  async loadBackups() {
    try {
      const data = await this.api("GET", "/api/backups");
      this.backups = data.backups || [];
      this.backupConfig = data.config || {};
      this.backupState = data.state || { active: null, restored_at: null, undo: null, undo_of: null };
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

  async saveBackupConfig() {
    return this.withBusy("saveBackupConfig", async () => {
      try {
        await this.api("PUT", "/api/backups/config", { values: this.backupConfigPayload(), restart: true });
        this.toast("Configuração aplicada e container reiniciado!");
        await this.loadBackups();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  openBackupModal() { this.backupModalOpen = true; },
  closeBackupModal() { this.backupModalOpen = false; },

  openRestoreModal(backup) {
    this.restoreTarget = backup;
    this.restoreModalOpen = true;
  },

  closeRestoreModal() {
    this.restoreModalOpen = false;
    this.restoreTarget = null;
  },

  openDeleteBackupModal(backup) {
    this.deleteBackupTarget = backup;
    this.deleteBackupModalOpen = true;
  },

  closeDeleteBackupModal() {
    this.deleteBackupModalOpen = false;
    this.deleteBackupTarget = null;
  },

  formatModsCount(backup) {
    if (!backup || backup.mods_count === null || backup.mods_count === undefined) return "—";
    const n = backup.mods_count;
    return `${n} mod${n === 1 ? "" : "s"}`;
  },

  openBackupDetailsModal(backup) {
    this.backupDetailsTarget = backup;
    this.backupDetails = null;
    this.backupDetailsModalOpen = true;
    this.loadBackupDetails(backup.name);
  },

  closeBackupDetailsModal() {
    this.backupDetailsModalOpen = false;
    this.backupDetailsTarget = null;
    this.backupDetails = null;
    this.backupDetailsLoading = false;
  },

  async loadBackupDetails(name) {
    this.backupDetailsLoading = true;
    try {
      this.backupDetails = await this.api("GET", `/api/backups/${encodeURIComponent(name)}/details`);
    } catch (e) {
      this.toast(e.message, "error");
      this.closeBackupDetailsModal();
    } finally {
      this.backupDetailsLoading = false;
    }
  },

  backupDetailsMods() {
    return this.backupDetails?.manifest?.mods?.items || [];
  },

  backupDetailsContentsNote() {
    const contents = this.backupDetails?.manifest?.contents;
    if (!contents) return "";
    if (contents.includes_mods_dlls) return "";
    if (this.backupDetails?.mods_count > 0) {
      return "Este backup não inclui os arquivos (.dll) dos mods — a lista abaixo reflete o estado do servidor na hora do backup.";
    }
    return "Este backup contém apenas o mundo/configs — mods não foram incluídos. Use backup Manual — completo para snapshot com DLLs.";
  },

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
        this.toast("Backup agendado executado — aguarde alguns segundos.");
        setTimeout(() => this.loadBackups(), 3000);
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async confirmRestoreBackup() {
    if (!this.restoreTarget) return;
    const name = this.restoreTarget.name;
    return this.withBusy(`restoreBackup:${name}`, async () => {
      try {
        await this.api("POST", `/api/backups/${encodeURIComponent(name)}/restore`);
        this.toast(`Backup "${name}" restaurado — servidor reiniciando.`);
        this.closeRestoreModal();
        await this.loadBackups();
        await this.refreshStatus();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async restoreLatestBackup() {
    if (!confirm("Restaurar o backup mais recente? O servidor será reiniciado.")) return;
    return this.withBusy("restoreLatest", async () => {
      try {
        const data = await this.api("POST", "/api/backups/restore-latest");
        this.toast(`Backup "${data.active}" restaurado — servidor reiniciando.`);
        await this.loadBackups();
        await this.refreshStatus();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async restoreUndoBackup() {
    if (!confirm("Desfazer a última restauração? O servidor voltará ao estado anterior.")) return;
    return this.withBusy("restoreUndo", async () => {
      try {
        const data = await this.api("POST", "/api/backups/restore-undo");
        this.toast(`Restauração desfeita — "${data.active}" ativo.`);
        await this.loadBackups();
        await this.refreshStatus();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async confirmDeleteBackup() {
    if (!this.deleteBackupTarget) return;
    const name = this.deleteBackupTarget.name;
    return this.withBusy(`deleteBackup:${name}`, async () => {
      try {
        await this.api("DELETE", `/api/backups/${encodeURIComponent(name)}`);
        this.toast(`Backup "${name}" apagado`);
        this.closeDeleteBackupModal();
        await this.loadBackups();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  backupDownloadUrl(name) {
    return `/api/backups/${encodeURIComponent(name)}/download`;
  },
};
