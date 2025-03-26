import { err, ok } from 'neverthrow'
import { expect, it } from 'vitest'

import { MemoryEventStore } from '../../common/infrastructure/memory-event-store.js'
import { mediaTypeCreatedEvent } from '../domain/create-media-type.js'
import type { MediaTypeEvent } from '../../common/domain/events.js'
import { MEDIA_TYPE_TREE_EVENT_STORE_KEY } from './common.js'
import { createUpdateMediaTypeCommand } from './update-media-type.js'
import { createCreateMediaTypeCommand } from './create-media-type.js'
import { mediaTypeUpdatedEvent } from '../domain/update-media-type.js'
import { MediaTypeNotFoundError } from '../domain/errors.js'

it('should update a media type', async () => {
  const eventStore = new MemoryEventStore<MediaTypeEvent>()

  const createMediaType = createCreateMediaTypeCommand((event) =>
    eventStore.save(MEDIA_TYPE_TREE_EVENT_STORE_KEY, [event]),
  )

  await createMediaType({
    mediaType: { id: 'test-id', name: 'Test', parents: [] },
  })

  const updateMediaType = createUpdateMediaTypeCommand(
    () => eventStore.get(MEDIA_TYPE_TREE_EVENT_STORE_KEY),
    (event) => eventStore.save(MEDIA_TYPE_TREE_EVENT_STORE_KEY, [event]),
  )

  const result = await updateMediaType({
    id: 'test-id',
    update: { name: 'Test (Updated)', parents: [] },
  })

  expect(result).toEqual(ok(undefined))

  const events = eventStore.get(MEDIA_TYPE_TREE_EVENT_STORE_KEY)
  expect(events).toEqual([
    mediaTypeCreatedEvent({ mediaType: { id: 'test-id', name: 'Test', parents: [] } }),
    mediaTypeUpdatedEvent({ id: 'test-id', update: { name: 'Test (Updated)', parents: [] } }),
  ])
})

it('should error if media type update fails', async () => {
  const eventStore = new MemoryEventStore<MediaTypeEvent>()
  const updateMediaType = createUpdateMediaTypeCommand(
    () => eventStore.get(MEDIA_TYPE_TREE_EVENT_STORE_KEY),
    (event) => eventStore.save(MEDIA_TYPE_TREE_EVENT_STORE_KEY, [event]),
  )

  const result = await updateMediaType({
    id: 'test-id',
    update: { name: 'Test (Updated)', parents: [] },
  })

  expect(result).toEqual(err(new MediaTypeNotFoundError('test-id')))

  const events = eventStore.get(MEDIA_TYPE_TREE_EVENT_STORE_KEY)
  expect(events).toEqual([])
})
