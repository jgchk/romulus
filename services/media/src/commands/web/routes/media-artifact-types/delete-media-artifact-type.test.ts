import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { okAsync } from 'neverthrow'
import { expect, it } from 'vitest'

import { createDeleteMediaArtifactTypeCommandHandler } from '../../../application/media-artifact-types/delete-media-artifact-type.js'
import { MediaPermission } from '../../../domain/permissions.js'
import { createAuthorizationMiddleware } from '../../authorization-middleware.js'
import { createBearerAuthMiddleware } from '../../bearer-auth-middleware.js'
import type { DeleteMediaArtifactTypeRouteDependencies } from './delete-media-artifact-type.js'
import { createDeleteMediaArtifactTypeRoute } from './delete-media-artifact-type.js'

function setup(options: Partial<DeleteMediaArtifactTypeRouteDependencies> = {}) {
  const bearerAuth = createBearerAuthMiddleware({
    whoami: () => okAsync({ id: 0 }),
  })

  const route = createDeleteMediaArtifactTypeRoute({
    authz: createAuthorizationMiddleware({
      hasPermission: () => Promise.resolve(true),
    }),
    deleteMediaArtifactType: createDeleteMediaArtifactTypeCommandHandler({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),

    ...options,
  })

  const router = new Hono().use(bearerAuth).delete('/:id', ...route)

  const client = testClient(router)

  return { client }
}

it('deletes a media artifact type', async () => {
  const { client } = setup()

  const response = await client[':id'].$delete(
    { param: { id: 'test' } },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )

  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({
    success: true,
  })
})

it('returns a 401 if the user is not authenticated', async () => {
  const { client } = setup()

  const response = await client[':id'].$delete({ param: { id: 'test' } }, { headers: {} })
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

it('returns a 403 if the user does not have permission', async () => {
  const { client } = setup({
    authz: createAuthorizationMiddleware({
      hasPermission: (userId, permission) => {
        if (permission === MediaPermission.WriteMediaArtifactTypes) {
          return Promise.resolve(false)
        } else {
          return Promise.resolve(true)
        }
      },
    }),
  })

  const response = await client[':id'].$delete(
    { param: { id: 'test' } },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )
  expect(response.status).toBe(403)
  expect(await response.json()).toEqual({
    success: false,
    error: { name: 'UnauthorizedError', message: 'You are not authorized', statusCode: 403 },
  })
})
