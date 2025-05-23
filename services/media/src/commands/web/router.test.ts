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
import { createCreateMediaArtifactCommandHandler } from '../application/media-artifacts/create-media-artifact.js'
import { createCreateMediaTypeCommandHandler } from '../application/media-types/create-media-type.js'
import { createDeleteMediaTypeCommandHandler } from '../application/media-types/delete-media-type.js'
import { createUpdateMediaTypeCommandHandler } from '../application/media-types/update-media-type.js'
import {
  createDefaultMediaArtifactTypesProjection,
  createMediaArtifactTypesProjectionFromEvents,
} from '../domain/media-artifact-types/media-artifact-types-projection.js'
import {
  createDefaultMediaTypesProjection,
  createMediaTypesProjectionFromEvents,
} from '../domain/media-types/media-types-projection.js'
import type { MediaCommandsRouterDependencies } from './router.js'
import { createMediaCommandsRouter } from './router.js'

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
    deleteMediaType: createDeleteMediaTypeCommandHandler(
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
    createMediaArtifact: createCreateMediaArtifactCommandHandler(
      () => createDefaultMediaArtifactTypesProjection(),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    ),
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
            mediaTypeCreatedEvent({
              mediaType: { id: 'test', name: 'Test', parents: [] },
              userId: 0,
            }),
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

describe('deleteMediaType', () => {
  it('deletes a media type', async () => {
    const { client } = setup()

    const response = await client['media-types'][':id'].$delete(
      { param: { id: 'test' } },
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
              userId: 0,
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
              userId: 0,
            }),
            mediaArtifactTypeCreatedEvent({
              mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: [] },
              userId: 0,
            }),
            mediaArtifactTypeCreatedEvent({
              mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: [] },
              userId: 0,
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
})

describe('updateMediaArtifactRelationshipType', () => {
  it('updates a media artifact relationship type', async () => {
    const { client } = setup({
      updateMediaArtifactRelationshipType: createUpdateMediaArtifactRelationshipTypeCommandHandler({
        getMediaArtifactTypes: () =>
          createMediaArtifactTypesProjectionFromEvents([
            mediaArtifactTypeCreatedEvent({
              mediaArtifactType: { id: 'gallery', name: 'Gallery', mediaTypes: [] },
              userId: 0,
            }),
            mediaArtifactTypeCreatedEvent({
              mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: [] },
              userId: 0,
            }),
            mediaArtifactTypeCreatedEvent({
              mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: [] },
              userId: 0,
            }),
            mediaArtifactRelationshipTypeCreatedEvent({
              mediaArtifactRelationshipType: {
                id: 'gallery-artwork',
                name: 'Gallery Artwork',
                parentMediaArtifactType: 'gallery',
                childMediaArtifactTypes: ['painting', 'sculpture'],
              },
              userId: 0,
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
})

describe('createMediaArtifact', () => {
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

    const response = await client['media-artifacts'].$post(
      { json: { id: 'test', name: 'Test Artifact', mediaArtifactType: 'test-type' } },
      { headers: { authorization: 'Bearer 000-000-000' } },
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
  })
})
