import { expect, it } from 'vitest'

import { CycleError, MediaTypeNotFoundError } from '../domain/media-type-tree/tree'
import { MemoryEventStore } from '../infrastructure/memory-event-store'
import { MemoryIdGenerator } from '../infrastructure/memory-id-generator'
import { MemoryMediaTypeTreeRepository } from '../infrastructure/memory-media-type-tree-repository'
import { AddMediaTypeParent } from './add-media-type-parent'
import { CreateMediaTypeCommand } from './create-media-type'
import { GetMediaTypeTreeQuery } from './get-media-type-tree'

it('should successfully add a parent to a media type', async () => {
  const eventStore = new MemoryEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)
  const idGenerator = new MemoryIdGenerator()

  const parent = await new CreateMediaTypeCommand(repo, idGenerator, eventStore).execute()
  const child = await new CreateMediaTypeCommand(repo, idGenerator, eventStore).execute()

  const result = await new AddMediaTypeParent(repo, eventStore).execute(child.id, parent.id)
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
  const idGenerator = new MemoryIdGenerator()

  const parent = await new CreateMediaTypeCommand(repo, idGenerator, eventStore).execute()
  const childId = idGenerator.generate()

  const result = await new AddMediaTypeParent(repo, eventStore).execute(childId, parent.id)
  expect(result).toBeInstanceOf(MediaTypeNotFoundError)
  expect((result as MediaTypeNotFoundError).id).toBe(childId)
})

it('should return error when parent media type not found', async () => {
  const eventStore = new MemoryEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)
  const idGenerator = new MemoryIdGenerator()

  const parentId = idGenerator.generate()
  const child = await new CreateMediaTypeCommand(repo, idGenerator, eventStore).execute()

  const result = await new AddMediaTypeParent(repo, eventStore).execute(child.id, parentId)
  expect(result).toBeInstanceOf(MediaTypeNotFoundError)
  expect((result as MediaTypeNotFoundError).id).toBe(parentId)
})

it('should return error when creating a cycle', async () => {
  const eventStore = new MemoryEventStore()
  const repo = new MemoryMediaTypeTreeRepository(eventStore)
  const idGenerator = new MemoryIdGenerator()

  const parent = await new CreateMediaTypeCommand(repo, idGenerator, eventStore).execute()
  const child = await new CreateMediaTypeCommand(repo, idGenerator, eventStore).execute()
  const grandchild = await new CreateMediaTypeCommand(repo, idGenerator, eventStore).execute()

  const result1 = await new AddMediaTypeParent(repo, eventStore).execute(child.id, parent.id)
  if (result1 instanceof Error) {
    expect.fail(`Failed to add parent for media type: ${result1.message}`)
  }
  const result2 = await new AddMediaTypeParent(repo, eventStore).execute(grandchild.id, child.id)
  if (result2 instanceof Error) {
    expect.fail(`Failed to add parent for media type: ${result2.message}`)
  }

  const cycleResult = await new AddMediaTypeParent(repo, eventStore).execute(
    parent.id,
    grandchild.id,
  )
  expect(cycleResult).toBeInstanceOf(CycleError)
  expect((cycleResult as CycleError).cycle).toEqual([parent.id, child.id, grandchild.id, parent.id])
})
