import type { MultiselectProps } from '$lib/atoms/Multiselect'
import type { GenreType, SearchGenre } from '$lib/types/genres'

export type GenreMultiselectProps = Omit<MultiselectProps<unknown>, 'value' | 'options'> & {
  value: number[]
  genres: MultiselectGenre[]
  exclude?: number[]
  onChange?: (value: number[]) => void
}

export type MultiselectGenre = SearchGenre & { type: GenreType; nsfw: boolean }
