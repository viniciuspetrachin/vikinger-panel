// Automatic in-game messages (RCON say / showMessage).

const INTERVAL_PRESETS = [
  { id: "60", seconds: 60 },
  { id: "300", seconds: 300 },
  { id: "900", seconds: 900 },
  { id: "1800", seconds: 1800 },
  { id: "3600", seconds: 3600 },
  { id: "custom", seconds: null },
];

function emptyMessageForm() {
  return {
    name: "",
    text: "",
    enabled: true,
    channel: "say",
    trigger: "interval",
    interval_seconds: 1800,
    intervalPreset: "1800",
    run_at: "",
    daily_time: "12:00",
    only_when_players_online: true,
  };
}

export const messages = {
  autoMessagesEnabled: true,
  autoMessages: [],
  autoMessageTags: [],
  autoMessagesRconAvailable: false,
  autoMessageForm: emptyMessageForm(),
  autoMessageEditingId: null,
  autoMessagePreview: "",
  autoMessageFormOpen: false,

  getAutoMessageTriggers() {
    void this.localeVersion;
    const labels = this.tObj("messages.triggers") || {};
    return ["interval", "once", "daily", "on_first_join", "on_join"].map((id) => ({
      id,
      label: labels[id] || id,
    }));
  },

  getAutoMessageChannels() {
    void this.localeVersion;
    const labels = this.tObj("messages.channels") || {};
    return ["say", "showMessage"].map((id) => ({
      id,
      label: labels[id] || id,
    }));
  },

  getAutoMessageIntervalPresets() {
    void this.localeVersion;
    const labels = this.tObj("messages.intervalPresets") || {};
    return INTERVAL_PRESETS.map((p) => ({
      ...p,
      label: labels[p.id] || p.id,
    }));
  },

  syncIntervalPresetFromSeconds(seconds) {
    const match = INTERVAL_PRESETS.find((p) => p.seconds === Number(seconds));
    if (match) {
      this.autoMessageForm.intervalPreset = match.id;
      this.autoMessageForm.interval_seconds = match.seconds;
    } else {
      this.autoMessageForm.intervalPreset = "custom";
      this.autoMessageForm.interval_seconds = Number(seconds) || 1800;
    }
  },

  onIntervalPresetChange() {
    const preset = INTERVAL_PRESETS.find((p) => p.id === this.autoMessageForm.intervalPreset);
    if (preset && preset.seconds) {
      this.autoMessageForm.interval_seconds = preset.seconds;
    }
  },

  triggerLabel(trigger) {
    void this.localeVersion;
    const labels = this.tObj("messages.triggers") || {};
    return labels[trigger] || trigger;
  },

  channelLabel(channel) {
    void this.localeVersion;
    const labels = this.tObj("messages.channels") || {};
    return labels[channel] || channel;
  },

  scheduleSummary(msg) {
    void this.localeVersion;
    if (msg.trigger === "interval") {
      return this.t("messages.summary.interval", { seconds: msg.interval_seconds });
    }
    if (msg.trigger === "once") {
      return this.t("messages.summary.once", { at: msg.run_at || "—" });
    }
    if (msg.trigger === "daily") {
      return this.t("messages.summary.daily", { time: msg.daily_time || "—" });
    }
    if (msg.trigger === "on_first_join") {
      return this.t("messages.summary.on_first_join");
    }
    if (msg.trigger === "on_join") {
      return this.t("messages.summary.on_join");
    }
    return msg.trigger;
  },

  async loadAutoMessages() {
    return this.withPageLoad("messages", async () => {
      try {
        const data = await this.api("GET", "/api/auto-messages");
        this.autoMessagesEnabled = data.enabled !== false;
        this.autoMessages = data.messages || [];
        this.autoMessageTags = data.tags || [];
        this.autoMessagesRconAvailable = !!data.rcon_available;
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },

  openAutoMessageCreate() {
    this.autoMessageEditingId = null;
    this.autoMessageForm = emptyMessageForm();
    this.autoMessageForm.name = this.t("messages.form.defaultName");
    this.autoMessagePreview = "";
    this.autoMessageFormOpen = true;
  },

  openAutoMessageEdit(msg) {
    this.autoMessageEditingId = msg.id;
    this.autoMessageForm = {
      name: msg.name || "",
      text: msg.text || "",
      enabled: msg.enabled !== false,
      channel: msg.channel || "say",
      trigger: msg.trigger || "interval",
      interval_seconds: msg.interval_seconds || 1800,
      intervalPreset: "custom",
      run_at: msg.run_at ? String(msg.run_at).slice(0, 16) : "",
      daily_time: msg.daily_time || "12:00",
      only_when_players_online: msg.only_when_players_online !== false,
    };
    this.syncIntervalPresetFromSeconds(this.autoMessageForm.interval_seconds);
    this.autoMessagePreview = "";
    this.autoMessageFormOpen = true;
  },

  closeAutoMessageForm() {
    this.autoMessageFormOpen = false;
    this.autoMessageEditingId = null;
    this.autoMessagePreview = "";
  },

  insertAutoMessageTag(tag) {
    this.autoMessageForm.text = `${this.autoMessageForm.text || ""}${tag}`;
  },

  autoMessagePayload() {
    const f = this.autoMessageForm;
    const payload = {
      name: f.name || this.t("messages.form.defaultName"),
      text: f.text,
      enabled: !!f.enabled,
      channel: f.channel,
      trigger: f.trigger,
      only_when_players_online: !!f.only_when_players_online,
    };
    if (f.trigger === "interval") {
      payload.interval_seconds = Number(f.interval_seconds) || 1800;
    } else if (f.trigger === "once") {
      payload.run_at = f.run_at ? new Date(f.run_at).toISOString() : null;
    } else if (f.trigger === "daily") {
      payload.daily_time = f.daily_time || "12:00";
    }
    return payload;
  },

  async saveAutoMessageSettings() {
    return this.withBusy("saveAutoMessageSettings", async () => {
      try {
        await this.api("PUT", "/api/auto-messages/settings", {
          enabled: this.autoMessagesEnabled,
        });
        this.toast(this.t("messages.toasts.settingsSaved"));
        await this.loadAutoMessages();
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },

  async saveAutoMessage() {
    return this.withBusy("saveAutoMessage", async () => {
      try {
        const payload = this.autoMessagePayload();
        if (!payload.text?.trim()) {
          this.toast(this.t("messages.toasts.textRequired"), "error");
          return;
        }
        if (this.autoMessageEditingId) {
          await this.api("PUT", `/api/auto-messages/${this.autoMessageEditingId}`, payload);
          this.toast(this.t("messages.toasts.updated"));
        } else {
          await this.api("POST", "/api/auto-messages", payload);
          this.toast(this.t("messages.toasts.created"));
        }
        this.closeAutoMessageForm();
        await this.loadAutoMessages();
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },

  async toggleAutoMessage(msg) {
    return this.withBusy(`toggleAutoMessage:${msg.id}`, async () => {
      try {
        await this.api("PUT", `/api/auto-messages/${msg.id}`, { enabled: !msg.enabled });
        await this.loadAutoMessages();
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },

  async deleteAutoMessage(msg) {
    if (!confirm(this.t("messages.confirmDelete", { name: msg.name }))) return;
    return this.withBusy(`deleteAutoMessage:${msg.id}`, async () => {
      try {
        await this.api("DELETE", `/api/auto-messages/${msg.id}`);
        this.toast(this.t("messages.toasts.deleted"));
        await this.loadAutoMessages();
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },

  async sendAutoMessageNow(msg) {
    return this.withBusy(`sendAutoMessage:${msg.id}`, async () => {
      try {
        const data = await this.api("POST", `/api/auto-messages/${msg.id}/send`);
        this.toast(this.t("messages.toasts.sent", { text: data.rendered || "" }));
        await this.loadAutoMessages();
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },

  async previewAutoMessage() {
    return this.withBusy("previewAutoMessage", async () => {
      try {
        const data = await this.api("POST", "/api/auto-messages/preview", {
          text: this.autoMessageForm.text,
          player_name: "Player",
          player_steam_id: "76561198000000000",
        });
        this.autoMessagePreview = data.rendered || "";
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },
};
