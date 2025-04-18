import { expect } from 'vitest'

import {
  mediaArtifactTypeCreatedEvent,
  mediaTypeCreatedEvent,
} from '../../../common/domain/events.js'
import { test } from '../../../vitest-setup.js'
import { applyEvent } from '../projection.js'
import { createGetMediaArtifactTypesByMediaTypeQueryHandler } from './get-media-artifact-types-by-media-type.js'

test('should get all media artifact types for the given media type', async ({ dbConnection }) => {
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({
      mediaType: { id: 'visual-art', name: 'Visual Art', parents: [] },
      userId: 0,
    }),
  )
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({
      mediaType: { id: 'painting', name: 'Painting', parents: ['visual-art'] },
      userId: 0,
    }),
  )
  await applyEvent(
    dbConnection,
    mediaTypeCreatedEvent({
      mediaType: { id: 'sculpting', name: 'Sculpting', parents: ['visual-art'] },
      userId: 0,
    }),
  )

  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'gallery', name: 'Gallery', mediaTypes: ['visual-art'] },
      userId: 0,
    }),
  )
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: ['painting'] },
      userId: 0,
    }),
  )
  await applyEvent(
    dbConnection,
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: ['sculpting'] },
      userId: 0,
    }),
  )

  const getMediaArtifactTypesByMediaType =
    createGetMediaArtifactTypesByMediaTypeQueryHandler(dbConnection)

  const result = await getMediaArtifactTypesByMediaType('painting')

  expect(result).toEqual({
    mediaArtifactTypes: [
      {
        id: 'painting',
        name: 'Painting',
        mediaTypes: ['painting'],
      },
    ],
  })
})
