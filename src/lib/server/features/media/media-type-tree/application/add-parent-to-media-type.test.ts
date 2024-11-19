import { expect, it } from 'vitest'

import { MediaTypeParentAddedEvent } from '../domain/events'
import { CycleError, MediaTypeNotFoundError } from '../domain/tree'
import { MemoryMediaTypeTreeEventStore } from '../infrastructure/memory-event-store'
import { MemoryMediaTypeTreeRepository } from '../infrastructure/memory-repository'
import { AddMediaTypeCommand } from './add-media-type'
import { AddParentToMediaTypeCommand } from './add-parent-to-media-type'

it('should persist valid parent-child relationship', async () => {
  // Arrange
  const eventStore = new MemoryMediaTypeTreeEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)
  const parent = await new AddMediaTypeCommand(repo).execute()
  const child = await new AddMediaTypeCommand(repo).execute()
  const command = new AddParentToMediaTypeCommand(repo)

  // Act
  const result = await command.execute(child.id, parent.id)

  // Assert
  expect(result).toBeUndefined() // Success case returns void
  const events = eventStore.get()
  expect(events).toHaveLength(3) // 2 adds + 1 relationship
  expect(events[2]).toBeInstanceOf(MediaTypeParentAddedEvent)
  expect((events[2] as MediaTypeParentAddedEvent).childId).toBe(child.id)
  expect((events[2] as MediaTypeParentAddedEvent).parentId).toBe(parent.id)
})

it('should propagate domain errors through the application layer', async () => {
  // Arrange
  const eventStore = new MemoryMediaTypeTreeEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)
  const mediaType = await new AddMediaTypeCommand(repo).execute()
  const command = new AddParentToMediaTypeCommand(repo)

  // Act
  const result = await command.execute(mediaType.id, mediaType.id)

  // Assert
  expect(result).toBeInstanceOf(CycleError)
  const events = eventStore.get()
  expect(events).toHaveLength(1) // Only the initial add, relationship not persisted
})

it('should handle non-existent media types', async () => {
  // Arrange
  const eventStore = new MemoryMediaTypeTreeEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)
  const command = new AddParentToMediaTypeCommand(repo)

  // Act
  const result = await command.execute(999, 998)

  // Assert
  expect(result).toBeInstanceOf(MediaTypeNotFoundError)
  const events = eventStore.get()
  expect(events).toHaveLength(0)
})
