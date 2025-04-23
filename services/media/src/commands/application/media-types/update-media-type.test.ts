import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import type { MediaTypeEvent } from '../../../common/domain/events.js'
import { mediaTypeCreatedEvent } from '../../../common/domain/events.js'
import { mediaTypeUpdatedEvent } from '../../../common/domain/events.js'
import { MemoryEventStore } from '../../../common/infrastructure/memory-event-store.js'
import { MediaTypeNotFoundError } from '../../domain/media-types/errors.js'
import { createMediaTypesProjectionFromEvents } from '../../domain/media-types/media-types-projection.js'
import { createGetMediaTypes, createSaveMediaTypeEvent } from '../../infrastructure/media-types.js'
import { createCreateMediaTypeCommandHandler } from './create-media-type.js'
import { createUpdateMediaTypeCommandHandler } from './update-media-type.js'

it('should update a media type', async () => {
  const eventStore = new MemoryEventStore<{ 'media-types': MediaTypeEvent }>()

  const createMediaType = createCreateMediaTypeCommandHandler(
    createGetMediaTypes(eventStore),
    createSaveMediaTypeEvent(eventStore),
  )

  await createMediaType({
    mediaType: { id: 'test-id', name: 'Test', parents: [] },
    userId: 0,
  })

  const updateMediaType = createUpdateMediaTypeCommandHandler(
    () =>
      createMediaTypesProjectionFromEvents(
        eventStore.get('media-types').map((event) => event.eventData),
      ),
    (event) => eventStore.save('media-types', [event]),
  )

  const result = await updateMediaType({
    id: 'test-id',
    update: { name: 'Test (Updated)', parents: [] },
    userId: 0,
  })

  expect(result).toEqual(ok(undefined))

  const events = eventStore.get('media-types')
  expect(events.map((event) => event.eventData)).toEqual([
    mediaTypeCreatedEvent({ mediaType: { id: 'test-id', name: 'Test', parents: [] }, userId: 0 }),
    mediaTypeUpdatedEvent({
      id: 'test-id',
      update: { name: 'Test (Updated)', parents: [] },
      userId: 0,
    }),
  ])
})

it('should error if media type update fails', async () => {
  const eventStore = new MemoryEventStore<{ 'media-types': MediaTypeEvent }>()
  const updateMediaType = createUpdateMediaTypeCommandHandler(
    createGetMediaTypes(eventStore),
    createSaveMediaTypeEvent(eventStore),
  )

  const result = await updateMediaType({
    id: 'test-id',
    update: { name: 'Test (Updated)', parents: [] },
    userId: 0,
  })

  expect(result).toEqual(err(new MediaTypeNotFoundError('test-id')))

  const events = eventStore.get('media-types')
  expect(events).toEqual([])
})
