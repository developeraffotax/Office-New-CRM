/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["sans-serif", "system-ui"],
      serif: ["Playfair Display", "serif"],
      roboto: ["Roboto", "sans-serif"],
      inter: ["Inter", "sans-serif"],
      google: ["Google Sans", "sans-serif"],
    },
    extend: {
      // fontSize: {
      //     xs: ["0.75rem", { lineHeight: "1rem" }],        // 12px / 16px
      //     sm: ["0.875rem", { lineHeight: "1.25rem" }],    // 14px / 20px
      //     base: ["1rem", { lineHeight: "1.5rem" }],       // 16px / 24px
      //     lg: ["1.125rem", { lineHeight: "1.75rem" }],    // 18px / 28px
      //     xl: ["1.25rem", { lineHeight: "1.75rem" }],     // 20px / 28px
      //     "2xl": ["1.5rem", { lineHeight: "2rem" }],      // 24px / 32px
      //     "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px / 36px
      //     "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px / 40px
      //     "5xl": ["3rem", { lineHeight: "1" }],           // 48px
      //     "6xl": ["3.75rem", { lineHeight: "1" }],        // 60px
      //     "7xl": ["4.5rem", { lineHeight: "1" }],         // 72px
      //     "8xl": ["6rem", { lineHeight: "1" }],           // 96px
      //     "9xl": ["8rem", { lineHeight: "1" }],           // 128px
      //   },

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
        "slide-down": "slideDown 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-up": "slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 0.6s ease-out both",
      },
      keyframes: {
        bob: {
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
        slideDown: {
          "0%": {
            opacity: "0",
            transform: "translateY(-200px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        slideUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(200px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },


        fadeIn: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
