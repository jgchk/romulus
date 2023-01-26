import { equals } from 'ramda'
import { useCallback, useMemo } from 'react'
import { create } from 'zustand'

import { useTreeStructureMapQuery } from '../../../../services/genres'
import { treeBfs } from '../../../../utils/genres'

interface TreeState {
  selectedPath: number[] | undefined
  setSelectedPath: (path: number[] | undefined) => void

  expanded: Set<string>
  getExpanded: (path: number[]) => boolean
  setExpanded: (path: number[], expanded: boolean) => void

  collapseAll: () => void
}

export const useTreeState = create<TreeState>()((set, get) => ({
  selectedPath: undefined,
  setSelectedPath: (selectedPath) => {
    set((state) => {
      if (equals(state.selectedPath, selectedPath)) {
        return {}
      }

      if (selectedPath) {
        const newExpanded = new Set(state.expanded)
        for (let i = 0; i < selectedPath.length; i++) {
          const partialPath = selectedPath.slice(0, i + 1).join('-')
          newExpanded.add(partialPath)
        }

        return { selectedPath, expanded: newExpanded }
      } else {
        return { selectedPath }
      }
    })
  },

  expanded: new Set(),
  getExpanded: (path) => get().expanded.has(path.join('-')),
  setExpanded: (path, expanded) => {
    set((state) => {
      const expandedSet = new Set(state.expanded)
      if (expanded) {
        expandedSet.add(path.join('-'))
      } else {
        expandedSet.delete(path.join('-'))
      }
      return { expanded: expandedSet }
    })
  },
  collapseAll: () => set({ expanded: new Set() }),
}))

const search = treeBfs
type Source = 'ancestor' | 'pre-expanded' | 'new'
export const usePathUpdater = (
  id: number | undefined
): { path: number[]; source: Source } | undefined => {
  const treeStructureQuery = useTreeStructureMapQuery()
  const selectedPath = useTreeState((state) => state.selectedPath)
  const expanded = useTreeState((state) => state.expanded)

  const getExpandedPathToId = useCallback(
    (id: number) => {
      if (!treeStructureQuery.data) return

      const parents =
        treeStructureQuery.data
          .get(id)
          ?.parentGenres.map((parent) => parent.id) ?? []

      for (const path_ of expanded) {
        const path = path_.split('-').map((x) => Number.parseInt(x))

        for (const parent of parents) {
          const indexOfId = path.indexOf(parent)
          if (indexOfId !== -1) {
            return [...path.slice(0, indexOfId + 1), id]
          }
        }
      }
    },
    [expanded, treeStructureQuery.data]
  )

  const getNewPath = useCallback(
    (id: number): { path: number[]; source: Source } | undefined => {
      // try to use an ancestor path
      if (selectedPath) {
        const indexOfId = selectedPath.indexOf(id)

        // if our path already points to this id, return nothing
        if (indexOfId === selectedPath.length - 1) {
          return
        }

        // if our path contains this id as an ancestor, return the path up to this id
        if (indexOfId !== -1) {
          const path = selectedPath.slice(0, indexOfId + 1)
          return { path, source: 'ancestor' }
        }
      }

      // otherwise, get a pre-expanded path to this id
      const preExpandedPath = getExpandedPathToId(id)
      if (preExpandedPath) {
        return { path: preExpandedPath, source: 'pre-expanded' }
      }

      // otherwise, search for a brand new path
      if (treeStructureQuery.data) {
        const node = search(treeStructureQuery.data, (node) => node.id === id)
        if (node) {
          return { path: node.path, source: 'new' }
        }
      }
    },
    [getExpandedPathToId, selectedPath, treeStructureQuery.data]
  )

  const p = useMemo(() => {
    if (!id) {
      return
    }

    if (selectedPath) {
      if (treeStructureQuery.data) {
        const pathExists = search(
          treeStructureQuery.data,
          (node) => node.id === id && equals(node.path, selectedPath)
        )

        return pathExists ? undefined : getNewPath(id)
      } else {
        return getNewPath(id)
      }
    } else {
      return getNewPath(id)
    }
  }, [getNewPath, id, selectedPath, treeStructureQuery.data])

  return p
}
