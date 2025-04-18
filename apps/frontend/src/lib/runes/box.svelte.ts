export type ReadableBox<T> = {
  readonly current: T
}

export type WritableBox<T> = {
  current: T
}

export function readableBoxWith<T>(getter: () => T): ReadableBox<T> {
  const derived = $derived.by(getter)

  return {
    get current() {
      return derived
    },
  }
}

export function writableBoxWith<T>(getter: () => T, setter: (v: T) => void): WritableBox<T> {
  const derived = $derived.by(getter)

  return {
    get current() {
      return derived
    },
    set current(v: T) {
      setter(v)
    },
  }
}
