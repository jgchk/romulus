export type AutocompleteProps<T, O extends AutocompleteOption<T> = AutocompleteOption<T>> = {
  value: string
  options: O[]
  id?: string
  placeholder?: string
  class?: string
  disabled?: boolean
}

export type AutocompleteOption<T> = { value: T; label: string }
