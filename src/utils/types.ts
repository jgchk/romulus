export const isNotNull = <T>(t: T | null): t is T => t !== null

export const ifDefined = <T, O>(
  t: T | undefined,
  fn: (t: T) => O
): O | undefined => (t !== undefined ? fn(t) : undefined)

export const isEmpty = <V>(value: V) => {
  if (!value) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  if (value instanceof Set) return value.size === 0
  return false
}
