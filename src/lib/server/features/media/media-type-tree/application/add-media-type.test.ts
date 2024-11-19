import { expect, it } from 'vitest'

import { MediaTypeAddedEvent } from '../domain/events'
import { MemoryMediaTypeTreeEventStore } from '../infrastructure/memory-event-store'
import { MemoryMediaTypeTreeRepository } from '../infrastructure/memory-repository'
import { AddMediaTypeCommand } from './add-media-type'

it('should persist a new media type through the repository', async () => {
  // Arrange
  const eventStore = new MemoryMediaTypeTreeEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)
  const command = new AddMediaTypeCommand(repo)

  // Act
  const result = await command.execute()

  // Assert
  const events = eventStore.get()
  expect(events).toHaveLength(1)
  expect(events[0]).toBeInstanceOf(MediaTypeAddedEvent)
  expect((events[0] as MediaTypeAddedEvent).id).toBe(result.id)
})
