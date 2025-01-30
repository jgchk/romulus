import { err } from 'neverthrow'
import { describe, expect, it } from 'vitest'

import { DuplicateAkaError } from './errors/duplicate-aka.js'
import { Genre } from './genre.js'
import { GenreHistory } from './genre-history.js'

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
      if (result.isErr()) {
        expect.fail(`Failed to create genre: ${result.error.message}`)
      }

      expect(result.value).toBeInstanceOf(Genre)
      if (result.value instanceof Genre) {
        expect(result.value.name).toBe('Test Genre')
        expect(result.value.type).toBe('STYLE')
        expect(result.value.nsfw).toBe(false)
      }
    })

    it('trims whitespace from name', () => {
      const result = Genre.create({
        ...baseGenreParams,
        name: '  Test Genre  ',
      })
      if (result.isErr()) {
        expect.fail(`Failed to create genre: ${result.error.message}`)
      }

      expect(result.value).toBeInstanceOf(Genre)
      if (result.value instanceof Genre) {
        expect(result.value.name).toBe('Test Genre')
      }
    })

    it('trims whitespace from subtitle', () => {
      const result = Genre.create({
        ...baseGenreParams,
        subtitle: '  Test Subtitle  ',
      })
      if (result.isErr()) {
        expect.fail(`Failed to create genre: ${result.error.message}`)
      }

      expect(result.value).toBeInstanceOf(Genre)
      if (result.value instanceof Genre) {
        expect(result.value.subtitle).toBe('Test Subtitle')
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
      if (result.isErr()) {
        expect.fail(`Failed to create genre: ${result.error.message}`)
      }

      expect(result.value).toBeInstanceOf(Genre)
      if (result.value instanceof Genre) {
        expect(result.value.akas.primary).toEqual(['Valid AKA'])
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

      expect(result).toEqual(err(new DuplicateAkaError('Duplicate', 'primary')))
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

      expect(result).toEqual(err(new DuplicateAkaError('Duplicate', 'secondary')))
    })
  })

  describe('withUpdate', () => {
    it('updates basic properties', () => {
      const baseGenre = Genre.create(baseGenreParams)
      if (baseGenre.isErr()) {
        expect.fail(`Failed to create genre: ${baseGenre.error.message}`)
      }

      const result = baseGenre.value.withUpdate({
        name: 'Updated Name',
        subtitle: 'New Subtitle',
        type: 'TREND',
        nsfw: true,
      })
      if (result.isErr()) {
        expect.fail(`Failed to update genre: ${result.error.message}`)
      }

      expect(result.value).toBeInstanceOf(Genre)
      if (result.value instanceof Genre) {
        expect(result.value.name).toBe('Updated Name')
        expect(result.value.subtitle).toBe('New Subtitle')
        expect(result.value.type).toBe('TREND')
        expect(result.value.nsfw).toBe(true)
      }
    })

    it('handles null values for optional fields', () => {
      const genreWithSubtitle = Genre.create({
        ...baseGenreParams,
        subtitle: 'Original Subtitle',
      })
      if (genreWithSubtitle.isErr()) {
        expect.fail(`Failed to create genre: ${genreWithSubtitle.error.message}`)
      }

      const result = genreWithSubtitle.value.withUpdate({
        subtitle: null,
      })
      if (result.isErr()) {
        expect.fail(`Failed to update genre: ${result.error.message}`)
      }

      expect(result.value).toBeInstanceOf(Genre)
      if (result.value) {
        expect(result.value.subtitle).toBeUndefined()
      }
    })

    it('updates AKAs', () => {
      const baseGenre = Genre.create(baseGenreParams)
      if (baseGenre.isErr()) {
        expect.fail(`Failed to create genre: ${baseGenre.error.message}`)
      }

      const result = baseGenre.value.withUpdate({
        akas: {
          primary: ['New AKA'],
          secondary: ['Secondary AKA'],
          tertiary: ['Tertiary AKA'],
        },
      })
      if (result.isErr()) {
        expect.fail(`Failed to update genre: ${result.error.message}`)
      }

      expect(result.value).toBeInstanceOf(Genre)
      if (result.value) {
        expect(result.value.akas.primary).toEqual(['New AKA'])
        expect(result.value.akas.secondary).toEqual(['Secondary AKA'])
        expect(result.value.akas.tertiary).toEqual(['Tertiary AKA'])
      }
    })

    it('returns DuplicateAkaError when update creates duplicate AKAs', () => {
      const baseGenre = Genre.create(baseGenreParams)
      if (baseGenre.isErr()) {
        expect.fail(`Failed to create genre: ${baseGenre.error.message}`)
      }

      const result = baseGenre.value.withUpdate({
        akas: {
          primary: ['Duplicate'],
          secondary: ['Duplicate'],
        },
      })

      expect(result).toEqual(err(new DuplicateAkaError('Duplicate', 'secondary')))
    })

    it('preserves unchanged fields', () => {
      const originalGenre = Genre.create({
        ...baseGenreParams,
        subtitle: 'Original Subtitle',
        shortDescription: 'Original Short Description',
        longDescription: 'Original Long Description',
        notes: 'Original Notes',
      })
      if (originalGenre.isErr()) {
        expect.fail(`Failed to create genre: ${originalGenre.error.message}`)
      }

      const result = originalGenre.value.withUpdate({
        name: 'Updated Name',
      })
      if (result.isErr()) {
        expect.fail(`Failed to update genre: ${result.error.message}`)
      }

      expect(result.value).toBeInstanceOf(Genre)
      if (result.value instanceof Genre) {
        expect(result.value.name).toBe('Updated Name')
        expect(result.value.subtitle).toBe('Original Subtitle')
        expect(result.value.shortDescription).toBe('Original Short Description')
        expect(result.value.longDescription).toBe('Original Long Description')
        expect(result.value.notes).toBe('Original Notes')
      }
    })
  })

  describe('isChangedFrom', () => {
    const baseGenreResult = Genre.create(baseGenreParams)
    if (baseGenreResult.isErr()) {
      expect.fail(`Failed to create genre: ${baseGenreResult.error.message}`)
    }
    const baseGenre = baseGenreResult.value

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
