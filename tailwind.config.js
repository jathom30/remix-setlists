/** @type {import('tailwindcss').Config} */

const generateSafeList = () => [
  'sm:gap-6', 'md:gap-4', 'xl:gap-0'
]

module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  safelist: generateSafeList(),
  theme: {
    fontFamily: {
      'sans': ['Poppins', 'sans-serif'],
    },
    extend: {
      borderWidth: {
        1: '1px'
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
  // daisyUI config (optional)
  daisyui: {
    styled: true,
    // themes: ["light", "dark"],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
  },
};
