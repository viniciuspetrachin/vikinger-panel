// Mods e Configs: instalar/ativar/remover mods + editar .cfg do BepInEx.

export const mods = {
  mods: [],
  modUrl: "",
  bepinexConfigs: [],
  exportSkipped: 0,

  async loadModsPage() {
    await this.loadMods();
    await this.loadBepinexConfigs();
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

  async uploadMod(event) {
    const file = event.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    await this.withBusy("uploadMod", async () => {
      try {
        const data = await this.api("POST", "/api/mods/upload", fd);
        this.toast(`Instalado: ${data.installed.join(", ")}`);
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
        this.toast(`Instalado: ${data.installed.join(", ")}`);
        this.modUrl = "";
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async deleteMod(name) {
    if (!confirm(`Remover mod ${name}?`)) return;
    return this.withBusy(`deleteMod:${name}`, async () => {
      try {
        await this.api("DELETE", `/api/mods/${encodeURIComponent(name)}`);
        this.toast(`${name} removido`);
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async toggleMod(name, enabled) {
    return this.withBusy(`toggleMod:${name}`, async () => {
      try {
        const data = await this.api("POST", `/api/mods/${encodeURIComponent(name)}/toggle`, { enabled });
        this.toast(data.message || (enabled ? "Mod ativado" : "Mod desativado"));
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  modStatusLabel(status) {
    return {
      up_to_date: "Atualizado",
      update_available: "Atualização disponível",
      unknown: "Origem desconhecida",
      error: "Erro ao verificar",
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
          ? `Atualização disponível: v${data.installed_version} → v${data.latest_version}`
          : "Mod está na versão mais recente";
        this.toast(msg);
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async updateMod(name) {
    if (!confirm(`Atualizar ${name}? O servidor pode precisar ser reiniciado.`)) return;
    return this.withBusy(`updateMod:${name}`, async () => {
      try {
        const data = await this.api("POST", `/api/mods/${encodeURIComponent(name)}/update`);
        this.toast(data.message || `Mod atualizado para v${data.version}`);
        await this.loadMods();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async linkModThunderstore(name) {
    if (!this.modLinkUrl) return;
    return this.withBusy(`linkMod:${name}`, async () => {
      try {
        await this.api("POST", `/api/mods/${encodeURIComponent(name)}/link`, { url: this.modLinkUrl });
        this.toast("Mod vinculado ao Thunderstore");
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
          throw new Error(err.detail || `Erro ${res.status}`);
        }
        const blob = await res.blob();
        const disposition = res.headers.get("Content-Disposition") || "";
        const match = disposition.match(/filename="([^"]+)"/);
        const filename = match ? match[1] : "perfil.r2z";
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.toast("Perfil .r2z baixado");
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async copyR2modmanCode() {
    return this.withBusy("copyR2modmanCode", async () => {
      try {
        const data = await this.api("POST", "/api/mods/export-code");
        await navigator.clipboard.writeText(data.code);
        const skipped = data.skipped ? ` (${data.skipped} mod(s) ignorados)` : "";
        this.toast(`Código copiado: ${data.mods_count} mod(s)${skipped}`);
      } catch (e) { this.toast(e.message, "error"); }
    });
  },
};
