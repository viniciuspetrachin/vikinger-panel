/** @type {import('tailwindcss').Config} */
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
          950: "#0a0e0d",
          900: "#0f1614",
          800: "#16201c",
          700: "#1e2b26",
          600: "#2a3d35",
          gold: "#c9a227",
          "gold-light": "#e8c547",
          moss: "#3d6b4f",
          ember: "#c45c26",
        },
      },
    },
  },
  plugins: [],
};
