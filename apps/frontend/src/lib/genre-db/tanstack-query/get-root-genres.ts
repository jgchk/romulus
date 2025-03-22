import { queryOptions } from '@tanstack/svelte-query'

import type { GetRootGenresQuery } from '../application/get-root-genres'

export function createGetRootGenresQuery(getRootGenres: GetRootGenresQuery) {
  return queryOptions({
    queryKey: ['genres', 'roots'],
    queryFn: () => getRootGenres(),
  })
}
