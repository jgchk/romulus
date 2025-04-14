import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { okAsync } from 'neverthrow'
import { expect, it } from 'vitest'

import { createCreateMediaArtifactTypeCommandHandler } from '../../../application/media-artifact-types/create-media-artifact-type.js'
import { createDefaultMediaTypesProjection } from '../../../domain/media-types/media-types-projection.js'
import { MediaPermission } from '../../../domain/permissions.js'
import { createAuthorizationMiddleware } from '../../authorization-middleware.js'
import { createBearerAuthMiddleware } from '../../bearer-auth-middleware.js'
import {
  createCreateMediaArtifactTypeRoute,
  type CreateMediaArtifactTypeRouteDependencies,
} from './create-media-artifact-type.js'

function setup(options: Partial<CreateMediaArtifactTypeRouteDependencies> = {}) {
  const bearerAuth = createBearerAuthMiddleware({
    whoami: () => okAsync({ id: 0 }),
  })

  const route = createCreateMediaArtifactTypeRoute({
    authz: createAuthorizationMiddleware({
      hasPermission: () => Promise.resolve(true),
    }),
    createMediaArtifactType: createCreateMediaArtifactTypeCommandHandler({
      getMediaTypes: () => createDefaultMediaTypesProjection(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),

    ...options,
  })

  const router = new Hono().use(bearerAuth).post('/', ...route)

  const client = testClient(router)

  return { client }
}

it('creates a media artifact type', async () => {
  const { client } = setup()

  const response = await client.index.$post(
    { json: { id: 'test', name: 'Test', mediaTypes: [] } },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ success: true })
})

it('returns a 401 if the user is not authenticated', async () => {
  const { client } = setup()

  const response = await client.index.$post(
    { json: { id: 'test', name: 'Test', mediaTypes: [] } },
    { headers: {} },
  )
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

  const response = await client.index.$post(
    { json: { id: 'test', name: 'Test', mediaTypes: [] } },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )
  expect(response.status).toBe(403)
  expect(await response.json()).toEqual({
    success: false,
    error: { name: 'UnauthorizedError', message: 'You are not authorized', statusCode: 403 },
  })
})

it('returns a 422 if the media type does not exist', async () => {
  const { client } = setup()

  const response = await client.index.$post(
    { json: { id: 'test', name: 'Test', mediaTypes: ['media-type'] } },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )
  expect(response.status).toBe(422)
  expect(await response.json()).toEqual({
    success: false,
    error: {
      name: 'MediaTypeNotFoundError',
      message: "Media type with ID 'media-type' not found",
      statusCode: 422,
    },
  })
})

it('returns an error if the request body is invalid', async () => {
  const { client } = setup()

  const response = await client.index.$post(
    // @ts-expect-error - testing an invalid request body
    { json: { foo: 'bar' } },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )
  expect(response.status).toBe(400)
  expect(await response.json()).toEqual({
    success: false,
    error: {
      name: 'BadRequestError',
      message:
        'id must be a string (was missing)\nmediaTypes must be an array (was missing)\nname must be a string (was missing)',
      statusCode: 400,
    },
  })
})
