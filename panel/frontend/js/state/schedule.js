// Schedule config (Config › Schedule): cron-like nightly restart / backup /
// mod-update jobs with last-run status.

export const schedule = {
  scheduleConfig: {
    restart: { enabled: false, cron: "0 5 * * *" },
    backup: { enabled: false, cron: "0 4 * * *" },
    mod_update: { enabled: false, cron: "0 3 * * 0" },
  },
  scheduleStatus: {},

  scheduleJobs() {
    void this.localeVersion;
    return [
      { id: "restart", label: this.t("schedule.jobs.restart") },
      { id: "backup", label: this.t("schedule.jobs.backup") },
      { id: "mod_update", label: this.t("schedule.jobs.modUpdate") },
    ];
  },

  async loadSchedule() {
    try {
      const data = await this.api("GET", "/api/schedule");
      if (data.config) this.scheduleConfig = data.config;
      this.scheduleStatus = data.status || {};
    } catch (e) {
      /* silent */
    }
  },

  async saveSchedule() {
    return this.withBusy("saveSchedule", async () => {
      try {
        const data = await this.api("PUT", "/api/schedule", this.scheduleConfig);
        if (data.config) this.scheduleConfig = data.config;
        this.scheduleStatus = data.status || {};
        this.toast(this.t("schedule.saved"));
      } catch (e) {
        this.toast(e.message, "error");
      }
    });
  },

  jobStatusLabel(jobId) {
    void this.localeVersion;
    const st = this.scheduleStatus?.[jobId];
    if (!st) return "";
    if (st.last_run) {
      const when = new Date(st.last_run * 1000).toLocaleString(this.locale || "en-US");
      return this.t("schedule.lastRun", { when, status: st.last_status || "—" });
    }
    return this.t("schedule.neverRun");
  },
};
