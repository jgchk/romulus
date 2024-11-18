import { describe, expect } from 'vitest'

import { test } from '../../../../../../vitest-setup'
import { MediaTypeAddedEvent } from '../../media-type-tree/domain/events'
import { MediaTypeTree } from '../../media-type-tree/domain/tree'
import { Transaction } from './transaction'

describe('addMediaType()', () => {
  test('should return a transaction media type added event', () => {
    const startingTree = MediaTypeTree.create()
    const transaction = new Transaction(startingTree)
    const event = transaction.addMediaType()
    expect(event).toBeInstanceOf(MediaTypeAddedEvent)
    expect(event.id).toBeTypeOf('number')
  })
})

describe('getMediaTypeTreeView()', () => {
  test('should return the media type tree with no changes applied', () => {
    const startingTree = MediaTypeTree.create()
    const transaction = new Transaction(startingTree)
    const treeView = transaction.getMediaTypeTreeView()
    expect(treeView).toEqual(startingTree)
  })

  test('should return the media type tree with changes applied', () => {
    const startingTree = MediaTypeTree.create()
    const transaction = new Transaction(startingTree)

    transaction.addMediaType()
    const treeView = transaction.getMediaTypeTreeView()

    const expectedTree = MediaTypeTree.create()
    expectedTree.addMediaType()

    expect(treeView).toEqual(expectedTree)
  })
})
