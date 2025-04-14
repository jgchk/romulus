import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { okAsync } from 'neverthrow'
import { expect, it } from 'vitest'

import { mediaArtifactTypeCreatedEvent } from '../../../../common/domain/events.js'
import { createCreateMediaArtifactRelationshipTypeCommandHandler } from '../../../application/media-artifact-relationship-types/create-media-artifact-relationship-type.js'
import {
  createDefaultMediaArtifactTypesProjection,
  createMediaArtifactTypesProjectionFromEvents,
} from '../../../domain/media-artifact-types/media-artifact-types-projection.js'
import { MediaPermission } from '../../../domain/permissions.js'
import { createAuthorizationMiddleware } from '../../authorization-middleware.js'
import { createBearerAuthMiddleware } from '../../bearer-auth-middleware.js'
import {
  createCreateMediaArtifactRelationshipTypeRoute,
  type CreateMediaArtifactRelationshipTypeRouteDependencies,
} from './create-media-artifact-relationship-type.js'

function setup(options: Partial<CreateMediaArtifactRelationshipTypeRouteDependencies> = {}) {
  const bearerAuth = createBearerAuthMiddleware({
    whoami: () => okAsync({ id: 0 }),
  })

  const route = createCreateMediaArtifactRelationshipTypeRoute({
    authz: createAuthorizationMiddleware({
      hasPermission: () => Promise.resolve(true),
    }),
    createMediaArtifactRelationshipType: createCreateMediaArtifactRelationshipTypeCommandHandler({
      getMediaArtifactTypes: () => createDefaultMediaArtifactTypesProjection(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),

    ...options,
  })

  const router = new Hono().use(bearerAuth).post('/', ...route)

  const client = testClient(router)

  return { client }
}

it('creates a media artifact relationship type', async () => {
  const { client } = setup({
    createMediaArtifactRelationshipType: createCreateMediaArtifactRelationshipTypeCommandHandler({
      getMediaArtifactTypes: () =>
        createMediaArtifactTypesProjectionFromEvents([
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'gallery', name: 'Gallery', mediaTypes: [] },
          }),
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: [] },
          }),
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: [] },
          }),
        ]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
  })

  const response = await client.index.$post(
    {
      json: {
        id: 'gallery-artwork',
        name: 'Gallery Artwork',
        parentMediaArtifactType: 'gallery',
        childMediaArtifactTypes: ['painting', 'sculpture'],
      },
    },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ success: true })
})

it('returns a 401 if the user is not authenticated', async () => {
  const { client } = setup({
    createMediaArtifactRelationshipType: createCreateMediaArtifactRelationshipTypeCommandHandler({
      getMediaArtifactTypes: () =>
        createMediaArtifactTypesProjectionFromEvents([
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'gallery', name: 'Gallery', mediaTypes: [] },
          }),
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: [] },
          }),
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: [] },
          }),
        ]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
  })

  const response = await client.index.$post(
    {
      json: {
        id: 'gallery-artwork',
        name: 'Gallery Artwork',
        parentMediaArtifactType: 'gallery',
        childMediaArtifactTypes: ['painting', 'sculpture'],
      },
    },
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
    createMediaArtifactRelationshipType: createCreateMediaArtifactRelationshipTypeCommandHandler({
      getMediaArtifactTypes: () =>
        createMediaArtifactTypesProjectionFromEvents([
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'gallery', name: 'Gallery', mediaTypes: [] },
          }),
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: [] },
          }),
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: [] },
          }),
        ]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
  })

  const response = await client.index.$post(
    {
      json: {
        id: 'gallery-artwork',
        name: 'Gallery Artwork',
        parentMediaArtifactType: 'gallery',
        childMediaArtifactTypes: ['painting', 'sculpture'],
      },
    },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )
  expect(response.status).toBe(403)
  expect(await response.json()).toEqual({
    success: false,
    error: { name: 'UnauthorizedError', message: 'You are not authorized', statusCode: 403 },
  })
})

it('returns a 422 if the media type does not exist', async () => {
  const { client } = setup({
    createMediaArtifactRelationshipType: createCreateMediaArtifactRelationshipTypeCommandHandler({
      getMediaArtifactTypes: () =>
        createMediaArtifactTypesProjectionFromEvents([
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'gallery', name: 'Gallery', mediaTypes: [] },
          }),
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: [] },
          }),
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: [] },
          }),
        ]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
  })

  const response = await client.index.$post(
    {
      json: {
        id: 'gallery-artwork',
        name: 'Gallery Artwork',
        parentMediaArtifactType: 'nonexistent-parent',
        childMediaArtifactTypes: ['painting', 'sculpture'],
      },
    },
    { headers: { authorization: 'Bearer 000-000-000' } },
  )
  expect(response.status).toBe(422)
  expect(await response.json()).toEqual({
    success: false,
    error: {
      name: 'MediaArtifactTypeNotFoundError',
      message: "Media artifact type with ID 'nonexistent-parent' not found",
      statusCode: 422,
      details: {
        id: 'nonexistent-parent',
      },
    },
  })
})

it('returns an error if the request body is invalid', async () => {
  const { client } = setup({
    createMediaArtifactRelationshipType: createCreateMediaArtifactRelationshipTypeCommandHandler({
      getMediaArtifactTypes: () =>
        createMediaArtifactTypesProjectionFromEvents([
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'gallery', name: 'Gallery', mediaTypes: [] },
          }),
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: [] },
          }),
          mediaArtifactTypeCreatedEvent({
            mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: [] },
          }),
        ]),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
  })

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
        'childMediaArtifactTypes must be an array (was missing)\nid must be a string (was missing)\nname must be a string (was missing)\nparentMediaArtifactType must be a string (was missing)',
      statusCode: 400,
    },
  })
})
