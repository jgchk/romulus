import { queryOptions } from '@tanstack/svelte-query'
import { parse, stringify } from 'devalue'

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
        cacheGenreTree(genreTree)
        return genreTree
      },
      initialData: () => getGenreTreeFromCache(),
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }),
}

function cacheGenreTree(store: GenreStore) {
  if (!browser) return

  localStorage.setItem('genre-tree', stringify([...store.values()]))
}

function getGenreTreeFromCache() {
  if (!browser) return

  const lsGenreTree = localStorage.getItem('genre-tree')
  if (lsGenreTree) {
    const tree = createGenreStore(parse(lsGenreTree) as TreeGenre[])
    return tree
  }
}
