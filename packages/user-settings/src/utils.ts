export const withProps = <T extends object, P extends Record<string, unknown>>(
  something: T,
  props: P,
): T & P => {
  Object.assign(something, props)
  return something as T & P
}

export type MaybePromise<T> = T | Promise<T>
