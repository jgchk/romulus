import type { SearchGenre } from '$lib/types/genres'

import type { TreeGenre } from './GenreNavigator/GenreTree/state'

export type GenreMultiselectProps = {
  value: number[]
  genres: MultiselectGenre[]
  exclude?: number[]
}

export type MultiselectGenre = SearchGenre & Pick<TreeGenre, 'type'>
