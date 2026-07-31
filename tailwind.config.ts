import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef1f7",
          100: "#dbe2ee",
          200: "#b3c1dc",
          300: "#8aa0c9",
          400: "#5c7aae",
          500: "#3a5a8f",
          600: "#284373",
          700: "#1c3157",
          800: "#13213e",
          900: "#0b1428",
          950: "#060c19",
        },
        skyfog: {
          50: "#f2f8fd",
          100: "#e3f0fb",
          200: "#c7e2f7",
          300: "#9dcbf0",
          400: "#6cabe4",
          500: "#478ed3",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Hiragino Sans'",
          "'Hiragino Kaku Gothic ProN'",
          "'Noto Sans JP'",
          "Meiryo",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 8px 30px -8px rgba(11, 20, 40, 0.18)",
        card: "0 2px 12px -2px rgba(11, 20, 40, 0.10)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "drift": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        "scale-in": "scale-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "drift": "drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
