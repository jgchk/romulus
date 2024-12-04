import { equals } from 'ramda'
import { writable } from 'svelte/store'

import type { LayoutData } from '../../$types'

export type TreeGenre = Awaited<LayoutData['streamed']['genres']>[number]

type TreeState = {
  genres: Map<number, TreeGenre>
  selectedId?: number
  selectedPath?: (number | 'derived')[]
  expanded: Set<string>
}

const createTreeState = () => {
  const { subscribe, update } = writable<TreeState>({
    genres: new Map(),
    selectedId: undefined,
    selectedPath: undefined,
    expanded: new Set(),
  })

  return {
    subscribe,

    setGenres: (genres: TreeGenre[]) => {
      const genresMap = new Map<number, TreeGenre>(genres.map((genre) => [genre.id, genre]))
      update((n) => ({ ...n, genres: genresMap }))
    },

    setSelectedId: (id?: number) => update((n) => ({ ...n, selectedId: id })),

    setSelectedPath: (path?: (number | 'derived')[]) =>
      update((state) => {
        if (equals(state.selectedPath, path)) {
          return state
        }

        if (!path) {
          return { ...state, selectedPath: path }
        }

        const newExpanded = new Set(state.expanded)
        path.forEach((_, idx) => {
          const partialPath = path.slice(0, idx + 1).join('-')
          newExpanded.add(partialPath)
        })
        return { ...state, selectedPath: path, expanded: newExpanded }
      }),

    setExpanded: (path: (number | 'derived')[], expanded: boolean) =>
      update((n) => {
        const key = path.join('-')
        const updatedExpanded = new Set(n.expanded)
        if (expanded) {
          updatedExpanded.add(key)
        } else {
          updatedExpanded.delete(key)
        }
        return { ...n, expanded: updatedExpanded }
      }),

    collapseAll: () => update((n) => ({ ...n, expanded: new Set() })),
  }
}

export const treeState = createTreeState()
