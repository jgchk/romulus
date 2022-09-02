const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      primary: colors.blue,
      secondary: colors.orange,
      error: colors.red,
      gray: colors.gray,
      black: colors.black,
      white: colors.white,
      transparent: colors.transparent,
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
