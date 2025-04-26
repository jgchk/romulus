import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { okAsync } from 'neverthrow'
import { expect, it } from 'vitest'

import { createDeleteMediaTypeCommandHandler } from '../../../application/media-types/delete-media-type.js'
import { MediaPermission } from '../../../domain/permissions.js'
import { createAuthorizationMiddleware } from '../../authorization-middleware.js'
import { createBearerAuthMiddleware } from '../../bearer-auth-middleware.js'
import type { DeleteMediaTypeRouteDependencies } from './delete-media-type.js'
import { createDeleteMediaTypeRoute } from './delete-media-type.js'

function setup(options: Partial<DeleteMediaTypeRouteDependencies> = {}) {
  const bearerAuth = createBearerAuthMiddleware({
    whoami: () => okAsync({ id: 0 }),
  })

  const route = createDeleteMediaTypeRoute({
    authz: createAuthorizationMiddleware({
      hasPermission: () => Promise.resolve(true),
    }),
    deleteMediaType: createDeleteMediaTypeCommandHandler(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ),

    ...options,
  })

  const router = new Hono().use(bearerAuth).delete('/:id', ...route)

  const client = testClient(router)

  return { client }
}

it('deletes a media type', async () => {
  const { client } = setup()

  const response = await client[':id'].$delete(
    { param: { id: 'test' } },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ success: true })
})

it('returns a 401 if the user is not authenticated', async () => {
  const { client } = setup()

  const response = await client[':id'].$delete({ param: { id: 'test' } })
  expect(response.status).toBe(401)
  expect(await response.json()).toEqual({
    success: false,
    error: {
      name: 'UnauthenticatedError',
      message: 'You are not authenticated',
      statusCode: 401,
    },
  })
})

it('returns 403 if user does not have permission', async () => {
  const { client } = setup({
    authz: createAuthorizationMiddleware({
      hasPermission: (userId, permission) => {
        if (permission === MediaPermission.WriteMediaTypes) {
          return Promise.resolve(false)
        } else {
          return Promise.resolve(true)
        }
      },
    }),
  })

  const response = await client[':id'].$delete(
    { param: { id: 'test' } },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(403)
  expect(await response.json()).toEqual({
    success: false,
    error: { name: 'UnauthorizedError', message: 'You are not authorized', statusCode: 403 },
  })
})
