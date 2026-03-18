import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        medical: {
          medication: "#f472b6",
          diagnosis: "#a78bfa",
          procedure: "#60a5fa",
          alert: "#fca5a5",
          recommendation: "#86efac",
        },
        recorder: {
          peach: "#ffdab9",
          peachDark: "#e8c4a0",
        },
      },
    },
  },
  plugins: [],
};
export default config;
