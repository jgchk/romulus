import type { MultiselectProps } from '$lib/atoms/Multiselect'
import type { TreeGenre } from '$lib/features/genres/queries/types'

export type GenreMultiselectProps = Omit<MultiselectProps<unknown>, 'value' | 'options'> & {
  value: number[]
  exclude?: number[]
  onChange?: (value: number[]) => void
  genres: TreeGenre[]
}
