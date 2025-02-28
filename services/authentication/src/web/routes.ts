import { createRoute, z } from '@hono/zod-openapi'

const passwordSchema = z.string().min(8).max(72)

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

const HeadersSchema = z.object({
  authorization: z.string().openapi({
    example: 'Bearer SECRET',
  }),
})

export const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({ username: z.string(), password: z.string() }),
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
            token: z.string(),
            expiresAt: z.string().openapi({ format: 'date-time' }),
          }),
        },
      },
      description: 'The access token and its expiry for the authenticated user',
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
      description: 'The request is invalid',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('InvalidLoginError'),
              message: z.string(),
              statusCode: z.literal(401),
            }),
          }),
        },
      },
      description: 'The provided credentials are invalid',
    },
  },
})

export const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  security: [{ Bearer: [] }],
  request: {
    headers: HeadersSchema,
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
      description: 'The user was logged out successfully',
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
      description: 'The request is invalid',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('UnauthorizedError'),
              message: z.string(),
              statusCode: z.literal(401),
            }),
          }),
        },
      },
      description: 'The user is not authorized to perform this action',
    },
  },
})

export const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({ username: z.string().min(3).max(72), password: passwordSchema }),
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
            token: z.string(),
            expiresAt: z.string().openapi({ format: 'date-time' }),
          }),
        },
      },
      description: 'The access token and its expiry for the authenticated user',
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
      description: 'The request is invalid',
    },
    409: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('NonUniqueUsernameError'),
              message: z.string(),
              statusCode: z.literal(409),
            }),
          }),
        },
      },
      description: 'The username is already taken',
    },
  },
})

export const deleteAccountRoute = createRoute({
  method: 'delete',
  path: '/accounts/{id}',
  security: [{ Bearer: [] }],
  request: {
    headers: HeadersSchema,
    params: z.object({ id: z.coerce.number().int() }),
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
      description: 'The password reset link for the user',
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
      description: 'The request is invalid',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('UnauthorizedError'),
              message: z.string(),
              statusCode: z.literal(401),
            }),
          }),
        },
      },
      description: 'The user is not authorized to perform this action',
    },
  },
})

export const requestPasswordResetRoute = createRoute({
  method: 'post',
  path: '/request-password-reset/{userId}',
  security: [{ Bearer: [] }],
  request: {
    headers: HeadersSchema,
    params: z.object({ userId: z.coerce.number().int() }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            passwordResetLink: z.string(),
          }),
        },
      },
      description: 'The password reset link for the user',
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
      description: 'The request is invalid',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('UnauthorizedError'),
              message: z.string(),
              statusCode: z.literal(401),
            }),
          }),
        },
      },
      description: 'The user is not authorized to perform this action',
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('AccountNotFoundError'),
              message: z.string(),
              statusCode: z.literal(404),
            }),
          }),
        },
      },
      description: 'The requested user does not exist',
    },
  },
})

export const resetPasswordRoute = createRoute({
  method: 'post',
  path: '/reset-password/{token}',
  request: {
    params: z.object({ token: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({ password: passwordSchema }),
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
            token: z.string(),
            expiresAt: z.string().openapi({ format: 'date-time' }),
          }),
        },
      },
      description: 'The access token and its expiry for the authenticated user',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: ValidationErrorSchema.or(
              z.object({
                name: z.literal('InvalidPasswordResetTokenError'),
                message: z.string(),
                statusCode: z.literal(400),
              }),
            ),
          }),
        },
      },
      description: 'The request is invalid',
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('AccountNotFoundError'),
              message: z.string(),
              statusCode: z.literal(404),
            }),
          }),
        },
      },
      description: 'The requested user does not exist',
    },
  },
})

export const whoamiRoute = createRoute({
  method: 'get',
  path: '/whoami',
  security: [{ Bearer: [] }],
  request: {
    headers: HeadersSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            account: z.object({
              id: z.number().int(),
              username: z.string(),
            }),
            session: z.object({
              expiresAt: z.string().openapi({ format: 'date-time' }),
            }),
          }),
        },
      },
      description: 'The account and session for the authenticated user',
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
      description: 'The request is invalid',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('UnauthorizedError'),
              message: z.string(),
              statusCode: z.literal(401),
            }),
          }),
        },
      },
      description: 'The user is not authorized to perform this action',
    },
  },
})

export const getAccountRoute = createRoute({
  method: 'get',
  path: '/accounts/{id}',
  request: {
    params: z.object({ id: z.coerce.number().int() }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            account: z.object({
              id: z.number().int(),
              username: z.string(),
            }),
          }),
        },
      },
      description: 'The requested account',
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
      description: 'The request is invalid',
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('AccountNotFoundError'),
              message: z.string(),
              statusCode: z.literal(404),
            }),
          }),
        },
      },
      description: 'The requested account does not exist',
    },
  },
})

export const getAccountsRoute = createRoute({
  method: 'get',
  path: '/accounts',
  security: [{ Bearer: [] }],
  request: {
    query: z.object({
      id: z.coerce.number().int().array().or(z.coerce.number().int()),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            accounts: z
              .object({
                id: z.number().int(),
                username: z.string(),
              })
              .array(),
          }),
        },
      },
      description: 'List of requested accounts',
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
      description: 'The request is invalid',
    },
  },
})

export const refreshSessionRoute = createRoute({
  method: 'post',
  path: '/refresh-session',
  security: [{ Bearer: [] }],
  request: {
    headers: HeadersSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            token: z.string(),
            expiresAt: z.string().openapi({ format: 'date-time' }),
          }),
        },
      },
      description: 'The refreshed session token and its expiry',
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
      description: 'The request is invalid',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('UnauthorizedError'),
              message: z.string(),
              statusCode: z.literal(401),
            }),
          }),
        },
      },
      description: 'The user is not authorized to perform this action',
    },
  },
})

export const createApiKeyRoute = createRoute({
  method: 'post',
  path: '/me/api-keys',
  security: [{ Bearer: [] }],
  request: {
    headers: HeadersSchema,
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(1),
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
            id: z.number().int(),
            name: z.string(),
            key: z.string(),
          }),
        },
      },
      description: 'The created API key',
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
      description: 'The request is invalid',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('UnauthorizedError'),
              message: z.string(),
              statusCode: z.literal(401),
            }),
          }),
        },
      },
      description: 'The user is not authorized to perform this action',
    },
  },
})

export const deleteApiKeyRoute = createRoute({
  method: 'delete',
  path: '/me/api-keys/{id}',
  security: [{ Bearer: [] }],
  request: {
    headers: HeadersSchema,
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
      description: 'The API key was deleted successfully',
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
      description: 'The request is invalid',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('UnauthorizedError'),
              message: z.string(),
              statusCode: z.literal(401),
            }),
          }),
        },
      },
      description: 'The user is not authorized to perform this action',
    },
  },
})

export const getApiKeysRoute = createRoute({
  method: 'get',
  path: '/me/api-keys',
  security: [{ Bearer: [] }],
  request: {
    headers: HeadersSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            keys: z.array(
              z.object({
                id: z.number().int(),
                name: z.string(),
                createdAt: z.string().openapi({ format: 'date-time' }),
              }),
            ),
          }),
        },
      },
      description: 'List of API keys for the authenticated user',
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
      description: 'The request is invalid',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('UnauthorizedError'),
              message: z.string(),
              statusCode: z.literal(401),
            }),
          }),
        },
      },
      description: 'The user is not authorized to perform this action',
    },
  },
})

export const validateApiKeyRoute = createRoute({
  method: 'post',
  path: '/validate-api-key/{key}',
  request: {
    params: z.object({
      key: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            valid: z.boolean(),
          }),
        },
      },
      description: 'The validation result for the API key',
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
      description: 'The request is invalid',
    },
  },
})
