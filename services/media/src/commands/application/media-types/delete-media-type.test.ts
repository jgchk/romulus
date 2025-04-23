import { expect, it } from 'vitest'

import { mediaTypeDeletedEvent, type MediaTypeEvent } from '../../../common/domain/events.js'
import { MemoryEventStore } from '../../../common/infrastructure/memory-event-store.js'
import { createSaveMediaTypeEvent } from '../../infrastructure/media-types.js'
import { createDeleteMediaTypeCommandHandler } from './delete-media-type.js'

it('should delete a media type', async () => {
  const eventStore = new MemoryEventStore<{ 'media-types': MediaTypeEvent }>()
  const deleteMediaType = createDeleteMediaTypeCommandHandler(createSaveMediaTypeEvent(eventStore))

  const result = await deleteMediaType({
    id: 'test-id',
    userId: 0,
  })

  expect(result).toEqual(undefined)

  const events = eventStore.get('media-types')
  expect(events.map((event) => event.eventData)).toEqual([
    mediaTypeDeletedEvent({ id: 'test-id', userId: 0 }),
  ])
})
