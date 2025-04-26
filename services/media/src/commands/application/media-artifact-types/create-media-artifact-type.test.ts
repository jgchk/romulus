import { ok } from 'neverthrow'
import { expect, it } from 'vitest'

import type { MediaArtifactTypeEvent, MediaTypeEvent } from '../../../common/domain/events.js'
import {
  mediaArtifactTypeCreatedEvent,
  mediaTypeCreatedEvent,
} from '../../../common/domain/events.js'
import { MemoryEventStore } from '../../../common/infrastructure/memory-event-store.js'
import { createSaveMediaArtifactTypeEvent } from '../../infrastructure/media-artifact-types.js'
import { createGetMediaTypes } from '../../infrastructure/media-types.js'
import { createCreateMediaArtifactTypeCommandHandler } from './create-media-artifact-type.js'

it('should create a media artifact type', async () => {
  const eventStore = new MemoryEventStore<{
    'media-types': MediaTypeEvent
    'media-artifact-types': MediaArtifactTypeEvent
  }>()

  eventStore.save('media-types', [
    mediaTypeCreatedEvent({
      mediaType: { id: 'test-media-type', name: 'Test Media Type', parents: [] },
      userId: 0,
    }),
  ])

  const createMediaArtifactType = createCreateMediaArtifactTypeCommandHandler({
    getMediaTypes: createGetMediaTypes(eventStore),
    saveMediaArtifactTypeEvent: createSaveMediaArtifactTypeEvent(eventStore),
  })

  const result = await createMediaArtifactType({
    mediaArtifactType: { id: 'test-id', name: 'Test', mediaTypes: ['test-media-type'] },
    userId: 0,
  })

  expect(result).toEqual(ok(undefined))

  const events = eventStore.get('media-artifact-types')
  expect(events.map((event) => event.eventData)).toEqual([
    mediaArtifactTypeCreatedEvent({
      mediaArtifactType: { id: 'test-id', name: 'Test', mediaTypes: ['test-media-type'] },
      userId: 0,
    }),
  ])
})
