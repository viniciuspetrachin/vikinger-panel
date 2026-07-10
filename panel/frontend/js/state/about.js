// About / Version.

export const about = {
  versionInfo: { version: "", commit: "", build_date: "", repo_url: "", license: "" },

  changelogHighlights: [
    { version: "2.2.0", items: [
      "Files tab: fast search by name with type filters (Config, DLLs, Plugins, Worlds, Lists, Backups, Logs).",
      "Server tab: optional backup disk cap with automatic pruning of oldest ZIPs when exceeded.",
      "Clear all backups now — irreversible purge with protection for active restore checkpoints.",
    ] },
    { version: "2.0.0", items: [
      "Complete UI/UX overhaul with section-based navigation.",
      "New Help (searchable FAQ), Support the Project, and About/Version screens.",
      "Polyform Shield license — free use, no commercial resale without authorization.",
      "Metrics on Overview; capacity (RAM and players) on Server tab; Tools with Files, Console, and Audit.",
      "100% dockerized, no permission headaches; local assets (no CDN).",
    ] },
  ],

  credits: [
    { label: "Valheim server in Docker", by: "lloesche/valheim-server-docker" },
    { label: "Backend", by: "FastAPI + Uvicorn" },
    { label: "Frontend", by: "Alpine.js + Tailwind CSS + Chart.js + CodeMirror" },
  ],

  async loadVersion() {
    try {
      this.versionInfo = await this.api("GET", "/api/version");
    } catch (e) { /* silent */ }
  },
};
