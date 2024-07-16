import { distance as levenshteinDistance } from 'fastest-levenshtein'
import { stringSimilarity as diceCoefficient } from 'string-similarity-js'

export { diceCoefficient, levenshteinDistance }

export const toAscii = (str: string) => str.normalize('NFD').replaceAll(/\p{Diacritic}/gu, '')

export const capitalize = (s: string): string =>
  s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase()

export const pageTitle = (...title: string[]) => {
  return [...title, 'Romulus'].join(' • ')
}

export const genreTitle = (name: string, subtitle?: string | null) => {
  if (subtitle) {
    return `${name} [${subtitle}]`
  } else {
    return name
  }
}
