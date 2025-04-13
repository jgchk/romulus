import { expect } from 'vitest'

import {
  mediaArtifactRelationshipTypeCreatedEvent,
  mediaArtifactTypeCreatedEvent,
} from '../../../common/domain/events.js'
import { test } from '../../../vitest-setup.js'
import { applyEvent } from '../projection.js'
import { createGetAllMediaArtifactTypesQueryHandler } from './get-all-media-artifact-types.js'

test('should get all media artifact types', async ({ dbConnection }) => {
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

  const getAllMediaArtifactTypes = createGetAllMediaArtifactTypesQueryHandler(dbConnection)

  const result = await getAllMediaArtifactTypes()

  expect(result).toEqual({
    mediaArtifactTypes: [
      {
        id: 'gallery',
        name: 'Gallery',
        mediaTypes: [],
      },
      {
        id: 'painting',
        name: 'Painting',
        mediaTypes: [],
      },
      {
        id: 'sculpture',
        name: 'Sculpture',
        mediaTypes: [],
      },
    ],
    mediaArtifactRelationshipTypes: [
      {
        id: 'gallery-artwork',
        name: 'Gallery Artwork',
        parentMediaArtifactType: 'gallery',
        childMediaArtifactTypes: ['painting', 'sculpture'],
      },
    ],
  })
})
