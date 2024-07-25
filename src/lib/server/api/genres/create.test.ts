import { describe, expect, it } from 'vitest'

import MockDatabase from '$lib/server/db/mock'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { createGenre } from './create'

describe('createGenre', () => {
  const genreData = {
    name: 'Test',
    subtitle: null,
    type: 'STYLE' as const,
    shortDescription: null,
    longDescription: null,
    notes: null,
    primaryAkas: null,
    secondaryAkas: null,
    tertiaryAkas: null,
    parents: [],
    influencedBy: [],
    relevance: undefined,
    nsfw: false,
  }

  const accountId = 10101

  it('should create a genre', async () => {
    const db = new MockDatabase()
    const createdGenre = await createGenre(genreData, accountId, db)

    expect(createdGenre).toEqual({
      id: expect.any(Number) as number,
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      akas: [],
      parents: [],
      influencedBy: [],
      relevance: 99,
      nsfw: false,
      createdAt: expect.any(Date) as Date,
      updatedAt: expect.any(Date) as Date,
    })
  })

  it('should support setting a subtitle', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        subtitle: 'Subtitle',
      },
      accountId,
      new MockDatabase(),
    )
    expect(createdGenre.subtitle).toBe('Subtitle')
  })

  it('should support setting a short description', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        shortDescription: 'Short description',
      },
      accountId,
      new MockDatabase(),
    )

    expect(createdGenre.shortDescription).toBe('Short description')
  })

  it('should support setting a long description', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        longDescription: 'Long description',
      },
      accountId,
      new MockDatabase(),
    )

    expect(createdGenre.longDescription).toBe('Long description')
  })

  it('should support setting notes', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        notes: 'Notes',
      },
      accountId,
      new MockDatabase(),
    )

    expect(createdGenre.notes).toBe('Notes')
  })

  it('should support setting AKAs', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        primaryAkas: 'primary one, primary two',
        secondaryAkas: 'secondary one, secondary two',
        tertiaryAkas: 'tertiary one, tertiary two',
      },
      accountId,
      new MockDatabase(),
    )

    expect(createdGenre.akas).toEqual([
      { name: 'primary one', relevance: 3, order: 0 },
      { name: 'primary two', relevance: 3, order: 1 },
      { name: 'secondary one', relevance: 2, order: 0 },
      { name: 'secondary two', relevance: 2, order: 1 },
      { name: 'tertiary one', relevance: 1, order: 0 },
      { name: 'tertiary two', relevance: 1, order: 1 },
    ])
  })

  it('should support setting parents', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        parents: [1, 2, 3],
      },
      accountId,
      new MockDatabase(),
    )

    expect(createdGenre.parents).toEqual([1, 2, 3])
  })

  it('should support setting influences', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        influencedBy: [1, 2, 3],
      },
      accountId,
      new MockDatabase(),
    )

    expect(createdGenre.influencedBy).toEqual([1, 2, 3])
  })

  it('should support setting a relevance', async () => {
    const db = new MockDatabase()
    const createdGenre = await createGenre(
      {
        ...genreData,
        relevance: 1,
      },
      accountId,
      db,
    )

    expect(createdGenre.relevance).toBe(1)

    expect(db.genreRelevanceVotes.upsert).toHaveBeenCalledTimes(1)
    expect(db.genreRelevanceVotes.upsert).toHaveBeenCalledWith({
      genreId: createdGenre.id,
      accountId,
      relevance: 1,
      updatedAt: expect.any(Date) as Date,
    })
  })

  it('should not add a relevance vote when relevance is unset', async () => {
    const db = new MockDatabase()
    await createGenre({ ...genreData, relevance: UNSET_GENRE_RELEVANCE }, accountId, db)
    expect(db.genreRelevanceVotes.upsert).not.toHaveBeenCalled()
  })

  it('should support setting NSFW', async () => {
    const createdGenre = await createGenre(
      {
        ...genreData,
        nsfw: true,
      },
      accountId,
      new MockDatabase(),
    )
    expect(createdGenre.nsfw).toBe(true)
  })

  it('should add a history entry', async () => {
    const db = new MockDatabase()
    const createdGenre = await createGenre(genreData, accountId, db)

    expect(db.genreHistory.insert).toHaveBeenCalledTimes(1)
    expect(db.genreHistory.insert).toHaveBeenCalledWith({
      treeGenreId: createdGenre.id,
      name: 'Test',
      subtitle: null,
      type: 'STYLE' as const,
      shortDescription: null,
      longDescription: null,
      notes: null,
      akas: [],
      parentGenreIds: [],
      influencedByGenreIds: [],
      relevance: 99,
      nsfw: false,
      accountId,
      operation: 'CREATE',
    })
  })
})