import { z } from 'zod'

import { GENRE_TYPES, genreRelevance } from '$lib/types/genres'

const schema = z.object({
  skip: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().min(0).max(100).optional(),
  include: z.enum(['parents', 'influencedBy', 'akas']).array().optional(),
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
    })
    .optional(),
})

export function parseQueryParams(url: URL) {
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
    },
  })
}
