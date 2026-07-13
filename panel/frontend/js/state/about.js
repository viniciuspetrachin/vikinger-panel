// About / Version.

const CHANGELOG_VERSIONS = ["2.2.0", "2.0.0"];
const CREDIT_KEYS = ["valheimDocker", "backend", "frontend"];

export const about = {
  versionInfo: { version: "", commit: "", build_date: "", repo_url: "", license: "", default_locale: "en-US" },

  getChangelogHighlights() {
    void this.localeVersion;
    const raw = this.tObj("about.changelog") || {};
    return CHANGELOG_VERSIONS.filter((v) => raw[v]).map((version) => ({
      version,
      items: raw[version],
    }));
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
  },
};
