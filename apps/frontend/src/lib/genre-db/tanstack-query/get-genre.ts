import { queryOptions } from '@tanstack/svelte-query'

import type { GetGenreQuery } from '../application/get-genre'

export function createGetGenreQuery(id: number, getGenre: GetGenreQuery) {
  return queryOptions({
    queryKey: ['genres', id, 'details'],
    queryFn: () => getGenre(id).then((genre) => genre ?? null),
  })
}
