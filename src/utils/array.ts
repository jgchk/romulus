export const remove = <T>(list: T[], i: number) => {
  if (i < 0) return list
  list.splice(i, 1)
  return list
}
