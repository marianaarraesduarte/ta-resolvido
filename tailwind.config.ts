import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#EDE9DE",
          card: "#FBFAF6",
          ink: "#1F3A3D",
          "ink-soft": "#5B6E6C",
          amber: "#D9A441",
          coral: "#C1553D",
          sage: "#6F8F6A",
          plum: "#7A5C7E",
          line: "#D9D3C4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-baloo)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
