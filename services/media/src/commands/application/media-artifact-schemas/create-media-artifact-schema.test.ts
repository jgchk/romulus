import { ok } from 'neverthrow'
import { expect, it } from 'vitest'

import {
  mediaArtifactSchemaCreatedEvent,
  type MediaArtifactSchemaEvent,
  mediaTypeCreatedEvent,
  type MediaTypeEvent,
} from '../../../common/domain/events.js'
import { MemoryEventStore } from '../../../common/infrastructure/memory-event-store.js'
import { createSaveMediaArtifactSchemaEvent } from '../../infrastructure/media-artifact-schemas.js'
import { createGetMediaTypes } from '../../infrastructure/media-types.js'
import { createCreateMediaArtifactSchemaCommandHandler } from './create-media-artifact-schema.js'

it('should create a media artifact schema', async () => {
  const eventStore = new MemoryEventStore<{
    'media-types': MediaTypeEvent
    [key: `media-artifact-schema-${string}`]: MediaArtifactSchemaEvent
  }>()
  eventStore.save('media-types', [
    mediaTypeCreatedEvent({
      mediaType: { id: 'test-media-type', name: 'Test Media Type', parents: [] },
    }),
  ])

  const createMediaArtifactSchema = createCreateMediaArtifactSchemaCommandHandler({
    getMediaTypes: createGetMediaTypes(eventStore),
    saveMediaArtifactSchemaEvent: createSaveMediaArtifactSchemaEvent(eventStore),
  })

  const result = await createMediaArtifactSchema({
    mediaType: 'test-media-type',
    schema: { id: 'test-id', name: 'Test', parent: undefined },
  })

  expect(result).toEqual(ok(undefined))

  const events = eventStore.get('media-artifact-schema-test-media-type')
  expect(events).toEqual([
    mediaArtifactSchemaCreatedEvent({
      mediaType: 'test-media-type',
      schema: { id: 'test-id', name: 'Test', parent: undefined },
    }),
  ])
})
