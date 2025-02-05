import { OpenAPIHono } from '@hono/zod-openapi'

import type { CreateGenreCommand } from '../application/commands/create-genre.js'
import type { DeleteGenreCommand } from '../application/commands/delete-genre.js'
import type { GetAllGenresQuery } from '../application/commands/get-all-genres.js'
import type { GetGenreQuery } from '../application/commands/get-genre.js'
import type { GetGenreHistoryQuery } from '../application/commands/get-genre-history.js'
import type { GetGenreHistoryByAccountQuery } from '../application/commands/get-genre-history-by-account.js'
import type { GetGenreRelevanceVoteByAccountQuery } from '../application/commands/get-genre-relevance-vote-by-account.js'
import type { GetGenreRelevanceVotesByGenreQuery } from '../application/commands/get-genre-relevance-votes-by-genre.js'
import type { GetGenreTreeQuery } from '../application/commands/get-genre-tree.js'
import type { GetLatestGenreUpdatesQuery } from '../application/commands/get-latest-genre-updates.js'
import type { GetRandomGenreIdQuery } from '../application/commands/get-random-genre-id.js'
import type { UpdateGenreCommand } from '../application/commands/update-genre.js'
import type { VoteGenreRelevanceCommand } from '../application/commands/vote-genre-relevance.js'
import { GenreNotFoundError } from '../application/errors/genre-not-found.js'
import type { IAuthenticationService } from '../domain/authentication.js'
import { DerivedChildError } from '../domain/errors/derived-child.js'
import { DerivedInfluenceError } from '../domain/errors/derived-influence.js'
import { DuplicateAkaError } from '../domain/errors/duplicate-aka.js'
import { GenreCycleError } from '../domain/errors/genre-cycle.js'
import { InvalidGenreRelevanceError } from '../domain/errors/invalid-genre-relevance.js'
import { SelfInfluenceError } from '../domain/errors/self-influence.js'
import { UnauthorizedError } from '../domain/errors/unauthorized.js'
import { getBearerAuthToken, UnauthenticatedError } from './bearer-auth-middleware.js'
import {
  createGenreRoute,
  deleteGenreRoute,
  getAllGenresRoute,
  getGenreHistoryByAccountRoute,
  getGenreHistoryRoute,
  getGenreRelevanceVoteByAccountRoute,
  getGenreRelevanceVotesByGenreRoute,
  getGenreRoute,
  getGenreTreeRoute,
  getLatestGenreUpdatesRoute,
  getRandomGenreIdRoute,
  updateGenreRoute,
  voteGenreRelevanceRoute,
} from './routes.js'

export type GenresRouter = ReturnType<typeof createGenresRouter>

export type GenresRouterDependencies = {
  authentication(): IAuthenticationService
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here")
}

export function createGenresRouter(deps: GenresRouterDependencies) {
  const app = new OpenAPIHono({
    defaultHook: async (result, c) => {
      if (!result.success) {
        return c.json(
          {
            success: false,
            error: {
              name: 'ValidationError',
              message: 'Request validation failed',
              details: { target: result.target, issues: result.error.issues },
              statusCode: 400,
            },
          } as const,
          400,
        )
      }
    },
  })
    .openapi(createGenreRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const body = c.req.valid('json')

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
        (genre) => c.json({ success: true, id: genre.id } as const, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: {
                  name: 'UnauthorizedError',
                  message: err.message,
                  statusCode: 403,
                },
              } as const,
              403,
            )
          } else if (err instanceof DuplicateAkaError) {
            return c.json(
              {
                success: false,
                error: {
                  name: err.name,
                  message: err.message,
                  details: {
                    aka: err.aka,
                    level: err.level,
                  },
                  statusCode: 400,
                },
              } as const,
              400,
            )
          } else if (
            err instanceof SelfInfluenceError ||
            err instanceof DerivedChildError ||
            err instanceof DerivedInfluenceError
          ) {
            return c.json(
              {
                success: false,
                error: {
                  name: err.name,
                  message: err.message,
                  statusCode: 400,
                },
              } as const,
              400,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(deleteGenreRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const id = c.req.valid('param').id

      const result = await deps.deleteGenreCommand().execute(id, user.id)

      return result.match(
        () => c.json({ success: true } as const, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: {
                  name: 'UnauthorizedError',
                  message: err.message,
                  statusCode: 403,
                },
              } as const,
              403,
            )
          } else if (err instanceof GenreNotFoundError) {
            return c.json(
              {
                success: false,
                error: {
                  name: err.name,
                  message: err.message,
                  statusCode: 404,
                },
              } as const,
              404,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(updateGenreRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const id = c.req.valid('param').id
      const body = c.req.valid('json')

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
        () => c.json({ success: true } as const, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: {
                  name: 'UnauthorizedError',
                  message: err.message,
                  statusCode: 403,
                },
              } as const,
              403,
            )
          } else if (err instanceof DuplicateAkaError) {
            return c.json(
              {
                success: false,
                error: {
                  name: err.name,
                  message: err.message,
                  details: {
                    aka: err.aka,
                    level: err.level,
                  },
                  statusCode: 400,
                },
              } as const,
              400,
            )
          } else if (
            err instanceof SelfInfluenceError ||
            err instanceof DerivedChildError ||
            err instanceof DerivedInfluenceError ||
            err instanceof GenreCycleError
          ) {
            return c.json(
              {
                success: false,
                error: {
                  name: err.name,
                  message: err.message,
                  statusCode: 400,
                },
              } as const,
              400,
            )
          } else if (err instanceof GenreNotFoundError) {
            return c.json(
              {
                success: false,
                error: {
                  name: err.name,
                  message: err.message,
                  statusCode: 404,
                },
              } as const,
              404,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(voteGenreRelevanceRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const id = c.req.valid('param').id
      const body = c.req.valid('json')

      const result = await deps.voteGenreRelevanceCommand().execute(id, body.relevanceVote, user.id)

      return result.match(
        () => c.json({ success: true } as const, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: {
                  name: 'UnauthorizedError',
                  message: err.message,
                  statusCode: 403,
                },
              } as const,
              403,
            )
          } else if (err instanceof InvalidGenreRelevanceError) {
            return c.json(
              {
                success: false,
                error: {
                  name: err.name,
                  message: err.message,
                  statusCode: 400,
                },
              } as const,
              400,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(getAllGenresRoute, async (c) => {
      const query = c.req.valid('query')

      const genres = await deps.getAllGenresQuery().execute({
        skip: query.skip,
        limit: query.limit,
        include: query.include,
        filter: {
          name: query.name,
          subtitle: query.subtitle,
          type: query.type,
          relevance: query.relevance,
          nsfw: query.nsfw,
          shortDescription: query.shortDescription,
          longDescription: query.longDescription,
          notes: query.notes,
          createdAt: query.createdAt,
          updatedAt: query.updatedAt,
          createdBy: query.createdBy,
          parents: query.parent,
          ancestors: query.ancestor,
        },
        sort: {
          field: query.sort,
          order: query.order,
        },
      })

      return c.json({ success: true, ...genres } as const, 200)
    })
    .openapi(getGenreHistoryByAccountRoute, async (c) => {
      const accountId = c.req.valid('param').accountId
      const history = await deps.getGenreHistoryByAccountQuery().execute(accountId)
      return c.json({ success: true, history } as const, 200)
    })
    .openapi(getGenreHistoryRoute, async (c) => {
      const id = c.req.valid('param').id
      const history = await deps.getGenreHistoryQuery().execute(id)
      return c.json({ success: true, history } as const, 200)
    })
    .openapi(getGenreRelevanceVoteByAccountRoute, async (c) => {
      const { id, accountId } = c.req.valid('param')
      const vote = await deps.getGenreRelevanceVoteByAccountQuery().execute(id, accountId)
      return c.json({ success: true, vote } as const, 200)
    })
    .openapi(getGenreRelevanceVotesByGenreRoute, async (c) => {
      const id = c.req.valid('param').id
      const votes = await deps.getGenreRelevanceVotesByGenreQuery().execute(id)
      return c.json({ success: true, votes } as const, 200)
    })
    .openapi(getGenreTreeRoute, async (c) => {
      const tree = await deps.getGenreTreeQuery().execute()
      return c.json({ success: true, tree } as const)
    })
    .openapi(getGenreRoute, async (c) => {
      const id = c.req.valid('param').id
      const result = await deps.getGenreQuery().execute(id)

      return result.match(
        (genre) => c.json({ success: true, genre } as const, 200),
        (err) => {
          if (err instanceof GenreNotFoundError) {
            return c.json(
              {
                success: false,
                error: { name: 'GenreNotFoundError', message: err.message, statusCode: 404 },
              } as const,
              404,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(getLatestGenreUpdatesRoute, async (c) => {
      const latestUpdates = await deps.getLatestGenreUpdatesQuery().execute()
      return c.json({ success: true, latestUpdates } as const)
    })
    .openapi(getRandomGenreIdRoute, async (c) => {
      const genre = await deps.getRandomGenreIdQuery().execute()
      return c.json({ success: true, genre } as const)
    })

  return app
}
