// Alerts config (Config › Alerts): Discord webhook + Telegram, event toggles.

export const alerts = {
  alertsConfig: {
    events: { server_down: false, player_join: false, backup_fail: false },
    discord: { enabled: false, webhook_url: "" },
    telegram: { enabled: false, bot_token: "", chat_id: "" },
  },

  async loadAlerts() {
    try {
      const cfg = await this.api("GET", "/api/alerts");
      this.alertsConfig = {
        events: { server_down: false, player_join: false, backup_fail: false, ...(cfg.events || {}) },
        discord: { enabled: false, webhook_url: "", ...(cfg.discord || {}) },
        telegram: { enabled: false, bot_token: "", chat_id: "", ...(cfg.telegram || {}) },
      };
    } catch (e) {
      /* silent */
    }
  },

  async saveAlerts() {
    return this.withBusy("saveAlerts", async () => {
      try {
        const payload = {
          events: this.alertsConfig.events,
          discord: this.alertsConfig.discord,
          telegram: this.alertsConfig.telegram,
        };
        const cfg = await this.api("PUT", "/api/alerts", payload);
        this.alertsConfig = {
          events: { server_down: false, player_join: false, backup_fail: false, ...(cfg.events || {}) },
          discord: { enabled: false, webhook_url: "", ...(cfg.discord || {}) },
          telegram: { enabled: false, bot_token: "", chat_id: "", ...(cfg.telegram || {}) },
        };
        this.toast(this.t("alerts.saved"));
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },

  async testAlerts() {
    return this.withBusy("testAlerts", async () => {
      try {
        await this.api("POST", "/api/alerts/test");
        this.toast(this.t("alerts.tested"));
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },
};
