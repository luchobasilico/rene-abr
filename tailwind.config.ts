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
          medication: "#86efac",
          diagnosis: "#6ee7b7",
          procedure: "#34d399",
          alert: "#fca5a5",
          recommendation: "#a7f3d0",
        },
        recorder: {
          peach: "#ffdab9",
          peachDark: "#e8c4a0",
        },
        /** Marca RENÉ — verde agua principal #9FD3D5 */
        rene: {
          brand: "#9FD3D5",
          brandDeep: "#5A9FA3",
          brandDeepDark: "#458084",
          aqua: "#f4fbfc",
          aquaDark: "#cfeaed",
          green: "#5A9FA3",
          greenDark: "#458084",
        },
      },
    },
  },
  plugins: [],
};
export default config;
