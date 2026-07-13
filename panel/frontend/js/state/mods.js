// Mods e Configs: instalar/ativar/remover mods + editar .cfg do BepInEx.

export const mods = {
  mods: [],
  modUrl: "",
  bepinexConfigs: [],
  exportSkipped: 0,
  orphanedConfigs: [],
  orphanedConfigsCount: 0,

  async loadModsPage() {
    await this.loadUpdatesConfig();
    await this.loadMods();
    await this.loadBepinexConfigs();
    await this.loadOrphanedConfigs();
    this.updateExportSkipped();
  },

  updateExportSkipped() {
    this.exportSkipped = this.mods.filter((m) => m.update_status === "unknown").length;
  },

  async loadMods() {
    try {
      const data = await this.api("GET", "/api/mods");
      this.mods = data.mods || [];
      this.updateExportSkipped();
    } catch (e) { this.toast(e.message, "error"); }
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
      ? `Remove orphaned config ${names}?`
      : `Remove ${count} orphaned config file(s)?\n\n${names}`;
    if (!confirm(msg)) return;
    return this.withBusy("cleanupOrphanedConfigs", async () => {
      try {
        const data = await this.api("DELETE", "/api/bepinex/orphaned-configs", {});
        this.toast(`${data.count} orphaned config(s) removed`);
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
        this.toast(`Installed: ${data.installed.join(", ")}`);
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
        this.toast(`Installed: ${data.installed.join(", ")}`);
        this.modUrl = "";
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async deleteMod(name) {
    if (!confirm(`Remove mod ${name}?`)) return;
    return this.withBusy(`deleteMod:${name}`, async () => {
      try {
        await this.api("DELETE", `/api/mods/${encodeURIComponent(name)}`);
        this.toast(`${name} removed`);
        await this.loadMods();
        await this.loadOrphanedConfigs();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async toggleMod(name, enabled) {
    return this.withBusy(`toggleMod:${name}`, async () => {
      try {
        const data = await this.api("POST", `/api/mods/${encodeURIComponent(name)}/toggle`, { enabled });
        this.toast(data.message || (enabled ? "Mod enabled" : "Mod disabled"));
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  modStatusLabel(status) {
    return {
      up_to_date: "Up to date",
      update_available: "Update available",
      unknown: "Unknown source",
      error: "Check failed",
    }[status] || status;
  },

  modStatusClass(status) {
    return {
      up_to_date: "text-green-500",
      update_available: "text-amber-400",
      unknown: "text-gray-500",
      error: "text-red-400",
    }[status] || "text-gray-500";
  },

  async checkModUpdate(name) {
    return this.withBusy(`checkModUpdate:${name}`, async () => {
      try {
        const data = await this.api("POST", `/api/mods/${encodeURIComponent(name)}/check-update`);
        const msg = data.update_available
          ? `Update available: v${data.installed_version} → v${data.latest_version}`
          : "Mod is on the latest version";
        this.toast(msg);
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async updateMod(name) {
    if (!confirm(`Update ${name}? The server may need to be restarted.`)) return;
    return this.withBusy(`updateMod:${name}`, async () => {
      try {
        const data = await this.api("POST", `/api/mods/${encodeURIComponent(name)}/update`);
        this.toast(data.message || `Mod updated to v${data.version}`);
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async linkModThunderstore(name) {
    if (!this.modLinkUrl) return;
    return this.withBusy(`linkMod:${name}`, async () => {
      try {
        await this.api("POST", `/api/mods/${encodeURIComponent(name)}/link`, { url: this.modLinkUrl });
        this.toast("Mod linked to Thunderstore");
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
        this.toast(".r2z profile downloaded");
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async copyR2modmanCode() {
    return this.withBusy("copyR2modmanCode", async () => {
      try {
        const data = await this.api("POST", "/api/mods/export-code");
        await navigator.clipboard.writeText(data.code);
        const skipped = data.skipped ? ` (${data.skipped} mod(s) skipped)` : "";
        this.toast(`Code copied: ${data.mods_count} mod(s)${skipped}`);
      } catch (e) { this.toast(e.message, "error"); }
    });
  },
};
