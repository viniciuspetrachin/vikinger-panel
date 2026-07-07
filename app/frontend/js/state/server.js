// Servidor: .env básico + listas de jogadores (admin/ban/permit).

export const server = {
  envValues: {},
  listValues: { admin: "", banned: "", permitted: "" },
  listEditorDirty: { admin: false, banned: false, permitted: false },
  showServerPass: false,
  selectedWorld: "",

  envFields: [
    { key: "SERVER_NAME", label: "Nome do Servidor", hint: "Aparece na lista de servidores do jogo." },
    { key: "SERVER_PUBLIC", label: "Público (true/false)", hint: "true = aparece na lista pública; false = só por conexão direta." },
    { key: "SERVER_ARGS", label: "Argumentos extra", hint: "Ex.: -crossplay para habilitar crossplay." },
  ],

  serverLists: [
    { key: "admin", label: "Administradores (Steam IDs)" },
    { key: "banned", label: "Banidos (Steam IDs)" },
    { key: "permitted", label: "Permitidos / whitelist (Steam IDs)" },
  ],

  async loadServerPage() {
    await this.loadWorlds();
    await this.loadEnv();
    this.selectedWorld = this.envValues.WORLD_NAME || this.worlds.find((w) => w.active)?.name || "";
    this.$nextTick(() => this.mountListEditors());
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
        this.toast("Configurações salvas!");
        if (restart) await this.serverAction("restart");
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
        this.toast("Listas salvas! Servidor reiniciado se estava online.");
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
