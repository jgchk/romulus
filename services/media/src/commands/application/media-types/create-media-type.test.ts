import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import type { MediaTypeEvent } from '../../../common/domain/events.js'
import { mediaTypeCreatedEvent } from '../../../common/domain/events.js'
import { MemoryEventStore } from '../../../common/infrastructure/memory-event-store.js'
import { MediaTypeTreeCycleError } from '../../domain/media-types/errors.js'
import { createGetMediaTypes, createSaveMediaTypeEvent } from '../../infrastructure/media-types.js'
import { createCreateMediaTypeCommandHandler } from './create-media-type.js'

it('should create a media type', async () => {
  const eventStore = new MemoryEventStore<{ 'media-types': MediaTypeEvent }>()
  const createMediaType = createCreateMediaTypeCommandHandler(
    createGetMediaTypes(eventStore),
    createSaveMediaTypeEvent(eventStore),
  )

  const result = await createMediaType({
    mediaType: { id: 'test-id', name: 'Test', parents: [] },
    userId: 0,
  })

  expect(result).toEqual(ok(undefined))

  const events = eventStore.get('media-types')
  expect(events.map((event) => event.eventData)).toEqual([
    mediaTypeCreatedEvent({
      mediaType: { id: 'test-id', name: 'Test', parents: [] },
      userId: 0,
    }),
  ])
})

it('should error if media type creation fails', async () => {
  const eventStore = new MemoryEventStore<{ 'media-types': MediaTypeEvent }>()
  const createMediaType = createCreateMediaTypeCommandHandler(
    createGetMediaTypes(eventStore),
    createSaveMediaTypeEvent(eventStore),
  )

  const result = await createMediaType({
    mediaType: { id: 'test-id', name: 'Test', parents: ['test-id'] },
    userId: 0,
  })

  expect(result).toEqual(err(new MediaTypeTreeCycleError(['Test', 'Test'])))

  const events = eventStore.get('media-types')
  expect(events).toEqual([])
})
