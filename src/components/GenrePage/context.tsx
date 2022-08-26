import { equals } from 'ramda'
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react'

import { GenreFormFields } from './GenreForm'
import useGenreTreeQuery, { TreeNode } from './useGenreTreeQuery'

type GenrePageContext = {
  view: GenrePageView
  selectedPath: number[] | undefined
}

export type GenrePageView =
  | { type: 'default' }
  | { type: 'view'; id: number }
  | { type: 'edit'; id: number; autoFocus?: keyof GenreFormFields }
  | { type: 'history'; id: number }
  | { type: 'create' }

const GenrePageContext = createContext<GenrePageContext>({
  view: { type: 'default' },
  selectedPath: undefined,
})

export const useGenrePageContext = () => useContext(GenrePageContext)

export const GenrePageProvider: FC<
  PropsWithChildren<{
    id?: number
    path?: number[]
    view?: string
    autoFocus?: keyof GenreFormFields
  }>
> = ({ id, path, children, view: viewType, autoFocus }) => {
  const view: GenrePageView = useMemo(() => {
    if (viewType === 'edit' && id !== undefined) {
      return { type: 'edit', id, autoFocus }
    } else if (viewType === 'history' && id !== undefined) {
      return { type: 'history', id }
    } else if (viewType === 'create') {
      return { type: 'create' }
    } else if (id !== undefined) {
      return { type: 'view', id }
    } else {
      return { type: 'default' }
    }
  }, [autoFocus, id, viewType])

  const treeQuery = useGenreTreeQuery()
  const selectedPath = useMemo(() => {
    if (path) {
      const isValid =
        !treeQuery.data ||
        findTree(treeQuery.data, (node) => equals(node.path, path))

      if (isValid) {
        return path
      }
    }

    if (treeQuery.data && 'id' in view) {
      const matchingNode = findTree(
        treeQuery.data,
        (node) => node.genre.id === view.id
      )
      if (matchingNode) {
        return matchingNode.path
      }
    }
  }, [path, treeQuery.data, view])

  const value: GenrePageContext = useMemo(
    () => ({ view, selectedPath }),
    [selectedPath, view]
  )

  return (
    <GenrePageContext.Provider value={value}>
      {children}
    </GenrePageContext.Provider>
  )
}

const findTree = (tree: TreeNode[], fn: (node: TreeNode) => boolean) => {
  const queue = [...tree]
  let curr = queue.shift()
  while (curr !== undefined) {
    if (fn(curr)) {
      return curr
    } else {
      queue.push(...curr.children)
      curr = queue.shift()
    }
  }
}
