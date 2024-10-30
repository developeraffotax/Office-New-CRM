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
        "3xl": "1520px",
      },
    },
  },
  plugins: [],
};
