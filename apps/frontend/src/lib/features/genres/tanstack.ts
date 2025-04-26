import { queryOptions } from '@tanstack/svelte-query'
import * as localForage from 'localforage'

import { browser } from '$app/environment'

import type { GenreStore } from './queries/infrastructure'
import { createGenreStore } from './queries/infrastructure'
import { parseTreeGenre, stringifyTreeGenre } from './serialization'

export const genreQueries = {
  all: () => ['genres'],
  tree: () =>
    queryOptions({
      queryKey: [...genreQueries.all(), 'tree'],
      queryFn: async ({ signal, client, queryKey }) => {
        // 1. Kick off the network fetch (with cache side-effect)
        const apiPromise = (async () => {
          const response = await fetch('/api/genre-tree', { signal })
          const json = (await response.json()) as { genres: string[] }
          const genreTree = createGenreStore(json.genres.map((genre) => parseTreeGenre(genre)))
          void cacheGenreTree(genreTree)
          return genreTree
        })()

        // 2. Kick off the cache lookup
        const cachePromise = getGenreTreeFromCache()

        // 3. Race them, but don’t cancel either
        const result = await new Promise<GenreStore>((resolve, reject) => {
          let settled = false

          cachePromise
            .then((cacheResult) => {
              if (cacheResult && !settled) {
                settled = true
                resolve(cacheResult)
              }
            })
            .catch((err) => {
              console.error('Error loading genre tree from cache:', err)
            })

          apiPromise
            .then((apiResult) => {
              if (settled) {
                client.setQueryData(queryKey, apiResult)
              } else {
                settled = true
                resolve(apiResult)
              }
            })
            .catch((err) => {
              if (!settled) {
                settled = true
                reject(err as Error)
              }
            })
        })

        return result
      },
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }),
}

export async function cacheGenreTree(store: GenreStore) {
  if (!browser) return

  try {
    await localForage.setItem(
      'genre-tree',
      [...store.values()].map((genre) => stringifyTreeGenre(genre)),
    )
  } catch (error) {
    console.error('Error caching genre tree:', error)
  }
}

export async function getGenreTreeFromCache() {
  if (!browser) return

  const stringifiedGenreTree = await localForage.getItem<string[] | null>('genre-tree')
  if (stringifiedGenreTree) {
    const tree = createGenreStore(stringifiedGenreTree.map((genre) => parseTreeGenre(genre)))
    return tree
  }
}
