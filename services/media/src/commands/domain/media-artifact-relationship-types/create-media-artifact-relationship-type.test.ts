import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import {
  mediaArtifactRelationshipTypeCreatedEvent,
  mediaArtifactTypeCreatedEvent,
} from '../../../common/domain/events.js'
import { MediaArtifactTypeNotFoundError } from '../media-artifact-types/errors.js'
import { createMediaArtifactTypesProjectionFromEvents } from '../media-artifact-types/media-artifact-types-projection.js'
import { createCreateMediaArtifactRelationshipTypeCommandHandler } from './create-media-artifact-relationship-type.js'

it('should create a media artifact relationship type', () => {
  const mediaArtifactTypes = createMediaArtifactTypesProjectionFromEvents([
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'gallery', name: 'Gallery', mediaTypes: [] },
    }),
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: [] },
    }),
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: [] },
    }),
  ])

  const createMediaArtifactRelationshipType =
    createCreateMediaArtifactRelationshipTypeCommandHandler(mediaArtifactTypes)

  const result = createMediaArtifactRelationshipType({
    mediaArtifactRelationshipType: {
      id: 'gallery-artwork',
      name: 'Gallery Artwork',
      parentMediaArtifactType: 'gallery',
      childMediaArtifactTypes: ['painting', 'sculpture'],
    },
  })

  expect(result).toEqual(
    ok(
      mediaArtifactRelationshipTypeCreatedEvent({
        mediaArtifactRelationshipType: {
          id: 'gallery-artwork',
          name: 'Gallery Artwork',
          parentMediaArtifactType: 'gallery',
          childMediaArtifactTypes: ['painting', 'sculpture'],
        },
      }),
    ),
  )
})

it('should error if the parent media artifact type does not exist', () => {
  const mediaArtifactTypes = createMediaArtifactTypesProjectionFromEvents([
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'painting', name: 'Painting', mediaTypes: [] },
    }),
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: [] },
    }),
  ])

  const createMediaArtifactRelationshipType =
    createCreateMediaArtifactRelationshipTypeCommandHandler(mediaArtifactTypes)

  const result = createMediaArtifactRelationshipType({
    mediaArtifactRelationshipType: {
      id: 'gallery-artwork',
      name: 'Gallery Artwork',
      parentMediaArtifactType: 'gallery',
      childMediaArtifactTypes: ['painting', 'sculpture'],
    },
  })

  expect(result).toEqual(err(new MediaArtifactTypeNotFoundError('gallery')))
})

it('should error if a child media artifact type does not exist', () => {
  const mediaArtifactTypes = createMediaArtifactTypesProjectionFromEvents([
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'gallery', name: 'Gallery', mediaTypes: [] },
    }),
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'sculpture', name: 'Sculpture', mediaTypes: [] },
    }),
  ])

  const createMediaArtifactRelationshipType =
    createCreateMediaArtifactRelationshipTypeCommandHandler(mediaArtifactTypes)

  const result = createMediaArtifactRelationshipType({
    mediaArtifactRelationshipType: {
      id: 'gallery-artwork',
      name: 'Gallery Artwork',
      parentMediaArtifactType: 'gallery',
      childMediaArtifactTypes: ['painting', 'sculpture'],
    },
  })

  expect(result).toEqual(err(new MediaArtifactTypeNotFoundError('painting')))
})
