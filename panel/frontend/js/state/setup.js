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
        this.toast(this.t("common.errors.invalidSteamId"), "error");
        return;
      }
    }
    if (this.setupWorldName.trim()) {
      const name = this.setupWorldName.trim();
      if (!/^[A-Za-z0-9_-]+$/.test(name)) {
        this.toast(this.t("common.errors.invalidWorldName"), "error");
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
          this.toast(this.t("common.toasts.rconPasswordGenerated"), "success");
        } else {
          this.toast(data.mode === "vanilla"
            ? this.t("common.toasts.serverConfiguredVanilla")
            : this.t("common.toasts.serverConfiguredBepinex"));
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
