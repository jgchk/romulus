import { isEmpty as rIsEmpty } from 'ramda'

export const isNotNull = <T>(t: T | null): t is T => t !== null

export const ifDefined = <T, O>(
  t: T | undefined,
  fn: (t: T) => O
): O | undefined => (t !== undefined ? fn(t) : undefined)

export const isEmpty = <V>(value: V) =>
  !value || (value instanceof Set ? value.size === 0 : rIsEmpty(value))
