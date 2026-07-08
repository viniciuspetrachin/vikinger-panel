// Recursos: helpers compartilhados (métricas na Visão Geral, RAM na aba Servidor).

export const resources = {
  memoryConfig: { gb: null, unlimited: true, slider_max: 29 },
  memoryGb: 29,

  memorySliderLabel() {
    if (this.memoryGb >= (this.memoryConfig.slider_max || 29)) return "Sem limite";
    return `${this.memoryGb} GB`;
  },

  memoryLimitLabel() {
    if (this.memoryConfig.unlimited && !this.metrics.memory?.limit_gb) {
      const host = this.formatBytes(this.metrics.memory?.limit_bytes);
      return host ? `${host} (host)` : "Sem limite";
    }
    const gb = this.metrics.memory?.limit_gb ?? this.memoryConfig.gb;
    if (gb) return `${gb} GB`;
    return this.formatBytes(this.metrics.memory?.limit_bytes) || "Sem limite";
  },

  memoryGbForApi() {
    const max = this.memoryConfig.slider_max || 29;
    return this.memoryGb >= max ? null : this.memoryGb;
  },

  syncMemorySliderFromConfig() {
    if (this.memoryConfig.unlimited) {
      this.memoryGb = this.memoryConfig.slider_max || 29;
    } else if (this.memoryConfig.gb) {
      this.memoryGb = this.memoryConfig.gb;
    }
  },

  async loadMemoryConfig() {
    try {
      const data = await this.api("GET", "/api/resources/memory");
      this.memoryConfig = data;
      this.syncMemorySliderFromConfig();
    } catch (e) { /* silencioso */ }
  },
};
