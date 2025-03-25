import { getContext, setContext } from 'svelte'
import { SvelteSet } from 'svelte/reactivity'

export type TreePath = (number | 'derived')[]

export function createTreeStateStore() {
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

    expandAlongPath(path: TreePath) {
      for (let i = 1; i <= path.length; i++) {
        const subPath = path.slice(0, i)
        this.setExpanded(subPath)
      }
    },
  }
}

export function stringifyTreePath(path: TreePath) {
  return path.join('-')
}

export function unstringifyTreePath(pathString: string): TreePath {
  return pathString.split('-').map((segment) => {
    if (segment === 'derived') return segment
    return parseInt(segment, 10)
  })
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
