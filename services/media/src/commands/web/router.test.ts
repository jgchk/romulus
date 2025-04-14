import { testClient } from 'hono/testing'
import { okAsync } from 'neverthrow'
import { describe, expect, it } from 'vitest'

import {
  mediaArtifactRelationshipTypeCreatedEvent,
  mediaArtifactTypeCreatedEvent,
  mediaTypeCreatedEvent,
} from '../../common/domain/events.js'
import { createCreateMediaArtifactRelationshipTypeCommandHandler } from '../application/media-artifact-relationship-types/create-media-artifact-relationship-type.js'
import { createUpdateMediaArtifactRelationshipTypeCommandHandler } from '../application/media-artifact-relationship-types/update-media-artifact-relationship-type.js'
import { createCreateMediaArtifactTypeCommandHandler } from '../application/media-artifact-types/create-media-artifact-type.js'
import { createDeleteMediaArtifactTypeCommandHandler } from '../application/media-artifact-types/delete-media-artifact-type.js'
import { createUpdateMediaArtifactTypeCommandHandler } from '../application/media-artifact-types/update-media-artifact-type.js'
import { createCreateMediaTypeCommandHandler } from '../application/media-types/create-media-type.js'
import { createUpdateMediaTypeCommandHandler } from '../application/media-types/update-media-type.js'
import {
  createDefaultMediaArtifactTypesProjection,
  createMediaArtifactTypesProjectionFromEvents,
} from '../domain/media-artifact-types/media-artifact-types-projection.js'
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
    updateMediaArtifactType: createUpdateMediaArtifactTypeCommandHandler({
      getMediaTypes: () => createDefaultMediaTypesProjection(),
      getMediaArtifactTypes: () => createDefaultMediaArtifactTypesProjection(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
    deleteMediaArtifactType: createDeleteMediaArtifactTypeCommandHandler({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
    createMediaArtifactRelationshipType: createCreateMediaArtifactRelationshipTypeCommandHandler({
      getMediaArtifactTypes: () => createDefaultMediaArtifactTypesProjection(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      saveMediaArtifactTypeEvent: () => {},
    }),
    updateMediaArtifactRelationshipType: createUpdateMediaArtifactRelationshipTypeCommandHandler({
      getMediaArtifactTypes: () => createDefaultMediaArtifactTypesProjection(),
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
})

describe('updateMediaArtifactType', () => {
  it('updates a media artifact type', async () => {
    const { client } = setup({
      updateMediaArtifactType: createUpdateMediaArtifactTypeCommandHandler({
        getMediaTypes: () => createMediaTypesProjectionFromEvents([]),
        getMediaArtifactTypes: () =>
          createMediaArtifactTypesProjectionFromEvents([
            mediaArtifactTypeCreatedEvent({
              mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: [] },
            }),
          ]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        saveMediaArtifactTypeEvent: () => {},
      }),
    })

    const response = await client['media-artifact-types'][':id'].$put(
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
            }),
          ]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        saveMediaArtifactTypeEvent: () => {},
      }),
    })

    const response = await client['media-artifact-types'][':id'].$put(
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
      authorization: {
        hasPermission: (userId, permission) => {
          if (permission === MediaPermission.WriteMediaArtifactTypes) {
            return Promise.resolve(false)
          } else {
            return Promise.resolve(true)
          }
        },
      },
      updateMediaArtifactType: createUpdateMediaArtifactTypeCommandHandler({
        getMediaTypes: () => createMediaTypesProjectionFromEvents([]),
        getMediaArtifactTypes: () =>
          createMediaArtifactTypesProjectionFromEvents([
            mediaArtifactTypeCreatedEvent({
              mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: [] },
            }),
          ]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        saveMediaArtifactTypeEvent: () => {},
      }),
    })

    const response = await client['media-artifact-types'][':id'].$put(
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

    const response = await client['media-artifact-types'][':id'].$put(
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
            }),
          ]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        saveMediaArtifactTypeEvent: () => {},
      }),
    })

    const response = await client['media-artifact-types'][':id'].$put(
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

    const response = await client['media-artifact-types'][':id'].$put(
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
})

describe('deleteMediaArtifactType', () => {
  it('deletes a media artifact type', async () => {
    const { client } = setup()

    const response = await client['media-artifact-types'][':id'].$delete(
      { param: { id: 'test' } },
      { headers: { authorization: 'Bearer 000-000-000' } },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      success: true,
    })
  })
})

describe('createMediaArtifactRelationshipType', () => {
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

    const response = await client['media-artifact-relationship-types'].$post(
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

    const response = await client['media-artifact-relationship-types'].$post(
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
      authorization: {
        hasPermission: (userId, permission) => {
          if (permission === MediaPermission.WriteMediaArtifactTypes) {
            return Promise.resolve(false)
          } else {
            return Promise.resolve(true)
          }
        },
      },
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

    const response = await client['media-artifact-relationship-types'].$post(
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

    const response = await client['media-artifact-relationship-types'].$post(
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

    const response = await client['media-artifact-relationship-types'].$post(
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
})

describe('updateMediaArtifactRelationshipType', () => {
  it('updates a media artifact relationship type', async () => {
    const { client } = setup({
      updateMediaArtifactRelationshipType: createUpdateMediaArtifactRelationshipTypeCommandHandler({
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
            mediaArtifactRelationshipTypeCreatedEvent({
              mediaArtifactRelationshipType: {
                id: 'gallery-artwork',
                name: 'Gallery Artwork',
                parentMediaArtifactType: 'gallery',
                childMediaArtifactTypes: ['painting', 'sculpture'],
              },
            }),
          ]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        saveMediaArtifactTypeEvent: () => {},
      }),
    })

    const response = await client['media-artifact-relationship-types'][':id'].$put(
      {
        param: { id: 'gallery-artwork' },
        json: {
          name: 'Gallery Artwork (Updated)',
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
      updateMediaArtifactRelationshipType: createUpdateMediaArtifactRelationshipTypeCommandHandler({
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
            mediaArtifactRelationshipTypeCreatedEvent({
              mediaArtifactRelationshipType: {
                id: 'gallery-artwork',
                name: 'Gallery Artwork',
                parentMediaArtifactType: 'gallery',
                childMediaArtifactTypes: ['painting', 'sculpture'],
              },
            }),
          ]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        saveMediaArtifactTypeEvent: () => {},
      }),
    })

    const response = await client['media-artifact-relationship-types'][':id'].$put(
      {
        param: { id: 'gallery-artwork' },
        json: {
          name: 'Gallery Artwork (Updated)',
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
      authorization: {
        hasPermission: (userId, permission) => {
          if (permission === MediaPermission.WriteMediaArtifactTypes) {
            return Promise.resolve(false)
          } else {
            return Promise.resolve(true)
          }
        },
      },
      updateMediaArtifactRelationshipType: createUpdateMediaArtifactRelationshipTypeCommandHandler({
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
            mediaArtifactRelationshipTypeCreatedEvent({
              mediaArtifactRelationshipType: {
                id: 'gallery-artwork',
                name: 'Gallery Artwork',
                parentMediaArtifactType: 'gallery',
                childMediaArtifactTypes: ['painting', 'sculpture'],
              },
            }),
          ]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        saveMediaArtifactTypeEvent: () => {},
      }),
    })

    const response = await client['media-artifact-relationship-types'][':id'].$put(
      {
        param: { id: 'gallery-artwork' },
        json: {
          name: 'Gallery Artwork (Updated)',
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
      updateMediaArtifactRelationshipType: createUpdateMediaArtifactRelationshipTypeCommandHandler({
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
            mediaArtifactRelationshipTypeCreatedEvent({
              mediaArtifactRelationshipType: {
                id: 'gallery-artwork',
                name: 'Gallery Artwork',
                parentMediaArtifactType: 'gallery',
                childMediaArtifactTypes: ['painting', 'sculpture'],
              },
            }),
          ]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        saveMediaArtifactTypeEvent: () => {},
      }),
    })

    const response = await client['media-artifact-relationship-types'][':id'].$put(
      {
        param: { id: 'gallery-artwork' },
        json: {
          name: 'Gallery Artwork (Updated)',
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
            mediaArtifactRelationshipTypeCreatedEvent({
              mediaArtifactRelationshipType: {
                id: 'gallery-artwork',
                name: 'Gallery Artwork',
                parentMediaArtifactType: 'gallery',
                childMediaArtifactTypes: ['painting', 'sculpture'],
              },
            }),
          ]),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        saveMediaArtifactTypeEvent: () => {},
      }),
    })

    const response = await client['media-artifact-relationship-types'][':id'].$put(
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
          'childMediaArtifactTypes must be an array (was missing)\nname must be a string (was missing)\nparentMediaArtifactType must be a string (was missing)',
        statusCode: 400,
      },
    })
  })
})
