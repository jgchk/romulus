import { expect, it } from 'vitest'

import type { MediaArtifactTypeEvent } from '../../../common/domain/events.js'
import { mediaArtifactTypeDeletedEvent } from '../../../common/domain/events.js'
import { MemoryEventStore } from '../../../common/infrastructure/memory-event-store.js'
import { createSaveMediaArtifactTypeEvent } from '../../infrastructure/media-artifact-types.js'
import { createDeleteMediaArtifactTypeCommandHandler } from './delete-media-artifact-type.js'

it('should delete a media artifact type', async () => {
  const eventStore = new MemoryEventStore<{ 'media-artifact-types': MediaArtifactTypeEvent }>()
  const deleteMediaArtifactType = createDeleteMediaArtifactTypeCommandHandler({
    saveMediaArtifactTypeEvent: createSaveMediaArtifactTypeEvent(eventStore),
  })

  const result = await deleteMediaArtifactType({ id: 'test-id', userId: 0 })

  expect(result).toEqual(undefined)

  const events = eventStore.get('media-artifact-types')
  expect(events.map((event) => event.eventData)).toEqual([
    mediaArtifactTypeDeletedEvent({ id: 'test-id', userId: 0 }),
  ])
})
