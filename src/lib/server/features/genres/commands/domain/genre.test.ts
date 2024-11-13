import { describe, expect, it } from 'vitest'

import { DuplicateAkaError } from './errors/duplicate-aka'
import { Genre } from './genre'
import { GenreHistory } from './genre-history'

describe('Genre', () => {
  const baseGenreParams = {
    name: 'Test Genre',
    type: 'STYLE' as const,
    nsfw: false,
    akas: {
      primary: [],
      secondary: [],
      tertiary: [],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }

  describe('create', () => {
    it('creates a valid genre', () => {
      const result = Genre.create(baseGenreParams)

      expect(result).toBeInstanceOf(Genre)
      if (result instanceof Genre) {
        expect(result.name).toBe('Test Genre')
        expect(result.type).toBe('STYLE')
        expect(result.nsfw).toBe(false)
      }
    })

    it('trims whitespace from name', () => {
      const result = Genre.create({
        ...baseGenreParams,
        name: '  Test Genre  ',
      })

      expect(result).toBeInstanceOf(Genre)
      if (result instanceof Genre) {
        expect(result.name).toBe('Test Genre')
      }
    })

    it('trims whitespace from subtitle', () => {
      const result = Genre.create({
        ...baseGenreParams,
        subtitle: '  Test Subtitle  ',
      })

      expect(result).toBeInstanceOf(Genre)
      if (result instanceof Genre) {
        expect(result.subtitle).toBe('Test Subtitle')
      }
    })

    it('filters out empty AKAs after trimming', () => {
      const result = Genre.create({
        ...baseGenreParams,
        akas: {
          primary: ['  ', 'Valid AKA', '   '],
          secondary: [],
          tertiary: [],
        },
      })

      expect(result).toBeInstanceOf(Genre)
      if (result instanceof Genre) {
        expect(result.akas.primary).toEqual(['Valid AKA'])
      }
    })

    it('returns DuplicateAkaError when same AKA exists within primary level', () => {
      const result = Genre.create({
        ...baseGenreParams,
        akas: {
          primary: ['Duplicate', 'Duplicate'],
          secondary: [],
          tertiary: [],
        },
      })

      expect(result).toBeInstanceOf(DuplicateAkaError)
      if (result instanceof DuplicateAkaError) {
        expect(result.aka).toBe('Duplicate')
        expect(result.level).toBe('primary')
      }
    })

    it('returns DuplicateAkaError when same AKA exists across different levels', () => {
      const result = Genre.create({
        ...baseGenreParams,
        akas: {
          primary: ['Duplicate'],
          secondary: ['Duplicate'],
          tertiary: [],
        },
      })

      expect(result).toBeInstanceOf(DuplicateAkaError)
      if (result instanceof DuplicateAkaError) {
        expect(result.aka).toBe('Duplicate')
        expect(result.level).toBe('secondary')
      }
    })
  })

  describe('withUpdate', () => {
    const baseGenre = Genre.create(baseGenreParams) as Genre

    it('updates basic properties', () => {
      const result = baseGenre.withUpdate({
        name: 'Updated Name',
        subtitle: 'New Subtitle',
        type: 'TREND',
        nsfw: true,
      })

      expect(result).toBeInstanceOf(Genre)
      if (result instanceof Genre) {
        expect(result.name).toBe('Updated Name')
        expect(result.subtitle).toBe('New Subtitle')
        expect(result.type).toBe('TREND')
        expect(result.nsfw).toBe(true)
      }
    })

    it('handles null values for optional fields', () => {
      const genreWithSubtitle = Genre.create({
        ...baseGenreParams,
        subtitle: 'Original Subtitle',
      }) as Genre

      const result = genreWithSubtitle.withUpdate({
        subtitle: null,
      })

      expect(result).toBeInstanceOf(Genre)
      if (result instanceof Genre) {
        expect(result.subtitle).toBeUndefined()
      }
    })

    it('updates AKAs', () => {
      const result = baseGenre.withUpdate({
        akas: {
          primary: ['New AKA'],
          secondary: ['Secondary AKA'],
          tertiary: ['Tertiary AKA'],
        },
      })

      expect(result).toBeInstanceOf(Genre)
      if (result instanceof Genre) {
        expect(result.akas.primary).toEqual(['New AKA'])
        expect(result.akas.secondary).toEqual(['Secondary AKA'])
        expect(result.akas.tertiary).toEqual(['Tertiary AKA'])
      }
    })

    it('returns DuplicateAkaError when update creates duplicate AKAs', () => {
      const result = baseGenre.withUpdate({
        akas: {
          primary: ['Duplicate'],
          secondary: ['Duplicate'],
        },
      })

      expect(result).toBeInstanceOf(DuplicateAkaError)
      if (result instanceof DuplicateAkaError) {
        expect(result.aka).toBe('Duplicate')
        expect(result.level).toBe('secondary')
      }
    })

    it('preserves unchanged fields', () => {
      const originalGenre = Genre.create({
        ...baseGenreParams,
        subtitle: 'Original Subtitle',
        shortDescription: 'Original Short Description',
        longDescription: 'Original Long Description',
        notes: 'Original Notes',
      }) as Genre

      const result = originalGenre.withUpdate({
        name: 'Updated Name',
      })

      expect(result).toBeInstanceOf(Genre)
      if (result instanceof Genre) {
        expect(result.name).toBe('Updated Name')
        expect(result.subtitle).toBe('Original Subtitle')
        expect(result.shortDescription).toBe('Original Short Description')
        expect(result.longDescription).toBe('Original Long Description')
        expect(result.notes).toBe('Original Notes')
      }
    })
  })

  describe('isChangedFrom', () => {
    const baseGenre = Genre.create(baseGenreParams) as Genre

    it('detects changes in basic properties', () => {
      const history = new GenreHistory(
        'Different Name',
        undefined,
        'STYLE',
        false,
        undefined,
        undefined,
        undefined,
        new Set(),
        new Set(),
        new Set(),
        { primary: [], secondary: [], tertiary: [] },
        1,
        new Date(),
        'CREATE',
        1,
      )

      expect(baseGenre.isChangedFrom(new Set(), new Set(), new Set(), history)).toBe(true)
    })

    it('detects changes in relationships', () => {
      const history = new GenreHistory(
        baseGenre.name,
        baseGenre.subtitle,
        baseGenre.type,
        baseGenre.nsfw,
        baseGenre.shortDescription,
        baseGenre.longDescription,
        baseGenre.notes,
        new Set([1]),
        new Set([2]),
        new Set([3]),
        baseGenre.akas,
        1,
        new Date(),
        'CREATE',
        1,
      )

      expect(baseGenre.isChangedFrom(new Set(), new Set(), new Set(), history)).toBe(true)
    })

    it('detects changes in AKAs', () => {
      const history = new GenreHistory(
        baseGenre.name,
        baseGenre.subtitle,
        baseGenre.type,
        baseGenre.nsfw,
        baseGenre.shortDescription,
        baseGenre.longDescription,
        baseGenre.notes,
        new Set(),
        new Set(),
        new Set(),
        { primary: ['Different AKA'], secondary: [], tertiary: [] },
        1,
        new Date(),
        'CREATE',
        1,
      )

      expect(baseGenre.isChangedFrom(new Set(), new Set(), new Set(), history)).toBe(true)
    })

    it('returns false when nothing has changed', () => {
      const history = new GenreHistory(
        baseGenre.name,
        baseGenre.subtitle,
        baseGenre.type,
        baseGenre.nsfw,
        baseGenre.shortDescription,
        baseGenre.longDescription,
        baseGenre.notes,
        new Set(),
        new Set(),
        new Set(),
        baseGenre.akas,
        1,
        new Date(),
        'CREATE',
        1,
      )

      expect(baseGenre.isChangedFrom(new Set(), new Set(), new Set(), history)).toBe(false)
    })
  })
})
