export type SelectProps<T> = {
  value?: T
  options?: Option<T>[]
  placeholder?: string
  id?: string
  class?: string
  onChange?: (option: Option<T>) => void
}

export type Option<T> = { value: T; label: string }
