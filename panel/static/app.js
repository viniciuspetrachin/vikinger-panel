function formatRateTick(bps) {
  if (!bps || bps <= 0) return '0 B/s';
  if (bps >= 1024 * 1024) return (bps / (1024 * 1024)).toFixed(1) + ' MB/s';
  if (bps >= 1024) return (bps / 1024).toFixed(1) + ' KB/s';
  return Math.round(bps) + ' B/s';
}

function panel() {
  const panelData = {
    page: 'dashboard',
    loading: false,
    actionPending: null,
    toasts: [],
    status: {},
    metrics: {},
    memoryConfig: { gb: null, unlimited: true },
    memoryGb: 4,
    memoryUnlimited: true,
    netChartInstance: null,
    metricsInterval: null,
    envValues: {},
    listValues: { admin: '', banned: '', permitted: '' },
    mods: [],
    modUrl: '',
    worlds: [],
    backups: [],
    backupConfig: {},
    backupIntervalPreset: 'hourly',
    backupCronCustom: '0 * * * *',
    backupModalOpen: false,
    backupTypes: [
      { id: 'world', label: 'Mundo ativo (rápido)', desc: 'Apenas o mundo em uso (.fwl + .db).' },
      { id: 'full', label: 'Completo', desc: 'Mundos + configs BepInEx + mods + listas + .env.' },
      { id: 'configs', label: 'Somente configs', desc: 'Configs BepInEx + listas de jogadores + .env.' },
    ],
    newWorldName: '',
    createWorldActivate: false,
    worldConfigName: '',
    worldConfigForm: {},
    worldConfigMeta: null,
    worldConfigSummary: null,
    worldConfigEffective: null,
    worldConfigInferredPreset: '',
    worldConfigPresetDetected: false,
    worldConfigModifierStrings: [],
    worldConfigFlagsActive: {},
    worldConfigWarnings: [],
    worldConfigRequiresRestart: false,
    worldModifierCatalog: {
      preset: [
        { value: '', label: 'Padrão do jogo', desc: 'Sem modificadores — experiência vanilla, como antes do patch Hildir\'s Request.' },
        { value: 'easy', label: 'Fácil', desc: 'Combate mais leve (dano fácil) e raids menos frequentes.' },
        { value: 'normal', label: 'Normal', desc: 'Equivalente ao padrão do jogo — todos os sliders em Normal.' },
        { value: 'hard', label: 'Difícil', desc: 'Combate difícil e raids mais frequentes.' },
        { value: 'hardcore', label: 'Hardcore', desc: 'Combate muito difícil, penalidade máxima de morte, raids frequentes, portais difíceis e sem mapa.' },
        { value: 'casual', label: 'Casual', desc: 'Combate muito fácil, morte leve, mais recursos, sem raids, portais casuais, eventos por jogador e mobs passivos.' },
        { value: 'hammer', label: 'Modo Martelo', desc: 'Construção sem custo de materiais, raids desativadas e mobs passivos.' },
        { value: 'immersive', label: 'Imersivo', desc: 'Portais proibidos, fogo se espalha pelo mundo e sem mapa/minimapa.' },
      ],
      combat: [
        { value: '', label: 'Usar preset', desc: 'Herdar dificuldade de combate do preset selecionado.' },
        { value: 'veryeasy', label: 'Muito fácil', desc: '125% dano do jogador, 50% dano inimigo, inimigos 90% velocidade/tamanho.' },
        { value: 'easy', label: 'Fácil', desc: '110% dano do jogador, 75% dano inimigo, inimigos 95% velocidade/tamanho.' },
        { value: 'normal', label: 'Normal', desc: '100% em todos os parâmetros de combate. Maior chance de inimigos de alto nível em Difícil/Muito difícil.' },
        { value: 'hard', label: 'Difícil', desc: '85% dano do jogador, 150% dano inimigo, inimigos 110% velocidade/tamanho, 120% taxa de level up.' },
        { value: 'veryhard', label: 'Muito difícil', desc: '70% dano do jogador, 200% dano inimigo, inimigos 120% velocidade/tamanho, 140% taxa de level up.' },
      ],
      deathpenalty: [
        { value: '', label: 'Usar preset', desc: 'Herdar penalidade de morte do preset selecionado.' },
        { value: 'casual', label: 'Casual', desc: 'Equipamento mantido ao morrer. Inventário dropado. Perda de skills: 1%.' },
        { value: 'veryeasy', label: 'Muito fácil', desc: 'Dropa tudo ao morrer. Perda de skills: 1% (menor que Normal).' },
        { value: 'easy', label: 'Fácil', desc: 'Dropa tudo ao morrer. Perda de skills: 2,5%.' },
        { value: 'normal', label: 'Normal', desc: 'Dropa tudo ao morrer. Perda de skills: 5%.' },
        { value: 'hard', label: 'Difícil', desc: 'Equipamento dropado, inventário destruído permanentemente. Perda de skills: 7,5%.' },
        { value: 'hardcore', label: 'Hardcore', desc: 'Todos os itens e skills perdidos permanentemente ao morrer.' },
      ],
      resources: [
        { value: '', label: 'Usar preset', desc: 'Herdar taxa de recursos do preset selecionado.' },
        { value: 'muchless', label: 'Muito menos', desc: '50% da taxa normal de drop de mobs e objetos (≈0,5×).' },
        { value: 'less', label: 'Menos', desc: '75% da taxa normal (≈0,75×).' },
        { value: 'normal', label: 'Normal', desc: 'Taxa padrão de recursos do jogo.' },
        { value: 'more', label: 'Mais', desc: '150% da taxa normal (≈1,5×).' },
        { value: 'muchmore', label: 'Muito mais', desc: '200% da taxa normal (≈2×).' },
        { value: 'most', label: 'Máximo', desc: '300% da taxa normal (≈3×).' },
      ],
      raids: [
        { value: '', label: 'Usar preset', desc: 'Herdar frequência de raids do preset selecionado.' },
        { value: 'none', label: 'Nenhuma', desc: 'EventRate 0 — raids diurnas desativadas. Raids noturnas ainda podem ocorrer.' },
        { value: 'muchless', label: 'Muito menos', desc: 'Intervalo ~92 min, 10% chance — bem menos raids.' },
        { value: 'less', label: 'Menos', desc: 'Intervalo ~69 min, ~13% chance.' },
        { value: 'normal', label: 'Normal', desc: 'Intervalo ~46 min, 20% chance.' },
        { value: 'more', label: 'Mais', desc: 'Intervalo ~28 min, ~33% chance.' },
        { value: 'muchmore', label: 'Muito mais', desc: 'Intervalo ~14 min, ~67% chance.' },
      ],
      portals: [
        { value: '', label: 'Usar preset', desc: 'Herdar regras de portais do preset selecionado.' },
        { value: 'casual', label: 'Casual', desc: 'TeleportAll — quase tudo pode ser levado por portal (exceto animais domados).' },
        { value: 'normal', label: 'Normal', desc: 'Itens não-portáveis seguem as regras padrão do jogo.' },
        { value: 'hard', label: 'Sem portais de boss', desc: 'Portais indisponíveis enquanto um boss estiver ativo na área.' },
        { value: 'veryhard', label: 'Sem portais', desc: 'Nenhum portal permitido no mundo.' },
      ],
    },
    worldConfigFields: [
      { key: 'combat', label: 'Combate', icon: '⚔️' },
      { key: 'deathpenalty', label: 'Penalidade de morte', icon: '💀' },
      { key: 'resources', label: 'Recursos', icon: '🪵' },
      { key: 'raids', label: 'Raids', icon: '🔥' },
      { key: 'portals', label: 'Portais', icon: '🌀' },
    ],
    worldConfigFlags: [
      { key: 'nobuildcost', label: 'Sem custo de construção', desc: 'Peças de construção não consomem materiais. Receitas ainda precisam ser descobertas.' },
      { key: 'playerevents', label: 'Raids por jogador', desc: 'Raids baseadas no progresso individual de cada jogador, não nos bosses mortos no servidor.' },
      { key: 'fire', label: 'Perigo de fogo', desc: 'Madeira pode pegar fogo e o fogo se espalha pelo mundo inteiro, não só em Ashlands.' },
      { key: 'passivemobs', label: 'Inimigos passivos', desc: 'Inimigos não atacam até serem provocados.' },
      { key: 'nomap', label: 'Sem mapa', desc: 'Mapa e minimapa desabilitados — navegação apenas por marcos visuais.' },
    ],
    showServerPass: false,
    selectedWorld: '',
    players: { count: 0, players: [], online: false },
    playersExpanded: false,
    auditEntry: null,
    auditModalOpen: false,
    bepinexConfigs: [],
    fileScope: 'config',
    fileTree: [],
    editPath: '',
    editContent: '',
    fileEditorDirty: false,
    fileEditorDraftPending: false,
    listEditorDirty: { admin: false, banned: false, permitted: false },
    logs: '',
    logSource: 'docker',
    logAutoRefresh: true,
    dashLogs: '',
    audit: [],
    auditAutoRefresh: false,

    nav: [
      { id: 'dashboard', label: 'Dashboard', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>' },
      { id: 'server', label: 'Servidor', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>' },
      { id: 'mods', label: 'Mods', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>' },
      { id: 'worlds', label: 'Mundos', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' },
      { id: 'backups', label: 'Backups', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>' },
      { id: 'bepinex', label: 'Configs BepInEx', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' },
      { id: 'files', label: 'Arquivos', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>' },
      { id: 'logs', label: 'Logs', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>' },
      { id: 'audit', label: 'Auditoria', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>' },
    ],

    envFields: [
      { key: 'SERVER_NAME', label: 'Nome do Servidor' },
      { key: 'SERVER_PUBLIC', label: 'Público (true/false)' },
      { key: 'SERVER_ARGS', label: 'Argumentos Extra (-crossplay, etc)' },
    ],

    backupIntervalPresets: [
      { id: 'hourly', label: 'A cada hora', cron: '0 * * * *' },
      { id: '6h', label: 'A cada 6 horas', cron: '0 */6 * * *' },
      { id: '12h', label: 'A cada 12 horas', cron: '0 */12 * * *' },
      { id: 'daily', label: 'Diário (00:00)', cron: '0 0 * * *' },
      { id: 'custom', label: 'Personalizado', cron: '' },
    ],

    serverLists: [
      { key: 'admin', label: 'Admin List (Steam IDs)' },
      { key: 'banned', label: 'Banned List (Steam IDs)' },
      { key: 'permitted', label: 'Permitted List (Steam IDs)' },
    ],

    async init() {
      this.actionPending = null;
      await this.refreshStatus();
      await this.loadPlayers();
      await this.loadDashLogs();
      await this.loadMemoryConfig();
      this.$nextTick(() => this.startMetricsPolling());
      setInterval(() => { if (this.page === 'dashboard') { this.refreshStatus(); this.loadPlayers(); } }, 10000);
      setInterval(() => { if (this.page === 'dashboard') this.loadDashLogs(); }, 5000);
      setInterval(() => { if (this.page === 'logs' && this.logAutoRefresh) this.loadLogs(); }, 5000);
      setInterval(() => { if (this.page === 'audit' && this.auditAutoRefresh) this.loadAudit(); }, 5000);
    },

    async onPageChange() {
      if (this.page === 'dashboard') {
        this.startMetricsPolling();
        this.$nextTick(() => {
          this.ensureNetChart();
          if (this.netChartInstance) this.netChartInstance.resize();
        });
      } else {
        this.stopMetricsPolling();
      }
      if (this.page === 'server') {
        await this.loadWorlds();
        await this.loadEnv();
        this.selectedWorld = this.envValues.WORLD_NAME || this.worlds.find(w => w.active)?.name || '';
        this.$nextTick(() => this.mountListEditors());
      }
      if (this.page === 'mods') await this.loadMods();
      if (this.page === 'worlds') {
        await this.loadWorlds();
        if (!this.worldConfigName && this.worlds.length) {
          this.worldConfigName = this.worlds.find(w => w.active)?.name || this.worlds[0].name;
        }
        await this.loadWorldConfig();
      }
      if (this.page === 'backups') await this.loadBackups();
      if (this.page === 'bepinex') await this.loadBepinexConfigs();
      if (this.page === 'files') {
        await this.loadFileTree();
        this.$nextTick(() => {
          if (this.editPath && this.editContent) {
            this.mountFileEditor(this.editContent);
          }
        });
      }
      if (this.page === 'logs') await this.loadLogs();
      if (this.page === 'audit') await this.loadAudit();
      if (this.page !== 'files' && this.page !== 'server') {
        window.PanelEditor?.destroy('file');
        window.PanelEditor?.destroy('list-admin');
        window.PanelEditor?.destroy('list-banned');
        window.PanelEditor?.destroy('list-permitted');
      }
    },

    toast(msg, type = 'success') {
      this.toasts.push({ msg, type });
      setTimeout(() => this.toasts.shift(), 4000);
    },

    statusLabel(s) {
      const map = { running: 'Online', stopped: 'Pausado', offline: 'Offline', starting: 'Iniciando' };
      return map[s] || s;
    },

    escapeHtml(text) {
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    logMessageClass(msg) {
      if (/Success!|^OK$|World loaded|Listening|connected|Game server connected/i.test(msg)) return 'log-success';
      if (/ERROR|Failed|Fatal|Exception/i.test(msg)) return 'log-error';
      if (/Update state|verifying install|progress:/i.test(msg)) return 'log-warn';
      if (/^\.d\.\./.test(msg)) return 'log-muted';
      return 'log-default';
    },

    formatLogLine(line) {
      const match = line.match(/^(\[[^\]]+\])\s+(\[[^\]]+\])\s+(.*)$/);
      if (match) {
        const msgCls = this.logMessageClass(match[3]);
        return `<span class="log-ts">${this.escapeHtml(match[1])}</span> `
          + `<span class="log-proc">${this.escapeHtml(match[2])}</span> `
          + `<span class="log-msg ${msgCls}">${this.escapeHtml(match[3])}</span>`;
      }
      const msgCls = this.logMessageClass(line);
      return `<span class="log-msg ${msgCls}">${this.escapeHtml(line)}</span>`;
    },

    formatLogHtml(text, emptyLabel = 'Aguardando saída do servidor...') {
      if (!text) {
        return `<span class="log-line log-empty">${this.escapeHtml(emptyLabel)}</span>`;
      }
      return text.split('\n')
        .filter((line) => line.length > 0)
        .map((line) => `<span class="log-line">${this.formatLogLine(line)}</span>`)
        .join('\n');
    },

    formatSize(bytes) {
      if (!bytes) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB'];
      let i = 0;
      while (bytes >= 1024 && i < 3) { bytes /= 1024; i++; }
      return bytes.toFixed(i ? 1 : 0) + ' ' + units[i];
    },

    formatBytes(bytes) {
      if (bytes == null || bytes === 0) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let v = bytes;
      let i = 0;
      while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
      return (i ? v.toFixed(1) : Math.round(v)) + ' ' + units[i];
    },

    formatRate(bps) {
      if (!bps || bps <= 0) return '0 B/s';
      if (bps >= 1024 * 1024) return (bps / (1024 * 1024)).toFixed(1) + ' MB/s';
      if (bps >= 1024) return (bps / 1024).toFixed(1) + ' KB/s';
      return bps + ' B/s';
    },

    pctBarClass(pct) {
      const p = pct ?? 0;
      if (p >= 85) return 'danger';
      if (p >= 60) return 'warn';
      return 'ok';
    },

    cpuPercent() {
      return this.metrics.cpu?.percent ?? 0;
    },

    memoryLimitLabel() {
      if (this.memoryConfig.unlimited && !this.metrics.memory?.limit_gb) {
        return this.formatBytes(this.metrics.memory?.limit_bytes) + ' (host)';
      }
      const gb = this.metrics.memory?.limit_gb ?? this.memoryConfig.gb;
      if (gb) return gb + ' GB';
      return this.formatBytes(this.metrics.memory?.limit_bytes);
    },

    startMetricsPolling() {
      if (this.metricsInterval) return;
      this.loadMetrics();
      this.metricsInterval = setInterval(() => {
        if (this.page === 'dashboard') this.loadMetrics();
      }, 2000);
    },

    stopMetricsPolling() {
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
        this.metricsInterval = null;
      }
    },

    ensureNetChart() {
      if (typeof Chart === 'undefined') return false;
      const canvas = this.$refs.netChartCanvas;
      if (!canvas) return false;
      if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return false;
      if (this.netChartInstance) return true;

      const ctx = canvas.getContext('2d');
      this.netChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Download',
              data: [],
              borderColor: '#4ade80',
              backgroundColor: 'rgba(74, 222, 128, 0.12)',
              fill: true,
              tension: 0.35,
              pointRadius: 0,
              borderWidth: 2,
            },
            {
              label: 'Upload',
              data: [],
              borderColor: '#fbbf24',
              backgroundColor: 'rgba(251, 191, 36, 0.12)',
              fill: true,
              tension: 0.35,
              pointRadius: 0,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: { intersect: false, mode: 'index' },
          scales: {
            x: {
              display: true,
              ticks: { maxTicksLimit: 8, color: '#6b7280', font: { size: 10 }, maxRotation: 0 },
              grid: { color: 'rgba(42, 61, 53, 0.45)' },
            },
            y: {
              beginAtZero: true,
              suggestedMin: 0,
              suggestedMax: 1024,
              ticks: {
                color: '#6b7280',
                font: { size: 10 },
                callback: (v) => formatRateTick(v),
              },
              grid: { color: 'rgba(42, 61, 53, 0.45)' },
            },
          },
          plugins: {
            legend: { labels: { color: '#9ca3af', boxWidth: 12, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${formatRateTick(ctx.parsed.y)}`,
              },
            },
          },
        },
      });
      return true;
    },

    pushNetChartPoint(rx, tx) {
      if (!this.netChartInstance) return;

      const labels = this.netChartInstance.data.labels;
      const rxData = this.netChartInstance.data.datasets[0].data;
      const txData = this.netChartInstance.data.datasets[1].data;
      const t = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });

      labels.push(t);
      rxData.push(Number(rx) || 0);
      txData.push(Number(tx) || 0);

      const maxPoints = 60;
      while (labels.length > maxPoints) {
        labels.shift();
        rxData.shift();
        txData.shift();
      }

      const peak = Math.max(...rxData, ...txData, 512);
      this.netChartInstance.options.scales.y.suggestedMax = Math.ceil(peak * 1.25);

      this.netChartInstance.update('none');
    },

    async loadMetrics() {
      try {
        this.metrics = await this.api('GET', '/api/metrics');
        if (this.page !== 'dashboard') return;

        await this.$nextTick();
        if (this.ensureNetChart()) {
          this.pushNetChartPoint(this.metrics.network?.rx_bps, this.metrics.network?.tx_bps);
          this.netChartInstance.resize();
        }
      } catch (e) { /* silencioso no dashboard */ }
    },

    async loadMemoryConfig() {
      try {
        const data = await this.api('GET', '/api/resources/memory');
        this.memoryConfig = data;
        this.memoryUnlimited = data.unlimited;
        if (data.gb) this.memoryGb = data.gb;
        else if (data.memory_used_bytes) {
          this.memoryGb = Math.max(2, Math.ceil(data.memory_used_bytes / (1024 ** 3)) + 1);
        }
      } catch (e) { /* silencioso */ }
    },

    async applyMemoryLimit() {
      const gb = this.memoryUnlimited ? null : this.memoryGb;
      const msg = gb
        ? `Definir limite de RAM para ${gb} GB? O container será recriado e jogadores desconectados.`
        : 'Remover limite de RAM? O container será recriado e jogadores desconectados.';
      if (!confirm(msg)) return;

      return this.withBusy('applyMemory', async () => {
        try {
          const data = await this.api('PUT', '/api/resources/memory', { gb, apply: true });
          if (data.warning) this.toast(data.warning, 'error');
          this.toast(data.message || 'Limite aplicado');
          await this.loadMemoryConfig();
          await this.refreshStatus();
          setTimeout(() => this.loadMetrics(), 3000);
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    isLogAtBottom(el, threshold = 40) {
      if (!el) return true;
      return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    },

    restoreLogScroll(ref, wasAtBottom, prevScrollTop) {
      this.$nextTick(() => {
        const el = this.$refs[ref];
        if (!el) return;
        el.scrollTop = wasAtBottom ? el.scrollHeight : prevScrollTop;
      });
    },

    async api(method, url, body) {
      const opts = { method, headers: {} };
      if (body && !(body instanceof FormData)) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      } else if (body) {
        opts.body = body;
      }
      const res = await fetch(url, opts);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || data.message || `Erro ${res.status}`);
      return data;
    },

    async refreshStatus() {
      this.loading = true;
      try {
        this.status = await this.api('GET', '/api/status');
      } catch (e) { this.toast(e.message, 'error'); }
      this.loading = false;
    },

    async loadPlayers() {
      try {
        this.players = await this.api('GET', '/api/players');
        this.playersExpanded = (this.players.players || []).length > 0;
      } catch (e) { /* silencioso no dashboard */ }
    },

    async serverAction(action) {
      return this.withBusy(`server:${action}`, async () => {
        try {
          await this.api('POST', `/api/server/${action}`);
          this.toast(`Ação "${action}" executada`);
          setTimeout(() => this.refreshStatus(), 2000);
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async loadEnv() {
      try {
        const data = await this.api('GET', '/api/config/env');
        this.envValues = data.values || {};
        const lists = await this.api('GET', '/api/config/serverlists');
        for (const k of ['admin', 'banned', 'permitted']) {
          this.listValues[k] = (lists[k] || []).join('\n');
        }
        this.$nextTick(() => this.mountListEditors());
      } catch (e) { this.toast(e.message, 'error'); }
    },

    async waitForPanelEditor(timeoutMs = 8000) {
      if (typeof window.PanelEditor !== 'undefined') return true;
      return new Promise((resolve) => {
        const start = Date.now();
        const onReady = () => { cleanup(); resolve(true); };
        const tick = () => {
          if (typeof window.PanelEditor !== 'undefined') { cleanup(); resolve(true); return; }
          if (Date.now() - start >= timeoutMs) { cleanup(); resolve(false); return; }
          setTimeout(tick, 50);
        };
        const cleanup = () => window.removeEventListener('panel-editor-ready', onReady);
        window.addEventListener('panel-editor-ready', onReady);
        tick();
      });
    },

    mountListEditors() {
      if (typeof window.PanelEditor === 'undefined') return;
      for (const key of ['admin', 'banned', 'permitted']) {
        const el = document.getElementById(`list-editor-${key}`);
        if (!el) continue;
        const path = `serverlist:${key}`;
        const content = this.listValues[key] || '';
        window.PanelEditor.mount(`list-${key}`, el, {
          path,
          content,
          minHeight: '120px',
          onSave: async (text) => {
            this.listValues[key] = text;
            await this.saveServerLists();
          },
          onDirtyChange: (dirty) => { this.listEditorDirty[key] = dirty; },
        });
      }
    },

    listEditorUndo(key) {
      window.PanelEditor?.get(`list-${key}`)?.undo();
    },

    listEditorRedo(key) {
      window.PanelEditor?.get(`list-${key}`)?.redo();
    },

    async mountFileEditor(content) {
      const el = document.getElementById('file-editor-host');
      if (!el) return;
      const ready = await this.waitForPanelEditor();
      if (!ready) return;
      window.PanelEditor.destroy('file');
      el.innerHTML = '';
      this.fileEditorDraftPending = false;
      const draft = window.PanelEditor.loadDraft(this.editPath);
      if (draft && draft.content !== content) {
        this.fileEditorDraftPending = true;
      }
      window.PanelEditor.mount('file', el, {
        path: this.editPath,
        content,
        minHeight: '400px',
        onSave: async (text) => {
          this.editContent = text;
          await this.saveFile();
        },
        onDirtyChange: (dirty) => { this.fileEditorDirty = dirty; },
      });
    },

    fileEditorUndo() {
      window.PanelEditor?.get('file')?.undo();
    },

    fileEditorRedo() {
      window.PanelEditor?.get('file')?.redo();
    },

    restoreFileDraft() {
      window.PanelEditor?.get('file')?.restoreDraftFromStorage();
      this.fileEditorDraftPending = false;
    },

    discardFileDraft() {
      window.PanelEditor?.get('file')?.discardDraft();
      this.fileEditorDraftPending = false;
    },

    async saveEnv(restart = false) {
      return this.withBusy(restart ? 'saveEnvRestart' : 'saveEnv', async () => {
        try {
          await this.api('PUT', '/api/config/env', { values: this.envValues });
          this.toast('Configurações salvas!');
          if (restart) await this.serverAction('restart');
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async saveServerLists() {
      return this.withBusy('saveServerLists', async () => {
        try {
          for (const k of ['admin', 'banned', 'permitted']) {
            const editor = window.PanelEditor?.get(`list-${k}`);
            const text = editor ? editor.getContent() : (this.listValues[k] || '');
            this.listValues[k] = text;
            const ids = text.split('\n').map(s => s.trim()).filter(Boolean);
            await this.api('PUT', `/api/config/serverlists/${k}`, { ids });
            editor?.setContent(text, { markSaved: true });
          }
          this.toast('Listas salvas! Servidor reiniciado se estava online.');
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async loadMods() {
      try {
        const data = await this.api('GET', '/api/mods');
        this.mods = data.mods || [];
      } catch (e) { this.toast(e.message, 'error'); }
    },

    async uploadMod(event) {
      const file = event.target.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('file', file);
      await this.withBusy('uploadMod', async () => {
        try {
          const data = await this.api('POST', '/api/mods/upload', fd);
          this.toast(`Instalado: ${data.installed.join(', ')}`);
          await this.loadMods();
        } catch (e) { this.toast(e.message, 'error'); }
      });
      event.target.value = '';
    },

    async installModUrl() {
      if (!this.modUrl) return;
      return this.withBusy('installModUrl', async () => {
        try {
          const data = await this.api('POST', '/api/mods/install-url', { url: this.modUrl });
          this.toast(`Instalado: ${data.installed.join(', ')}`);
          this.modUrl = '';
          await this.loadMods();
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async deleteMod(name) {
      if (!confirm(`Remover mod ${name}?`)) return;
      return this.withBusy(`deleteMod:${name}`, async () => {
        try {
          await this.api('DELETE', `/api/mods/${encodeURIComponent(name)}`);
          this.toast(`${name} removido`);
          await this.loadMods();
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async toggleMod(name, enabled) {
      return this.withBusy(`toggleMod:${name}`, async () => {
        try {
          const data = await this.api('POST', `/api/mods/${encodeURIComponent(name)}/toggle`, { enabled });
          this.toast(data.message || (enabled ? 'Mod ativado' : 'Mod desativado'));
          await this.loadMods();
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async loadWorlds() {
      try {
        const data = await this.api('GET', '/api/worlds');
        this.worlds = data.worlds || [];
      } catch (e) { this.toast(e.message, 'error'); }
    },

    cronFromPreset() {
      if (this.backupIntervalPreset === 'custom') return this.backupCronCustom;
      const preset = this.backupIntervalPresets.find(p => p.id === this.backupIntervalPreset);
      return preset?.cron || '0 * * * *';
    },

    syncBackupPresetFromCron(cron) {
      const match = this.backupIntervalPresets.find(p => p.cron && p.cron === cron);
      if (match) {
        this.backupIntervalPreset = match.id;
      } else {
        this.backupIntervalPreset = 'custom';
        this.backupCronCustom = cron;
      }
    },

    async loadBackups() {
      try {
        const data = await this.api('GET', '/api/backups');
        this.backups = data.backups || [];
        this.backupConfig = data.config || {};
        this.syncBackupPresetFromCron(this.backupConfig.BACKUPS_CRON || '0 * * * *');
      } catch (e) { this.toast(e.message, 'error'); }
    },

    backupConfigPayload() {
      return {
        BACKUPS: this.backupConfig.BACKUPS ?? 'true',
        BACKUPS_CRON: this.cronFromPreset(),
        BACKUPS_MAX_AGE: '30',
        BACKUPS_MAX_COUNT: this.backupConfig.BACKUPS_MAX_COUNT ?? '0',
        BACKUPS_IF_IDLE: this.backupConfig.BACKUPS_IF_IDLE ?? 'true',
      };
    },

    async saveBackupConfig(restart = false) {
      return this.withBusy(restart ? 'saveBackupConfigRestart' : 'saveBackupConfig', async () => {
        try {
          await this.api('PUT', '/api/backups/config', {
            values: this.backupConfigPayload(),
            restart,
          });
          this.toast(restart ? 'Config salva e container reiniciado!' : 'Config de backup salva!');
          await this.loadBackups();
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    openBackupModal() {
      this.backupModalOpen = true;
    },

    closeBackupModal() {
      this.backupModalOpen = false;
    },

    async createBackup(type) {
      return this.withBusy(`createBackup:${type}`, async () => {
        try {
          const data = await this.api('POST', '/api/backups/create', { type });
          this.toast(`Backup criado: ${data.name}`);
          this.backupModalOpen = false;
          if (this.page === 'backups') await this.loadBackups();
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async triggerBackup() {
      return this.withBusy('triggerBackup', async () => {
        try {
          await this.api('POST', '/api/backups/trigger');
          this.toast('Backup automático solicitado!');
          setTimeout(() => this.loadBackups(), 3000);
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async deleteBackup(name) {
      if (!confirm(`Apagar backup "${name}"?`)) return;
      return this.withBusy(`deleteBackup:${name}`, async () => {
        try {
          await this.api('DELETE', `/api/backups/${encodeURIComponent(name)}`);
          this.toast(`Backup "${name}" apagado`);
          await this.loadBackups();
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    backupDownloadUrl(name) {
      return `/api/backups/${encodeURIComponent(name)}/download`;
    },

    async switchWorld(name) {
      const world = this.worlds.find(w => w.name === name);
      const isNew = world && world.pending && !world.has_db;
      const msg = isNew
        ? `Ativar mundo "${name}"? O servidor será reiniciado e um mundo NOVO (vazio) será criado.`
        : `Ativar mundo "${name}"? O servidor será reiniciado.`;
      if (!confirm(msg)) return;
      return this.withBusy(`switchWorld:${name}`, async () => {
        try {
          await this.api('POST', '/api/worlds/switch', { world_name: name });
          this.toast(`Mundo "${name}" ativado`);
          await this.loadWorlds();
          await this.refreshStatus();
          if (this.page === 'server') {
            this.selectedWorld = name;
            this.envValues.WORLD_NAME = name;
          }
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async onWorldSelectChange() {
      const name = this.selectedWorld;
      if (!name || name === this.envValues.WORLD_NAME) return;
      await this.switchWorld(name);
      if (this.envValues.WORLD_NAME !== name) this.selectedWorld = this.envValues.WORLD_NAME || name;
    },

    async createWorld(activate = false) {
      if (!this.newWorldName) return;
      const act = activate || this.createWorldActivate;
      return this.withBusy(act ? 'createWorldActivate' : 'createWorld', async () => {
        try {
          await this.api('POST', `/api/worlds/create?name=${encodeURIComponent(this.newWorldName)}&activate=${act}`);
          this.toast(act
            ? `Mundo "${this.newWorldName}" criado e ativado`
            : `Mundo "${this.newWorldName}" registrado`);
          this.newWorldName = '';
          this.createWorldActivate = false;
          await this.loadWorlds();
          if (act) await this.refreshStatus();
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async deleteWorld(name) {
      if (!confirm(`Apagar mundo "${name}" permanentemente?`)) return;
      return this.withBusy(`deleteWorld:${name}`, async () => {
        try {
          await this.api('DELETE', `/api/worlds/${encodeURIComponent(name)}`);
          this.toast(`Mundo "${name}" apagado`);
          await this.loadWorlds();
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async loadBepinexConfigs() {
      try {
        const data = await this.api('GET', '/api/bepinex/configs');
        this.bepinexConfigs = data.configs || [];
      } catch (e) { this.toast(e.message, 'error'); }
    },

    async loadFileTree() {
      return this.withBusy(`fileScope:${this.fileScope}`, async () => {
        try {
          const data = await this.api('GET', `/api/files/tree?scope=${this.fileScope}`);
          this.fileTree = data.tree || [];
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    renderTree(items, depth = 0) {
      if (!items || !items.length) return '<p class="text-gray-500 text-xs">Vazio</p>';
      let html = '';
      for (const item of items) {
        const pad = depth * 16;
        if (item.type === 'dir') {
          html += `<div style="padding-left:${pad}px" class="py-0.5"><span class="text-yellow-600 text-xs">📁 ${item.name}/</span></div>`;
          html += this.renderTree(item.children, depth + 1);
        } else if (item.type === 'broken') {
          html += `<div style="padding-left:${pad}px" class="py-0.5"><span class="text-red-500 text-xs">⚠ ${item.name} (${item.error || 'inacessível'})</span></div>`;
        } else {
          html += `<div style="padding-left:${pad}px" class="py-0.5">
            <button data-path="${item.path}" class="file-btn btn btn-sm btn-ghost">📄 ${item.name} <span class="text-gray-600">${this.formatSize(item.size)}</span></button>
          </div>`;
        }
      }
      return html;
    },

    async editFile(path) {
      try {
        const data = await this.api('GET', `/api/files/read?path=${encodeURIComponent(path)}`);
        this.editPath = path;
        this.editContent = data.content;
        if (this.page !== 'files') this.page = 'files';
        await this.$nextTick();
        await this.mountFileEditor(data.content);
      } catch (e) { this.toast(e.message, 'error'); }
    },

    onFileClick(event) {
      const btn = event.target.closest('.file-btn');
      if (btn?.dataset.path) this.editFile(btn.dataset.path);
    },

    async saveFile() {
      return this.withBusy('saveFile', async () => {
        try {
          const editor = window.PanelEditor?.get('file');
          const content = editor ? editor.getContent() : this.editContent;
          await this.api('PUT', `/api/files/write?path=${encodeURIComponent(this.editPath)}`, { content });
          this.editContent = content;
          editor?.setContent(content, { markSaved: true });
          this.fileEditorDirty = false;
          this.fileEditorDraftPending = false;
          this.toast('Arquivo salvo!');
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async loadLogs() {
      return this.withBusy('loadLogs', async () => {
        try {
          const el = this.$refs.logConsole;
          const wasAtBottom = this.isLogAtBottom(el);
          const prevScrollTop = el?.scrollTop ?? 0;
          const data = await this.api('GET', `/api/logs?lines=200&source=${this.logSource}`);
          this.logs = data.logs || '';
          this.restoreLogScroll('logConsole', wasAtBottom, prevScrollTop);
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async loadDashLogs() {
      try {
        const el = this.$refs.dashConsole;
        const wasAtBottom = this.isLogAtBottom(el);
        const prevScrollTop = el?.scrollTop ?? 0;
        const data = await this.api('GET', '/api/logs?lines=40&source=docker');
        this.dashLogs = data.logs || '';
        this.restoreLogScroll('dashConsole', wasAtBottom, prevScrollTop);
      } catch (e) { /* silencioso no dashboard */ }
    },

    async loadAudit() {
      return this.withBusy('loadAudit', async () => {
        try {
          const data = await this.api('GET', '/api/audit?lines=200');
          this.audit = data.entries || [];
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    openAuditModal(entry) {
      this.auditEntry = entry;
      this.auditModalOpen = true;
    },

    closeAuditModal() {
      this.auditModalOpen = false;
      this.auditEntry = null;
    },

    auditRequestJson(entry) {
      if (!entry) return '';
      return JSON.stringify({
        method: entry.method,
        path: entry.path,
        params: entry.params || {},
        body: entry.request_body ?? null,
      }, null, 2);
    },

    auditResponseJson(entry) {
      if (!entry) return '';
      return JSON.stringify({
        status: entry.status,
        duration_ms: entry.duration_ms,
        error: entry.error || null,
        body: entry.response_body ?? null,
      }, null, 2);
    },

    auditFullJson(entry) {
      if (!entry) return '';
      return JSON.stringify(entry, null, 2);
    },

    async copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.toast('Copiado!');
      } catch (e) {
        this.toast('Falha ao copiar', 'error');
      }
    },

    worldBadge(world) {
      if (world.running && !world.has_db) return 'Aguardando criação';
      if (world.running) return 'Em execução';
      if (world.active) return 'Ativo';
      if (world.pending) return 'Pendente';
      return '';
    },

    worldConfigBadge(world) {
      const s = world.config_summary;
      if (!s) return '';
      const preset = this.worldOptionLabel('preset', s.preset || 'normal');
      const portals = this.worldOptionLabel('portals', s.portals || 'normal');
      return `${preset} · Portais: ${portals}`;
    },

    worldOptionLabel(field, value) {
      const v = value ?? '';
      const item = (this.worldModifierCatalog[field] || []).find(o => o.value === v);
      if (item) return item.label;
      if (!v) return field === 'preset' ? 'Padrão do jogo' : 'Preset';
      return v;
    },

    worldOptionDesc(field, value) {
      const v = value ?? '';
      const item = (this.worldModifierCatalog[field] || []).find(o => o.value === v);
      return item?.desc || '';
    },

    worldFieldDesc(field) {
      const val = this.worldConfigForm[field] ?? '';
      return this.worldOptionDesc(field, val);
    },

    worldPresetDesc() {
      return this.worldOptionDesc('preset', this.worldConfigForm.preset ?? '');
    },

    worldEffectiveRows() {
      const eff = this.computeWorldEffective();
      return [
        { key: 'preset', label: 'Preset', value: eff.preset },
        { key: 'combat', label: 'Combate', value: eff.combat },
        { key: 'deathpenalty', label: 'Morte', value: eff.deathpenalty },
        { key: 'resources', label: 'Recursos', value: eff.resources },
        { key: 'raids', label: 'Raids', value: eff.raids },
        { key: 'portals', label: 'Portais', value: eff.portals },
      ];
    },

    computeWorldEffective() {
      const form = this.worldConfigForm || {};
      const preset = (form.preset || '').toLowerCase();
      const eff = {
        combat: 'normal',
        deathpenalty: 'normal',
        resources: 'normal',
        raids: 'normal',
        portals: 'normal',
      };
      if (preset === 'easy') { eff.combat = 'easy'; eff.raids = 'less'; }
      else if (preset === 'hard') { eff.combat = 'hard'; eff.raids = 'more'; }
      else if (preset === 'hardcore') {
        eff.combat = 'veryhard'; eff.deathpenalty = 'hardcore'; eff.raids = 'more'; eff.portals = 'hard';
      } else if (preset === 'casual') {
        eff.combat = 'veryeasy'; eff.deathpenalty = 'casual'; eff.resources = 'more'; eff.raids = 'none'; eff.portals = 'casual';
      } else if (preset === 'hammer') { eff.raids = 'none'; }
      else if (preset === 'immersive') { eff.portals = 'veryhard'; }
      if (form.combat) eff.combat = form.combat;
      if (form.deathpenalty) eff.deathpenalty = form.deathpenalty;
      if (form.resources) eff.resources = form.resources;
      if (form.raids) eff.raids = form.raids;
      if (form.portals) eff.portals = form.portals;
      return {
        preset: preset || 'normal',
        ...eff,
      };
    },

    selectWorldPreset(value) {
      this.worldConfigForm.preset = value;
      this.worldConfigPresetDetected = false;
    },

    openWorldConfig(name) {
      this.worldConfigName = name;
      this.page = 'worlds';
      this.$nextTick(() => {
        this.loadWorldConfig();
        this.$refs.worldConfigPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },

    defaultWorldConfigForm() {
      return {
        preset: '',
        combat: '',
        deathpenalty: '',
        resources: '',
        raids: '',
        portals: '',
        seed: '',
        nobuildcost: null,
        playerevents: null,
        fire: null,
        passivemobs: null,
        nomap: null,
      };
    },

    async loadWorldConfig() {
      if (!this.worldConfigName) return;
      return this.withBusy('loadWorldConfig', async () => {
        try {
          const data = await this.api('GET', `/api/worlds/${encodeURIComponent(this.worldConfigName)}/config`);
          this.worldConfigMeta = data.meta || null;
          this.worldConfigSummary = data.summary || data.effective || null;
          this.worldConfigEffective = data.effective || data.summary || null;
          this.worldConfigInferredPreset = data.inferred_preset || '';
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
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },

    async saveWorldConfig(restart = false) {
      const key = restart ? 'saveWorldConfigRestart' : 'saveWorldConfig';
      return this.withBusy(key, async () => {
        try {
          const payload = { config: this.worldConfigForm, restart };
          const data = await this.api('PUT', `/api/worlds/${encodeURIComponent(this.worldConfigName)}/config`, payload);
          this.toast(restart ? 'Configurações salvas e servidor reiniciado' : 'Configurações do mundo salvas');
          this.worldConfigRequiresRestart = !!data.requires_restart;
          this.worldConfigEffective = data.effective || data.summary || null;
          this.worldConfigInferredPreset = data.inferred_preset || '';
          this.worldConfigModifierStrings = data.modifier_strings || [];
          this.worldConfigFlagsActive = data.flags || {};
          await this.loadWorlds();
          await this.loadWorldConfig();
        } catch (e) { this.toast(e.message, 'error'); }
      });
    },
  };

  panelData.withBusy = async function (key, fn) {
    if (panelData.actionPending) return;
    panelData.actionPending = key;
    try {
      return await fn.call(panelData);
    } finally {
      panelData.actionPending = null;
    }
  };

  panelData.isBusy = function (key) {
    return panelData.actionPending === key;
  };

  return panelData;
}
