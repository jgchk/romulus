import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import {
  mediaArtifactRelationshipTypeCreatedEvent,
  mediaArtifactRelationshipTypeUpdatedEvent,
  mediaArtifactTypeCreatedEvent,
} from '../../../common/domain/events.js'
import { MediaArtifactTypeNotFoundError } from '../media-artifact-types/errors.js'
import { createMediaArtifactTypesProjectionFromEvents } from '../media-artifact-types/media-artifact-types-projection.js'
import { MediaArtifactRelationshipTypeNotFoundError } from './errors.js'
import { createUpdateMediaArtifactRelationshipTypeCommandHandler } from './update-media-artifact-relationship-type.js'

it('should update a media artifact relationship type', () => {
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
    mediaArtifactRelationshipTypeCreatedEvent({
      mediaArtifactRelationshipType: {
        id: 'gallery-artwork',
        name: 'Gallery Artwork',
        parentMediaArtifactType: 'gallery',
        childMediaArtifactTypes: ['painting', 'sculpture'],
      },
    }),
  ])

  const updateMediaArtifactRelationshipType =
    createUpdateMediaArtifactRelationshipTypeCommandHandler(mediaArtifactTypes)

  const result = updateMediaArtifactRelationshipType({
    id: 'gallery-artwork',
    update: {
      name: 'Gallery Artwork (Updated)',
      parentMediaArtifactType: 'gallery',
      childMediaArtifactTypes: ['painting', 'sculpture'],
    },
  })

  expect(result).toEqual(
    ok(
      mediaArtifactRelationshipTypeUpdatedEvent({
        id: 'gallery-artwork',
        update: {
          name: 'Gallery Artwork (Updated)',
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
  ])

  const updateMediaArtifactRelationshipType =
    createUpdateMediaArtifactRelationshipTypeCommandHandler(mediaArtifactTypes)

  const result = updateMediaArtifactRelationshipType({
    id: 'gallery-artwork',
    update: {
      name: 'Gallery Artwork (Updated)',
      parentMediaArtifactType: 'non-existent',
      childMediaArtifactTypes: ['painting', 'sculpture'],
    },
  })

  expect(result).toEqual(err(new MediaArtifactTypeNotFoundError('non-existent')))
})

it('should error if a child media artifact type does not exist', () => {
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
    mediaArtifactRelationshipTypeCreatedEvent({
      mediaArtifactRelationshipType: {
        id: 'gallery-artwork',
        name: 'Gallery Artwork',
        parentMediaArtifactType: 'gallery',
        childMediaArtifactTypes: ['painting', 'sculpture'],
      },
    }),
  ])

  const updateMediaArtifactRelationshipType =
    createUpdateMediaArtifactRelationshipTypeCommandHandler(mediaArtifactTypes)

  const result = updateMediaArtifactRelationshipType({
    id: 'gallery-artwork',
    update: {
      name: 'Gallery Artwork (Updated)',
      parentMediaArtifactType: 'gallery',
      childMediaArtifactTypes: ['painting', 'non-existent'],
    },
  })

  expect(result).toEqual(err(new MediaArtifactTypeNotFoundError('non-existent')))
})

it('should error if the media artifact relationship type does not exist', () => {
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

  const updateMediaArtifactRelationshipType =
    createUpdateMediaArtifactRelationshipTypeCommandHandler(mediaArtifactTypes)

  const result = updateMediaArtifactRelationshipType({
    id: 'non-existent',
    update: {
      name: 'Nonexistent',
      parentMediaArtifactType: 'gallery',
      childMediaArtifactTypes: ['painting', 'sculpture'],
    },
  })

  expect(result).toEqual(err(new MediaArtifactRelationshipTypeNotFoundError('non-existent')))
})
