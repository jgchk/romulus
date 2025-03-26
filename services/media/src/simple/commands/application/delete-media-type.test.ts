import { expect, it } from 'vitest'

import type { MediaTypeEvent } from '../../common/domain/events.js'
import { MemoryEventStore } from '../../common/infrastructure/memory-event-store.js'
import { mediaTypeDeletedEvent } from '../domain/delete-media-type.js'
import { MEDIA_TYPE_TREE_EVENT_STORE_KEY } from './common.js'
import { createDeleteMediaTypeCommand } from './delete-media-type.js'

it('should delete a media type', async () => {
  const eventStore = new MemoryEventStore<MediaTypeEvent>()
  const deleteMediaType = createDeleteMediaTypeCommand((event) =>
    eventStore.save(MEDIA_TYPE_TREE_EVENT_STORE_KEY, [event]),
  )

  const result = await deleteMediaType({
    id: 'test-id',
  })

  expect(result).toEqual(undefined)

  const events = eventStore.get(MEDIA_TYPE_TREE_EVENT_STORE_KEY)
  expect(events).toEqual([mediaTypeDeletedEvent({ id: 'test-id' })])
})
