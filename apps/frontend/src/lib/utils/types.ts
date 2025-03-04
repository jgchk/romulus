export const isDefined = <T>(value: T | undefined): value is T => value !== undefined
export const ifDefined = <T, O>(value: T | undefined, fn: (value: T) => O): O | undefined => {
  if (isDefined(value)) {
    return fn(value)
  } else {
    return undefined
  }
}

export const isNotNull = <T>(value: T | null): value is T => value !== null

export type Timeout = ReturnType<typeof setTimeout>

export type AreAllPropsOptional<T, TypeIfTrue = true, TypeIfFalse = false> = AreAllPropsTrue<
  {
    [K in keyof Required<T>]: IsPropOptional<T[K], true, false>
  },
  TypeIfTrue,
  TypeIfFalse
>

type IsPropOptional<T, TypeIfTrue = true, TypeIfFalse = false> = undefined extends T
  ? TypeIfTrue
  : TypeIfFalse

type AreAllPropsTrue<T, TypeIfTrue = true, TypeIfFalse = false> =
  AllPropertiesTrue<T> extends { [K in keyof T]: true } ? TypeIfTrue : TypeIfFalse

type AllPropertiesTrue<T> = {
  [K in keyof T]: T[K] extends true ? true : false
}

export type MaybePromise<T> = T | Promise<T>

export function willNeverHappen(value: never): never {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`This should never happen: ${value}`)
}
