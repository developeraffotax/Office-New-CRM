/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: [ "sans-serif", "system-ui" ],
      serif: ["Playfair Display", "serif"],
      roboto: ["Roboto", "sans-serif"],
      inter: ["Inter", "sans-serif"],
      google: ["Google Sans", "sans-serif"],
    },
    extend: {
      screens: {
        "2xl": "1320px",
        "3xl": "1620px",
        "4xl": "1820px",
      },
      /* ------------------ Animations ------------------ */
      animation: {
        bob: "bob 1.4s ease-in-out infinite",
        shake: "shake 0.5s ease-in-out infinite",
        pop: "pop 0.25s ease-out",
        "badge-pop": "badge-pop 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "card-in": "cardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "phase-in": "phaseIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      keyframes: {
        bob:{
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
         },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        pop: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "badge-pop": {
          "0%": {
            transform: "scale(0.8) translateY(-4px)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1) translateY(0)",
            opacity: "1",
          },
        },
        cardIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(24px) scale(0.97)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        phaseIn: {
          "0%": {
            opacity: "0",
            transform: "translateX(18px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};