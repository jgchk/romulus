import { equals } from 'ramda'
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { GenreFormFields } from './GenreForm'
import useGenreTreeQuery, { TreeNode } from './useGenreTreeQuery'

type GenrePageContext = {
  view: GenrePageView
  selectedPath: number[] | undefined
  expanded: Expanded
  setExpanded: (key: ExpandedKey, value: ExpandedValue) => void
}

export type GenrePageView =
  | { type: 'default' }
  | { type: 'view'; id: number }
  | { type: 'edit'; id: number; autoFocus?: keyof GenreFormFields }
  | { type: 'history'; id: number }
  | { type: 'create' }

type Expanded = Record<ExpandedKey, ExpandedValue | undefined>
type ExpandedKey = string
type ExpandedValue = 'expanded' | 'collapsed'

const GenrePageContext = createContext<GenrePageContext>({
  view: { type: 'default' },
  selectedPath: undefined,
  expanded: {},
  setExpanded: () => {
    throw new Error('GenrePageContext must be used inside a GenrePageProvider')
  },
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

  const [expanded, setExpanded] = useState<Expanded>({})
  const setExpandedKV = useCallback(
    (key: ExpandedKey, value: ExpandedValue) =>
      setExpanded((e) => ({ ...e, [key]: value })),
    []
  )

  useEffect(() => {
    if (selectedPath) {
      for (let i = 1; i < selectedPath.length; i++) {
        const key = selectedPath.slice(0, i).join('-')
        if (expanded[key] !== 'expanded') {
          setExpandedKV(key, 'expanded')
        }
      }
    }
  }, [expanded, selectedPath, setExpandedKV])

  return (
    <GenrePageContext.Provider
      value={{ view, selectedPath, expanded, setExpanded: setExpandedKV }}
    >
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
