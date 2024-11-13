import { describe, expect, it } from 'vitest'

import { DerivedChildError } from './errors/derived-child'
import { DerivedInfluenceError } from './errors/derived-influence'
import { GenreCycleError } from './errors/genre-cycle'
import { SelfInfluenceError } from './errors/self-influence'
import { GenreTree } from './genre-tree'

describe('GenreTree', () => {
  describe('insertGenre', () => {
    it('successfully inserts a genre with no relationships', () => {
      const tree = new GenreTree([])
      const result = tree.insertGenre(1, 'Rock', new Set(), new Set(), new Set())

      expect(result).toBeUndefined()
      expect(tree.map.get(1)).toBeDefined()
      expect(tree.map.get(1)?.name).toBe('Rock')
    })

    it('successfully inserts a genre with parent relationships', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Music', new Set(), new Set(), new Set())
      const result = tree.insertGenre(2, 'Rock', new Set([1]), new Set(), new Set())

      expect(result).toBeUndefined()
      expect(tree.map.get(2)?.parents).toEqual(new Set([1]))
    })

    it('successfully inserts a genre with derived relationships', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Blues', new Set(), new Set(), new Set())
      const result = tree.insertGenre(2, 'Rock', new Set(), new Set([1]), new Set())

      expect(result).toBeUndefined()
      expect(tree.map.get(2)?.derivedFrom).toEqual(new Set([1]))
    })

    it('successfully inserts a genre with influence relationships', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Blues', new Set(), new Set(), new Set())
      const result = tree.insertGenre(2, 'Rock', new Set(), new Set(), new Set([1]))

      expect(result).toBeUndefined()
      expect(tree.map.get(2)?.influences).toEqual(new Set([1]))
    })

    it('returns DerivedChildError when genre is both derived and child', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Music', new Set(), new Set(), new Set())
      const result = tree.insertGenre(2, 'Rock', new Set([1]), new Set([1]), new Set())

      expect(result).toBeInstanceOf(DerivedChildError)
      expect((result as DerivedChildError).childId).toBe(2)
    })

    it('returns DerivedInfluenceError when genre is both derived and influence', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Blues', new Set(), new Set(), new Set())
      const result = tree.insertGenre(2, 'Rock', new Set(), new Set([1]), new Set([1]))

      expect(result).toBeInstanceOf(DerivedInfluenceError)
      expect((result as DerivedInfluenceError).childId).toBe(2)
    })

    it('returns SelfInfluenceError when genre influences itself', () => {
      const tree = new GenreTree([])
      const result = tree.insertGenre(1, 'Rock', new Set(), new Set(), new Set([1]))

      expect(result).toBeInstanceOf(SelfInfluenceError)
    })
  })

  describe('updateGenre', () => {
    it('successfully updates a genre with new relationships', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Music', new Set(), new Set(), new Set())
      tree.insertGenre(2, 'Rock', new Set(), new Set(), new Set())

      const result = tree.updateGenre(2, 'Rock', new Set([1]), new Set(), new Set())

      expect(result).toBeUndefined()
      expect(tree.map.get(2)?.parents).toEqual(new Set([1]))
    })

    it('detects cycles in parent relationships', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Music', new Set(), new Set(), new Set())
      tree.insertGenre(2, 'Rock', new Set([1]), new Set(), new Set())

      const result = tree.updateGenre(1, 'Music', new Set([2]), new Set(), new Set())

      expect(result).toBeInstanceOf(GenreCycleError)
      expect((result as GenreCycleError).cycle).toBe('Music → Rock → Music')
    })

    it('detects cycles in derived relationships', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Blues', new Set(), new Set(), new Set())
      tree.insertGenre(2, 'Rock', new Set(), new Set([1]), new Set())

      const result = tree.updateGenre(1, 'Blues', new Set(), new Set([2]), new Set())

      expect(result).toBeInstanceOf(GenreCycleError)
      expect((result as GenreCycleError).cycle).toBe('Blues → Rock → Blues')
    })

    it('detects cycles in mixed relationships', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Blues', new Set(), new Set(), new Set())
      tree.insertGenre(2, 'Rock', new Set([1]), new Set(), new Set())
      tree.insertGenre(3, 'Metal', new Set(), new Set([2]), new Set())

      const result = tree.updateGenre(1, 'Blues', new Set(), new Set([3]), new Set())

      expect(result).toBeInstanceOf(GenreCycleError)
    })

    it('returns DerivedChildError when update makes genre both derived and child', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Music', new Set(), new Set(), new Set())
      tree.insertGenre(2, 'Rock', new Set([1]), new Set(), new Set())

      const result = tree.updateGenre(2, 'Rock', new Set([1]), new Set([1]), new Set())

      expect(result).toBeInstanceOf(DerivedChildError)
      expect((result as DerivedChildError).childId).toBe(2)
    })
  })

  describe('deleteGenre', () => {
    it('marks genre as deleted', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Music', new Set(), new Set(), new Set())
      tree.deleteGenre(1)

      expect(tree.map.get(1)?.status).toBe('deleted')
    })

    it('moves children to parent genres when deleting intermediate node', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Music', new Set(), new Set(), new Set())
      tree.insertGenre(2, 'Rock', new Set([1]), new Set(), new Set())
      tree.insertGenre(3, 'Metal', new Set([2]), new Set(), new Set())

      tree.deleteGenre(2)

      expect(tree.map.get(3)?.parents).toEqual(new Set([1]))
      expect(tree.map.get(3)?.status).toBe('updated')
    })

    it('handles deletion of genre with multiple parents', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Music', new Set(), new Set(), new Set())
      tree.insertGenre(2, 'Dance', new Set(), new Set(), new Set())
      tree.insertGenre(3, 'Rock', new Set([1, 2]), new Set(), new Set())
      tree.insertGenre(4, 'Metal', new Set([3]), new Set(), new Set())

      tree.deleteGenre(3)

      expect(tree.map.get(4)?.parents).toEqual(new Set([1, 2]))
      expect(tree.map.get(4)?.status).toBe('updated')
    })
  })

  describe('getters', () => {
    it('getParents returns correct set of parent ids', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Music', new Set(), new Set(), new Set())
      tree.insertGenre(2, 'Rock', new Set([1]), new Set(), new Set())

      expect(tree.getParents(2)).toEqual(new Set([1]))
      expect(tree.getParents(1)).toEqual(new Set())
    })

    it('getDerivedFrom returns correct set of derived ids', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Blues', new Set(), new Set(), new Set())
      tree.insertGenre(2, 'Rock', new Set(), new Set([1]), new Set())

      expect(tree.getDerivedFrom(2)).toEqual(new Set([1]))
      expect(tree.getDerivedFrom(1)).toEqual(new Set())
    })

    it('getInfluences returns correct set of influence ids', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Blues', new Set(), new Set(), new Set())
      tree.insertGenre(2, 'Rock', new Set(), new Set(), new Set([1]))

      expect(tree.getInfluences(2)).toEqual(new Set([1]))
      expect(tree.getInfluences(1)).toEqual(new Set())
    })

    it('getGenreChildren returns correct set of child ids', () => {
      const tree = new GenreTree([])
      tree.insertGenre(1, 'Music', new Set(), new Set(), new Set())
      tree.insertGenre(2, 'Rock', new Set([1]), new Set(), new Set())
      tree.insertGenre(3, 'Pop', new Set([1]), new Set(), new Set())

      expect(tree.getGenreChildren(1)).toEqual(new Set([2, 3]))
      expect(tree.getGenreChildren(2)).toEqual(new Set())
    })

    it('returns empty sets for non-existent genres', () => {
      const tree = new GenreTree([])

      expect(tree.getParents(999)).toEqual(new Set())
      expect(tree.getDerivedFrom(999)).toEqual(new Set())
      expect(tree.getInfluences(999)).toEqual(new Set())
      expect(tree.getGenreChildren(999)).toEqual(new Set())
    })
  })
})
