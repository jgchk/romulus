import type { IAuthenticationClient } from '@romulus/authentication/client'
import { AuthorizationClientError, type IAuthorizationClient } from '@romulus/authorization/client'
import { Hono } from 'hono'
import { z } from 'zod'

import type { CompositionRoot } from '../../composition-root'
import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '../../config'
import { CustomError } from '../../shared/domain/base'
import { UnauthorizedError } from '../../shared/domain/unauthorized'
import { GENRE_TYPES, UNSET_GENRE_RELEVANCE } from '../../shared/infrastructure/drizzle-schema'
import { bearerAuth } from '../../shared/web/bearer-auth-middleware'
import { setError } from '../../shared/web/utils'
import { zodValidator } from '../../shared/web/zod-validator'
import { CreateGenreCommand } from '../application/commands/create-genre'
import { DeleteGenreCommand } from '../application/commands/delete-genre'
import { UpdateGenreCommand } from '../application/commands/update-genre'
import { VoteGenreRelevanceCommand } from '../application/commands/vote-genre-relevance'
import { GenreNotFoundError } from '../application/errors/genre-not-found'
import { DerivedChildError } from '../domain/errors/derived-child'
import { DerivedInfluenceError } from '../domain/errors/derived-influence'
import { DuplicateAkaError } from '../domain/errors/duplicate-aka'
import { GenreCycleError } from '../domain/errors/genre-cycle'
import { InvalidGenreRelevanceError } from '../domain/errors/invalid-genre-relevance'
import { SelfInfluenceError } from '../domain/errors/self-influence'

export type GenreCommandsRouter = ReturnType<typeof createCommandsRouter>

export function createCommandsRouter(
  di: CompositionRoot,
  getAuthenticationClient: (sessionToken: string) => IAuthenticationClient,
  getAuthorizationClient: (sessionToken: string) => IAuthorizationClient,
) {
  const requireUser = bearerAuth(getAuthenticationClient)

  const app = new Hono()
    .post('/genres', zodValidator('json', genreSchema), requireUser, async (c) => {
      const body = c.req.valid('json')
      const user = c.var.user

      const createGenreCommand = new CreateGenreCommand(
        di.genreRepository(),
        di.genreTreeRepository(),
        di.genreHistoryRepository(),
        getAuthorizationClient(c.var.token),
      )
      const result = await createGenreCommand.execute(
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
          if (err instanceof AuthorizationClientError) {
            return setError(c, err, 500)
          } else if (err instanceof UnauthorizedError) {
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

        const deleteGenreCommand = new DeleteGenreCommand(
          di.genreRepository(),
          di.genreTreeRepository(),
          di.genreHistoryRepository(),
          getAuthorizationClient(c.var.token),
        )
        const result = await deleteGenreCommand.execute(id, user.id)

        return result.match(
          () => c.json({ success: true } as const),
          (err) => {
            if (err instanceof AuthorizationClientError) {
              return setError(c, err, 500)
            } else if (err instanceof UnauthorizedError) {
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

        const updateGenreCommand = new UpdateGenreCommand(
          di.genreRepository(),
          di.genreTreeRepository(),
          di.genreHistoryRepository(),
          getAuthorizationClient(c.var.token),
        )
        const result = await updateGenreCommand.execute(
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
            if (err instanceof AuthorizationClientError) {
              return setError(c, err, 500)
            } else if (err instanceof UnauthorizedError) {
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

        const voteGenreRelevanceCommand = new VoteGenreRelevanceCommand(
          di.genreRelevanceVoteRepository(),
          getAuthorizationClient(c.var.token),
        )
        const result = await voteGenreRelevanceCommand.execute(id, body.relevanceVote, user.id)

        return result.match(
          () => c.json({ success: true } as const),
          (err) => {
            if (err instanceof AuthorizationClientError) {
              return setError(c, err, 500)
            } else if (err instanceof UnauthorizedError) {
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

class UnknownError extends CustomError {
  constructor() {
    super('UnknownError', 'An unknown error occurred')
  }
}
