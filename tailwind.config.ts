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
        brand: {
          primary: "rgb(var(--brand-primary) / <alpha-value>)",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(to bottom right, var(--brand-gradient-from), var(--brand-gradient-to))",
      },
      boxShadow: {
        "brand-glow": "0 0 15px var(--brand-glow)",
      }
    },
  },
  plugins: [],
};
export default config;
