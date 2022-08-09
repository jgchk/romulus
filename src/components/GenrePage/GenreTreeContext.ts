import { createContext, Dispatch, SetStateAction, useContext } from 'react'

import { GenreMap } from '../../hooks/useGenreMap'

export type Expanded = Record<number, 'expanded' | 'collapsed' | undefined>

export type FilterMatches = Record<
  number,
  { name: boolean; aka?: string | undefined } | undefined
>

export type Descendants = Record<number, number[]>

type TreeContext = {
  selectedId: number | undefined
  filter: string
  genreMap: GenreMap
  expanded: Expanded
  setExpanded: Dispatch<SetStateAction<Expanded>>
  descendants: Descendants
  filterMatches: FilterMatches
}

export const TreeContext = createContext<TreeContext>({
  selectedId: undefined,
  filter: '',
  genreMap: {},
  expanded: {},
  setExpanded: () => {
    throw new Error('Must use TreeContext inside of a TreeProvider')
  },
  descendants: {},
  filterMatches: {},
})

export const useTreeContext = () => useContext(TreeContext)
