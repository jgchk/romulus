import { queryOptions } from '@tanstack/svelte-query'

import type { GetDerivationsQuery } from '../application/get-derivations'

export function createGetDerivationsQuery(id: number, getDerivations: GetDerivationsQuery) {
  return queryOptions({
    queryKey: ['genres', id, 'derivations'],
    queryFn: () => getDerivations(id),
  })
}
