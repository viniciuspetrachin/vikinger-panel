// Recursos: helpers compartilhados (métricas na Visão Geral, RAM na aba Servidor).

export const resources = {
  memoryConfig: { gb: null, unlimited: true, slider_max: 29 },
  memoryGb: 29,

  memorySliderLabel() {
    void this.localeVersion;
    if (this.memoryGb >= (this.memoryConfig.slider_max || 29)) return this.t("resources.noLimit");
    return `${this.memoryGb} GB`;
  },

  memoryLimitLabel() {
    void this.localeVersion;
    if (this.memoryConfig.unlimited && !this.metrics.memory?.limit_gb) {
      const host = this.formatBytes(this.metrics.memory?.limit_bytes);
      return host ? `${host} ${this.t("resources.hostSuffix")}` : this.t("resources.noLimit");
    }
    const gb = this.metrics.memory?.limit_gb ?? this.memoryConfig.gb;
    if (gb) return `${gb} GB`;
    return this.formatBytes(this.metrics.memory?.limit_bytes) || this.t("resources.noLimit");
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
