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

      green: colors.green,
      yellow: colors.yellow,
      red: colors.red,

      gray: colors.gray,
      black: colors.black,
      white: colors.white,
      transparent: colors.transparent,
    },
    extend: {
      fontSize: {
        '2xs': '.625rem',
      },
    },
  },
}
