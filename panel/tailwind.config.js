/** @type {import('tailwindcss').Config} */

// Palettes are driven by CSS variables (RGB triplets) so the whole UI can be
// re-themed (dark/light) by swapping the variables in input.css — see the
// [data-theme] blocks. `<alpha-value>` keeps Tailwind opacity modifiers working
// (e.g. bg-valheim-900/80).
const v = (name) => `rgb(var(--v-${name}) / <alpha-value>)`;
const g = (name) => `rgb(var(--g-${name}) / <alpha-value>)`;

export default {
  content: [
    "./static/index.html",
    "./frontend/**/*.{js,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cinzel", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        valheim: {
          950: v("950"),
          900: v("900"),
          800: v("800"),
          700: v("700"),
          600: v("600"),
          gold: v("gold"),
          "gold-light": v("gold-light"),
          moss: v("moss"),
          ember: v("ember"),
        },
        gray: {
          100: g("100"),
          200: g("200"),
          300: g("300"),
          400: g("400"),
          500: g("500"),
          600: g("600"),
          700: g("700"),
          800: g("800"),
          900: g("900"),
        },
      },
      maxWidth: {
        content: "90rem",
      },
    },
  },
  plugins: [],
};
