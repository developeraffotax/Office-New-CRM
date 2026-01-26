/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: [
        '"Inter var", sans-serif',
        {
          fontFeatureSettings: '"cv11", "ss01"',
          fontVariationSettings: '"opsz" 32',
        },
      ],
      serif: ['"Playfair Display"', "serif"],
    },
    extend: {
      screens: {
        "2xl": "1320px",
        "3xl": "1620px",
        "4xl": "1820px",
      },

      /* ------------------ Animations ------------------ */
      animation: {
        shake: "shake 0.5s ease-in-out infinite",
        pop: "pop 0.25s ease-out",

        // Panel / container
        "fade-in": "fade-in 1s ease-out forwards",
        "slide-in-left": "slide-in-left 5s ease-out forwards",

        // Badge / micro-interactions
        "badge-pop": "badge-pop 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      },

      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        shake: {
          "0%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-10px)" },
          "50%": { transform: "translateX(10px)" },
          "75%": { transform: "translateX(-10px)" },
          "100%": { transform: "translateX(0)" },
        },

        pop: {
          "0%": { transform: "scale(0.95)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },

        /* Fade in */
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },

        /* Slide in from left */
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: 0,  },
          "100%": { transform: "translateX(0)", opacity: 1,   },
        },

        /* Selected badge animation */
        "badge-pop": {
          "0%": {
            transform: "scale(0.8) translateY(-4px)",
            opacity: 0,
          },
          "100%": {
            transform: "scale(1) translateY(0)",
            opacity: 1,
          },
        },
      },
    },
  },

  plugins: [require("@tailwindcss/typography")],
};
