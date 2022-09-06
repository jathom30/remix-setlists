/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    fontFamily: {
      'sans': ['Poppins', 'sans-serif'],
    },
    extend: {
      colors: {
        background: '#f3f3f3',
        'component-background': '#ffffff',
        'component-background-alt': '#e6e6e6',
        'component-background-darken': '#cbcbcb',
        'component-border': '#cbcbcb',
        text: '#264653',
        'text-subdued': '#647b84',
        'primary': '#f4a261',
        'primary-text': '#FFE7CE',
        'primary-darken': '#e76f51',
        'success': '#90ee90',
        'success-text': '#008000',
        'danger': '#ff4400',
        'secondary': '#457b9d',
      },
      borderWidth: {
        1: '1px'
      },
    },
  },
  plugins: [
    plugin(({addBase, theme}) => {
      addBase({
        'html': {
          // add default font color
          color: theme('colors.text')
        }
      })
    })
  ],
};
