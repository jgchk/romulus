import { createContext, Dispatch, SetStateAction, useContext } from 'react'

import { TreeGenre } from '../../server/db/genre/outputs'

export type Node = {
  path: number[]
  key: string
  genre: TreeGenre
  children: Node[]
  descendants: number[]
}

export type Expanded = Record<string, 'expanded' | 'collapsed' | undefined>

export type FilterMatches = Record<
  number,
  { name: boolean; aka?: string | undefined } | undefined
>

export type Descendants = Map<number, number[]>

type TreeContext = {
  selectedId: number | undefined
  expanded: Expanded
  setExpanded: Dispatch<SetStateAction<Expanded>>
}

export const TreeContext = createContext<TreeContext>({
  selectedId: undefined,
  expanded: {},
  setExpanded: () => {
    throw new Error('Must use TreeContext inside of a TreeProvider')
  },
})

export const useTreeContext = () => useContext(TreeContext)
