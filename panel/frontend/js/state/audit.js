// Auditoria (avançado): histórico persistente de ações mutantes.

export const audit = {
  audit: [],
  auditAutoRefresh: false,
  auditEntry: null,
  auditModalOpen: false,
  auditPage: 1,
  auditPageSize: 10,
  auditTotal: 0,
  auditTotalPages: 1,

  async loadAudit() {
    return this.withPageLoad("audit", async () => {
      try {
        const data = await this.api(
          "GET",
          `/api/audit?page=${this.auditPage}&page_size=${this.auditPageSize}`,
        );
        this.audit = data.entries || [];
        this.auditTotal = data.total ?? 0;
        this.auditTotalPages = data.total_pages ?? 1;
        this.auditPage = data.page ?? this.auditPage;
        if (this.auditPage > this.auditTotalPages) {
          this.auditPage = this.auditTotalPages;
          return this.loadAudit();
        }
      } catch (e) { this.toast(e.message, "error"); }
    });
  },

  auditPrevPage() {
    if (this.auditPage <= 1) return;
    this.auditPage -= 1;
    this.loadAudit();
  },

  auditNextPage() {
    if (this.auditPage >= this.auditTotalPages) return;
    this.auditPage += 1;
    this.loadAudit();
  },

  auditSetPageSize(size) {
    this.auditPageSize = size;
    this.auditPage = 1;
    this.loadAudit();
  },

  auditShowingFrom() {
    return this.paginationFrom(this.auditPage, this.auditPageSize, this.auditTotal);
  },

  auditShowingTo() {
    return this.paginationTo(this.auditPage, this.auditPageSize, this.auditTotal);
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
