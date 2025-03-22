import type { MultiselectProps } from '$lib/atoms/Multiselect'
import type { GenreStore } from '$lib/features/genres/queries/infrastructure'

export type GenreMultiselectProps = Omit<MultiselectProps<unknown>, 'value' | 'options'> & {
  value: number[]
  exclude?: number[]
  onChange?: (value: number[]) => void
  genres: GenreStore
}
