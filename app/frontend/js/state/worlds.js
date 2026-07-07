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
      { value: "", label: "Padrão do jogo", desc: "Sem modificadores — experiência vanilla, como antes do patch Hildir's Request." },
      { value: "easy", label: "Fácil", desc: "Combate mais leve (dano fácil) e raids menos frequentes." },
      { value: "normal", label: "Normal", desc: "Equivalente ao padrão do jogo — todos os sliders em Normal." },
      { value: "hard", label: "Difícil", desc: "Combate difícil e raids mais frequentes." },
      { value: "hardcore", label: "Hardcore", desc: "Combate muito difícil, penalidade máxima de morte, raids frequentes, portais difíceis e sem mapa." },
      { value: "casual", label: "Casual", desc: "Combate muito fácil, morte leve, mais recursos, sem raids, portais casuais, eventos por jogador e mobs passivos." },
      { value: "hammer", label: "Modo Martelo", desc: "Construção sem custo de materiais, raids desativadas e mobs passivos." },
      { value: "immersive", label: "Imersivo", desc: "Portais proibidos, fogo se espalha pelo mundo e sem mapa/minimapa." },
    ],
    combat: [
      { value: "", label: "Usar preset", desc: "Herdar dificuldade de combate do preset selecionado." },
      { value: "veryeasy", label: "Muito fácil", desc: "125% dano do jogador, 50% dano inimigo, inimigos 90% velocidade/tamanho." },
      { value: "easy", label: "Fácil", desc: "110% dano do jogador, 75% dano inimigo, inimigos 95% velocidade/tamanho." },
      { value: "normal", label: "Normal", desc: "100% em todos os parâmetros de combate. Maior chance de inimigos de alto nível em Difícil/Muito difícil." },
      { value: "hard", label: "Difícil", desc: "85% dano do jogador, 150% dano inimigo, inimigos 110% velocidade/tamanho, 120% taxa de level up." },
      { value: "veryhard", label: "Muito difícil", desc: "70% dano do jogador, 200% dano inimigo, inimigos 120% velocidade/tamanho, 140% taxa de level up." },
    ],
    deathpenalty: [
      { value: "", label: "Usar preset", desc: "Herdar penalidade de morte do preset selecionado." },
      { value: "casual", label: "Casual", desc: "Equipamento mantido ao morrer. Inventário dropado. Perda de skills: 1%." },
      { value: "veryeasy", label: "Muito fácil", desc: "Dropa tudo ao morrer. Perda de skills: 1% (menor que Normal)." },
      { value: "easy", label: "Fácil", desc: "Dropa tudo ao morrer. Perda de skills: 2,5%." },
      { value: "normal", label: "Normal", desc: "Dropa tudo ao morrer. Perda de skills: 5%." },
      { value: "hard", label: "Difícil", desc: "Equipamento dropado, inventário destruído permanentemente. Perda de skills: 7,5%." },
      { value: "hardcore", label: "Hardcore", desc: "Todos os itens e skills perdidos permanentemente ao morrer." },
    ],
    resources: [
      { value: "", label: "Usar preset", desc: "Herdar taxa de recursos do preset selecionado." },
      { value: "muchless", label: "Muito menos", desc: "50% da taxa normal de drop de mobs e objetos (≈0,5×)." },
      { value: "less", label: "Menos", desc: "75% da taxa normal (≈0,75×)." },
      { value: "normal", label: "Normal", desc: "Taxa padrão de recursos do jogo." },
      { value: "more", label: "Mais", desc: "150% da taxa normal (≈1,5×)." },
      { value: "muchmore", label: "Muito mais", desc: "200% da taxa normal (≈2×)." },
      { value: "most", label: "Máximo", desc: "300% da taxa normal (≈3×)." },
    ],
    raids: [
      { value: "", label: "Usar preset", desc: "Herdar frequência de raids do preset selecionado." },
      { value: "none", label: "Nenhuma", desc: "EventRate 0 — raids diurnas desativadas. Raids noturnas ainda podem ocorrer." },
      { value: "muchless", label: "Muito menos", desc: "Intervalo ~92 min, 10% chance — bem menos raids." },
      { value: "less", label: "Menos", desc: "Intervalo ~69 min, ~13% chance." },
      { value: "normal", label: "Normal", desc: "Intervalo ~46 min, 20% chance." },
      { value: "more", label: "Mais", desc: "Intervalo ~28 min, ~33% chance." },
      { value: "muchmore", label: "Muito mais", desc: "Intervalo ~14 min, ~67% chance." },
    ],
    portals: [
      { value: "", label: "Usar preset", desc: "Herdar regras de portais do preset selecionado." },
      { value: "casual", label: "Casual", desc: "TeleportAll — quase tudo pode ser levado por portal (exceto animais domados)." },
      { value: "normal", label: "Normal", desc: "Itens não-portáveis seguem as regras padrão do jogo." },
      { value: "hard", label: "Sem portais de boss", desc: "Portais indisponíveis enquanto um boss estiver ativo na área." },
      { value: "veryhard", label: "Sem portais", desc: "Nenhum portal permitido no mundo." },
    ],
  },
  worldConfigFields: [
    { key: "combat", label: "Combate", icon: "⚔️" },
    { key: "deathpenalty", label: "Penalidade de morte", icon: "💀" },
    { key: "resources", label: "Recursos", icon: "🪵" },
    { key: "raids", label: "Raids", icon: "🔥" },
    { key: "portals", label: "Portais", icon: "🌀" },
  ],
  worldConfigFlags: [
    { key: "nobuildcost", label: "Sem custo de construção", desc: "Peças de construção não consomem materiais. Receitas ainda precisam ser descobertas." },
    { key: "playerevents", label: "Raids por jogador", desc: "Raids baseadas no progresso individual de cada jogador, não nos bosses mortos no servidor." },
    { key: "fire", label: "Perigo de fogo", desc: "Madeira pode pegar fogo e o fogo se espalha pelo mundo inteiro, não só em Ashlands." },
    { key: "passivemobs", label: "Inimigos passivos", desc: "Inimigos não atacam até serem provocados." },
    { key: "nomap", label: "Sem mapa", desc: "Mapa e minimapa desabilitados — navegação apenas por marcos visuais." },
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
      ? `Ativar mundo "${name}"? O servidor será reiniciado e um mundo NOVO (vazio) será criado.`
      : `Ativar mundo "${name}"? O servidor será reiniciado.`;
    if (!confirm(msg)) return;
    return this.withBusy(`switchWorld:${name}`, async () => {
      try {
        await this.api("POST", "/api/worlds/switch", { world_name: name });
        this.toast(`Mundo "${name}" ativado`);
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
        this.toast(act ? `Mundo "${this.newWorldName}" criado e ativado` : `Mundo "${this.newWorldName}" registrado`);
        this.newWorldName = "";
        this.createWorldActivate = false;
        await this.loadWorlds();
        if (act) await this.refreshStatus();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  async deleteWorld(name) {
    if (!confirm(`Apagar mundo "${name}" permanentemente?`)) return;
    return this.withBusy(`deleteWorld:${name}`, async () => {
      try {
        await this.api("DELETE", `/api/worlds/${encodeURIComponent(name)}`);
        this.toast(`Mundo "${name}" apagado`);
        await this.loadWorlds();
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  worldBadge(world) {
    if (world.running && !world.has_db) return "Aguardando criação";
    if (world.running) return "Em execução";
    if (world.active) return "Ativo";
    if (world.pending) return "Pendente";
    return "";
  },

  worldConfigBadge(world) {
    const s = world.config_summary;
    if (!s) return "";
    const preset = this.worldOptionLabel("preset", s.preset || "normal");
    const portals = this.worldOptionLabel("portals", s.portals || "normal");
    return `${preset} · Portais: ${portals}`;
  },

  worldOptionLabel(field, value) {
    const v = value ?? "";
    const item = (this.worldModifierCatalog[field] || []).find((o) => o.value === v);
    if (item) return item.label;
    if (!v) return field === "preset" ? "Padrão do jogo" : "Preset";
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
      { key: "combat", label: "Combate", value: eff.combat },
      { key: "deathpenalty", label: "Morte", value: eff.deathpenalty },
      { key: "resources", label: "Recursos", value: eff.resources },
      { key: "raids", label: "Raids", value: eff.raids },
      { key: "portals", label: "Portais", value: eff.portals },
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
        this.toast(restart ? "Configurações salvas e servidor reiniciado" : "Configurações do mundo salvas");
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
