// Servidor: .env básico + listas de jogadores + capacidade (RAM e jogadores).

export const server = {
  envValues: {},
  listValues: { admin: "", banned: "", permitted: "" },
  listEditorDirty: { admin: false, banned: false, permitted: false },
  showServerPass: false,
  selectedWorld: "",
  capacity: {
    max_players: 10,
    max_players_cap: 10,
    mod_source: null,
    suggested_ram_gb: 4,
    warning: null,
    suggestions: [],
    crossplay: false,
  },
  maxPlayers: 10,

  envFields: [
    { key: "SERVER_NAME", label: "Server Name", hint: "Shown in the in-game server list." },
    { key: "SERVER_PUBLIC", label: "Public (true/false)", hint: "true = listed publicly; false = direct connection only." },
    { key: "SERVER_ARGS", label: "Extra arguments", hint: "E.g. -crossplay to enable crossplay." },
  ],

  serverLists: [
    { key: "admin", label: "Administrators (Steam IDs)" },
    { key: "banned", label: "Banned (Steam IDs)" },
    { key: "permitted", label: "Permitted / whitelist (Steam IDs)" },
  ],

  async loadServerPage() {
    await this.loadWorlds();
    await this.loadUpdatesPage();
    await this.loadEnv();
    await Promise.all([this.loadMemoryConfig(), this.loadCapacity()]);
    this.selectedWorld = this.envValues.WORLD_NAME || this.worlds.find((w) => w.active)?.name || "";
    this.$nextTick(() => this.mountListEditors());
  },

  async loadCapacity() {
    try {
      const data = await this.api("GET", "/api/config/capacity");
      this.capacity = data;
      this.maxPlayers = data.max_players ?? 10;
      if (data.memory_gb != null) {
        this.memoryConfig.gb = data.memory_gb;
        this.memoryConfig.unlimited = data.memory_unlimited;
      }
      if (data.memory_slider_max) this.memoryConfig.slider_max = data.memory_slider_max;
      this.syncMemorySliderFromConfig();
    } catch (e) { this.toast(e.message, "error"); }
  },

  isSuggestionActive(row) {
    const n = this.maxPlayers ?? 10;
    return n >= row.players_min && n <= row.players_max;
  },

  async applyMemoryLimit() {
    const gb = this.memoryGbForApi();
    const label = gb ? `${gb} GB` : "No limit";
    if (!confirm(`Set RAM limit to ${label}? The container will be recreated and players disconnected.`)) return;

    return this.withBusy("applyMemory", async () => {
      try {
        const data = await this.api("PUT", "/api/config/capacity", {
          memory_gb: gb ?? (this.memoryConfig.slider_max || 29),
          apply_memory: true,
        });
        if (data.memory_warning) this.toast(data.memory_warning, "error");
        this.toast(data.message || "Limit applied");
        await this.loadCapacity();
        await this.loadMemoryConfig();
        await this.refreshStatus();
        setTimeout(() => this.loadMetrics(false), 3000);
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async saveMaxPlayers() {
    return this.withBusy("saveMaxPlayers", async () => {
      try {
        const data = await this.api("PUT", "/api/config/capacity", { max_players: this.maxPlayers });
        this.capacity = { ...this.capacity, ...data };
        this.maxPlayers = data.max_players ?? this.maxPlayers;
        if (data.warning) this.toast(data.warning, "error");
        this.toast(data.message || "Player limit saved");
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async loadEnv() {
    try {
      const data = await this.api("GET", "/api/config/env");
      this.envValues = data.values || {};
      const lists = await this.api("GET", "/api/config/serverlists");
      for (const k of ["admin", "banned", "permitted"]) {
        this.listValues[k] = (lists[k] || []).join("\n");
      }
      this.$nextTick(() => this.mountListEditors());
    } catch (e) { this.toast(e.message, "error"); }
  },

  mountListEditors() {
    if (typeof window.PanelEditor === "undefined") return;
    for (const key of ["admin", "banned", "permitted"]) {
      const el = document.getElementById(`list-editor-${key}`);
      if (!el) continue;
      const path = `serverlist:${key}`;
      const content = this.listValues[key] || "";
      window.PanelEditor.mount(`list-${key}`, el, {
        path,
        content,
        minHeight: "120px",
        onSave: async (text) => {
          this.listValues[key] = text;
          await this.saveServerLists();
        },
        onDirtyChange: (dirty) => { this.listEditorDirty[key] = dirty; },
      });
    }
  },

  listEditorUndo(key) { window.PanelEditor?.get(`list-${key}`)?.undo(); },
  listEditorRedo(key) { window.PanelEditor?.get(`list-${key}`)?.redo(); },

  async saveEnv(restart = false) {
    return this.withBusy(restart ? "saveEnvRestart" : "saveEnv", async () => {
      try {
        await this.api("PUT", "/api/config/env", { values: this.envValues });
        this.toast("Settings saved!");
        if (restart) await this.serverAction("restart");
        await this.loadCapacity();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async saveServerLists() {
    return this.withBusy("saveServerLists", async () => {
      try {
        for (const k of ["admin", "banned", "permitted"]) {
          const editor = window.PanelEditor?.get(`list-${k}`);
          const text = editor ? editor.getContent() : (this.listValues[k] || "");
          this.listValues[k] = text;
          const ids = text.split("\n").map((s) => s.trim()).filter(Boolean);
          await this.api("PUT", `/api/config/serverlists/${k}`, { ids });
          editor?.setContent(text, { markSaved: true });
        }
        this.toast("Lists saved! Server restarted if it was online.");
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async onWorldSelectChange() {
    const name = this.selectedWorld;
    if (!name || name === this.envValues.WORLD_NAME) return;
    await this.switchWorld(name);
    if (this.envValues.WORLD_NAME !== name) this.selectedWorld = this.envValues.WORLD_NAME || name;
  },
};
