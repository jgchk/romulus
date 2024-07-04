import type { ComponentProps } from 'svelte'

import Multiselect from '$lib/atoms/Multiselect.svelte'
import type { Option } from '$lib/atoms/Select'
import type { SearchGenre } from '$lib/types/genres'

import type { TreeGenre } from './GenreNavigator/GenreTree/state'

export type GenreMultiselectProps<T extends MultiselectGenre> = Omit<
  ComponentProps<Multiselect<GenreMultiselectOption>>,
  'value' | 'options'
> & {
  value: number[]
  genres: T[]
  exclude?: number[]
}

export type GenreMultiselectOption = Option<{ value: number }>

export type MultiselectGenre = SearchGenre & Pick<TreeGenre, 'type'>
