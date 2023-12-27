/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    fontFamily: {
      sans: ["Poppins", "sans-serif"],
    },
    extend: {
      borderWidth: {
        1: "1px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
