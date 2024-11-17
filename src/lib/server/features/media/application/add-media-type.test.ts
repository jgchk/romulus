import { expect, it } from 'vitest'

import { MemoryEventStore } from '../infrastructure/memory-event-store'
import { MemoryMediaTypeTreeRepository } from '../infrastructure/memory-media-type-tree-repository'
import { AddMediaTypeCommand } from './add-media-type'
import { GetMediaTypeTreeQuery } from './get-media-type-tree'

it('should create a new media type', async () => {
  const eventStore = new MemoryEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)

  const command = new AddMediaTypeCommand(repo, eventStore)
  const result = await command.execute()
  expect(result.id).toEqual(expect.any(Number))

  const queryResult = await new GetMediaTypeTreeQuery(repo).execute()
  expect(queryResult).toEqual([{ id: result.id, children: new Set() }])
})
