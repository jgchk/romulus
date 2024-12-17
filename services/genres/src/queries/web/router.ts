import { Hono } from 'hono'
import { z } from 'zod'

import { GenreNotFoundError } from '../../commands/application/errors/genre-not-found'
import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '../../config'
import { GENRE_TYPES, UNSET_GENRE_RELEVANCE } from '../../shared/infrastructure/drizzle-schema'
import { setError } from '../../shared/web/utils'
import { zodValidator } from '../../shared/web/zod-validator'
import type { GenreQueriesApplication } from '../application'

export type GenreQueriesRouter = ReturnType<typeof createQueriesRouter>

export function createQueriesRouter(application: GenreQueriesApplication) {
  const app = new Hono()
    .get('/genres', async (c) => {
      const url = new URL(c.req.raw.url)
      const params = parseQueryParams(url)
      if (params.success === false) {
        return setError(
          c,
          {
            name: 'InvalidRequestError',
            message: 'Invalid request',
            details: params.error.issues,
          },
          400,
        )
      }

      const genres = await application.getAllGenres(params.data)
      return c.json({ success: true, ...genres } as const)
    })

    .get(
      '/genres/history/by-account/:accountId',
      zodValidator('param', z.object({ accountId: z.coerce.number().int() })),
      async (c) => {
        const accountId = c.req.valid('param').accountId
        const history = await application.getGenreHistoryByAccount(accountId)
        return c.json({ success: true, history } as const)
      },
    )

    .get(
      '/genres/:id/history',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      async (c) => {
        const id = c.req.valid('param').id
        const history = await application.getGenreHistory(id)
        return c.json({ success: true, history } as const)
      },
    )

    .get(
      '/genres/:id/relevance/votes/:accountId',
      zodValidator(
        'param',
        z.object({ id: z.coerce.number().int(), accountId: z.coerce.number().int() }),
      ),
      async (c) => {
        const { id, accountId } = c.req.valid('param')
        const vote = await application.getGenreRelevanceVoteByAccount(id, accountId)
        return c.json({ success: true, vote } as const)
      },
    )

    .get(
      '/genres/:id/relevance/votes',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      async (c) => {
        const id = c.req.valid('param').id
        const votes = await application.getGenreRelevanceVotesByGenre(id)
        return c.json({ success: true, votes })
      },
    )

    .get('/genre-tree', async (c) => {
      const tree = await application.getGenreTree()
      return c.json({ success: true, tree } as const)
    })

    .get(
      '/genres/:id',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      async (c) => {
        const id = c.req.valid('param').id
        const genre = await application.getGenre(id)
        if (genre instanceof GenreNotFoundError) {
          return setError(c, genre, 404)
        }
        return c.json({ success: true, genre } as const)
      },
    )

    .get('/latest-genre-updates', async (c) => {
      const latestUpdates = await application.getLatestGenreUpdates()
      return c.json({ success: true, latestUpdates } as const)
    })

    .get('/random-genre', async (c) => {
      const genre = await application.getRandomGenreId()
      return c.json({ success: true, genre } as const)
    })

  return app
}

const genreRelevance = z.coerce
  .number()
  .int()
  .refine(
    (v) => v === UNSET_GENRE_RELEVANCE || (v >= MIN_GENRE_RELEVANCE && v <= MAX_GENRE_RELEVANCE),
    { message: `Relevance must be between 0 and 7 (inclusive), or ${UNSET_GENRE_RELEVANCE}` },
  )

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

const getAllGenresQuerySchema = z.object({
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

function parseQueryParams(url: URL) {
  const parents = url.searchParams.getAll('parent')
  const ancestors = url.searchParams.getAll('ancestor')

  return getAllGenresQuerySchema.safeParse({
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
