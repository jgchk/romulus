import { describe, expect, it } from 'vitest'

import { createGenreTreeStore, type TreeGenre } from './genre-tree-store.svelte'

function createExampleGenre(data?: Partial<TreeGenre>): TreeGenre {
  return {
    id: 0,
    name: 'Test Genre',
    subtitle: null,
    type: 'STYLE',
    akas: [],
    nsfw: false,
    parents: [],
    derivedFrom: [],
    relevance: 1,
    updatedAt: new Date(),

    ...data,
  }
}

it('should create a genre tree store', () => {
  createGenreTreeStore([])
})

describe('getRootGenres', () => {
  it('should return the IDs of all genres with no parents', () => {
    const store = createGenreTreeStore([
      createExampleGenre({ id: 0, parents: [] }),
      createExampleGenre({ id: 1, parents: [0] }),
      createExampleGenre({ id: 2, parents: [0] }),
      createExampleGenre({ id: 3, parents: [] }),
    ])
    expect(store.getRootGenres()).toEqual([0, 3])
  })
})

describe('getChildren', () => {
  it('should return the IDs of the children of a genre', () => {
    const store = createGenreTreeStore([
      createExampleGenre({ id: 0, parents: [] }),
      createExampleGenre({ id: 1, parents: [0] }),
      createExampleGenre({ id: 2, parents: [0] }),
    ])
    expect(store.getChildren(0)).toEqual([1, 2])
  })
})

describe('getDerivations', () => {
  it('should return the IDs of the derived genres of a genre', () => {
    const store = createGenreTreeStore([
      createExampleGenre({ id: 0, derivedFrom: [] }),
      createExampleGenre({ id: 1, derivedFrom: [0] }),
      createExampleGenre({ id: 2, derivedFrom: [0] }),
    ])
    expect(store.getDerivations(0)).toEqual([1, 2])
  })
})

describe('getGenre', () => {
  it('should return the data for a given genre', () => {
    const store = createGenreTreeStore([
      {
        id: 0,
        name: 'Zero',
        parents: [],
        derivedFrom: [],
        nsfw: false,
        subtitle: null,
        type: 'STYLE',
        relevance: 0,
        akas: [],
        updatedAt: new Date(),
      },
      {
        id: 1,
        name: 'One',
        parents: [0],
        derivedFrom: [],
        nsfw: false,
        subtitle: null,
        type: 'STYLE',
        relevance: 0,
        akas: [],
        updatedAt: new Date(),
      },
    ])
    expect(store.getGenre(1)).toEqual({
      id: 1,
      name: 'One',
      parents: [0],
      derivedFrom: [],
      nsfw: false,
      subtitle: null,
      type: 'STYLE',
      relevance: 0,
      akas: [],
      updatedAt: expect.any(Date) as Date,
    })
  })
})

describe('isPathValid', () => {
  it('should return true if the path is valid', () => {
    const store = createGenreTreeStore([
      createExampleGenre({ id: 0, parents: [] }),
      createExampleGenre({ id: 1, parents: [0] }),
      createExampleGenre({ id: 2, parents: [1] }),
      createExampleGenre({ id: 3, parents: [2] }),
    ])
    expect(store.isPathValid([0])).toBe(true)
    expect(store.isPathValid([0, 1])).toBe(true)
    expect(store.isPathValid([0, 1, 2])).toBe(true)
    expect(store.isPathValid([0, 1, 2, 3])).toBe(true)
  })

  it('should return false if the path is not valid', () => {
    const store = createGenreTreeStore([
      createExampleGenre({ id: 0, parents: [] }),
      createExampleGenre({ id: 1, parents: [0] }),
      createExampleGenre({ id: 2, parents: [1] }),
      createExampleGenre({ id: 3, parents: [2] }),
    ])
    expect(store.isPathValid([])).toBe(false)
    expect(store.isPathValid([1])).toBe(false)
    expect(store.isPathValid([1, 2])).toBe(false)
    expect(store.isPathValid([0, 1, 3])).toBe(false)
  })
})

describe('getPathTo', () => {
  it('should return the shortest path to a genre', () => {
    const store = createGenreTreeStore([
      createExampleGenre({ id: 0, parents: [] }),
      createExampleGenre({ id: 1, parents: [0] }),
      createExampleGenre({ id: 2, parents: [1] }),
      createExampleGenre({ id: 3, parents: [2] }),
    ])
    expect(store.getPathTo(0)).toEqual([0])
    expect(store.getPathTo(1)).toEqual([0, 1])
    expect(store.getPathTo(2)).toEqual([0, 1, 2])
    expect(store.getPathTo(3)).toEqual([0, 1, 2, 3])

    const store2 = createGenreTreeStore([
      {
        id: 1,
        name: 'gooby',
        subtitle: null,
        type: 'STYLE',
        relevance: 99,
        nsfw: false,
        updatedAt: new Date(),
        derivedFrom: [],
        akas: [],
        parents: [],
      },
      {
        id: 2,
        name: 'gooby2',
        subtitle: null,
        type: 'STYLE',
        relevance: 99,
        nsfw: false,
        updatedAt: new Date(),
        derivedFrom: [],
        akas: [],
        parents: [1],
      },
      {
        id: 3,
        name: 'yo',
        subtitle: null,
        type: 'STYLE',
        relevance: 99,
        nsfw: false,
        updatedAt: new Date(),
        derivedFrom: [],
        akas: [],
        parents: [],
      },
    ])
    expect(store2.getPathTo(2)).toEqual([1, 2])
  })
})
