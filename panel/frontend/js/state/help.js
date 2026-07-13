// Help: data-driven FAQ + search + reference links.

const FAQ_CATEGORY_IDS = [
  "primeiros-passos",
  "servidor",
  "mundos",
  "mods",
  "backups",
  "files",
  "recursos",
  "docker",
  "problemas",
];

export const help = {
  faqSearch: "",
  faqOpen: {},

  getFaqCategories() {
    void this.localeVersion;
    const raw = this.tObj("help.categories") || {};
    return FAQ_CATEGORY_IDS.filter((id) => raw[id]).map((id) => ({
      id,
      label: raw[id].label,
      items: raw[id].items || [],
    }));
  },

  getReferenceLinks() {
    void this.localeVersion;
    return this.tObj("help.referenceLinks") || [];
  },

  faqToggle(key) {
    this.faqOpen[key] = !this.faqOpen[key];
  },

  faqFilteredCategories() {
    const term = (this.faqSearch || "").trim().toLowerCase();
    const cats = this.getFaqCategories();
    if (!term) return cats;
    return cats
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) => it.q.toLowerCase().includes(term) || it.a.toLowerCase().includes(term),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  },
};
