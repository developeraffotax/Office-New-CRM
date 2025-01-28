/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "2xl": "1320px",
        "3xl": "1620px",
        "4xl": "1820px",
      },
      screens: {
        "custom-md": "880px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        customBrown: "#443022",
        // light
        texth1: "#11111199",
        // dark
        hoverBg: "#443022",
      },
      fontFamily: {
        // Add your custom fonts here
        sans: ["Roboto", "sans-serif"],
        serif: ["Georgia", "serif"],
        customFont: ["YourFontName", "sans-serif"],
      },
      keyframes: {
        zoomInOut: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "50%": { transform: "translateX(5px)" },
          "75%": { transform: "translateX(-5px)" },
        },
        wave: {
          "0%, 100%": { transform: "scale(1)", opacity: 1 },
          "50%": { transform: "scale(1.2)", opacity: 0.5 },
        },
      },
      animation: {
        "zoom-animation": "zoomInOut 1.5s ease-in-out infinite",
        "fade-in": "fade-in 1.2s ease-out",
        shake: "shake 0.5s ease-in-out infinite",
        "wave-animation": "wave 2s infinite ease-in-out",
        pulse: "pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
