import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaults from 'tailwindcss/defaultTheme'

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontFamily: {
      ...defaults.fontFamily,
      sans: ['InterVariable', 'Noto Emoji', ...defaults.fontFamily.sans],
    },
    colors: {
      primary: colors.amber,
      secondary: colors.sky,
      gray: colors.stone,

      success: colors.green,
      info: colors.blue,
      warning: colors.yellow,
      error: colors.red,

      inherit: colors.inherit,
      current: colors.current,
      transparent: colors.transparent,
      black: colors.black,
      white: colors.white,
    },
    extend: {},
  },
} satisfies Config

export default config
