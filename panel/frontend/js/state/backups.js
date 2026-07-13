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

  getBackupTypes() {
    void this.localeVersion;
    const types = this.tObj("backups.types") || {};
    return ["world", "full", "configs"].filter((id) => types[id]).map((id) => ({
      id,
      label: types[id].label,
      desc: types[id].desc,
    }));
  },

  getBackupIntervalPresets() {
    void this.localeVersion;
    const presets = this.tObj("backups.intervalPresets") || {};
    const crons = {
      hourly: "0 * * * *",
      "6h": "0 */6 * * *",
      "12h": "0 */12 * * *",
      daily: "0 0 * * *",
      custom: "",
    };
    return Object.keys(crons).map((id) => ({
      id,
      label: presets[id] || id,
      cron: crons[id],
    }));
  },

  cronFromPreset() {
    if (this.backupIntervalPreset === "custom") return this.backupCronCustom;
    const preset = this.getBackupIntervalPresets().find((p) => p.id === this.backupIntervalPreset);
    return preset?.cron || "0 * * * *";
  },

  syncBackupPresetFromCron(cron) {
    const match = this.getBackupIntervalPresets().find((p) => p.cron && p.cron === cron);
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
    void this.localeVersion;
    const labels = this.tObj("backups.idleLabels") || {};
    return this.backupConfig.BACKUPS_IF_IDLE === "false"
      ? (labels.online || this.t("backups.idleLabels.online"))
      : (labels.empty || this.t("backups.idleLabels.empty"));
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
        this.toast(this.t("common.toasts.backupConfigApplied"));
        await this.loadBackups();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  openBackupModal() { this.backupModalOpen = true; },
  closeBackupModal() { this.backupModalOpen = false; },

  restoreModalBullets() {
    void this.localeVersion;
    const bullets = this.tObj("backups.modals.restore.bullets");
    return Array.isArray(bullets) ? bullets : [];
  },

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
    return `${n} ${n === 1 ? this.t("common.status.mod") : this.t("common.status.mods")}`;
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
      return this.t("backups.contentsNotes.noDlls");
    }
    return this.t("backups.contentsNotes.configsOnly");
  },

  async createBackup(type) {
    return this.withBusy(`createBackup:${type}`, async () => {
      try {
        const data = await this.api("POST", "/api/backups/create", { type });
        this.toast(this.t("common.toasts.backupCreated", { name: data.name }));
        this.backupModalOpen = false;
        if (this.page === "backups") await this.loadBackups();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async triggerBackup() {
    return this.withBusy("triggerBackup", async () => {
      try {
        await this.api("POST", "/api/backups/trigger");
        this.toast(this.t("common.toasts.scheduledBackupTriggered"));
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
        this.toast(this.t("common.toasts.backupRestored", { name }));
        this.closeRestoreModal();
        await this.loadBackups();
        await this.refreshStatus();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async restoreLatestBackup() {
    if (!confirm(this.t("common.confirm.restoreLatest"))) return;
    return this.withBusy("restoreLatest", async () => {
      try {
        const data = await this.api("POST", "/api/backups/restore-latest");
        this.toast(this.t("common.toasts.backupRestoredLatest", { name: data.active }));
        await this.loadBackups();
        await this.refreshStatus();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async restoreUndoBackup() {
    if (!confirm(this.t("common.confirm.undoRestore"))) return;
    return this.withBusy("restoreUndo", async () => {
      try {
        const data = await this.api("POST", "/api/backups/restore-undo");
        this.toast(this.t("common.toasts.restoreUndone", { name: data.active }));
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
        this.toast(this.t("common.toasts.backupDeleted", { name }));
        this.closeDeleteBackupModal();
        await this.loadBackups();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  backupDownloadUrl(name) {
    return `/api/backups/${encodeURIComponent(name)}/download`;
  },
};
