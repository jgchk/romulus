import { expect } from 'vitest'

import {
  mediaArtifactRelationshipTypeCreatedEvent,
  mediaArtifactTypeCreatedEvent,
} from '../../../common/domain/events.js'
import { test } from '../../../vitest-setup.js'
import { applyEvent } from '../projection.js'
import { createGetMediaArtifactRelationshipTypeQueryHandler } from './get-media-artifact-relationship-type.js'

test('should return the media artifact relationship type if it exists', async ({
  dbConnection,
}) => {
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: {
        id: 'gallery',
        name: 'Gallery',
        mediaTypes: [],
      },
    }),
  )
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: {
        id: 'painting',
        name: 'Painting',
        mediaTypes: [],
      },
    }),
  )
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: {
        id: 'sculpture',
        name: 'Sculpture',
        mediaTypes: [],
      },
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

  const getMediaArtifactRelationshipType =
    createGetMediaArtifactRelationshipTypeQueryHandler(dbConnection)

  const result = await getMediaArtifactRelationshipType('gallery-artwork')

  expect(result).toEqual({
    id: 'gallery-artwork',
    name: 'Gallery Artwork',
    parentMediaArtifactType: 'gallery',
    childMediaArtifactTypes: ['painting', 'sculpture'],
  })
})

test('should return undefined if the media artifact relationship type does not exist', async ({
  dbConnection,
}) => {
  const getMediaArtifactRelationshipType =
    createGetMediaArtifactRelationshipTypeQueryHandler(dbConnection)

  const result = await getMediaArtifactRelationshipType('non-existent')

  expect(result).toBeUndefined()
})
