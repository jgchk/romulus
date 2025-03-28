import { expect, it } from 'vitest'

import { mediaTypeDeletedEvent, type MediaTypeEvent } from '../../common/domain/events.js'
import { MemoryEventStore } from '../../common/infrastructure/memory-event-store.js'
import { MEDIA_TYPE_TREE_EVENT_STORE_KEY } from './common.js'
import { createDeleteMediaTypeCommandHandler } from './delete-media-type.js'

it('should delete a media type', async () => {
  const eventStore = new MemoryEventStore<MediaTypeEvent>()
  const deleteMediaType = createDeleteMediaTypeCommandHandler((event) =>
    eventStore.save(MEDIA_TYPE_TREE_EVENT_STORE_KEY, [event]),
  )

  const result = await deleteMediaType({
    id: 'test-id',
  })

  expect(result).toEqual(undefined)

  const events = eventStore.get(MEDIA_TYPE_TREE_EVENT_STORE_KEY)
  expect(events).toEqual([mediaTypeDeletedEvent({ id: 'test-id' })])
})
