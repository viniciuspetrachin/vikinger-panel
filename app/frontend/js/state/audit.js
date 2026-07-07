// Auditoria (avançado): histórico persistente de ações mutantes.

export const audit = {
  audit: [],
  auditAutoRefresh: false,
  auditEntry: null,
  auditModalOpen: false,

  async loadAudit() {
    return this.withBusy("loadAudit", async () => {
      try {
        const data = await this.api("GET", "/api/audit?lines=200");
        this.audit = data.entries || [];
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  openAuditModal(entry) { this.auditEntry = entry; this.auditModalOpen = true; },
  closeAuditModal() { this.auditModalOpen = false; this.auditEntry = null; },

  auditRequestJson(entry) {
    if (!entry) return "";
    return JSON.stringify({ method: entry.method, path: entry.path, params: entry.params || {}, body: entry.request_body ?? null }, null, 2);
  },

  auditResponseJson(entry) {
    if (!entry) return "";
    return JSON.stringify({ status: entry.status, duration_ms: entry.duration_ms, error: entry.error || null, body: entry.response_body ?? null }, null, 2);
  },

  auditFullJson(entry) {
    if (!entry) return "";
    return JSON.stringify(entry, null, 2);
  },
};
