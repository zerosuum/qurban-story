import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#044B57",
          50: "#6EC9D9", // p000
          100: "#61BAC9", // p100
          200: "#54AAB9", // p200
          300: "#398A98", // p300
          400: "#1F6B78", // p400
          500: "#044B57", // p500 (Base)
          600: "#033C46", // p600
          700: "#022D34", // p700
          800: "#021E23", // p800
          900: "#01171A", // p900
        },
        secondary: {
          DEFAULT: "#FDD185",
          50: "#FFF6E7", // p000
          100: "#FEF1DA", // p100
          200: "#FEEDCE", // p200
          300: "#FEE3B6", // p300
          400: "#FDDA9D", // p400
          500: "#FDD185", // p500 (Base)
          600: "#DCB36B", // p600
          700: "#BB9450", // p700
          800: "#9B7636", // p800
          900: "#8A6729", // p900
        },
        neutral: {
          DEFAULT: "#525252",
          50: "#F3F3F3", // nt100
          100: "#DCDCDC", // nt200
          200: "#B8B8B8", // nt300
          300: "#898989", // nt400
          400: "#525252", // nt500
          500: "#292929", // nt600
          600: "#1B1B1B", // nt700
          700: "#0E0E0E", // nt800
          800: "#000000", // nt900
        },
      },
      fontFamily: {
        sans: ["var(--font-public-sans)", "sans-serif"],
        serif: ["var(--font-forum)", "serif"],
      },
      borderRadius: {
        xl: "12px",
      },
    },
  },
  plugins: [],
};
export default config;