export const remove = <T>(list: T[], i: number) => {
  if (i < 0) return list
  list.splice(i, 1)
  return list
}

export type NonEmpty<T> = [T, ...T[]]

export const isNonEmpty = <T>(arr: T[]): arr is NonEmpty<T> => arr.length > 0
