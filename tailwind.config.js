/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      maxWidth: {
        "6xl": "1080px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        main: ["Be Vietnam Pro", "sans-serif"],
      },
      colors: {
        textPrimary: "#020e27",
        textSecondary: "#364259",
        whiteText: "#edeefd",
        hoverBackground: "#f9f9fb",
        primary: "#31326F",
        secondary: "#c8f9e4",
        lightBg: "#edfdf6",
        blue: "#4754ff",
        borderColor: "#e4e8f1",
      },
      padding: {
        "5%": "5%",
      },
    },
  },
  plugins: [],
};
