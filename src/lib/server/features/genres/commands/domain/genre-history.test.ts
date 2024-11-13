import { describe, expect, it } from 'vitest'

import { Genre } from './genre'
import { GenreHistory } from './genre-history'

describe('GenreHistory', () => {
  const baseGenre: Genre = Genre.create({
    id: 1,
    name: 'Test Genre',
    type: 'STYLE',
    nsfw: false,
    akas: {
      primary: [],
      secondary: [],
      tertiary: [],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }) as Genre

  it('should create a GenreHistory from a Genre', () => {
    const parents = new Set<number>([2, 3])
    const derivedFrom = new Set<number>([4, 5])
    const influences = new Set<number>([6, 7])

    const genreHistory = GenreHistory.fromGenre(
      baseGenre.id!,
      baseGenre,
      parents,
      derivedFrom,
      influences,
      'CREATE',
      1,
    )

    expect(genreHistory).toEqual({
      name: baseGenre.name,
      subtitle: baseGenre.subtitle,
      type: baseGenre.type,
      nsfw: baseGenre.nsfw,
      shortDescription: baseGenre.shortDescription,
      longDescription: baseGenre.longDescription,
      notes: baseGenre.notes,
      parents: parents,
      derivedFrom: derivedFrom,
      influences: influences,
      akas: baseGenre.akas,
      genreId: baseGenre.id,
      createdAt: genreHistory.createdAt,
      operation: 'CREATE',
      accountId: 1,
    })
  })

  it('should handle null values for optional fields', () => {
    const genreWithSubtitle = Genre.create({
      ...baseGenre,
      subtitle: 'Original Subtitle',
    }) as Genre

    const genreHistory = GenreHistory.fromGenre(
      genreWithSubtitle.id!,
      genreWithSubtitle,
      new Set(),
      new Set(),
      new Set(),
      'UPDATE',
      1,
    )

    expect(genreHistory.subtitle).toBe('Original Subtitle')

    const genreWithoutSubtitle = Genre.create({
      ...baseGenre,
      subtitle: undefined,
    }) as Genre

    const genreHistoryWithoutSubtitle = GenreHistory.fromGenre(
      genreWithoutSubtitle.id!,
      genreWithoutSubtitle,
      new Set(),
      new Set(),
      new Set(),
      'UPDATE',
      1,
    )

    expect(genreHistoryWithoutSubtitle.subtitle).toBeUndefined()
  })
})
