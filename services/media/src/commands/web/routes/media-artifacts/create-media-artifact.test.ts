import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { okAsync } from 'neverthrow'
import { expect, it } from 'vitest'

import { mediaArtifactTypeCreatedEvent } from '../../../../common/domain/events.js'
import { createCreateMediaArtifactCommandHandler } from '../../../application/media-artifacts/create-media-artifact.js'
import {
  createDefaultMediaArtifactTypesProjection,
  createMediaArtifactTypesProjectionFromEvents,
} from '../../../domain/media-artifact-types/media-artifact-types-projection.js'
import { MediaPermission } from '../../../domain/permissions.js'
import { createAuthorizationMiddleware } from '../../authorization-middleware.js'
import { createBearerAuthMiddleware } from '../../bearer-auth-middleware.js'
import type { CreateMediaArtifactRouteDependencies } from './create-media-artifact.js'
import { createCreateMediaArtifactRoute } from './create-media-artifact.js'

function setup(options: Partial<CreateMediaArtifactRouteDependencies> = {}) {
  const bearerAuth = createBearerAuthMiddleware({
    whoami: () => okAsync({ id: 0 }),
  })

  const route = createCreateMediaArtifactRoute({
    authz: createAuthorizationMiddleware({
      hasPermission: () => Promise.resolve(true),
    }),
    createMediaArtifact: createCreateMediaArtifactCommandHandler(
      () => createDefaultMediaArtifactTypesProjection(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ),
    ...options,
  })

  const router = new Hono().use(bearerAuth).post('/', ...route)

  const client = testClient(router)

  return { client }
}

it('creates a media artifact', async () => {
  const { client } = setup({
    createMediaArtifact: createCreateMediaArtifactCommandHandler(
      () =>
        createMediaArtifactTypesProjectionFromEvents([
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'test-type', name: 'Test Type', mediaTypes: [] },
            userId: 0,
          }),
        ]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ),
  })

  const response = await client.index.$post(
    { json: { id: 'test-artifact', name: 'Test Artifact', mediaArtifactType: 'test-type' } },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ success: true })
})

it('returns 400 when the request body is invalid', async () => {
  const { client } = setup()

  // Missing mediaArtifactType
  const response = await client.index.$post(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    { json: { id: 'test-artifact', name: 'Test Artifact', mediaArtifactType: undefined as any } },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(400)
  expect(await response.json()).toEqual({
    success: false,
    error: {
      name: 'BadRequestError',
      message: 'mediaArtifactType must be a string (was missing)',
      statusCode: 400,
    },
  })
})

it('returns 401 if the user is not authenticated', async () => {
  const { client } = setup()

  const response = await client.index.$post({
    json: { id: 'test-artifact', name: 'Test Artifact', mediaArtifactType: 'test-type' },
  })
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
        if (permission === MediaPermission.WriteMediaArtifacts) {
          return Promise.resolve(false)
        } else {
          return Promise.resolve(true)
        }
      },
    }),
  })

  const response = await client.index.$post(
    { json: { id: 'test-artifact', name: 'Test Artifact', mediaArtifactType: 'test-type' } },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(403)
  expect(await response.json()).toEqual({
    success: false,
    error: { name: 'UnauthorizedError', message: 'You are not authorized', statusCode: 403 },
  })
})

it('returns 422 error if media artifact type does not exist', async () => {
  const { client } = setup()

  const response = await client.index.$post(
    {
      json: {
        id: 'test-artifact',
        name: 'Test Artifact',
        mediaArtifactType: 'non-existent-type',
      },
    },
    { headers: { authorization: `Bearer 000-000-000` } },
  )
  expect(response.status).toBe(422)
  expect(await response.json()).toEqual({
    success: false,
    error: {
      name: 'MediaArtifactTypeNotFoundError',
      message: `Media artifact type with ID 'non-existent-type' not found`,
      statusCode: 422,
    },
  })
})
