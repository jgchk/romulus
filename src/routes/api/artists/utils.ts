import { z } from 'zod'

import {
  FIND_ALL_SORT_FIELD,
  FIND_ALL_SORT_ORDER,
  FIND_MANY_INCLUDE,
} from '$lib/server/db/controllers/artists'

const schema = z.object({
  skip: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().min(0).max(100).default(25),
  include: z.enum(FIND_MANY_INCLUDE).array().optional(),
  filter: z
    .object({
      ids: z.coerce.number().int().array().optional(),
    })
    .optional(),
  sort: z
    .object({
      field: z.enum(FIND_ALL_SORT_FIELD).optional(),
      order: z.enum(FIND_ALL_SORT_ORDER).optional(),
    })
    .optional(),
})

export function parseQueryParams(url: URL) {
  const ids = url.searchParams.getAll('id')

  return schema.safeParse({
    skip: url.searchParams.get('skip') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
    include: url.searchParams.getAll('include'),
    filter: {
      ids: ids.length === 0 ? undefined : ids,
    },
    sort: {
      field: url.searchParams.get('sort') ?? undefined,
      order: url.searchParams.get('order') ?? undefined,
    },
  })
}
