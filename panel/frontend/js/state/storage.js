// Backup disk limits and purge.

export const storage = {
  storageData: null,
  storageLoadError: null,
  backupStorageMaxGb: 0,
  backupStoragePresets: [
    { value: 1, label: "1 GB" },
    { value: 2, label: "2 GB" },
    { value: 5, label: "5 GB" },
    { value: 10, label: "10 GB" },
    { value: 20, label: "20 GB" },
    { value: 50, label: "50 GB" },
    { value: 100, label: "100 GB" },
  ],
  purgeAllBackupsModalOpen: false,

  backupStorageLimitEnabled() {
    return this.backupStorageMaxGb > 0;
  },

  _resolveBackupMaxGb(maxGb) {
    const preset = this.backupStoragePresets.find((p) => p.value === maxGb);
    return preset ? preset.value : maxGb;
  },

  async loadStorageLimits() {
    this.storageLoadError = null;
    try {
      const data = await this.api("GET", "/api/storage");
      this.storageData = data;
      const cfg = data.limits?.backups || { enabled: false, max_gb: null };
      if (!cfg.enabled || cfg.max_gb == null) {
        this.backupStorageMaxGb = 0;
      } else {
        this.backupStorageMaxGb = this._resolveBackupMaxGb(cfg.max_gb);
      }
    } catch (e) {
      this.storageLoadError = "Could not load usage";
      this.toast(e.message, "error");
    }
  },

  backupStorageLimitLabel() {
    if (!this.backupStorageLimitEnabled()) return "Unlimited";
    return `${this.backupStorageMaxGb} GB`;
  },

  backupStorageUsedLabel() {
    if (this.storageLoadError) return this.storageLoadError;
    if (!this.storageData) return "Loading…";
    return this.formatBytes(this.backupStorageStatus().used_bytes);
  },

  backupStorageUsageDetail() {
    if (this.storageLoadError) return "";
    if (!this.storageData) return "Loading…";
    const used = this.formatBytes(this.backupStorageStatus().used_bytes);
    if (!this.backupStorageLimitEnabled()) {
      return `${used} used (no limit)`;
    }
    return `${used} of ${this.backupStorageMaxGb} GB`;
  },

  backupStorageStatus() {
    return this.storageData?.categories?.backups || {
      used_bytes: 0,
      max_bytes: null,
      percent: null,
      enabled: false,
    };
  },

  backupStorageMaxBytes() {
    const status = this.backupStorageStatus();
    if (status.max_bytes) return status.max_bytes;
    if (!this.backupStorageLimitEnabled()) return null;
    return this.backupStorageMaxGb * 1024 ** 3;
  },

  backupStoragePct() {
    const status = this.backupStorageStatus();
    if (status.percent != null && status.max_bytes) return status.percent;
    const maxBytes = this.backupStorageMaxBytes();
    if (!maxBytes) return null;
    return Math.round((status.used_bytes / maxBytes) * 1000) / 10;
  },

  backupStorageBarClass() {
    return this.pctBarClass(this.backupStoragePct());
  },

  async saveBackupStorageLimit() {
    return this.withBusy("saveBackupStorageLimit", async () => {
      try {
        const maxGb = Number(this.backupStorageMaxGb);
        const payload = {
          backups: {
            enabled: maxGb > 0,
            max_gb: maxGb > 0 ? maxGb : null,
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
