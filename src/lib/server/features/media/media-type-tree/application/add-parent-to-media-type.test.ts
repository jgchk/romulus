import { expect, it } from 'vitest'

import { CycleError, MediaTypeNotFoundError } from '../domain/tree'
import { MemoryEventStore } from '../infrastructure/memory-event-store'
import { MemoryMediaTypeTreeRepository } from '../infrastructure/memory-media-type-tree-repository'
import { AddMediaTypeCommand } from './add-media-type'
import { AddParentToMediaTypeCommand } from './add-parent-to-media-type'
import { GetMediaTypeTreeQuery } from './get-media-type-tree'

it('should successfully add a parent to a media type', async () => {
  const eventStore = new MemoryEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)

  const parent = await new AddMediaTypeCommand(repo, eventStore).execute()
  const child = await new AddMediaTypeCommand(repo, eventStore).execute()

  const result = await new AddParentToMediaTypeCommand(repo, eventStore).execute(
    child.id,
    parent.id,
  )
  expect(result).toBeUndefined()

  const tree = await new GetMediaTypeTreeQuery(repo).execute()
  expect(tree).toEqual([
    { id: parent.id, children: new Set([child.id]) },
    { id: child.id, children: new Set([]) },
  ])
})

it('should return error when child media type not found', async () => {
  const eventStore = new MemoryEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)

  const parent = await new AddMediaTypeCommand(repo, eventStore).execute()
  const child = { id: parent.id + 1 }

  const result = await new AddParentToMediaTypeCommand(repo, eventStore).execute(
    child.id,
    parent.id,
  )
  expect(result).toBeInstanceOf(MediaTypeNotFoundError)
  expect((result as MediaTypeNotFoundError).id).toBe(child.id)
})

it('should return error when parent media type not found', async () => {
  const eventStore = new MemoryEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)

  const child = await new AddMediaTypeCommand(repo, eventStore).execute()
  const parent = { id: child.id + 1 }

  const result = await new AddParentToMediaTypeCommand(repo, eventStore).execute(
    child.id,
    parent.id,
  )
  expect(result).toBeInstanceOf(MediaTypeNotFoundError)
  expect((result as MediaTypeNotFoundError).id).toBe(parent.id)
})

it('should return error when creating a cycle', async () => {
  const eventStore = new MemoryEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)

  const parent = await new AddMediaTypeCommand(repo, eventStore).execute()
  const child = await new AddMediaTypeCommand(repo, eventStore).execute()
  const grandchild = await new AddMediaTypeCommand(repo, eventStore).execute()

  const result1 = await new AddParentToMediaTypeCommand(repo, eventStore).execute(
    child.id,
    parent.id,
  )
  if (result1 instanceof Error) {
    expect.fail(`Failed to add parent for media type: ${result1.message}`)
  }
  const result2 = await new AddParentToMediaTypeCommand(repo, eventStore).execute(
    grandchild.id,
    child.id,
  )
  if (result2 instanceof Error) {
    expect.fail(`Failed to add parent for media type: ${result2.message}`)
  }

  const cycleResult = await new AddParentToMediaTypeCommand(repo, eventStore).execute(
    parent.id,
    grandchild.id,
  )
  expect(cycleResult).toBeInstanceOf(CycleError)
  expect((cycleResult as CycleError).cycle).toEqual([parent.id, child.id, grandchild.id, parent.id])
})
