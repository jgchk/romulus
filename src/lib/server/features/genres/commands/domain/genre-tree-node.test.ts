import { describe, expect, it } from 'vitest'

import { DerivedChildError } from './errors/derived-child'
import { DerivedInfluenceError } from './errors/derived-influence'
import { SelfInfluenceError } from './errors/self-influence'
import { GenreTreeNode } from './genre-tree-node'

describe('GenreTreeNode', () => {
  it('should create a valid genre tree node', () => {
    const node = GenreTreeNode.create(1, 'Rock', new Set([2, 3]), new Set([4, 5]), new Set([6, 7]))

    expect(node).toBeInstanceOf(GenreTreeNode)
    if (node instanceof GenreTreeNode) {
      expect(node.id).toBe(1)
      expect(node.name).toBe('Rock')
      expect(node.parents).toEqual(new Set([2, 3]))
      expect(node.derivedFrom).toEqual(new Set([4, 5]))
      expect(node.influences).toEqual(new Set([6, 7]))
    }
  })

  it('should return DerivedChildError when a genre is both derived from and child of same genre', () => {
    const node = GenreTreeNode.create(
      1,
      'Rock',
      new Set([2, 3]),
      new Set([2, 4]), // 2 appears in both parents and derivedFrom
      new Set([5, 6]),
    )

    expect(node).toBeInstanceOf(DerivedChildError)
  })

  it('should return DerivedInfluenceError when a genre is both derived from and influenced by same genre', () => {
    const node = GenreTreeNode.create(
      1,
      'Rock',
      new Set([2, 3]),
      new Set([4, 5]),
      new Set([4, 6]), // 4 appears in both derivedFrom and influences
    )

    expect(node).toBeInstanceOf(DerivedInfluenceError)
  })

  it('should return SelfInfluenceError when a genre influences itself', () => {
    const node = GenreTreeNode.create(
      1,
      'Rock',
      new Set([2, 3]),
      new Set([4, 5]),
      new Set([1, 6]), // 1 is the node's own ID
    )

    expect(node).toBeInstanceOf(SelfInfluenceError)
  })
})
