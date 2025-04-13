import { ok } from 'neverthrow'
import { expect, it } from 'vitest'

import {
  mediaArtifactRelationshipTypeCreatedEvent,
  mediaArtifactRelationshipTypeUpdatedEvent,
  mediaArtifactTypeCreatedEvent,
  type MediaArtifactTypeEvent,
} from '../../../common/domain/events.js'
import { MemoryEventStore } from '../../../common/infrastructure/memory-event-store.js'
import {
  createGetMediaArtifactTypes,
  createSaveMediaArtifactTypeEvent,
} from '../../infrastructure/media-artifact-types.js'
import { createUpdateMediaArtifactRelationshipTypeCommandHandler } from './update-media-artifact-relationship-type.js'

it('should update a media artifact relationship type', async () => {
  const eventStore = new MemoryEventStore<{
    'media-artifact-types': MediaArtifactTypeEvent
  }>()
  eventStore.save('media-artifact-types', [
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
    createUpdateMediaArtifactRelationshipTypeCommandHandler({
      getMediaArtifactTypes: createGetMediaArtifactTypes(eventStore),
      saveMediaArtifactTypeEvent: createSaveMediaArtifactTypeEvent(eventStore),
    })

  const result = await updateMediaArtifactRelationshipType({
    id: 'gallery-artwork',
    update: {
      name: 'Gallery Artwork (Updated)',
      parentMediaArtifactType: 'gallery',
      childMediaArtifactTypes: ['painting', 'sculpture'],
    },
  })

  expect(result).toEqual(ok(undefined))

  const events = eventStore.get('media-artifact-types')
  expect(events).toHaveLength(5)
  expect(events[4]).toEqual(
    mediaArtifactRelationshipTypeUpdatedEvent({
      id: 'gallery-artwork',
      update: {
        name: 'Gallery Artwork (Updated)',
        parentMediaArtifactType: 'gallery',
        childMediaArtifactTypes: ['painting', 'sculpture'],
      },
    }),
  )
})
