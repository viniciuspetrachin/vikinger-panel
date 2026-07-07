// Mods e Configs: instalar/ativar/remover mods + editar .cfg do BepInEx.

export const mods = {
  mods: [],
  modUrl: "",
  bepinexConfigs: [],

  async loadModsPage() {
    await this.loadMods();
    await this.loadBepinexConfigs();
  },

  async loadMods() {
    try {
      const data = await this.api("GET", "/api/mods");
      this.mods = data.mods || [];
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
};
