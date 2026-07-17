// Discord alerts page (primary sidebar › Discord).
//
// To add a new event toggle: append one entry to ALERT_EVENT_DEFS (+ i18n +
// backend EVENT_TYPES / dispatch wiring). The UI renders from this list.
// To add a channel later: extend CHANNELS in the HTML template the same way.

/** @type {{ id: string, labelKey: string }[]} */
export const ALERT_EVENT_DEFS = [
  { id: "server_down", labelKey: "alerts.serverDown" },
  { id: "server_up", labelKey: "alerts.serverUp" },
  { id: "server_starting", labelKey: "alerts.serverStarting" },
  { id: "server_stopping", labelKey: "alerts.serverStopping" },
  { id: "server_restarting", labelKey: "alerts.serverRestarting" },
  { id: "server_high_load", labelKey: "alerts.serverHighLoad" },
  { id: "player_join", labelKey: "alerts.playerJoin" },
  { id: "player_leave", labelKey: "alerts.playerLeave" },
  { id: "player_chat", labelKey: "alerts.playerChat" },
  { id: "mod_added", labelKey: "alerts.modAdded" },
  { id: "mod_updated", labelKey: "alerts.modUpdated" },
  { id: "mod_removed", labelKey: "alerts.modRemoved" },
  { id: "backup_ok", labelKey: "alerts.backupOk" },
  { id: "backup_fail", labelKey: "alerts.backupFail" },
];

const DEFAULT_EVENTS = Object.fromEntries(ALERT_EVENT_DEFS.map((e) => [e.id, false]));

const DEFAULT_CHAT_BRIDGE = { enabled: false, prefix: "@discord" };

export const alerts = {
  alertsConfig: {
    events: { ...DEFAULT_EVENTS },
    discord: { enabled: false, webhook_url: "" },
    telegram: { enabled: false, bot_token: "", chat_id: "" },
    chat_bridge: { ...DEFAULT_CHAT_BRIDGE },
  },
  showDiscordWebhook: false,
  showTelegramToken: false,
  showTelegramChannel: false,

  alertEventDefs() {
    void this.localeVersion;
    return ALERT_EVENT_DEFS.map((ev) => ({
      ...ev,
      label: this.t(ev.labelKey),
    }));
  },

  _normalizeAlertsConfig(cfg) {
    const bridge = { ...DEFAULT_CHAT_BRIDGE, ...(cfg.chat_bridge || {}) };
    if (!bridge.prefix) bridge.prefix = DEFAULT_CHAT_BRIDGE.prefix;
    return {
      events: { ...DEFAULT_EVENTS, ...(cfg.events || {}) },
      discord: { enabled: false, webhook_url: "", ...(cfg.discord || {}) },
      telegram: { enabled: false, bot_token: "", chat_id: "", ...(cfg.telegram || {}) },
      chat_bridge: bridge,
    };
  },

  async loadAlerts() {
    return this.withPageLoad("alerts", async () => {
      try {
        const cfg = await this.api("GET", "/api/alerts");
        this.alertsConfig = this._normalizeAlertsConfig(cfg);
        this.showDiscordWebhook = false;
        this.showTelegramToken = false;
        const tg = this.alertsConfig.telegram;
        this.showTelegramChannel = Boolean(tg.enabled || tg.bot_token_set || tg.chat_id);
      } catch (e) {
        /* silent */
      }
    });
  },

  async saveAlerts() {
    return this.withBusy("saveAlerts", async () => {
      try {
        const payload = {
          events: this.alertsConfig.events,
          discord: this.alertsConfig.discord,
          telegram: this.alertsConfig.telegram,
          chat_bridge: this.alertsConfig.chat_bridge,
        };
        const cfg = await this.api("PUT", "/api/alerts", payload);
        this.alertsConfig = this._normalizeAlertsConfig(cfg);
        this.showDiscordWebhook = false;
        this.showTelegramToken = false;
        this.toast(this.t("alerts.saved"));
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },

  async testAlerts() {
    return this.withBusy("testAlerts", async () => {
      try {
        const payload = {
          discord: { webhook_url: this.alertsConfig.discord.webhook_url || "" },
          telegram: {
            bot_token: this.alertsConfig.telegram.bot_token || "",
            chat_id: this.alertsConfig.telegram.chat_id || "",
          },
        };
        const res = await this.api("POST", "/api/alerts/test", payload);
        const result = res.result || {};
        if (result.discord !== true && result.telegram !== true) {
          this.toast(this.t("alerts.testFailed"), "error");
          return;
        }
        this.toast(this.t("alerts.tested"));
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },
};
