import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { okAsync } from 'neverthrow'
import { expect, it } from 'vitest'

import { mediaArtifactTypeCreatedEvent } from '../../../../common/domain/events.js'
import { createUpdateMediaArtifactTypeCommandHandler } from '../../../application/media-artifact-types/update-media-artifact-type.js'
import {
  createDefaultMediaArtifactTypesProjection,
  createMediaArtifactTypesProjectionFromEvents,
} from '../../../domain/media-artifact-types/media-artifact-types-projection.js'
import {
  createDefaultMediaTypesProjection,
  createMediaTypesProjectionFromEvents,
} from '../../../domain/media-types/media-types-projection.js'
import { MediaPermission } from '../../../domain/permissions.js'
import { createAuthorizationMiddleware } from '../../authorization-middleware.js'
import { createBearerAuthMiddleware } from '../../bearer-auth-middleware.js'
import type { UpdateMediaArtifactTypeRouteDependencies } from './update-media-artifact-type.js'
import { createUpdateMediaArtifactTypeRoute } from './update-media-artifact-type.js'

function setup(options: Partial<UpdateMediaArtifactTypeRouteDependencies> = {}) {
  const bearerAuth = createBearerAuthMiddleware({
    whoami: () => okAsync({ id: 0 }),
  })

  const route = createUpdateMediaArtifactTypeRoute({
    authz: createAuthorizationMiddleware({
      hasPermission: () => Promise.resolve(true),
    }),
    updateMediaArtifactType: createUpdateMediaArtifactTypeCommandHandler({
      getMediaTypes: () => createDefaultMediaTypesProjection(),
      getMediaArtifactTypes: () => createDefaultMediaArtifactTypesProjection(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),

    ...options,
  })

  const router = new Hono().use(bearerAuth).put('/:id', ...route)

  const client = testClient(router)

  return { client }
}

it('updates a media artifact type', async () => {
  const { client } = setup({
    updateMediaArtifactType: createUpdateMediaArtifactTypeCommandHandler({
      getMediaTypes: () => createMediaTypesProjectionFromEvents([]),
      getMediaArtifactTypes: () =>
        createMediaArtifactTypesProjectionFromEvents([
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: [] },
            userId: 0,
          }),
        ]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
  })

  const response = await client[':id'].$put(
    { param: { id: 'test' }, json: { name: 'Test', mediaTypes: [] } },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ success: true })
})

it('returns a 401 if the user is not authenticated', async () => {
  const { client } = setup({
    updateMediaArtifactType: createUpdateMediaArtifactTypeCommandHandler({
      getMediaTypes: () => createMediaTypesProjectionFromEvents([]),
      getMediaArtifactTypes: () =>
        createMediaArtifactTypesProjectionFromEvents([
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: [] },
            userId: 0,
          }),
        ]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
  })

  const response = await client[':id'].$put(
    { param: { id: 'test' }, json: { name: 'Test', mediaTypes: [] } },
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
    updateMediaArtifactType: createUpdateMediaArtifactTypeCommandHandler({
      getMediaTypes: () => createMediaTypesProjectionFromEvents([]),
      getMediaArtifactTypes: () =>
        createMediaArtifactTypesProjectionFromEvents([
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: [] },
            userId: 0,
          }),
        ]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
  })

  const response = await client[':id'].$put(
    { param: { id: 'test' }, json: { name: 'Test', mediaTypes: [] } },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )
  expect(response.status).toBe(403)
  expect(await response.json()).toEqual({
    success: false,
    error: { name: 'UnauthorizedError', message: 'You are not authorized', statusCode: 403 },
  })
})

it('returns a 404 if the media artifact type does not exist', async () => {
  const { client } = setup({
    updateMediaArtifactType: createUpdateMediaArtifactTypeCommandHandler({
      getMediaTypes: () => createMediaTypesProjectionFromEvents([]),
      getMediaArtifactTypes: () => createMediaArtifactTypesProjectionFromEvents([]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
  })

  const response = await client[':id'].$put(
    { param: { id: 'test' }, json: { name: 'Test', mediaTypes: [] } },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )
  expect(response.status).toBe(404)
  expect(await response.json()).toEqual({
    success: false,
    error: {
      name: 'MediaArtifactTypeNotFoundError',
      message: "Media artifact type with ID 'test' not found",
      statusCode: 404,
    },
  })
})

it('returns a 422 if the media type does not exist', async () => {
  const { client } = setup({
    updateMediaArtifactType: createUpdateMediaArtifactTypeCommandHandler({
      getMediaTypes: () => createMediaTypesProjectionFromEvents([]),
      getMediaArtifactTypes: () =>
        createMediaArtifactTypesProjectionFromEvents([
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: [] },
            userId: 0,
          }),
        ]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
  })

  const response = await client[':id'].$put(
    { param: { id: 'test' }, json: { name: 'Test', mediaTypes: ['media-type'] } },
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

  const response = await client[':id'].$put(
    // @ts-expect-error - testing an invalid request body
    { json: { foo: 'bar' } },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )
  expect(response.status).toBe(400)
  expect(await response.json()).toEqual({
    success: false,
    error: {
      name: 'BadRequestError',
      message: 'mediaTypes must be an array (was missing)\nname must be a string (was missing)',
      statusCode: 400,
    },
  })
})
