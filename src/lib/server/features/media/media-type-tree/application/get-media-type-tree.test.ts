// src/lib/server/features/media/media-type-tree/application/get-media-type-tree.test.ts
import { expect, it } from 'vitest'

import { MemoryMediaTypeTreeEventStore } from '../infrastructure/memory-event-store'
import { MemoryMediaTypeTreeRepository } from '../infrastructure/memory-repository'
import { AddMediaTypeCommand } from './add-media-type'
import { AddParentToMediaTypeCommand } from './add-parent-to-media-type'
import { GetMediaTypeTreeQuery } from './get-media-type-tree'

it('should return empty tree when no events exist', async () => {
  // Arrange
  const eventStore = new MemoryMediaTypeTreeEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)
  const query = new GetMediaTypeTreeQuery(repo)

  // Act
  const result = await query.execute()

  // Assert
  expect(result).toEqual([])
})

it('should reconstruct tree state from persisted events', async () => {
  // Arrange
  const eventStore = new MemoryMediaTypeTreeEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)

  const parent = await new AddMediaTypeCommand(repo).execute()
  const child = await new AddMediaTypeCommand(repo).execute()
  const addParentResult = await new AddParentToMediaTypeCommand(repo).execute(child.id, parent.id)
  expect(addParentResult).toBeUndefined()

  const query = new GetMediaTypeTreeQuery(repo)

  // Act
  const result = await query.execute()

  // Assert
  expect(result).toEqual([
    { id: parent.id, children: new Set([child.id]) },
    { id: child.id, children: new Set() },
  ])
})
