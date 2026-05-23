import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18171f",
        mist: "#f5f7fb",
        coral: "#ef6f61",
        mint: "#54b99f",
        plum: "#5c4776"
      },
      boxShadow: {
        soft: "0 18px 70px rgba(25, 23, 31, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
