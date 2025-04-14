import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { okAsync } from 'neverthrow'
import { expect, it } from 'vitest'

import { createCreateMediaTypeCommandHandler } from '../../../application/media-types/create-media-type.js'
import { createDefaultMediaTypesProjection } from '../../../domain/media-types/media-types-projection.js'
import { MediaPermission } from '../../../domain/permissions.js'
import { createAuthorizationMiddleware } from '../../authorization-middleware.js'
import { createBearerAuthMiddleware } from '../../bearer-auth-middleware.js'
import {
  createCreateMediaTypeRoute,
  type CreateMediaTypeRouteDependencies,
} from './create-media-type.js'

function setup(options: Partial<CreateMediaTypeRouteDependencies> = {}) {
  const bearerAuth = createBearerAuthMiddleware({
    whoami: () => okAsync({ id: 0 }),
  })

  const route = createCreateMediaTypeRoute({
    authz: createAuthorizationMiddleware({
      hasPermission: () => Promise.resolve(true),
    }),
    createMediaType: createCreateMediaTypeCommandHandler(
      () => createDefaultMediaTypesProjection(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ),

    ...options,
  })

  const router = new Hono().use(bearerAuth).post('/', ...route)

  const client = testClient(router)

  return { client }
}

it('creates a media type', async () => {
  const { client } = setup()

  const response = await client.index.$post(
    { json: { id: 'test', name: 'Test', parents: [] } },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ success: true })
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

  const response = await client.index.$post(
    { json: { id: 'test', name: 'Test', parents: [] } },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(403)
  expect(await response.json()).toEqual({
    success: false,
    error: { name: 'UnauthorizedError', message: 'You are not authorized', statusCode: 403 },
  })
})

it('returns 422 error if a cycle would be created', async () => {
  const { client } = setup()

  const response = await client.index.$post(
    { json: { id: 'test', name: 'Test', parents: ['test'] } },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(422)
  expect(await response.json()).toEqual({
    success: false,
    error: {
      name: 'MediaTypeTreeCycleError',
      message: 'A cycle would be created in the media type tree: Test -> Test',
      statusCode: 422,
    },
  })
})
