import { createRoute, z } from '@hono/zod-openapi'

import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '../config.js'
import {
  GENRE_OPERATIONS,
  GENRE_TYPES,
  UNSET_GENRE_RELEVANCE,
} from '../infrastructure/drizzle-schema.js'

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
    {
      message: `Relevance must be between ${MIN_GENRE_RELEVANCE} and ${MAX_GENRE_RELEVANCE} (inclusive), or ${UNSET_GENRE_RELEVANCE}`,
    },
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

  nsfw: z.boolean(),
})

const ValidationErrorSchema = z.object({
  name: z.literal('ValidationError'),
  message: z.string(),
  details: z.object({
    target: z.enum(['json', 'form', 'query', 'param', 'header', 'cookie']),
    issues: z
      .object({
        path: z.string().or(z.number()).array(),
        message: z.string(),
        fatal: z.boolean().optional(),
      })
      .array(),
  }),
  statusCode: z.literal(400),
})

const DuplicateAkaErrorSchema = z.object({
  name: z.literal('DuplicateAkaError'),
  message: z.string(),
  details: z.object({
    aka: z.string(),
    level: z.enum(['primary', 'secondary', 'tertiary']),
  }),
})

const UnauthenticatedErrorSchema = z.object({
  name: z.literal('UnauthenticatedError'),
  message: z.string(),
  statusCode: z.literal(401),
})

const UnauthorizedErrorSchema = z.object({
  name: z.literal('UnauthorizedError'),
  message: z.string(),
  statusCode: z.literal(403),
})

const NotFoundErrorSchema = z.object({
  name: z.literal('GenreNotFoundError'),
  message: z.string(),
  statusCode: z.literal(404),
})

export const createGenreRoute = createRoute({
  method: 'post',
  path: '/genres',
  request: {
    body: {
      content: {
        'application/json': {
          schema: genreSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            id: z.number().int(),
          }),
        },
      },
      description: 'Genre created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.union([
              ValidationErrorSchema,
              DuplicateAkaErrorSchema,
              z.object({
                name: z.union([
                  z.literal('SelfInfluenceError'),
                  z.literal('DerivedChildError'),
                  z.literal('DerivedInfluenceError'),
                ]),
                message: z.string(),
                statusCode: z.literal(400),
              }),
            ]),
          }),
        },
      },
      description: 'Invalid request or validation error',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: UnauthenticatedErrorSchema,
          }),
        },
      },
      description: 'The user is not authenticated',
    },
    403: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: UnauthorizedErrorSchema,
          }),
        },
      },
      description: 'User is not authorized',
    },
  },
})

export const deleteGenreRoute = createRoute({
  method: 'delete',
  path: '/genres/{id}',
  request: {
    params: z.object({
      id: z.coerce.number().int(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
          }),
        },
      },
      description: 'Genre deleted successfully',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: UnauthenticatedErrorSchema,
          }),
        },
      },
      description: 'The user is not authenticated',
    },
    403: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: UnauthorizedErrorSchema,
          }),
        },
      },
      description: 'User is not authorized',
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: NotFoundErrorSchema,
          }),
        },
      },
      description: 'Genre not found',
    },
  },
})

export const updateGenreRoute = createRoute({
  method: 'put',
  path: '/genres/{id}',
  request: {
    params: z.object({
      id: z.coerce.number().int(),
    }),
    body: {
      content: {
        'application/json': {
          schema: genreSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
          }),
        },
      },
      description: 'Genre updated successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.union([
              ValidationErrorSchema,
              DuplicateAkaErrorSchema,
              z.object({
                name: z.union([
                  z.literal('SelfInfluenceError'),
                  z.literal('DerivedChildError'),
                  z.literal('DerivedInfluenceError'),
                  z.literal('GenreCycleError'),
                ]),
                message: z.string(),
                statusCode: z.literal(400),
              }),
            ]),
          }),
        },
      },
      description: 'Invalid request or validation error',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: UnauthenticatedErrorSchema,
          }),
        },
      },
      description: 'The user is not authenticated',
    },
    403: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: UnauthorizedErrorSchema,
          }),
        },
      },
      description: 'User is not authorized',
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: NotFoundErrorSchema,
          }),
        },
      },
      description: 'Genre not found',
    },
  },
})

export const voteGenreRelevanceRoute = createRoute({
  method: 'post',
  path: '/genres/{id}/relevance/votes',
  request: {
    params: z.object({
      id: z.coerce.number().int(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            relevanceVote: genreRelevance,
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
          }),
        },
      },
      description: 'Vote recorded successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.union([
              ValidationErrorSchema,
              z.object({
                name: z.literal('InvalidGenreRelevanceError'),
                message: z.string(),
                statusCode: z.literal(400),
              }),
            ]),
          }),
        },
      },
      description: 'Invalid relevance vote',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: UnauthenticatedErrorSchema,
          }),
        },
      },
      description: 'The user is not authenticated',
    },
    403: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: UnauthorizedErrorSchema,
          }),
        },
      },
      description: 'User is not authorized',
    },
  },
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

export const getAllGenresRoute = createRoute({
  method: 'get',
  path: '/genres',
  request: {
    query: z.object({
      skip: z.coerce.number().int().optional(),
      limit: z.coerce.number().int().min(0).max(100).optional(),
      include: z.enum(FIND_ALL_INCLUDE).array().optional(),
      name: z.string().optional(),
      subtitle: z.string().optional(),
      type: z.enum(GENRE_TYPES).optional(),
      relevance: genreRelevance.optional(),
      nsfw: z
        .enum(['true', 'false'])
        .transform((val) => val === 'true')
        .optional(),
      shortDescription: z.string().optional(),
      longDescription: z.string().optional(),
      notes: z.string().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      createdBy: z.coerce.number().int().optional(),
      parent: z.coerce.number().int().array().optional(),
      ancestor: z.coerce.number().int().array().optional(),
      sort: z.enum(FIND_ALL_SORT_FIELD).optional(),
      order: z.enum(FIND_ALL_SORT_ORDER).optional(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(
              z.object({
                id: z.number().int(),
                name: z.string(),
                subtitle: z.string().nullable(),
                shortDescription: z.string().nullable(),
                longDescription: z.string().nullable(),
                notes: z.string().nullable(),
                type: z.enum(GENRE_TYPES),
                relevance: genreRelevance,
                nsfw: z.boolean(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            ),
            pagination: z.object({
              skip: z.number().int(),
              limit: z.number().int(),
              total: z.number().int(),
            }),
          }),
        },
      },
      description: 'Retrieved genres successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: ValidationErrorSchema,
          }),
        },
      },
      description: 'Invalid request',
    },
  },
})

export const getGenreHistoryByAccountRoute = createRoute({
  method: 'get',
  path: '/genres/history/by-account/{accountId}',
  request: {
    params: z.object({
      accountId: z.coerce.number().int(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            history: z
              .object({
                id: z.number().int(),
                name: z.string(),
                type: z.enum(GENRE_TYPES),
                subtitle: z.string().nullable(),
                operation: z.enum(GENRE_OPERATIONS),
                createdAt: z.string(),
                treeGenreId: z.number().int(),
                nsfw: z.boolean(),
              })
              .array(),
          }),
        },
      },
      description: 'Retrieved genre history successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: ValidationErrorSchema,
          }),
        },
      },
      description: 'Invalid request',
    },
  },
})

export const getGenreHistoryRoute = createRoute({
  method: 'get',
  path: '/genres/{id}/history',
  request: {
    params: z.object({
      id: z.coerce.number().int(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            history: z
              .object({
                id: z.number().int(),
                name: z.string(),
                subtitle: z.string().nullable(),
                akas: z.string().array(),
                type: z.enum(GENRE_TYPES),
                shortDescription: z.string().nullable(),
                longDescription: z.string().nullable(),
                nsfw: z.boolean(),
                notes: z.string().nullable(),
                parentGenreIds: z.number().int().array(),
                derivedFromGenreIds: z.number().int().array(),
                influencedByGenreIds: z.number().int().array(),
                treeGenreId: z.number().int(),
                createdAt: z.date(),
                operation: z.enum(GENRE_OPERATIONS),
                accountId: z.number().int().nullable(),
              })
              .array(),
          }),
        },
      },
      description: 'Retrieved genre history successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: ValidationErrorSchema,
          }),
        },
      },
      description: 'Invalid request',
    },
  },
})

export const getGenreRelevanceVoteByAccountRoute = createRoute({
  method: 'get',
  path: '/genres/{id}/relevance/votes/{accountId}',
  request: {
    params: z.object({
      id: z.coerce.number().int(),
      accountId: z.coerce.number().int(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            vote: z
              .object({
                genreId: z.number().int(),
                accountId: z.number().int(),
                relevance: genreRelevance,
                createdAt: z.string(),
                updatedAt: z.string(),
              })
              .optional(),
          }),
        },
      },
      description: 'Retrieved vote successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: ValidationErrorSchema,
          }),
        },
      },
      description: 'Invalid request',
    },
  },
})

export const getGenreRelevanceVotesByGenreRoute = createRoute({
  method: 'get',
  path: '/genres/{id}/relevance/votes',
  request: {
    params: z.object({
      id: z.coerce.number().int(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            votes: z
              .object({
                genreId: z.number().int(),
                accountId: z.number().int(),
                relevance: genreRelevance,
                createdAt: z.string(),
                updatedAt: z.string(),
              })
              .array(),
          }),
        },
      },
      description: 'Retrieved vote successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: ValidationErrorSchema,
          }),
        },
      },
      description: 'Invalid request',
    },
  },
})

export const getGenreTreeRoute = createRoute({
  method: 'get',
  path: '/genre-tree',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            tree: z.array(
              z.object({
                id: z.number().int(),
                name: z.string(),
                subtitle: z.string().nullable(),
                type: z.enum(GENRE_TYPES),
                akas: z.string().array(),
                parents: z.number().int().array(),
                children: z.number().int().array(),
                derivedFrom: z.number().int().array(),
                derivations: z.number().int().array(),
                relevance: z.number().int(),
                nsfw: z.boolean(),
                updatedAt: z.date(),
              }),
            ),
          }),
        },
      },
      description: 'Retrieved genre tree successfully',
    },
  },
})

export const getGenreRoute = createRoute({
  method: 'get',
  path: '/genres/{id}',
  request: {
    params: z.object({
      id: z.coerce.number().int(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            genre: z.object({
              id: z.number().int(),
              name: z.string(),
              subtitle: z.string().nullable(),
              type: z.enum(GENRE_TYPES),
              relevance: genreRelevance,
              nsfw: z.boolean(),
              shortDescription: z.string().nullable(),
              longDescription: z.string().nullable(),
              notes: z.string().nullable(),
              createdAt: z.string(),
              updatedAt: z.string(),
              akas: z.object({
                primary: z.string().array(),
                secondary: z.string().array(),
                tertiary: z.string().array(),
              }),
              parents: z
                .object({
                  id: z.number().int(),
                  name: z.string(),
                  type: z.enum(GENRE_TYPES),
                  subtitle: z.string().nullable(),
                  nsfw: z.boolean(),
                })
                .array(),
              children: z
                .object({
                  id: z.number().int(),
                  name: z.string(),
                  type: z.enum(GENRE_TYPES),
                })
                .array(),
              derivedFrom: z
                .object({
                  id: z.number().int(),
                  name: z.string(),
                  type: z.enum(GENRE_TYPES),
                  subtitle: z.string().nullable(),
                  nsfw: z.boolean(),
                })
                .array(),
              influencedBy: z
                .object({
                  id: z.number().int(),
                  name: z.string(),
                  type: z.enum(GENRE_TYPES),
                  subtitle: z.string().nullable(),
                  nsfw: z.boolean(),
                })
                .array(),
              influences: z
                .object({
                  id: z.number().int(),
                  name: z.string(),
                  type: z.enum(GENRE_TYPES),
                  subtitle: z.string().nullable(),
                  nsfw: z.boolean(),
                })
                .array(),
              contributors: z.number().int().array(),
            }),
          }),
        },
      },
      description: 'Retrieved genre successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: ValidationErrorSchema,
          }),
        },
      },
      description: 'Invalid request',
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: NotFoundErrorSchema,
          }),
        },
      },
      description: 'Genre not found',
    },
  },
})

export const getLatestGenreUpdatesRoute = createRoute({
  method: 'get',
  path: '/latest-genre-updates',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            latestUpdates: z
              .object({
                genre: z.object({
                  id: z.number().int(),
                  name: z.string(),
                  subtitle: z.string().nullable(),
                  akas: z.object({
                    primary: z.string().array(),
                    secondary: z.string().array(),
                    tertiary: z.string().array(),
                  }),
                  type: z.enum(GENRE_TYPES),
                  nsfw: z.boolean(),
                  shortDescription: z.string().nullable(),
                  longDescription: z.string().nullable(),
                  notes: z.string().nullable(),
                  parentGenreIds: z.number().int().array(),
                  derivedFromGenreIds: z.number().int().array(),
                  influencedByGenreIds: z.number().int().array(),
                  treeGenreId: z.number().int(),
                  createdAt: z.string(),
                  operation: z.enum(GENRE_OPERATIONS),
                  accountId: z.number().int().nullable(),
                }),
                previousHistory: z
                  .object({
                    name: z.string(),
                    subtitle: z.string().nullable(),
                    akas: z.object({
                      primary: z.string().array(),
                      secondary: z.string().array(),
                      tertiary: z.string().array(),
                    }),
                    type: z.enum(GENRE_TYPES),
                    nsfw: z.boolean(),
                    shortDescription: z.string().nullable(),
                    longDescription: z.string().nullable(),
                    notes: z.string().nullable(),
                    parentGenreIds: z.number().int().array(),
                    derivedFromGenreIds: z.number().int().array(),
                    influencedByGenreIds: z.number().int().array(),
                    treeGenreId: z.number().int(),
                    createdAt: z.string(),
                    operation: z.enum(GENRE_OPERATIONS),
                  })
                  .optional(),
              })
              .array(),
          }),
        },
      },
      description: 'Retrieved latest genre updates successfully',
    },
  },
})

export const getRandomGenreIdRoute = createRoute({
  method: 'get',
  path: '/random-genre',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            genre: z.number().int().optional(),
          }),
        },
      },
      description: 'Retrieved a random genre',
    },
  },
})
