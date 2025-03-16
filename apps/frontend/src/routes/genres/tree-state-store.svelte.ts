import { getContext, setContext } from 'svelte'
import { SvelteSet } from 'svelte/reactivity'

export type TreePath = (number | 'derived')[]

export function createTreeStateStore() {
  let selectedPath = $state<TreePath | undefined>(undefined)
  const expandedPaths = new SvelteSet<string>()

  return {
    setExpanded(path: TreePath) {
      const pathString = path.join('-')
      expandedPaths.add(pathString)
    },

    setCollapsed(path: TreePath) {
      const pathString = path.join('-')
      expandedPaths.delete(pathString)
    },

    collapseAll() {
      expandedPaths.clear()
    },

    isExpanded: (path: TreePath) => {
      const pathString = path.join('-')
      return expandedPaths.has(pathString)
    },

    isExpandedAtRootLevel() {
      for (const expandedPath of expandedPaths) {
        const isRootLevel = !expandedPath.includes('-')
        if (isRootLevel) return true
      }
      return false
    },

    setSelectedPath(path: TreePath | undefined) {
      selectedPath = path
    },

    getSelectedPath() {
      return selectedPath
    },

    expandAlongPath(path: TreePath) {
      for (let i = 1; i <= path.length; i++) {
        const subPath = path.slice(0, i)
        this.setExpanded(subPath)
      }
    },
  }
}

export function getSelectedGenreIdFromTreePath(path: TreePath): number | undefined {
  for (const segment of path.toReversed()) {
    if (segment === 'derived') continue
    return segment
  }
}

export type TreeStateStore = ReturnType<typeof createTreeStateStore>

export const TREE_STATE_STORE_KEY = Symbol('tree-state-store-context')

export const setTreeStateStoreContext = (value: TreeStateStore) =>
  setContext(TREE_STATE_STORE_KEY, value)

export const getTreeStateStoreContext = () => getContext<TreeStateStore>(TREE_STATE_STORE_KEY)
