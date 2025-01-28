import { createRoute, z } from '@hono/zod-openapi'

const permissionSchema = z.object({ name: z.string().min(1), description: z.string().optional() })

const roleSchema = z.object({
  name: z.string().min(1),
  permissions: z.string().array(),
  description: z.string().optional(),
})

const ValidationErrorSchema = z.object({
  name: z.literal('ValidationError'),
  message: z.string(),
  details: z.object({
    target: z.union([
      z.literal('json'),
      z.literal('form'),
      z.literal('query'),
      z.literal('param'),
      z.literal('header'),
      z.literal('cookie'),
    ]),
    issues: z.object({ code: z.string(), message: z.string() }).array(),
  }),
  statusCode: z.literal(400),
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

export const createPermissionRoute = createRoute({
  method: 'post',
  path: '/permissions',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            permission: permissionSchema,
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
      description: 'The permission was created successfully',
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
      description: 'The user is not authorized to perform this action',
    },
    409: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              name: z.literal('DuplicatePermissionError'),
              message: z.string(),
              statusCode: z.literal(409),
            }),
          }),
        },
      },
      description: 'A permission with the given name already exists',
    },
  },
})

export const ensurePermissionsRoute = createRoute({
  method: 'put',
  path: '/permissions',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            permissions: permissionSchema.array(),
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
      description: 'Permissions were ensured successfully',
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
      description: 'The user is not authorized to perform this action',
    },
  },
})

export const deletePermissionRoute = createRoute({
  method: 'delete',
  path: '/permissions/{name}',
  request: {
    params: z.object({
      name: z.string(),
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
      description: 'Permission was deleted successfully',
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
      description: 'The user is not authorized to perform this action',
    },
  },
})

export const createRoleRoute = createRoute({
  method: 'post',
  path: '/roles',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            role: roleSchema,
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
      description: 'Role was created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.union([
              ValidationErrorSchema,
              z.object({
                name: z.literal('PermissionNotFoundError'),
                message: z.string(),
                statusCode: z.literal(400),
              }),
            ]),
          }),
        },
      },
      description: 'The request is invalid or references non-existent permissions',
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
      description: 'The user is not authorized to perform this action',
    },
  },
})

export const deleteRoleRoute = createRoute({
  method: 'delete',
  path: '/roles/{name}',
  request: {
    params: z.object({
      name: z.string(),
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
      description: 'Role was deleted successfully',
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
      description: 'The user is not authorized to perform this action',
    },
  },
})

export const assignRoleToUserRoute = createRoute({
  method: 'put',
  path: '/users/{id}/roles',
  request: {
    params: z.object({
      id: z.coerce.number().int(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
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
      description: 'Role was assigned to user successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.union([
              ValidationErrorSchema,
              z.object({
                name: z.literal('RoleNotFoundError'),
                message: z.string(),
                statusCode: z.literal(400),
              }),
            ]),
          }),
        },
      },
      description: 'The request is invalid or references a non-existent role',
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
      description: 'The user is not authorized to perform this action',
    },
  },
})

export const checkMyPermissionRoute = createRoute({
  method: 'get',
  path: '/me/permissions/{permission}',
  request: {
    params: z.object({
      permission: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            hasPermission: z.boolean(),
          }),
        },
      },
      description: 'Permission check completed successfully',
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
  },
})

export const getMyPermissionsRoute = createRoute({
  method: 'get',
  path: '/me/permissions',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            permissions: z.string().array(),
          }),
        },
      },
      description: 'Retrieved user permissions successfully',
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
      description: 'The user is not authorized to perform this action',
    },
  },
})
