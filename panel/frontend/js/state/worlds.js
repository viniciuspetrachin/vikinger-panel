// Mundos: criar/trocar/apagar + editor de configurações do .fwl.

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

  worldModifierCatalog: {
    preset: [
      { value: "", label: "Game default", desc: "No modifiers — vanilla experience, as before the Hildir's Request patch." },
      { value: "easy", label: "Easy", desc: "Lighter combat (easy damage) and less frequent raids." },
      { value: "normal", label: "Normal", desc: "Equivalent to game default — all sliders at Normal." },
      { value: "hard", label: "Hard", desc: "Hard combat and more frequent raids." },
      { value: "hardcore", label: "Hardcore", desc: "Very hard combat, maximum death penalty, frequent raids, hard portals, and no map." },
      { value: "casual", label: "Casual", desc: "Very easy combat, light death penalty, more resources, no raids, casual portals, per-player events, and passive mobs." },
      { value: "hammer", label: "Hammer mode", desc: "Building with no material cost, raids disabled, and passive mobs." },
      { value: "immersive", label: "Immersive", desc: "Portals forbidden, fire spreads across the world, and no map/minimap." },
    ],
    combat: [
      { value: "", label: "Use preset", desc: "Inherit combat difficulty from the selected preset." },
      { value: "veryeasy", label: "Very easy", desc: "125% player damage, 50% enemy damage, enemies 90% speed/size." },
      { value: "easy", label: "Easy", desc: "110% player damage, 75% enemy damage, enemies 95% speed/size." },
      { value: "normal", label: "Normal", desc: "100% on all combat parameters. Higher chance of high-level enemies on Hard/Very hard." },
      { value: "hard", label: "Hard", desc: "85% player damage, 150% enemy damage, enemies 110% speed/size, 120% level-up rate." },
      { value: "veryhard", label: "Very hard", desc: "70% player damage, 200% enemy damage, enemies 120% speed/size, 140% level-up rate." },
    ],
    deathpenalty: [
      { value: "", label: "Use preset", desc: "Inherit death penalty from the selected preset." },
      { value: "casual", label: "Casual", desc: "Equipment kept on death. Inventory dropped. Skill loss: 1%." },
      { value: "veryeasy", label: "Very easy", desc: "Drop everything on death. Skill loss: 1% (less than Normal)." },
      { value: "easy", label: "Easy", desc: "Drop everything on death. Skill loss: 2.5%." },
      { value: "normal", label: "Normal", desc: "Drop everything on death. Skill loss: 5%." },
      { value: "hard", label: "Hard", desc: "Equipment dropped, inventory permanently destroyed. Skill loss: 7.5%." },
      { value: "hardcore", label: "Hardcore", desc: "All items and skills permanently lost on death." },
    ],
    resources: [
      { value: "", label: "Use preset", desc: "Inherit resource rate from the selected preset." },
      { value: "muchless", label: "Much less", desc: "50% of normal mob and object drop rate (≈0.5×)." },
      { value: "less", label: "Less", desc: "75% of normal rate (≈0.75×)." },
      { value: "normal", label: "Normal", desc: "Default game resource rate." },
      { value: "more", label: "More", desc: "150% of normal rate (≈1.5×)." },
      { value: "muchmore", label: "Much more", desc: "200% of normal rate (≈2×)." },
      { value: "most", label: "Maximum", desc: "300% of normal rate (≈3×)." },
    ],
    raids: [
      { value: "", label: "Use preset", desc: "Inherit raid frequency from the selected preset." },
      { value: "none", label: "None", desc: "EventRate 0 — daytime raids disabled. Night raids may still occur." },
      { value: "muchless", label: "Much less", desc: "Interval ~92 min, 10% chance — far fewer raids." },
      { value: "less", label: "Less", desc: "Interval ~69 min, ~13% chance." },
      { value: "normal", label: "Normal", desc: "Interval ~46 min, 20% chance." },
      { value: "more", label: "More", desc: "Interval ~28 min, ~33% chance." },
      { value: "muchmore", label: "Much more", desc: "Interval ~14 min, ~67% chance." },
    ],
    portals: [
      { value: "", label: "Use preset", desc: "Inherit portal rules from the selected preset." },
      { value: "casual", label: "Casual", desc: "TeleportAll — almost everything can go through portals (except tamed animals)." },
      { value: "normal", label: "Normal", desc: "Non-portable items follow default game rules." },
      { value: "hard", label: "No boss portals", desc: "Portals unavailable while a boss is active in the area." },
      { value: "veryhard", label: "No portals", desc: "No portals allowed in the world." },
    ],
  },
  worldConfigFields: [
    { key: "combat", label: "Combat", icon: "⚔️" },
    { key: "deathpenalty", label: "Death penalty", icon: "💀" },
    { key: "resources", label: "Resources", icon: "🪵" },
    { key: "raids", label: "Raids", icon: "🔥" },
    { key: "portals", label: "Portals", icon: "🌀" },
  ],
  worldConfigFlags: [
    { key: "nobuildcost", label: "No build cost", desc: "Building pieces consume no materials. Recipes still need to be discovered." },
    { key: "playerevents", label: "Per-player raids", desc: "Raids based on each player's individual progress, not bosses killed on the server." },
    { key: "fire", label: "Fire hazard", desc: "Wood can catch fire and fire spreads across the entire world, not just Ashlands." },
    { key: "passivemobs", label: "Passive enemies", desc: "Enemies do not attack until provoked." },
    { key: "nomap", label: "No map", desc: "Map and minimap disabled — navigate by landmarks only." },
  ],

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
      ? `Activate world "${name}"? The server will restart and a NEW (empty) world will be created.`
      : `Activate world "${name}"? The server will restart.`;
    if (!confirm(msg)) return;
    return this.withBusy(`switchWorld:${name}`, async () => {
      try {
        await this.api("POST", "/api/worlds/switch", { world_name: name });
        this.toast(`World "${name}" activated`);
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
        this.toast(act ? `World "${this.newWorldName}" created and activated` : `World "${this.newWorldName}" registered`);
        this.newWorldName = "";
        this.createWorldActivate = false;
        await this.loadWorlds();
        if (act) await this.refreshStatus();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async deleteWorld(name) {
    if (!confirm(`Permanently delete world "${name}"?`)) return;
    return this.withBusy(`deleteWorld:${name}`, async () => {
      try {
        await this.api("DELETE", `/api/worlds/${encodeURIComponent(name)}`);
        this.toast(`World "${name}" deleted`);
        await this.loadWorlds();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  worldBadge(world) {
    if (world.running && !world.has_db) return "Awaiting creation";
    if (world.running) return "Running";
    if (world.active) return "Active";
    if (world.pending) return "Pending";
    return "";
  },

  worldConfigBadge(world) {
    const s = world.config_summary;
    if (!s) return "";
    const preset = this.worldOptionLabel("preset", s.preset || "normal");
    const portals = this.worldOptionLabel("portals", s.portals || "normal");
    return `${preset} · Portals: ${portals}`;
  },

  worldOptionLabel(field, value) {
    const v = value ?? "";
    const item = (this.worldModifierCatalog[field] || []).find((o) => o.value === v);
    if (item) return item.label;
    if (!v) return field === "preset" ? "Game default" : "Preset";
    return v;
  },

  worldOptionDesc(field, value) {
    const v = value ?? "";
    const item = (this.worldModifierCatalog[field] || []).find((o) => o.value === v);
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
    const eff = this.computeWorldEffective();
    return [
      { key: "preset", label: "Preset", value: eff.preset },
      { key: "combat", label: "Combat", value: eff.combat },
      { key: "deathpenalty", label: "Death", value: eff.deathpenalty },
      { key: "resources", label: "Resources", value: eff.resources },
      { key: "raids", label: "Raids", value: eff.raids },
      { key: "portals", label: "Portals", value: eff.portals },
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
        this.toast(restart ? "Settings saved and server restarted" : "World settings saved");
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
