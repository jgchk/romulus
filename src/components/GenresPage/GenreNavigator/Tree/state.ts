import { useMemo } from 'react'
import { create } from 'zustand'

import { useTreeStructureMapQuery } from '../../../../services/genres'
import { treeBfs } from '../../../../utils/genres'

interface TreeState {
  selectedPath: number[] | undefined
  setSelectedPath: (path: number[] | undefined) => void

  expanded: Record<string, boolean>
  getExpanded: (path: number[]) => boolean
  setExpanded: (path: number[], expanded: boolean) => void

  collapseAll: () => void
}

export const useTreeState = create<TreeState>()((set, get) => ({
  selectedPath: undefined,
  setSelectedPath: (selectedPath) => {
    set({ selectedPath })

    if (selectedPath) {
      const partialPaths: number[][] = []
      for (let i = 0; i < selectedPath.length; i++) {
        partialPaths.push(selectedPath.slice(0, i + 1))
      }
      set((state) => ({
        expanded: {
          ...state.expanded,
          ...Object.fromEntries(
            partialPaths.map((partialPath) => [partialPath.join('-'), true])
          ),
        },
      }))
    }
  },

  expanded: {},
  getExpanded: (path) => get().expanded[path.join('-')] ?? false,
  setExpanded: (path, expanded) =>
    set((state) => ({
      expanded: {
        ...state.expanded,
        [path.join('-')]: expanded,
      },
    })),
  collapseAll: () => set({ expanded: {} }),
}))

const search = treeBfs
export const useNearbyPath = (
  id: number | undefined,
  selectedPath: TreeState['selectedPath']
) => {
  const treeStructureQuery = useTreeStructureMapQuery()

  const p = useMemo(() => {
    if (!id) {
      return
    }

    if (selectedPath) {
      const indexOfId = selectedPath.indexOf(id)

      // if our path already points to this id, return nothing
      if (indexOfId === selectedPath.length - 1) {
        return
      }

      // if our path contains this id as an ancestor, return the path up to this id
      if (indexOfId !== -1) {
        return selectedPath.slice(0, indexOfId + 1)
      }

      // if our path does not contain this id, do a tree search to find a valid path to the id
      if (treeStructureQuery.data) {
        const node = search(treeStructureQuery.data, (node) => node.id === id)
        return node?.path
      }
    }

    // if we don't have a selected path, do a tree search to find a valid path to the id
    if (!selectedPath && treeStructureQuery.data) {
      const node = search(treeStructureQuery.data, (node) => node.id === id)
      return node?.path
    }
  }, [id, selectedPath, treeStructureQuery.data])

  return p
}
