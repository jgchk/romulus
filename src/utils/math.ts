import { reduce } from 'remeda'

export const sum = (list: number[]) => reduce(list, (a, b) => a + b, 0)

export const mean = (list: number[]) => sum(list) / list.length

export const median = (list: number[]) => {
  const len = list.length
  if (len === 0) return Number.NaN

  const width = 2 - (len % 2)
  const idx = (len - width) / 2
  return mean(
    [...list]
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
      .slice(idx, idx + width)
  )
}
