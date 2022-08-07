export const isNotNull = <T>(t: T | null): t is T => t !== null

export const ifDefined = <T, O>(
  t: T | undefined,
  fn: (t: T) => O
): O | undefined => (t !== undefined ? fn(t) : undefined)
