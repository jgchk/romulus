import { queryOptions } from '@tanstack/svelte-query'
import { parse } from 'devalue'

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
        return genreTree
      },
    }),
}
