// Recursos (avançado): limite de RAM do container + métricas detalhadas.

export const resources = {
  memoryConfig: { gb: null, unlimited: true },
  memoryGb: 4,
  memoryUnlimited: true,

  memoryLimitLabel() {
    if (this.memoryConfig.unlimited && !this.metrics.memory?.limit_gb) {
      return this.formatBytes(this.metrics.memory?.limit_bytes) + " (host)";
    }
    const gb = this.metrics.memory?.limit_gb ?? this.memoryConfig.gb;
    if (gb) return gb + " GB";
    return this.formatBytes(this.metrics.memory?.limit_bytes);
  },

  async loadMemoryConfig() {
    try {
      const data = await this.api("GET", "/api/resources/memory");
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
      : "Remover limite de RAM? O container será recriado e jogadores desconectados.";
    if (!confirm(msg)) return;

    return this.withBusy("applyMemory", async () => {
      try {
        const data = await this.api("PUT", "/api/resources/memory", { gb, apply: true });
        if (data.warning) this.toast(data.warning, "error");
        this.toast(data.message || "Limite aplicado");
        await this.loadMemoryConfig();
        await this.refreshStatus();
        setTimeout(() => this.loadMetrics(), 3000);
      } catch (e) { this.toast(e.message, "error"); }
    });
  },
};
