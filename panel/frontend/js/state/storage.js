// Backup disk limits and purge.

export const storage = {
  storageData: null,
  backupStorageLimit: { enabled: false, max_gb: 2 },
  purgeAllBackupsModalOpen: false,

  async loadStorageLimits() {
    try {
      const data = await this.api("GET", "/api/storage");
      this.storageData = data;
      const cfg = data.limits?.backups || { enabled: false, max_gb: null };
      this.backupStorageLimit = {
        enabled: !!cfg.enabled,
        max_gb: cfg.max_gb ?? 2,
      };
    } catch (e) {
      this.toast(e.message, "error");
    }
  },

  backupStorageStatus() {
    return this.storageData?.categories?.backups || {
      used_bytes: 0,
      max_bytes: null,
      percent: null,
      enabled: false,
    };
  },

  backupStoragePct() {
    const status = this.backupStorageStatus();
    if (status.percent != null) return status.percent;
    if (!status.max_bytes) return null;
    return Math.round((status.used_bytes / status.max_bytes) * 1000) / 10;
  },

  backupStorageBarClass() {
    return this.pctBarClass(this.backupStoragePct());
  },

  async saveBackupStorageLimit() {
    return this.withBusy("saveBackupStorageLimit", async () => {
      try {
        const cfg = this.backupStorageLimit;
        const payload = {
          backups: {
            enabled: !!cfg.enabled,
            max_gb: cfg.enabled && cfg.max_gb > 0 ? Number(cfg.max_gb) : null,
          },
        };
        await this.api("PUT", "/api/storage/limits", payload);
        this.toast("Backup limit saved and cleanup applied");
        await this.loadStorageLimits();
        if (this.page === "dashboard") await this.loadMetrics(false);
        if (this.page === "backups") await this.loadBackups();
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },

  openPurgeAllBackupsModal() {
    this.purgeAllBackupsModalOpen = true;
  },

  closePurgeAllBackupsModal() {
    this.purgeAllBackupsModalOpen = false;
  },

  async confirmPurgeAllBackups() {
    return this.withBusy("purgeAllBackups", async () => {
      try {
        const data = await this.api("POST", "/api/backups/purge-all", { confirm: true });
        const count = (data.deleted || []).length;
        this.toast(count ? `Deleted ${count} backup(s)` : "No backups to delete");
        this.closePurgeAllBackupsModal();
        await this.loadStorageLimits();
        if (this.page === "backups") await this.loadBackups();
        if (this.page === "dashboard") await this.loadMetrics(false);
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },

  diskLimitPct(category) {
    const limits = this.metrics?.disk?.limits?.[category];
    if (!limits?.max_bytes) return null;
    return limits.percent ?? Math.round((limits.used_bytes / limits.max_bytes) * 1000) / 10;
  },

  backupsDiskLimitActive() {
    return !!this.metrics?.disk?.limits?.backups?.max_bytes;
  },
};
