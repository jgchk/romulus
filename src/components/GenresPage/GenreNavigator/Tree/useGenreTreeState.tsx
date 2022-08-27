import { equals } from 'ramda'
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import useGenreTreeQuery, { TreeNode } from './useGenreTreeQuery'

type GenreTreeStateContext = {
  selectedPath: number[] | undefined
  setSelectedPath: (path: number[] | undefined) => void
  expanded: Expanded
  setExpanded: (key: ExpandedKey, value: ExpandedValue) => void
}

type Expanded = Record<ExpandedKey, ExpandedValue | undefined>
type ExpandedKey = string
type ExpandedValue = 'expanded' | 'collapsed'

const GenreTreeStateContext = createContext<GenreTreeStateContext>({
  selectedPath: undefined,
  setSelectedPath: () => {
    throw new Error(
      'GenreTreeStateContext must be used inside a GenreTreeStateProvider'
    )
  },
  expanded: {},
  setExpanded: () => {
    throw new Error(
      'GenreTreeStateContext must be used inside a GenreTreeStateProvider'
    )
  },
})

export const useGenreTreeState = () => useContext(GenreTreeStateContext)

export const GenreTreeStateProvider: FC<PropsWithChildren<{ id?: number }>> = ({
  id,
  children,
}) => {
  const treeQuery = useGenreTreeQuery()
  const [path, setPath] = useState<number[]>()
  const [selectedPath, setSelectedPath] = useState<number[]>()
  useEffect(() => {
    if (path) {
      const isValid =
        !treeQuery.data ||
        findTree(treeQuery.data, (node) => equals(node.path, path))

      if (isValid) {
        if (!equals(path, selectedPath)) {
          setSelectedPath(path)
        }
        return
      }
    }

    if (treeQuery.data && id) {
      const matchingNode = findTree(
        treeQuery.data,
        (node) => node.genre.id === id
      )
      if (matchingNode) {
        if (!equals(matchingNode.path, selectedPath)) {
          setSelectedPath(matchingNode.path)
        }
        return
      }
    }

    if (selectedPath !== undefined) {
      setSelectedPath(undefined)
    }
    return
  }, [id, path, selectedPath, treeQuery.data])

  const [expanded, setExpanded] = useState<Expanded>({})
  const setExpandedKV = useCallback(
    (
      key: ExpandedKey,
      value:
        | ExpandedValue
        | ((value: ExpandedValue | undefined) => ExpandedValue)
    ) =>
      setExpanded((e) => {
        const oldValue = e[key]
        const newValue = typeof value === 'function' ? value(oldValue) : value
        return oldValue === newValue ? e : { ...e, [key]: newValue }
      }),
    []
  )

  useEffect(() => {
    if (selectedPath) {
      for (let i = 1; i < selectedPath.length; i++) {
        const key = selectedPath.slice(0, i).join('-')
        setExpandedKV(key, 'expanded')
      }
    }
  }, [selectedPath, setExpandedKV])

  return (
    <GenreTreeStateContext.Provider
      value={{
        selectedPath,
        setSelectedPath: setPath,
        expanded,
        setExpanded: setExpandedKV,
      }}
    >
      {children}
    </GenreTreeStateContext.Provider>
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
