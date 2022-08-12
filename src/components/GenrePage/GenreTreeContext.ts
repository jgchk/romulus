import { createContext, Dispatch, SetStateAction, useContext } from 'react'

import { IdMap } from '../../hooks/useIdMap'
import { TreeGenre } from '../../server/db/genre/outputs'

export type Expanded = Record<number, 'expanded' | 'collapsed' | undefined>

export type FilterMatches = Record<
  number,
  { name: boolean; aka?: string | undefined } | undefined
>

export type Descendants = Record<number, number[]>

type TreeContext = {
  selectedId: number | undefined
  genreMap: IdMap<TreeGenre>
  expanded: Expanded
  setExpanded: Dispatch<SetStateAction<Expanded>>
  descendants: Descendants
}

export const TreeContext = createContext<TreeContext>({
  selectedId: undefined,
  genreMap: {},
  expanded: {},
  setExpanded: () => {
    throw new Error('Must use TreeContext inside of a TreeProvider')
  },
  descendants: {},
})

export const useTreeContext = () => useContext(TreeContext)
