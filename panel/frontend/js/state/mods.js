// Mods e Configs: instalar/ativar/remover mods + editar .cfg do BepInEx.

export const mods = {
  mods: [],
  modUrl: "",
  bepinexConfigs: [],
  exportSkipped: 0,
  orphanedConfigs: [],
  orphanedConfigsCount: 0,
  modsPage: 1,
  modsPageSize: 10,
  modsViewMode: "cards",

  async loadModsPage() {
    await this.loadUpdatesConfig();
    await this.loadMods();
    await this.loadBepinexConfigs();
    await this.loadOrphanedConfigs();
    this.updateExportSkipped();
  },

  updateExportSkipped() {
    this.exportSkipped = this.mods.filter((m) => m.update_status === "unknown" && m.linkable !== false).length;
  },

  async loadMods() {
    try {
      const data = await this.api("GET", "/api/mods");
      this.mods = data.mods || [];
      this.modsPage = this.clampPage(this.modsPage, this.modsTotalPages());
      this.updateExportSkipped();
    } catch (e) { this.toast(e.message, "error"); }
  },

  paginatedMods() {
    return this.paginateSlice(this.mods, this.modsPage, this.modsPageSize);
  },

  modsTotalPages() {
    return this.calcTotalPages(this.mods.length, this.modsPageSize);
  },

  modsPrevPage() {
    if (this.modsPage <= 1) return;
    this.modsPage -= 1;
  },

  modsNextPage() {
    if (this.modsPage >= this.modsTotalPages()) return;
    this.modsPage += 1;
  },

  modsSetPageSize(size) {
    this.modsPageSize = size;
    this.modsPage = 1;
  },

  modsSetViewMode(mode) {
    this.modsViewMode = mode;
  },

  modsShowingFrom() {
    return this.paginationFrom(this.modsPage, this.modsPageSize, this.mods.length);
  },

  modsShowingTo() {
    return this.paginationTo(this.modsPage, this.modsPageSize, this.mods.length);
  },

  async loadBepinexConfigs() {
    try {
      const data = await this.api("GET", "/api/bepinex/configs");
      this.bepinexConfigs = data.configs || [];
    } catch (e) { this.toast(e.message, "error"); }
  },

  async loadOrphanedConfigs() {
    try {
      const data = await this.api("GET", "/api/bepinex/orphaned-configs");
      this.orphanedConfigs = data.configs || [];
      this.orphanedConfigsCount = data.count || 0;
    } catch (e) { this.toast(e.message, "error"); }
  },

  async cleanupOrphanedConfigs() {
    const count = this.orphanedConfigsCount;
    if (!count) return;
    const names = this.orphanedConfigs.map((c) => c.name).join(", ");
    const msg = count === 1
      ? this.t("common.confirm.removeOrphanedConfig", { names })
      : this.t("common.confirm.removeOrphanedConfigs", { count, names });
    if (!confirm(msg)) return;
    return this.withBusy("cleanupOrphanedConfigs", async () => {
      try {
        const data = await this.api("DELETE", "/api/bepinex/orphaned-configs", {});
        this.toast(this.t("common.toasts.orphanedConfigsRemoved", { count: data.count }));
        await this.loadBepinexConfigs();
        await this.loadOrphanedConfigs();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async uploadMod(event) {
    const file = event.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    await this.withBusy("uploadMod", async () => {
      try {
        const data = await this.api("POST", "/api/mods/upload", fd);
        this.toast(this.t("common.toasts.installed", { names: data.installed.join(", ") }));
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
    event.target.value = "";
  },

  async installModUrl() {
    if (!this.modUrl) return;
    return this.withBusy("installModUrl", async () => {
      try {
        const data = await this.api("POST", "/api/mods/install-url", { url: this.modUrl });
        this.toast(this.t("common.toasts.installed", { names: data.installed.join(", ") }));
        this.modUrl = "";
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async deleteMod(name) {
    if (!confirm(this.t("common.confirm.removeMod", { name }))) return;
    return this.withBusy(`deleteMod:${name}`, async () => {
      try {
        await this.api("DELETE", `/api/mods/${encodeURIComponent(name)}`);
        this.toast(this.t("common.toasts.modRemoved", { name }));
        await this.loadMods();
        await this.loadOrphanedConfigs();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async toggleMod(name, enabled) {
    return this.withBusy(`toggleMod:${name}`, async () => {
      try {
        const data = await this.api("POST", `/api/mods/${encodeURIComponent(name)}/toggle`, { enabled });
        this.toast(data.message || (enabled ? this.t("common.toasts.modEnabled") : this.t("common.toasts.modDisabled")));
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  modStatusLabel(status) {
    void this.localeVersion;
    const key = `mods.status.${status}`;
    const val = this.t(key);
    return val !== key ? val : status;
  },

  modEnabledStatusLabel(mod) {
    void this.localeVersion;
    if (mod.protected) {
      return mod.enabled ? this.t("mods.activeConsole") : this.t("mods.disabledConsole");
    }
    return mod.enabled ? this.t("mods.active") : this.t("mods.disabled");
  },

  modConfigLabel(mod) {
    void this.localeVersion;
    return mod.config ? this.t("mods.configPrefix", { name: mod.config }) : this.t("mods.noConfig");
  },

  modStatusClass(status) {
    return {
      up_to_date: "text-green-500",
      update_available: "text-amber-400",
      unknown: "text-gray-500",
      dependency: "text-gray-500",
      error: "text-red-400",
    }[status] || "text-gray-500";
  },

  isUnlinkableMod(mod) {
    return mod.linkable === false;
  },

  linkedPackageCount() {
    return new Set(this.mods.filter((m) => m.package_id).map((m) => m.package_id)).size;
  },

  pendingPackageUpdates() {
    const seen = new Set();
    const packages = [];
    for (const mod of this.mods) {
      if (mod.update_available && mod.package_id && !seen.has(mod.package_id)) {
        seen.add(mod.package_id);
        packages.push(mod.package_id);
      }
    }
    return packages;
  },

  async checkAllModUpdates() {
    return this.withBusy("checkAllModUpdates", async () => {
      try {
        const data = await this.api("POST", "/api/mods/check-updates");
        if (!data.checked) {
          this.toast(this.t("common.toasts.modsNoLinkedPackages"));
          return;
        }
        this.toast(this.t("common.toasts.modsCheckAllSummary", {
          checked: data.checked,
          updates: data.updates_available,
          errors: data.errors,
        }));
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async updateAllMods() {
    const packages = this.pendingPackageUpdates();
    if (!packages.length) return;
    const msg = this.t("common.confirm.updateAllMods", { packages: packages.join("\n") });
    if (!confirm(msg)) return;
    return this.withBusy("updateAllMods", async () => {
      try {
        const data = await this.api("POST", "/api/mods/update-all");
        this.toast(this.t("common.toasts.modsUpdateAllSummary", {
          updated: data.updated,
          failed: data.failed,
          skipped: data.skipped,
        }));
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async checkModUpdate(name) {
    return this.withBusy(`checkModUpdate:${name}`, async () => {
      try {
        const data = await this.api("POST", `/api/mods/${encodeURIComponent(name)}/check-update`);
        const msg = data.update_available
          ? this.t("common.toasts.modUpdateAvailable", { installed: data.installed_version, latest: data.latest_version })
          : this.t("common.toasts.modOnLatest");
        this.toast(msg);
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async updateMod(name) {
    if (!confirm(this.t("common.confirm.updateMod", { name }))) return;
    return this.withBusy(`updateMod:${name}`, async () => {
      try {
        const data = await this.api("POST", `/api/mods/${encodeURIComponent(name)}/update`);
        this.toast(data.message || this.t("common.toasts.modUpdated", { version: data.version }));
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async linkModThunderstore(name) {
    if (!this.modLinkUrl) return;
    return this.withBusy(`linkMod:${name}`, async () => {
      try {
        await this.api("POST", `/api/mods/${encodeURIComponent(name)}/link`, { url: this.modLinkUrl });
        this.toast(this.t("common.toasts.modLinked"));
        this.cancelModLink();
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async downloadR2zExport() {
    return this.withBusy("downloadR2zExport", async () => {
      try {
        const res = await fetch("/api/mods/export-r2z");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Error ${res.status}`);
        }
        const blob = await res.blob();
        const disposition = res.headers.get("Content-Disposition") || "";
        const match = disposition.match(/filename="([^"]+)"/);
        const filename = match ? match[1] : "profile.r2z";
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.toast(this.t("common.toasts.r2zDownloaded"));
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async copyR2modmanCode() {
    return this.withBusy("copyR2modmanCode", async () => {
      try {
        const data = await this.api("POST", "/api/mods/export-code");
        await navigator.clipboard.writeText(data.code);
        const skipped = data.skipped ? this.t("common.toasts.codeCopiedSkipped", { skipped: data.skipped }) : "";
        this.toast(this.t("common.toasts.codeCopied", { count: data.mods_count, skipped }));
      } catch (e) { this.toast(e.message, "error"); }
    });
  },
};
