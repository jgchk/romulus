import { z } from 'zod'

import { GENRE_TYPES, genreRelevance } from '$lib/types/genres'

const FIND_ALL_INCLUDE = ['parents', 'influencedBy', 'akas'] as const
const FIND_ALL_SORT_FIELD = [
  'id',
  'name',
  'subtitle',
  'type',
  'relevance',
  'nsfw',
  'shortDescription',
  'longDescription',
  'notes',
  'createdAt',
  'updatedAt',
] as const
const FIND_ALL_SORT_ORDER = ['asc', 'desc'] as const

const schema = z.object({
  skip: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().min(0).max(100).optional(),
  include: z.enum(FIND_ALL_INCLUDE).array().optional(),
  filter: z
    .object({
      name: z.string().optional(),
      subtitle: z.string().nullable().optional(),
      type: z.enum(GENRE_TYPES).optional(),
      relevance: genreRelevance.nullable().optional(),
      nsfw: z
        .enum(['true', 'false'])
        .transform((v) => v === 'true')
        .optional(),
      shortDescription: z.string().nullable().optional(),
      longDescription: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      createdBy: z.coerce.number().int().optional(),
      parents: z.coerce.number().int().array().optional(),
      ancestors: z.coerce.number().int().array().optional(),
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
  const parents = url.searchParams.getAll('parent')
  const ancestors = url.searchParams.getAll('ancestor')

  return schema.safeParse({
    skip: url.searchParams.get('skip') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
    include: url.searchParams.getAll('include'),
    filter: {
      name: url.searchParams.get('name') ?? undefined,
      subtitle: url.searchParams.get('subtitle') ?? undefined,
      type: url.searchParams.get('type') ?? undefined,
      relevance: url.searchParams.get('relevance') ?? undefined,
      nsfw: url.searchParams.get('nsfw') ?? undefined,
      shortDescription: url.searchParams.get('shortDescription') ?? undefined,
      longDescription: url.searchParams.get('longDescription') ?? undefined,
      notes: url.searchParams.get('notes') ?? undefined,
      createdAt: url.searchParams.get('createdAt') ?? undefined,
      updatedAt: url.searchParams.get('updatedAt') ?? undefined,
      createdBy: url.searchParams.get('createdBy') ?? undefined,
      parents: parents.length === 0 ? undefined : parents,
      ancestors: ancestors.length === 0 ? undefined : ancestors,
    },
    sort: {
      field: url.searchParams.get('sort') ?? undefined,
      order: url.searchParams.get('order') ?? undefined,
    },
  })
}
