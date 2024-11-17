import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { MemoryIdGenerator } from '../../../infrastructure/memory-id-generator'
import { MediaTypeAlreadyExistsError, MediaTypeTree } from '../tree'
import { AddMediaTypeToTreeEvent } from './add-media-type-to-tree'

test('should add a media type to the tree', () => {
  const tree = new MediaTypeTree()
  const id = new MemoryIdGenerator().generate()
  const event = new AddMediaTypeToTreeEvent(id)
  const result = event.process(tree)
  if (result instanceof Error) {
    expect.fail(`Failed to add media type to tree: ${result.message}`)
  }
  expect(tree.get(id)).toBeDefined()
})

test('should error if media type already exists with id', () => {
  const tree = new MediaTypeTree()
  const id = new MemoryIdGenerator().generate()
  const event = new AddMediaTypeToTreeEvent(id)

  const initialAddResult = event.process(tree)
  if (initialAddResult instanceof Error) {
    expect.fail(`Failed to add media type to tree: ${initialAddResult.message}`)
  }

  const secondAddResult = event.process(tree)
  expect(secondAddResult).toBeInstanceOf(MediaTypeAlreadyExistsError)
})
