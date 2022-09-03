/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    fontFamily: {
      'poppins': ['Poppins', 'sans-serif'],
    },
    extend: {
      colors: {
        background: '#f3f3f3',
        'component-background': '#ffffff',
        'component-background-alt': '#e6e6e6',
        'component-background-darken': '#cbcbcb',
        text: '#023047',
        'text-subdued': '#808080',
        'primary': '#FB8500',
        'primary-text': '#FFE7CE',
        'primary-darken': '#E47600',
        'success': '#90ee90',
        'success-text': '#008000',
        'danger': '#ff4400',
        'secondary': '#023047',
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
