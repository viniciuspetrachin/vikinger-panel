// Sobre / Versão.

export const about = {
  versionInfo: { version: "", commit: "", build_date: "", repo_url: "", license: "" },

  changelogHighlights: [
    { version: "2.0.0", items: [
      "Reformulação completa de UI/UX com navegação por seções.",
      "Novas telas de Ajuda (FAQ com busca), Doações e Sobre/Versão.",
      "Licença Polyform Shield — uso livre, sem revenda comercial sem autorização.",
      "Métricas na Visão Geral; capacidade (RAM e jogadores) na aba Servidor; Ferramentas com Arquivos, Logs e Auditoria.",
      "100% dockerizado, sem dores de permissão; assets locais (sem CDN).",
    ] },
  ],

  credits: [
    { label: "Servidor Valheim em Docker", by: "lloesche/valheim-server-docker" },
    { label: "Backend", by: "FastAPI + Uvicorn" },
    { label: "Frontend", by: "Alpine.js + Tailwind CSS + Chart.js + CodeMirror" },
  ],

  async loadVersion() {
    try {
      this.versionInfo = await this.api("GET", "/api/version");
    } catch (e) { /* silencioso */ }
  },
};
