import { expect } from 'vitest'

import {
  mediaArtifactRelationshipTypeCreatedEvent,
  mediaArtifactRelationshipTypeUpdatedEvent,
  mediaArtifactTypeCreatedEvent,
  mediaArtifactTypeUpdatedEvent,
  mediaTypeUpdatedEvent,
} from '../../common/domain/events.js'
import { mediaTypeCreatedEvent, mediaTypeDeletedEvent } from '../../common/domain/events.js'
import { test } from '../../vitest-setup.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import { applyEvent } from './projection.js'

test('should handle the media-type-created event', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] } }),
  )

  const mediaType = await getMediaTypeById(dbConnection, 'test')
  expect(mediaType).toEqual({ id: 'test', name: 'Test', parents: [] })
})

test('should handle the media-type-updated event', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] } }),
  )

  await applyEvent(
    dbConnection,
    mediaTypeUpdatedEvent({ id: 'test', update: { name: 'Test (Update)', parents: [] } }),
  )

  const mediaType = await getMediaTypeById(dbConnection, 'test')
  expect(mediaType).toEqual({ id: 'test', name: 'Test (Update)', parents: [] })
})

test('should handle the media-type-deleted event', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({ mediaType: { id: 'test', name: 'Test', parents: [] } }),
  )

  await applyEvent(dbConnection, mediaTypeDeletedEvent({ id: 'test' }))

  const mediaType = await getMediaTypeById(dbConnection, 'test')
  expect(mediaType).toBeUndefined()
})

test('should handle the media-artifact-type-created event', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: [] },
    }),
  )

  const mediaArtifactType = await getMediaArtifactTypeById(dbConnection, 'test')
  expect(mediaArtifactType).toEqual({ id: 'test', name: 'Test', mediaTypes: [] })
})

test('should handle the media-artifact-type-updated event', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'test', name: 'Test', mediaTypes: [] },
    }),
  )

  await applyEvent(
    dbConnection,
    mediaArtifactTypeUpdatedEvent({
      id: 'test',
      update: { name: 'Test (Update)', mediaTypes: [] },
    }),
  )

  const mediaArtifactType = await getMediaArtifactTypeById(dbConnection, 'test')
  expect(mediaArtifactType).toEqual({ id: 'test', name: 'Test (Update)', mediaTypes: [] })
})

test('should handle the media-artifact-relationship-type-created event', async ({
  dbConnection,
}) => {
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'gallery', name: 'Gallery', mediaTypes: [] },
    }),
  )
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: [] },
    }),
  )
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: [] },
    }),
  )

  await applyEvent(
    dbConnection,
    mediaArtifactRelationshipTypeCreatedEvent({
      mediaArtifactRelationshipType: {
        id: 'gallery-artwork',
        name: 'Gallery Artwork',
        parentMediaArtifactType: 'gallery',
        childMediaArtifactTypes: ['painting', 'sculpture'],
      },
    }),
  )

  const mediaArtifactRelationshipType = await getMediaArtifactRelationshipType(
    dbConnection,
    'gallery-artwork',
  )
  expect(mediaArtifactRelationshipType).toEqual({
    id: 'gallery-artwork',
    name: 'Gallery Artwork',
    parentMediaArtifactTypeId: 'gallery',
    childMediaArtifactTypes: [
      {
        childMediaArtifactTypeId: 'painting',
        mediaArtifactRelationshipTypeId: 'gallery-artwork',
      },
      {
        childMediaArtifactTypeId: 'sculpture',
        mediaArtifactRelationshipTypeId: 'gallery-artwork',
      },
    ],
  })
})

test('should handle the media-artifact-relationship-type-updated event', async ({
  dbConnection,
}) => {
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'gallery', name: 'Gallery', mediaTypes: [] },
    }),
  )
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: [] },
    }),
  )
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: [] },
    }),
  )
  await applyEvent(
    dbConnection,
    mediaArtifactRelationshipTypeCreatedEvent({
      mediaArtifactRelationshipType: {
        id: 'gallery-artwork',
        name: 'Gallery Artwork',
        parentMediaArtifactType: 'gallery',
        childMediaArtifactTypes: ['painting', 'sculpture'],
      },
    }),
  )

  await applyEvent(
    dbConnection,
    mediaArtifactRelationshipTypeUpdatedEvent({
      id: 'gallery-artwork',
      update: {
        name: 'Gallery Artwork (Updated)',
        parentMediaArtifactType: 'gallery',
        childMediaArtifactTypes: ['painting', 'sculpture'],
      },
    }),
  )

  const mediaArtifactRelationshipType = await getMediaArtifactRelationshipType(
    dbConnection,
    'gallery-artwork',
  )
  expect(mediaArtifactRelationshipType).toEqual({
    id: 'gallery-artwork',
    name: 'Gallery Artwork (Updated)',
    parentMediaArtifactTypeId: 'gallery',
    childMediaArtifactTypes: [
      {
        childMediaArtifactTypeId: 'painting',
        mediaArtifactRelationshipTypeId: 'gallery-artwork',
      },
      {
        childMediaArtifactTypeId: 'sculpture',
        mediaArtifactRelationshipTypeId: 'gallery-artwork',
      },
    ],
  })
})

async function getMediaTypeById(dbConnection: IDrizzleConnection, id: string) {
  return await dbConnection.query.mediaTypes.findFirst({
    where: (mediaTypes, { eq }) => eq(mediaTypes.id, id),
    with: {
      parents: true,
    },
  })
}

async function getMediaArtifactTypeById(dbConnection: IDrizzleConnection, id: string) {
  return await dbConnection.query.mediaArtifactTypes.findFirst({
    where: (mediaArtifactTypes, { eq }) => eq(mediaArtifactTypes.id, id),
    with: {
      mediaTypes: true,
    },
  })
}

async function getMediaArtifactRelationshipType(dbConnection: IDrizzleConnection, id: string) {
  return await dbConnection.query.mediaArtifactRelationshipTypes.findFirst({
    where: (mediaArtifactRelationshipTypes, { eq }) => eq(mediaArtifactRelationshipTypes.id, id),
    with: {
      childMediaArtifactTypes: true,
    },
  })
}
