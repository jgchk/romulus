import { expect, it } from 'vitest'

import { MemoryMediaTypeTreeEventStore } from '../infrastructure/memory-event-store'
import { MemoryMediaTypeTreeRepository } from '../infrastructure/memory-repository'
import { AddMediaTypeCommand } from './add-media-type'
import { AddParentToMediaTypeCommand } from './add-parent-to-media-type'
import { GetMediaTypeTreeQuery } from './get-media-type-tree'

it('should return empty array for empty tree', async () => {
  const eventStore = new MemoryMediaTypeTreeEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)
  const query = new GetMediaTypeTreeQuery(repo)

  const result = await query.execute()
  expect(result).toEqual([])
})

it('should return tree structure with relationships', async () => {
  const eventStore = new MemoryMediaTypeTreeEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)

  const parent = await new AddMediaTypeCommand(repo, eventStore).execute()
  const child = await new AddMediaTypeCommand(repo, eventStore).execute()
  const addParentResult = await new AddParentToMediaTypeCommand(repo, eventStore).execute(
    child.id,
    parent.id,
  )
  if (addParentResult instanceof Error) {
    expect.fail(`Failed to parent for media type: ${addParentResult.message}`)
  }

  const result = await new GetMediaTypeTreeQuery(repo).execute()
  expect(result).toEqual([
    { id: parent.id, children: new Set([child.id]) },
    { id: child.id, children: new Set() },
  ])
})
