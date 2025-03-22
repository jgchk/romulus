import { queryOptions } from '@tanstack/svelte-query'

import type { GetChildrenQuery } from '../application/get-children'

export function createGetChildrenQuery(id: number, getChildren: GetChildrenQuery) {
  return queryOptions({
    queryKey: ['genres', id, 'children'],
    queryFn: () => getChildren(id),
  })
}
