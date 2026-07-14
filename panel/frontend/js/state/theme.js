// Dark/light theme handling. Persisted in localStorage and applied via the
// data-theme attribute (CSS variables in input.css do the rest).

const THEME_KEY = "vikinger-panel-theme";

export const theme = {
  theme: "dark",

  initTheme() {
    let stored = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {
      /* private browsing */
    }
    this.theme = stored === "light" || stored === "dark" ? stored : "dark";
    this.applyTheme();
  },

  applyTheme() {
    document.documentElement.setAttribute("data-theme", this.theme);
  },

  toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, this.theme);
    } catch {
      /* ignore */
    }
    this.applyTheme();
  },

  themeLabel() {
    void this.localeVersion;
    return this.theme === "dark" ? this.t("theme.light") : this.t("theme.dark");
  },
};
