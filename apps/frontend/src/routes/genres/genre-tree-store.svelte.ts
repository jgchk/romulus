import { getContext, setContext } from 'svelte'

import { browser } from '$app/environment'
import type { GenreType } from '$lib/types/genres'
import { diceCoefficient, toAscii } from '$lib/utils/string'

import type { TreePath } from './tree-state-store.svelte'

export type GenreTreeStore = {
  getRootGenres(): number[]
  getChildren(id: number): number[]
  getDerivations(id: number): number[]
  getGenre(id: number): TreeGenre | undefined
  isPathValid(path: TreePath): boolean
  getPathTo(id: number): number[] | undefined
  search(query: string): GenreMatch[]
}

export type TreeGenre = {
  id: number
  name: string
  parents: number[]
  derivedFrom: number[]
  nsfw: boolean
  subtitle: string | null
  type: GenreType
  relevance: number
  akas: string[]
  updatedAt: Date
}

export function createGenreTreeStore(genres: TreeGenre[]): GenreTreeStore {
  return {
    getRootGenres() {
      return genres.filter((genre) => genre.parents.length === 0).map((genre) => genre.id)
    },

    getChildren(id: number) {
      return genres.filter((genre) => genre.parents.includes(id)).map((genre) => genre.id)
    },

    getDerivations(id: number) {
      return genres.filter((genre) => genre.derivedFrom.includes(id)).map((genre) => genre.id)
    },

    getGenre(id: number) {
      return genres.find((genre) => genre.id === id)
    },

    isPathValid(path: TreePath) {
      const rootNode = path[0]
      if (rootNode === 'derived' || !this.getRootGenres().includes(rootNode)) {
        return false
      }

      for (let i = path.length - 1; i >= 0; i--) {
        const currentId = path[i]
        const parentId = path[i - 1]
        const grandparentId = path[i - 2]

        if (currentId === 'derived') {
          if (parentId === 'derived') return false
          if (parentId === undefined) return false

          const parentDerivations = this.getDerivations(parentId)
          if (parentDerivations.length === 0) return false
        } else if (parentId === 'derived') {
          if (grandparentId === 'derived') return false
          if (grandparentId === undefined) return false

          const grandparentDerivations = this.getDerivations(grandparentId)
          if (grandparentDerivations.length === 0) return false
          if (!grandparentDerivations.includes(currentId)) return false
        } else {
          if (parentId === undefined) continue

          const parentChildren = this.getChildren(parentId)
          if (parentChildren.length === 0) return false
          if (!parentChildren.includes(currentId)) return false
        }
      }

      return true
    },

    getPathTo(id: number) {
      // Check if the target genre exists
      const genre = this.getGenre(id)
      if (!genre) {
        return undefined
      }

      // If the target is a root genre, return a path with just itself
      if (genre.parents.length === 0) {
        return [id]
      }

      // Initialize BFS data structures
      const parentMap = new Map<number, number>() // Maps genre ID to its parent in the shortest path
      const queue: number[] = [] // Queue for BFS traversal
      const roots = this.getRootGenres() // Get all root genres (no parents)

      // Seed the queue with all root genres
      for (const root of roots) {
        queue.push(root)
        parentMap.set(root, -1) // Use -1 as a sentinel value for roots
      }

      // Perform BFS
      while (queue.length > 0) {
        const current = queue.shift()! // Dequeue the next genre
        const children = this.getChildren(current) // Get its children
        for (const child of children) {
          if (!parentMap.has(child)) {
            // If child hasn't been visited
            parentMap.set(child, current) // Record its parent
            queue.push(child) // Enqueue the child
          }
        }
      }

      // Check if the target is reachable
      if (!parentMap.has(id)) {
        return undefined // Target not reachable from any root
      }

      // Reconstruct the path from target to root
      const path: number[] = []
      let current: number | undefined = id
      while (current !== undefined && current !== -1) {
        path.push(current)
        current = parentMap.get(current) // Move to the parent
      }

      // Reverse the path to go from root to target
      path.reverse()
      return path
    },

    search(query: string) {
      const m: GenreMatch[] = []

      for (const genre of genres) {
        let name = genre.name
        if (genre.subtitle) {
          name += ` [${genre.subtitle}]`
        }
        const nameWeight = getMatchWeight(name, query)
        let match: GenreMatch = { id: genre.id, genre, weight: nameWeight }

        for (const aka of genre.akas) {
          // TODO: incorporate aka relevance
          const akaWeight = getMatchWeight(aka, query)
          if (akaWeight > match.weight) {
            match = {
              id: genre.id,
              genre,
              matchedAka: aka,
              weight: akaWeight,
            }
          }
        }

        if (match.weight >= WEIGHT_THRESHOLD) {
          m.push(match)
        }
      }

      return m.sort((a, b) => b.weight - a.weight || a.genre.name.localeCompare(b.genre.name))
    },
  }
}

const WEIGHT_THRESHOLD = 0.2
const toFilterString = (s: string) => toAscii(s.toLowerCase())
function getMatchWeight(name: string, filter: string) {
  const fName = toFilterString(name)
  const fFilter = toFilterString(filter)

  if (fName.length < 2 || fFilter.length < 2) {
    if (fName.startsWith(fFilter)) {
      return 1
    } else if (fName.includes(fFilter)) {
      return 0.5
    } else {
      return 0
    }
  }

  return diceCoefficient(fName, fFilter)
}

export type GenreMatch = {
  id: number
  genre: TreeGenre
  matchedAka?: string
  weight: number
}

export function createAsyncGenreTreeStore(genresPromise: Promise<TreeGenre[]>) {
  const cached = getCachedGenreTree()
  const store = $state<GenreTreeStore>(createGenreTreeStore(cached ?? []))

  void genresPromise.then((genres) => {
    const newStore = createGenreTreeStore(genres)
    store.getRootGenres = newStore.getRootGenres
    store.getChildren = newStore.getChildren
    store.getDerivations = newStore.getDerivations
    store.getGenre = newStore.getGenre
    store.isPathValid = newStore.isPathValid
    store.getPathTo = newStore.getPathTo
    store.search = newStore.search

    setCachedGenreTree(genres)
  })

  return store
}

function getCachedGenreTree() {
  if (!browser) return undefined

  const localStorageData = localStorage.getItem('genre-tree')
  const localStorageTree =
    localStorageData !== null ? (JSON.parse(localStorageData) as TreeGenre[]) : null

  return localStorageTree
}

function setCachedGenreTree(genres: TreeGenre[]) {
  if (!browser) return

  localStorage.setItem('genre-tree', JSON.stringify(genres))
}

export const GENRE_TREE_STORE_KEY = Symbol('genre-tree-store-context')

export const setGenreTreeStoreContext = (value: GenreTreeStore) =>
  setContext(GENRE_TREE_STORE_KEY, value)

export const getGenreTreeStoreContext = () => getContext<GenreTreeStore>(GENRE_TREE_STORE_KEY)
