import type { MultiselectProps } from '$lib/atoms/Multiselect'
import type { SearchGenre } from '$lib/types/genres'

import type { TreeGenre } from './GenreNavigator/GenreTree/state'

export type GenreMultiselectProps = Omit<MultiselectProps<unknown>, 'value' | 'options'> & {
  value: number[]
  genres: MultiselectGenre[]
  exclude?: number[]
}

export type MultiselectGenre = SearchGenre & Pick<TreeGenre, 'type'>
