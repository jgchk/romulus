import { Hono } from 'hono'
import { z } from 'zod'

import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '../../config'
import { GENRE_TYPES, UNSET_GENRE_RELEVANCE } from '../../shared/infrastructure/drizzle-schema'
import { bearerAuth } from '../../shared/web/bearer-auth-middleware'
import { setError } from '../../shared/web/utils'
import { zodValidator } from '../../shared/web/zod-validator'
import type { GenreCommandsApplication } from '../application'
import { GenreNotFoundError } from '../application/errors/genre-not-found'
import type { IAuthenticationService } from '../domain/authentication-service'
import { DerivedChildError } from '../domain/errors/derived-child'
import { DerivedInfluenceError } from '../domain/errors/derived-influence'
import { DuplicateAkaError } from '../domain/errors/duplicate-aka'
import { GenreCycleError } from '../domain/errors/genre-cycle'
import { InvalidGenreRelevanceError } from '../domain/errors/invalid-genre-relevance'
import { SelfInfluenceError } from '../domain/errors/self-influence'

export type GenreCommandsRouter = ReturnType<typeof createCommandsRouter>

export function createCommandsRouter(
  application: GenreCommandsApplication,
  authenticationService: IAuthenticationService,
) {
  const requireUser = bearerAuth(authenticationService)

  const app = new Hono()
    .post('/genres', zodValidator('json', genreSchema), requireUser, async (c) => {
      const body = c.req.valid('json')
      const user = c.var.user

      const result = await application.createGenre(
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

      if (
        result instanceof SelfInfluenceError ||
        result instanceof DuplicateAkaError ||
        result instanceof DerivedChildError ||
        result instanceof DerivedInfluenceError
      ) {
        return setError(c, result, 400)
      }

      return c.json({ success: true, id: result.id } as const)
    })

    .delete(
      '/genres/:id',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      requireUser,
      async (c) => {
        const id = c.req.valid('param').id
        const user = c.var.user

        const result = await application.deleteGenre(id, user.id)

        if (result instanceof GenreNotFoundError) {
          return setError(c, result, 404)
        }

        return c.json({ success: true } as const)
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

        const result = await application.updateGenre(
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

        if (
          result instanceof SelfInfluenceError ||
          result instanceof DuplicateAkaError ||
          result instanceof DerivedChildError ||
          result instanceof DerivedInfluenceError ||
          result instanceof GenreCycleError
        ) {
          return setError(c, result, 400)
        }

        if (result instanceof GenreNotFoundError) {
          return setError(c, result, 404)
        }

        return c.json({ success: true } as const)
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

        const result = await application.voteGenreRelevance(id, body.relevanceVote, user.id)

        if (result instanceof InvalidGenreRelevanceError) {
          return setError(c, result, 400)
        }

        return c.json({ success: true } as const)
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
