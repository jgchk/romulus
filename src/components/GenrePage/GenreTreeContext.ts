import { createContext, useContext } from 'react'

import { TreeGenre } from '../../server/db/genre/outputs'

export type Node = {
  path: number[]
  key: string
  genre: TreeGenre
  children: Node[]
  descendants: number[]
}

export type FilterMatches = Record<
  number,
  { name: boolean; aka?: string | undefined } | undefined
>

export type Descendants = Map<number, number[]>

type TreeContext = {
  selectedId: number | undefined
  scrollTo: number | undefined
}

export const TreeContext = createContext<TreeContext>({
  selectedId: undefined,
  scrollTo: undefined,
})

export const useTreeContext = () => useContext(TreeContext)
