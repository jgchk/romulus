import { expect, it } from 'vitest'

import { MemoryEventStore } from '../infrastructure/memory-event-store'
import { MemoryIdGenerator } from '../infrastructure/memory-id-generator'
import { MemoryMediaTypeTreeRepository } from '../infrastructure/memory-media-type-tree-repository'
import { AddMediaTypeToTreeCommand } from './add-media-type-to-tree'
import { GetMediaTypeTreeQuery } from './get-media-type-tree'

it('should create a new media type', async () => {
  const eventStore = new MemoryEventStore()
  const idGenerator = new MemoryIdGenerator()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)

  const command = new AddMediaTypeToTreeCommand(repo, idGenerator, eventStore)
  const result = await command.execute()
  expect(result.id).toEqual(expect.any(Number))

  const queryResult = await new GetMediaTypeTreeQuery(repo).execute()
  expect(queryResult).toEqual([{ id: result.id, children: new Set() }])
})
