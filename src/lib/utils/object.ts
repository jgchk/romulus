export const mapValuesRecursive = (obj: unknown, fn: (value: unknown) => unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map((value) => mapValuesRecursive(value, fn))
  }
  if (obj && typeof obj === 'object') {
    if (obj instanceof Map) {
      return fn(obj)
    } else {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, mapValuesRecursive(value, fn)]),
      )
    }
  }
  return fn(obj)
}

export const withProps = <T extends object, P extends Record<string, unknown>>(
  something: T,
  props: P,
): T & P => {
  Object.assign(something, props)
  return something as T & P
}

export const omit = <T, P extends keyof T>(something: T, props: P[]): Omit<T, P> => {
  const result = { ...something }
  for (const prop of props) {
    delete result[prop]
  }
  return result
}

export const pick = <T extends object, P extends keyof T>(something: T, props: P[]): Pick<T, P> => {
  const result = {} as Pick<T, P>
  for (const prop of props) {
    if (prop in something) {
      result[prop] = something[prop]
    }
  }
  return result
}

export const isObject = (error: unknown): error is object =>
  typeof error === 'object' && error !== null

export type ObjectKeys<T> = T extends object
  ? (keyof T)[]
  : T extends number
    ? []
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T extends any[] | string
      ? string[]
      : never
export const keys = <T extends object>(o: T): ObjectKeys<T> => Object.keys(o) as ObjectKeys<T>
