import { testClient } from 'hono/testing'
import { okAsync } from 'neverthrow'
import { describe, expect, it } from 'vitest'

import { mediaTypeCreatedEvent } from '../../common/domain/events.js'
import { createCreateMediaTypeCommandHandler } from '../application/create-media-type.js'
import { createUpdateMediaTypeCommandHandler } from '../application/update-media-type.js'
import { MediaPermission } from '../domain/permissions.js'
import { createMediaRouter, type MediaRouterDependencies } from './router.js'

function setup(options: Partial<MediaRouterDependencies> = {}) {
  const router = createMediaRouter({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    createMediaType: createCreateMediaTypeCommandHandler(() => {}),
    updateMediaType: createUpdateMediaTypeCommandHandler(
      () => [],
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ),
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

describe('create', () => {
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

describe('update', () => {
  it('updates a media type', async () => {
    const { client } = setup({
      updateMediaType: createUpdateMediaTypeCommandHandler(
        () => [mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] } })],
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
        () => [mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] } })],
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
        () => [],
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
