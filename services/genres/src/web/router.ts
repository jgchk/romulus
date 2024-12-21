import type { WhoamiQuery } from '@romulus/authentication/application'
import { Hono } from 'hono'
import { z } from 'zod'

import type { CreateGenreCommand } from '../application/commands/create-genre'
import type { DeleteGenreCommand } from '../application/commands/delete-genre'
import type { GetAllGenresQuery } from '../application/commands/get-all-genres'
import type { GetGenreQuery } from '../application/commands/get-genre'
import type { GetGenreHistoryQuery } from '../application/commands/get-genre-history'
import type { GetGenreHistoryByAccountQuery } from '../application/commands/get-genre-history-by-account'
import type { GetGenreRelevanceVoteByAccountQuery } from '../application/commands/get-genre-relevance-vote-by-account'
import type { GetGenreRelevanceVotesByGenreQuery } from '../application/commands/get-genre-relevance-votes-by-genre'
import type { GetGenreTreeQuery } from '../application/commands/get-genre-tree'
import type { GetLatestGenreUpdatesQuery } from '../application/commands/get-latest-genre-updates'
import type { GetRandomGenreIdQuery } from '../application/commands/get-random-genre-id'
import type { UpdateGenreCommand } from '../application/commands/update-genre'
import type { VoteGenreRelevanceCommand } from '../application/commands/vote-genre-relevance'
import { GenreNotFoundError } from '../application/errors/genre-not-found'
import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '../config'
import { CustomError } from '../domain/errors/base'
import { DerivedChildError } from '../domain/errors/derived-child'
import { DerivedInfluenceError } from '../domain/errors/derived-influence'
import { DuplicateAkaError } from '../domain/errors/duplicate-aka'
import { GenreCycleError } from '../domain/errors/genre-cycle'
import { InvalidGenreRelevanceError } from '../domain/errors/invalid-genre-relevance'
import { SelfInfluenceError } from '../domain/errors/self-influence'
import { UnauthorizedError } from '../domain/errors/unauthorized'
import { GENRE_TYPES, UNSET_GENRE_RELEVANCE } from '../infrastructure/drizzle-schema'
import { bearerAuth } from './bearer-auth-middleware'
import { setError } from './utils'
import { zodValidator } from './zod-validator'

export type GenresRouter = ReturnType<typeof createGenresRouter>

export type GenresRouterDependencies = {
  whoamiQuery(): WhoamiQuery
  createGenreCommand(): CreateGenreCommand
  deleteGenreCommand(): DeleteGenreCommand
  updateGenreCommand(): UpdateGenreCommand
  voteGenreRelevanceCommand(): VoteGenreRelevanceCommand
  getAllGenresQuery(): GetAllGenresQuery
  getGenreHistoryByAccountQuery(): GetGenreHistoryByAccountQuery
  getGenreHistoryQuery(): GetGenreHistoryQuery
  getGenreRelevanceVoteByAccountQuery(): GetGenreRelevanceVoteByAccountQuery
  getGenreRelevanceVotesByGenreQuery(): GetGenreRelevanceVotesByGenreQuery
  getGenreTreeQuery(): GetGenreTreeQuery
  getGenreQuery(): GetGenreQuery
  getLatestGenreUpdatesQuery(): GetLatestGenreUpdatesQuery
  getRandomGenreIdQuery(): GetRandomGenreIdQuery
}

export function createGenresRouter(deps: GenresRouterDependencies) {
  const requireUser = bearerAuth(deps.whoamiQuery())

  const app = new Hono()
    .post('/genres', zodValidator('json', genreSchema), requireUser, async (c) => {
      const body = c.req.valid('json')
      const user = c.var.user

      const result = await deps.createGenreCommand().execute(
        {
          ...body,
          subtitle: body.subtitle ?? undefined,
          shortDescription: body.shortDescription ?? undefined,
          longDescription: body.longDescription ?? undefined,
          notes: body.notes ?? undefined,
          parents: new Set(body.parents),
          derivedFrom: new Set(body.derivedFrom),
          influences: new Set(body.influencedBy),
          akas: {
            primary: body.primaryAkas?.length
              ? body.primaryAkas?.split(',').map((aka) => aka.trim())
              : [],
            secondary: body.secondaryAkas?.length
              ? body.secondaryAkas?.split(',').map((aka) => aka.trim())
              : [],
            tertiary: body.tertiaryAkas?.length
              ? body.tertiaryAkas?.split(',').map((aka) => aka.trim())
              : [],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        user.id,
      )

      return result.match(
        (genre) => c.json({ success: true, id: genre.id } as const),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return setError(c, err, 401)
          } else if (
            err instanceof SelfInfluenceError ||
            err instanceof DuplicateAkaError ||
            err instanceof DerivedChildError ||
            err instanceof DerivedInfluenceError
          ) {
            return setError(c, err, 400)
          } else {
            err satisfies never
            return setError(c, new UnknownError(), 500)
          }
        },
      )
    })

    .delete(
      '/genres/:id',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      requireUser,
      async (c) => {
        const id = c.req.valid('param').id
        const user = c.var.user

        const result = await deps.deleteGenreCommand().execute(id, user.id)

        return result.match(
          () => c.json({ success: true } as const),
          (err) => {
            if (err instanceof UnauthorizedError) {
              return setError(c, err, 401)
            } else if (err instanceof GenreNotFoundError) {
              return setError(c, err, 404)
            } else {
              err satisfies never
              return setError(c, new UnknownError(), 500)
            }
          },
        )
      },
    )

    .put(
      '/genres/:id',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      zodValidator('json', genreSchema),
      requireUser,
      async (c) => {
        const id = c.req.valid('param').id
        const body = c.req.valid('json')
        const user = c.var.user

        const result = await deps.updateGenreCommand().execute(
          id,
          {
            ...body,
            parents: new Set(body.parents),
            derivedFrom: new Set(body.derivedFrom),
            influences: new Set(body.influencedBy),
            akas: {
              primary: body.primaryAkas?.length
                ? body.primaryAkas?.split(',').map((aka) => aka.trim())
                : [],
              secondary: body.secondaryAkas?.length
                ? body.secondaryAkas?.split(',').map((aka) => aka.trim())
                : [],
              tertiary: body.tertiaryAkas?.length
                ? body.tertiaryAkas?.split(',').map((aka) => aka.trim())
                : [],
            },
          },
          user.id,
        )

        return result.match(
          () => c.json({ success: true } as const),
          (err) => {
            if (err instanceof UnauthorizedError) {
              return setError(c, err, 401)
            } else if (
              err instanceof SelfInfluenceError ||
              err instanceof DuplicateAkaError ||
              err instanceof DerivedChildError ||
              err instanceof DerivedInfluenceError ||
              err instanceof GenreCycleError
            ) {
              return setError(c, err, 400)
            } else if (err instanceof GenreNotFoundError) {
              return setError(c, err, 404)
            } else {
              err satisfies never
              return setError(c, new UnknownError(), 500)
            }
          },
        )
      },
    )

    .post(
      '/genres/:id/relevance/votes',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      zodValidator('json', z.object({ relevanceVote: genreRelevance })),
      requireUser,
      async (c) => {
        const id = c.req.valid('param').id
        const body = c.req.valid('json')
        const user = c.var.user

        const result = await deps
          .voteGenreRelevanceCommand()
          .execute(id, body.relevanceVote, user.id)

        return result.match(
          () => c.json({ success: true } as const),
          (err) => {
            if (err instanceof UnauthorizedError) {
              return setError(c, err, 401)
            } else if (err instanceof InvalidGenreRelevanceError) {
              return setError(c, err, 400)
            } else {
              err satisfies never
              return setError(c, new UnknownError(), 500)
            }
          },
        )
      },
    )

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

      const genres = await deps.getAllGenresQuery().execute(params.data)
      return c.json({ success: true, ...genres } as const)
    })

    .get(
      '/genres/history/by-account/:accountId',
      zodValidator('param', z.object({ accountId: z.coerce.number().int() })),
      async (c) => {
        const accountId = c.req.valid('param').accountId
        const history = await deps.getGenreHistoryByAccountQuery().execute(accountId)
        return c.json({ success: true, history } as const)
      },
    )

    .get(
      '/genres/:id/history',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      async (c) => {
        const id = c.req.valid('param').id
        const history = await deps.getGenreHistoryQuery().execute(id)
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
        const vote = await deps.getGenreRelevanceVoteByAccountQuery().execute(id, accountId)
        return c.json({ success: true, vote } as const)
      },
    )

    .get(
      '/genres/:id/relevance/votes',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      async (c) => {
        const id = c.req.valid('param').id
        const votes = await deps.getGenreRelevanceVotesByGenreQuery().execute(id)
        return c.json({ success: true, votes })
      },
    )

    .get('/genre-tree', async (c) => {
      const tree = await deps.getGenreTreeQuery().execute()
      return c.json({ success: true, tree } as const)
    })

    .get(
      '/genres/:id',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      async (c) => {
        const id = c.req.valid('param').id
        const result = await deps.getGenreQuery().execute(id)

        return result.match(
          (genre) => c.json({ success: true, genre } as const),
          (err) => {
            if (err instanceof GenreNotFoundError) {
              return setError(c, err, 404)
            } else {
              err satisfies never
              return setError(c, new UnknownError(), 500)
            }
          },
        )
      },
    )

    .get('/latest-genre-updates', async (c) => {
      const latestUpdates = await deps.getLatestGenreUpdatesQuery().execute()
      return c.json({ success: true, latestUpdates } as const)
    })

    .get('/random-genre', async (c) => {
      const genre = await deps.getRandomGenreIdQuery().execute()
      return c.json({ success: true, genre } as const)
    })

  return app
}

const nullableString = z
  .string()
  .optional()
  .nullable()
  .transform((s) => (s?.length ? s : null))

const genreRelevance = z.coerce
  .number()
  .int()
  .refine(
    (v) => v === UNSET_GENRE_RELEVANCE || (v >= MIN_GENRE_RELEVANCE && v <= MAX_GENRE_RELEVANCE),
    { message: `Relevance must be between 0 and 7 (inclusive), or ${UNSET_GENRE_RELEVANCE}` },
  )

export type GenreSchema = z.infer<typeof genreSchema>
const genreSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  shortDescription: nullableString,
  longDescription: nullableString,
  notes: nullableString,
  type: z.enum(GENRE_TYPES),
  subtitle: nullableString,

  primaryAkas: nullableString,
  secondaryAkas: nullableString,
  tertiaryAkas: nullableString,

  parents: z.number().int().array(),
  derivedFrom: z.number().int().array(),
  influencedBy: z.number().int().array(),

  relevance: genreRelevance.optional(),
  nsfw: z.boolean(),
})

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

class UnknownError extends CustomError {
  constructor() {
    super('UnknownError', 'An unknown error occurred')
  }
}
