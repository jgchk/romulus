export type SelectProps<T> = {
  value?: T
  options?: Option<T>[]
  placeholder?: string
  id?: string
  class?: string
}

export type Option<T> = { value: T; label: string }
