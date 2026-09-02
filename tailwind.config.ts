import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "rgb(var(--color-brand-bg) / <alpha-value>)",
          card: "rgb(var(--color-brand-card) / <alpha-value>)",
          ink: "rgb(var(--color-brand-ink) / <alpha-value>)",
          "ink-soft": "rgb(var(--color-brand-ink-soft) / <alpha-value>)",
          amber: "rgb(var(--color-brand-amber) / <alpha-value>)",
          coral: "rgb(var(--color-brand-coral) / <alpha-value>)",
          sage: "rgb(var(--color-brand-sage) / <alpha-value>)",
          plum: "rgb(var(--color-brand-plum) / <alpha-value>)",
          line: "rgb(var(--color-brand-line) / <alpha-value>)",
          "ink-solid": "rgb(var(--color-brand-ink-solid) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-baloo)", "sans-serif"],
        caveat: ["var(--font-caveat)", "cursive"],
      },
    },
  },
  plugins: [],
};

export default config;
