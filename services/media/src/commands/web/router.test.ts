import { testClient } from 'hono/testing'
import { okAsync } from 'neverthrow'
import { describe, expect, it } from 'vitest'

import { mediaTypeCreatedEvent } from '../../common/domain/events.js'
import { createCreateMediaArtifactTypeCommandHandler } from '../application/media-artifact-types/create-media-artifact-type.js'
import { createCreateMediaTypeCommandHandler } from '../application/media-types/create-media-type.js'
import { createUpdateMediaTypeCommandHandler } from '../application/media-types/update-media-type.js'
import {
  createDefaultMediaTypesProjection,
  createMediaTypesProjectionFromEvents,
} from '../domain/media-types/media-types-projection.js'
import { MediaPermission } from '../domain/permissions.js'
import { createMediaCommandsRouter, type MediaCommandsRouterDependencies } from './router.js'

function setup(options: Partial<MediaCommandsRouterDependencies> = {}) {
  const router = createMediaCommandsRouter({
    createMediaType: createCreateMediaTypeCommandHandler(
      () => createDefaultMediaTypesProjection(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ),
    updateMediaType: createUpdateMediaTypeCommandHandler(
      () => createDefaultMediaTypesProjection(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ),
    createMediaArtifactType: createCreateMediaArtifactTypeCommandHandler({
      getMediaTypes: () => createDefaultMediaTypesProjection(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
    authentication: {
      whoami: () => okAsync({ id: 0 }),
    },
    authorization: {
      hasPermission: () => Promise.resolve(true),
    },

    ...options,
  })

  const client = testClient(router)

  return { router, client }
}

describe('createMediaType', () => {
  it('creates a media type', async () => {
    const { client } = setup()

    const response = await client['media-types'].$post(
      { json: { id: 'test', name: 'Test', parents: [] } },
      { headers: { authorization: `Bearer 000-000-000` } },
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
  })

  it('returns 403 if user does not have permission', async () => {
    const { client } = setup({
      authorization: {
        hasPermission: (userId, permission) => {
          if (permission === MediaPermission.CreateMediaTypes) {
            return Promise.resolve(false)
          } else {
            return Promise.resolve(true)
          }
        },
      },
    })

    const response = await client['media-types'].$post(
      { json: { id: 'test', name: 'Test', parents: [] } },
      { headers: { authorization: `Bearer 000-000-000` } },
    )
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      success: false,
      error: { name: 'UnauthorizedError', message: 'You are not authorized', statusCode: 403 },
    })
  })

  it('returns 400 error if a cycle would be created', async () => {
    const { client } = setup()

    const response = await client['media-types'].$post(
      { json: { id: 'test', name: 'Test', parents: ['test'] } },
      { headers: { authorization: `Bearer 000-000-000` } },
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      success: false,
      error: {
        name: 'MediaTypeTreeCycleError',
        message: 'A cycle would be created in the media type tree: Test -> Test',
        statusCode: 400,
      },
    })
  })
})

describe('updateMediaType', () => {
  it('updates a media type', async () => {
    const { client } = setup({
      updateMediaType: createUpdateMediaTypeCommandHandler(
        () =>
          createMediaTypesProjectionFromEvents([
            mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] } }),
          ]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      ),
    })

    const response = await client['media-types'][':id'].$put(
      { param: { id: 'test' }, json: { name: 'Test (Updated)', parents: [] } },
      { headers: { authorization: `Bearer 000-000-000` } },
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
  })

  it('returns 403 if user does not have permission', async () => {
    const { client } = setup({
      authorization: {
        hasPermission: (userId, permission) => {
          if (permission === MediaPermission.EditMediaTypes) {
            return Promise.resolve(false)
          } else {
            return Promise.resolve(true)
          }
        },
      },
    })

    const response = await client['media-types'][':id'].$put(
      { param: { id: 'test' }, json: { name: 'Test (Updated)', parents: [] } },
      { headers: { authorization: `Bearer 000-000-000` } },
    )
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      success: false,
      error: { name: 'UnauthorizedError', message: 'You are not authorized', statusCode: 403 },
    })
  })

  it('returns 400 error if a cycle would be created', async () => {
    const { client } = setup({
      updateMediaType: createUpdateMediaTypeCommandHandler(
        () =>
          createMediaTypesProjectionFromEvents([
            mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] } }),
          ]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      ),
    })

    const response = await client['media-types'][':id'].$put(
      { param: { id: 'test' }, json: { name: 'Test (Updated)', parents: ['test'] } },
      { headers: { authorization: `Bearer 000-000-000` } },
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      success: false,
      error: {
        name: 'MediaTypeTreeCycleError',
        message:
          'A cycle would be created in the media type tree: Test (Updated) -> Test (Updated)',
        statusCode: 400,
      },
    })
  })

  it('returns 404 error if the media type does not exist', async () => {
    const { client } = setup({
      updateMediaType: createUpdateMediaTypeCommandHandler(
        () => createMediaTypesProjectionFromEvents([]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      ),
    })

    const response = await client['media-types'][':id'].$put(
      { param: { id: 'test' }, json: { name: 'Test (Updated)', parents: [] } },
      { headers: { authorization: `Bearer 000-000-000` } },
    )
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      success: false,
      error: {
        name: 'MediaTypeNotFoundError',
        message: "Media type with ID 'test' not found",
        statusCode: 404,
      },
    })
  })
})

describe('createMediaArtifactType', () => {
  it('creates a media artifact type', async () => {
    const { client } = setup()

    const response = await client['media-artifact-types'].$post(
      { json: { id: 'test', name: 'Test', mediaTypes: [] } },
      { headers: { authorization: 'Bearer 000-000-000' } },
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
  })

  it('returns a 401 if the user is not authenticated', async () => {
    const { client } = setup()

    const response = await client['media-artifact-types'].$post(
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
      authorization: {
        hasPermission: (userId, permission) => {
          if (permission === MediaPermission.CreateMediaArtifactType) {
            return Promise.resolve(false)
          } else {
            return Promise.resolve(true)
          }
        },
      },
    })

    const response = await client['media-artifact-types'].$post(
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

    const response = await client['media-artifact-types'].$post(
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

    const response = await client['media-artifact-types'].$post(
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
})
