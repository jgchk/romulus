import { Hono } from 'hono'
import { z } from 'zod'

import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '../../config'
import { GENRE_TYPES, UNSET_GENRE_RELEVANCE } from '../../shared/infrastructure/drizzle-schema'
import { zodValidator } from '../../shared/web/zod-validator'
import type { GenreQueriesApplication } from '../application'

export type GenreQueriesRouter = ReturnType<typeof createQueriesRouter>

export function createQueriesRouter(application: GenreQueriesApplication) {
  const app = new Hono()
    .get('/genres', zodValidator('query', getAllGenresQuerySchema), async (c) => {
      const params = c.req.valid('query')
      const genres = await application.getAllGenres(params)
      return c.json({ success: true, ...genres })
    })

    .get(
      '/genres/history/by-account/:accountId',
      zodValidator('param', z.object({ accountId: z.coerce.number().int() })),
      async (c) => {
        const accountId = c.req.valid('param').accountId
        const history = await application.getGenreHistoryByAccount(accountId)
        return c.json({ success: true, history })
      },
    )

    .get(
      '/genres/:id/history',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      async (c) => {
        const id = c.req.valid('param').id
        const history = await application.getGenreHistory(id)
        return c.json({ success: true, history })
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
        return c.json({ success: true, vote })
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
      return c.json({ success: true, tree })
    })

    .get(
      '/genres/:id',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      async (c) => {
        const id = c.req.valid('param').id
        const genre = await application.getGenre(id)
        return c.json({ success: true, genre })
      },
    )

    .get('/latest-genre-updates', async (c) => {
      const latestUpdates = await application.getLatestGenreUpdates()
      return c.json({ success: true, latestUpdates })
    })

    .get('/random-genre', async (c) => {
      const genre = await application.getRandomGenreId()
      return c.json({ success: true, genre })
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
