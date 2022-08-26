import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { GenreFormFields } from './GenreForm'
import useGenreTreeQuery, { TreeNode } from './useGenreTreeQuery'

type GenrePageContext = {
  view: GenrePageView
  setView: (view: GenrePageView) => void

  selectedPath: number[] | undefined
  setSelectedPath: (path: number[] | undefined) => void
}

export type GenrePageView =
  | { type: 'default' }
  | { type: 'view'; id: number }
  | { type: 'edit'; id: number; autoFocus: keyof GenreFormFields }
  | { type: 'history'; id: number }
  | { type: 'create' }

const GenrePageContext = createContext<GenrePageContext>({
  view: { type: 'default' },
  setView: () => {
    throw new Error('GenrePageContext must be used inside a GenrePageProvider')
  },

  selectedPath: undefined,
  setSelectedPath: () => {
    throw new Error('GenrePageContext must be used inside a GenrePageProvider')
  },
})

export const useGenrePageContext = () => useContext(GenrePageContext)

export const GenrePageProvider: FC<PropsWithChildren<{ id?: number }>> = ({
  id,
  children,
}) => {
  const [view, setView] = useState<GenrePageView>(
    id === undefined ? { type: 'default' } : { type: 'view', id }
  )
  useEffect(() => {
    setView((view) => {
      switch (view.type) {
        case 'default': {
          if (id !== undefined) {
            return { type: 'view', id }
          }
          break
        }
        case 'view': {
          if (id !== undefined) {
            if (id !== view.id) {
              return { ...view, id }
            }
          } else {
            return { type: 'default' }
          }
          break
        }
        case 'edit': {
          if (id !== undefined) {
            if (id !== view.id) {
              return { ...view, id }
            }
          } else {
            return { type: 'default' }
          }
          break
        }
        case 'history': {
          if (id !== undefined) {
            if (id !== view.id) {
              return { ...view, id }
            }
          } else {
            return { type: 'default' }
          }
          break
        }
        case 'create': {
          if (id !== undefined) {
            return { type: 'view', id }
          }
          break
        }
      }
      return view
    })
  }, [id])

  const [selectedPath, setSelectedPath] = useState<number[] | undefined>()

  const treeQuery = useGenreTreeQuery()
  useEffect(() => {
    if ('id' in view && selectedPath === undefined && treeQuery.data) {
      const matchingNode = findTree(
        treeQuery.data,
        (node) => node.genre.id === view.id
      )
      if (matchingNode) {
        setSelectedPath(matchingNode.path)
      }
    }
  }, [id, selectedPath, treeQuery.data, view])

  const value: GenrePageContext = useMemo(
    () => ({
      view,
      setView,
      selectedPath,
      setSelectedPath,
    }),
    [selectedPath, view]
  )

  return (
    <GenrePageContext.Provider value={value}>
      {children}
    </GenrePageContext.Provider>
  )
}

const findTree = (tree: TreeNode[], fn: (node: TreeNode) => boolean) => {
  const queue = tree
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
