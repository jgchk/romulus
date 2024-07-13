export type MultiselectProps<T> = {
  value?: T[]
  options?: T[]
  hasMore?: boolean
  open?: boolean
  filter?: string
  virtual?: boolean
  focusedIndex?: number
  id?: string
  placeholder?: string
  disabled?: boolean
  class?: string
}
