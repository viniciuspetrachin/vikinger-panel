// Wizard de primeiro acesso — escolha Vanilla vs BepInEx.

export const setup = {
  setupStatus: { completed: true, needs_wizard: false },
  setupWizardOpen: false,
  setupMode: "bepinex",
  setupAdminSteamId: "",
  setupWorldName: "",
  setupActivateWorld: true,
  setupRconPassword: null,

  async loadSetupStatus() {
    try {
      this.setupStatus = await this.api("GET", "/api/setup/status");
      this.setupWizardOpen = !!this.setupStatus.needs_wizard;
      if (this.setupStatus.mode) {
        this.setupMode = this.setupStatus.mode;
      }
    } catch (e) {
      this.toast(e.message, "error");
    }
  },

  async completeSetup() {
    if (this.setupMode === "vanilla" && this.setupAdminSteamId) {
      const sid = this.setupAdminSteamId.trim();
      if (!/^\d{17}$/.test(sid)) {
        this.toast("Steam ID inválido — use 17 dígitos", "error");
        return;
      }
    }
    if (this.setupWorldName.trim()) {
      const name = this.setupWorldName.trim();
      if (!/^[A-Za-z0-9_-]+$/.test(name)) {
        this.toast("Nome do mundo inválido — use apenas letras, números, _ e -", "error");
        return;
      }
    }

    return this.withBusy("completeSetup", async () => {
      try {
        const data = await this.api("POST", "/api/setup/complete", {
          mode: this.setupMode,
          admin_steam_id: this.setupMode === "vanilla" ? this.setupAdminSteamId.trim() || null : null,
          world_name: this.setupWorldName.trim() || null,
          activate_world: this.setupActivateWorld,
        });
        this.setupWizardOpen = false;
        this.setupStatus = { completed: true, needs_wizard: false, mode: data.mode };
        if (data.rcon_password) {
          this.setupRconPassword = data.rcon_password;
          this.toast("Senha RCON gerada — copie antes de fechar o aviso", "success");
        } else {
          this.toast(data.mode === "vanilla" ? "Servidor configurado em modo Vanilla" : "Servidor configurado com BepInEx");
        }
        this.bepinexEnabled = data.bepinex;
        await this.loadDashboardData();
        await this.loadWorlds();
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },

  dismissRconPassword() {
    this.setupRconPassword = null;
  },
};
