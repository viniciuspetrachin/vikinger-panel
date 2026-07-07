// Logs (avançado): docker / BepInEx.

export const logs = {
  logs: "",
  logSource: "docker",
  logAutoRefresh: true,

  async loadLogs() {
    return this.withBusy("loadLogs", async () => {
      try {
        const el = this.$refs.logConsole;
        const wasAtBottom = this.isLogAtBottom(el);
        const prevScrollTop = el?.scrollTop ?? 0;
        const data = await this.api("GET", `/api/logs?lines=200&source=${this.logSource}`);
        this.logs = data.logs || "";
        this.restoreLogScroll("logConsole", wasAtBottom, prevScrollTop);
      } catch (e) { this.toast(e.message, "error"); }
    });
  },
};
