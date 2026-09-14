import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#faf8f4",
          100: "#f4efe5",
          200: "#e7dcc8",
          300: "#d5c3a3",
          400: "#c2a87f",
          500: "#a98a5f",
          600: "#8a6e4b",
          700: "#6f573d",
          800: "#574435",
          900: "#44362c",
        },
        brand: {
          50: "#faf7f2",
          100: "#f3ecdf",
          200: "#e5d5bd",
          300: "#d4b992",
          400: "#c29c6d",
          500: "#a97f4f",
          600: "#8f683f",
          700: "#745334",
          800: "#5f452f",
          900: "#4f3a29",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "Cairo", "Tajawal", "Segoe UI", "Tahoma", "Arial", "sans-serif"],
        arabesque: ["var(--font-arabesque)", "Rakkas", "Cairo", "serif"],
      },
      boxShadow: {
        card: "0 2px 16px -4px rgba(68,54,44,.12)",
        lift: "0 12px 32px -8px rgba(68,54,44,.22)",
      },
    },
  },
  plugins: [],
};
export default config;
