import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
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
  plugins: [typography, daisyui]
};
