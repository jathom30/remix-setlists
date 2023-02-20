/** @type {import('tailwindcss').Config} */

const widths = [0,1,2,4,6,8]
const attributes = ['gap', 'p', 'px', 'py', 'pt','pb','pl','pr']
const flexDirection = ['flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse']
const mediaQueries = ['xs', 'sm', 'md', 'lg', 'xl']

function generateSafeList() {
  let combined = [];

  mediaQueries.forEach(query => {
    attributes.forEach(attribute => {
      widths.forEach(width => {
        const classString = `${query}:${attribute}-${width}`
        combined = [...combined, classString]
      })
    })
  })

  return combined;
}
function flexAtQuery() {
  let combined = []
  mediaQueries.forEach(query => {
    flexDirection.forEach(direction => {
      const classString = `${query}:${direction}`
      combined = [...combined, classString]
    })
  })
  return combined
}

module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  safelist: [...generateSafeList(), ...flexAtQuery()],
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
