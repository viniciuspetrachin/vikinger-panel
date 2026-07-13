// About / Version.

const CREDIT_KEYS = ["valheimDocker", "backend", "frontend"];
const CHANGELOG_SECTION_ORDER = ["Added", "Changed", "Deprecated", "Removed", "Fixed", "Security"];

export const about = {
  versionInfo: {
    version: "",
    commit: "",
    build_date: "",
    repo_url: "",
    license: "",
    changelog: [],
    default_locale: "en-US",
  },
  panelUpdate: {
    current: "",
    latest: "",
    update_available: false,
    can_update: false,
    deploy_mode: "",
    release_url: "",
    message: "",
    error: "",
  },
  panelUpdating: false,

  getChangelogHighlights() {
    const entries = this.versionInfo.changelog || [];
    return entries.map((entry) => ({
      version: entry.version,
      sections: CHANGELOG_SECTION_ORDER.filter((name) => entry.sections?.[name]?.length).map((name) => ({
        name,
        label: this.t(`about.changelogSections.${name.toLowerCase()}`) || name,
        items: entry.sections[name],
      })),
    })).filter((e) => e.sections.length);
  },

  changelogSectionLabel(section) {
    return this.t(`about.changelogSections.${String(section).toLowerCase()}`) || section;
  },

  getCredits() {
    void this.localeVersion;
    const raw = this.tObj("about.credits") || {};
    return CREDIT_KEYS.filter((k) => raw[k]).map((key) => ({
      label: raw[key].label,
      by: raw[key].by,
    }));
  },

  async loadVersion() {
    try {
      this.versionInfo = await this.api("GET", "/api/version");
    } catch (e) { /* silent */ }
    await this.checkPanelUpdate();
  },

  async checkPanelUpdate() {
    try {
      this.panelUpdate = await this.api("GET", "/api/panel/update/check");
    } catch (e) {
      this.panelUpdate = { ...this.panelUpdate, error: e.message || String(e) };
    }
  },

  async applyPanelUpdate() {
    if (!this.panelUpdate.can_update || this.panelUpdating) return;
    return this.withBusy("panelUpdate", async () => {
      this.panelUpdating = true;
      try {
        const body = this.panelUpdate.latest ? { version: this.panelUpdate.latest } : {};
        await this.api("POST", "/api/panel/update", body);
        this.toast(this.t("about.update.started"));
      } catch (e) {
        this.panelUpdating = false;
        this.toast(e.message, "error");
      }
    });
  },
};
