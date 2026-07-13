// Mundos: criar/trocar/apagar + editor de configurações do .fwl.

const MODIFIER_FIELDS = ["preset", "combat", "deathpenalty", "resources", "raids", "portals"];
const FLAG_KEYS = ["nobuildcost", "playerevents", "fire", "passivemobs", "nomap"];
const FIELD_KEYS = ["combat", "deathpenalty", "resources", "raids", "portals"];
const FIELD_ICONS = { combat: "⚔️", deathpenalty: "💀", resources: "🪵", raids: "🔥", portals: "🌀" };

function catalogFromI18n(tObj, field) {
  const raw = tObj?.[field] || {};
  return Object.entries(raw).map(([value, meta]) => ({
    value: value === "_default" ? "" : value,
    label: meta.label,
    desc: meta.desc,
  }));
}

export const worlds = {
  worlds: [],
  newWorldName: "",
  createWorldActivate: false,
  worldConfigName: "",
  worldConfigForm: {},
  worldConfigMeta: null,
  worldConfigSummary: null,
  worldConfigEffective: null,
  worldConfigInferredPreset: "",
  worldConfigPresetDetected: false,
  worldConfigModifierStrings: [],
  worldConfigFlagsActive: {},
  worldConfigWarnings: [],
  worldConfigRequiresRestart: false,

  getWorldModifierCatalog() {
    void this.localeVersion;
    const presets = this.tObj("worlds.presets") || {};
    const out = {};
    for (const field of MODIFIER_FIELDS) {
      out[field] = catalogFromI18n(presets, field);
    }
    return out;
  },

  getWorldConfigFields() {
    void this.localeVersion;
    const labels = this.tObj("worlds.fields") || {};
    return FIELD_KEYS.map((key) => ({
      key,
      label: labels[key] || key,
      icon: FIELD_ICONS[key],
    }));
  },

  getWorldConfigFlags() {
    void this.localeVersion;
    const flags = this.tObj("worlds.flags") || {};
    return FLAG_KEYS.filter((key) => flags[key]).map((key) => ({
      key,
      label: flags[key].label,
      desc: flags[key].desc,
    }));
  },

  async loadWorldsPage() {
    await this.loadWorlds();
    if (!this.worldConfigName && this.worlds.length) {
      this.worldConfigName = this.worlds.find((w) => w.active)?.name || this.worlds[0].name;
    }
    await this.loadWorldConfig();
  },

  async loadWorlds() {
    try {
      const data = await this.api("GET", "/api/worlds");
      this.worlds = data.worlds || [];
    } catch (e) { this.toast(e.message, "error"); }
  },

  async switchWorld(name) {
    const world = this.worlds.find((w) => w.name === name);
    const isNew = world && world.pending && !world.has_db;
    const msg = isNew
      ? this.t("common.confirm.activateWorldNew", { name })
      : this.t("common.confirm.activateWorld", { name });
    if (!confirm(msg)) return;
    return this.withBusy(`switchWorld:${name}`, async () => {
      try {
        await this.api("POST", "/api/worlds/switch", { world_name: name });
        this.toast(this.t("common.toasts.worldActivated", { name }));
        await this.loadWorlds();
        await this.refreshStatus();
        if (this.page === "server") {
          this.selectedWorld = name;
          this.envValues.WORLD_NAME = name;
        }
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async createWorld(activate = false) {
    if (!this.newWorldName) return;
    const act = activate || this.createWorldActivate;
    return this.withBusy(act ? "createWorldActivate" : "createWorld", async () => {
      try {
        await this.api("POST", `/api/worlds/create?name=${encodeURIComponent(this.newWorldName)}&activate=${act}`);
        const name = this.newWorldName;
        this.toast(act
          ? this.t("common.toasts.worldCreatedActivated", { name })
          : this.t("common.toasts.worldRegistered", { name }));
        this.newWorldName = "";
        this.createWorldActivate = false;
        await this.loadWorlds();
        if (act) await this.refreshStatus();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async deleteWorld(name) {
    if (!confirm(this.t("common.confirm.deleteWorld", { name }))) return;
    return this.withBusy(`deleteWorld:${name}`, async () => {
      try {
        await this.api("DELETE", `/api/worlds/${encodeURIComponent(name)}`);
        this.toast(this.t("common.toasts.worldDeleted", { name }));
        await this.loadWorlds();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  worldBadge(world) {
    if (world.running && !world.has_db) return this.t("worlds.badges.awaitingCreation");
    if (world.running) return this.t("worlds.badges.running");
    if (world.active) return this.t("worlds.badges.active");
    if (world.pending) return this.t("worlds.badges.pending");
    return "";
  },

  worldConfigBadge(world) {
    const s = world.config_summary;
    if (!s) return "";
    const preset = this.worldOptionLabel("preset", s.preset || "normal");
    const portals = this.worldOptionLabel("portals", s.portals || "normal");
    return this.t("worlds.badges.configBadge", { preset, portals });
  },

  worldDbLabel(world) {
    void this.localeVersion;
    const value = world.has_db ? this.formatSize(world.db_size) : this.t("worlds.ui.notCreated");
    return this.t("worlds.ui.db", { value });
  },

  worldOptionLabel(field, value) {
    const v = value ?? "";
    const item = (this.getWorldModifierCatalog()[field] || []).find((o) => o.value === v);
    if (item) return item.label;
    if (!v) return field === "preset"
      ? this.t("worlds.fallback.gameDefault")
      : this.t("worlds.fallback.preset");
    return v;
  },

  worldOptionDesc(field, value) {
    const v = value ?? "";
    const item = (this.getWorldModifierCatalog()[field] || []).find((o) => o.value === v);
    return item?.desc || "";
  },

  worldFieldDesc(field) {
    const val = this.worldConfigForm[field] ?? "";
    return this.worldOptionDesc(field, val);
  },

  worldPresetDesc() {
    return this.worldOptionDesc("preset", this.worldConfigForm.preset ?? "");
  },

  worldEffectiveRows() {
    void this.localeVersion;
    const eff = this.computeWorldEffective();
    const labels = this.tObj("worlds.fields") || {};
    return [
      { key: "preset", label: labels.preset || this.t("worlds.fields.preset"), value: eff.preset },
      { key: "combat", label: labels.combat || this.t("worlds.fields.combat"), value: eff.combat },
      { key: "deathpenalty", label: labels.death || labels.deathpenalty || this.t("worlds.fields.death"), value: eff.deathpenalty },
      { key: "resources", label: labels.resources || this.t("worlds.fields.resources"), value: eff.resources },
      { key: "raids", label: labels.raids || this.t("worlds.fields.raids"), value: eff.raids },
      { key: "portals", label: labels.portals || this.t("worlds.fields.portals"), value: eff.portals },
    ];
  },

  computeWorldEffective() {
    const form = this.worldConfigForm || {};
    const preset = (form.preset || "").toLowerCase();
    const eff = { combat: "normal", deathpenalty: "normal", resources: "normal", raids: "normal", portals: "normal" };
    if (preset === "easy") { eff.combat = "easy"; eff.raids = "less"; }
    else if (preset === "hard") { eff.combat = "hard"; eff.raids = "more"; }
    else if (preset === "hardcore") { eff.combat = "veryhard"; eff.deathpenalty = "hardcore"; eff.raids = "more"; eff.portals = "hard"; }
    else if (preset === "casual") { eff.combat = "veryeasy"; eff.deathpenalty = "casual"; eff.resources = "more"; eff.raids = "none"; eff.portals = "casual"; }
    else if (preset === "hammer") { eff.raids = "none"; }
    else if (preset === "immersive") { eff.portals = "veryhard"; }
    if (form.combat) eff.combat = form.combat;
    if (form.deathpenalty) eff.deathpenalty = form.deathpenalty;
    if (form.resources) eff.resources = form.resources;
    if (form.raids) eff.raids = form.raids;
    if (form.portals) eff.portals = form.portals;
    return { preset: preset || "normal", ...eff };
  },

  selectWorldPreset(value) {
    this.worldConfigForm.preset = value;
    this.worldConfigPresetDetected = false;
  },

  openWorldConfig(name) {
    this.worldConfigName = name;
    this.page = "worlds";
    this.$nextTick(() => {
      this.loadWorldConfig();
      this.$refs.worldConfigPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  },

  defaultWorldConfigForm() {
    return { preset: "", combat: "", deathpenalty: "", resources: "", raids: "", portals: "", seed: "", nobuildcost: null, playerevents: null, fire: null, passivemobs: null, nomap: null };
  },

  async loadWorldConfig() {
    if (!this.worldConfigName) return;
    return this.withBusy("loadWorldConfig", async () => {
      try {
        const data = await this.api("GET", `/api/worlds/${encodeURIComponent(this.worldConfigName)}/config`);
        this.worldConfigMeta = data.meta || null;
        this.worldConfigSummary = data.summary || data.effective || null;
        this.worldConfigEffective = data.effective || data.summary || null;
        this.worldConfigInferredPreset = data.inferred_preset || "";
        this.worldConfigModifierStrings = data.modifier_strings || [];
        this.worldConfigFlagsActive = data.flags || {};
        this.worldConfigWarnings = data.warnings || [];
        this.worldConfigRequiresRestart = !!data.requires_restart;
        const form = { ...this.defaultWorldConfigForm(), ...(data.config || {}) };
        this.worldConfigPresetDetected = !data.config?.preset && !!data.inferred_preset;
        if (!form.preset && this.worldConfigInferredPreset) {
          form.preset = this.worldConfigInferredPreset;
        }
        this.worldConfigForm = form;
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async saveWorldConfig(restart = false) {
    const key = restart ? "saveWorldConfigRestart" : "saveWorldConfig";
    return this.withBusy(key, async () => {
      try {
        const payload = { config: this.worldConfigForm, restart };
        const data = await this.api("PUT", `/api/worlds/${encodeURIComponent(this.worldConfigName)}/config`, payload);
        this.toast(restart
          ? this.t("common.toasts.worldSettingsSavedRestart")
          : this.t("common.toasts.worldSettingsSaved"));
        this.worldConfigRequiresRestart = !!data.requires_restart;
        this.worldConfigEffective = data.effective || data.summary || null;
        this.worldConfigInferredPreset = data.inferred_preset || "";
        this.worldConfigModifierStrings = data.modifier_strings || [];
        this.worldConfigFlagsActive = data.flags || {};
        await this.loadWorlds();
        await this.loadWorldConfig();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },
};
