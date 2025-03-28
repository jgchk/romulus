import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import type { MediaTypeEvent } from '../../common/domain/events.js'
import { mediaTypeCreatedEvent } from '../../common/domain/events.js'
import { MemoryEventStore } from '../../common/infrastructure/memory-event-store.js'
import { MediaTypeTreeCycleError } from '../domain/errors.js'
import { MEDIA_TYPE_TREE_EVENT_STORE_KEY } from './common.js'
import { createCreateMediaTypeCommand } from './create-media-type.js'

it('should create a media type', async () => {
  const eventStore = new MemoryEventStore<MediaTypeEvent>()
  const createMediaType = createCreateMediaTypeCommand((event) =>
    eventStore.save(MEDIA_TYPE_TREE_EVENT_STORE_KEY, [event]),
  )

  const result = await createMediaType({
    mediaType: { id: 'test-id', name: 'Test', parents: [] },
  })

  expect(result).toEqual(ok(undefined))

  const events = eventStore.get(MEDIA_TYPE_TREE_EVENT_STORE_KEY)
  expect(events).toEqual([
    mediaTypeCreatedEvent({ mediaType: { id: 'test-id', name: 'Test', parents: [] } }),
  ])
})

it('should error if media type creation fails', async () => {
  const eventStore = new MemoryEventStore<MediaTypeEvent>()
  const createMediaType = createCreateMediaTypeCommand((event) =>
    eventStore.save(MEDIA_TYPE_TREE_EVENT_STORE_KEY, [event]),
  )

  const result = await createMediaType({
    mediaType: { id: 'test-id', name: 'Test', parents: ['test-id'] },
  })

  expect(result).toEqual(err(new MediaTypeTreeCycleError(['Test', 'Test'])))

  const events = eventStore.get(MEDIA_TYPE_TREE_EVENT_STORE_KEY)
  expect(events).toEqual([])
})
