import { queryOptions } from '@tanstack/svelte-query'
import { parse, stringify } from 'devalue'
import * as localForage from 'localforage'

import { browser } from '$app/environment'

import { createGenreStore, type GenreStore } from './queries/infrastructure'
import type { TreeGenre } from './queries/types'

export const genreQueries = {
  all: () => ['genres'],
  tree: () =>
    queryOptions({
      queryKey: [...genreQueries.all(), 'tree'],
      queryFn: async ({ signal }) => {
        const response = await fetch('/api/genre-tree', {
          signal,
        })
        const json = (await response.json()) as { genres: string }
        const genreTree = parse(json.genres) as Map<number, TreeGenre>
        await cacheGenreTree(genreTree)
        return genreTree
      },
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }),
}

export async function cacheGenreTree(store: GenreStore) {
  if (!browser) return

  try {
    await localForage.setItem('genre-tree', stringify([...store.values()]))
  } catch (error) {
    console.error('Error caching genre tree:', error)
  }
}

export async function getGenreTreeFromCache() {
  if (!browser) return

  const stringifiedGenreTree = await localForage.getItem<string | null>('genre-tree')
  if (stringifiedGenreTree) {
    const tree = createGenreStore(parse(stringifiedGenreTree) as TreeGenre[])
    return tree
  }
}
