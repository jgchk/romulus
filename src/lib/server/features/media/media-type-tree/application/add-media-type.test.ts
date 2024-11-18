import { expect, it } from 'vitest'

import { MemoryMediaTypeTreeEventStore } from '../infrastructure/memory-event-store'
import { MemoryMediaTypeTreeRepository } from '../infrastructure/memory-repository'
import { AddMediaTypeCommand } from './add-media-type'
import { GetMediaTypeTreeQuery } from './get-media-type-tree'

it('should create a new media type', async () => {
  const eventStore = new MemoryMediaTypeTreeEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)

  const command = new AddMediaTypeCommand(repo)
  const result = await command.execute()
  expect(result.id).toEqual(expect.any(Number))

  const queryResult = await new GetMediaTypeTreeQuery(repo).execute()
  expect(queryResult).toEqual([{ id: result.id, children: new Set() }])
})
