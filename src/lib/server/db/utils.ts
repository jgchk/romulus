import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import { type GenreOperation } from '$lib/types/genres'

import { genreHistoryAkas, type genres } from './schema'
import type { IDatabase } from './wrapper'

export async function createGenreHistoryEntry({
  genre,
  accountId,
  operation,
  db,
}: {
  genre: Pick<
    InferSelectModel<typeof genres>,
    'id' | 'name' | 'type' | 'shortDescription' | 'longDescription' | 'notes' | 'subtitle' | 'nsfw'
  > & {
    parents: { parentId: number }[]
    influencedBy: { influencerId: number }[]
    akas: Omit<InferInsertModel<typeof genreHistoryAkas>, 'genreId'>[]
  }
  accountId: number
  operation: GenreOperation
  db: IDatabase
}) {
  await db.genreHistory.insert({
    name: genre.name,
    type: genre.type,
    shortDescription: genre.shortDescription,
    longDescription: genre.longDescription,
    notes: genre.notes,
    parentGenreIds: genre.parents.map((parent) => parent.parentId),
    influencedByGenreIds: genre.influencedBy.map((influencer) => influencer.influencerId),
    treeGenreId: genre.id,
    nsfw: genre.nsfw,
    operation,
    accountId,
    subtitle: genre.subtitle,
    akas: genre.akas,
  })
}

type CycleGenre = { id: number; name: string; parents: number[] }

export async function detectCycle(
  data: {
    id?: number
    name: string
    parents?: number[]
    children?: number[]
  },
  db: IDatabase,
) {
  let allGenres = await db.genres.findAllSimple().then((genres) =>
    genres.map((genre) => ({
      ...genre,
      parents: genre.parents.map((parent) => parent.parentId),
    })),
  )

  // if the user has made any updates to parent/child genres,
  // temporarily apply those updates before checking for cycles
  const id = data.id ?? -1
  if (!allGenres.some((genre) => genre.id === id)) {
    allGenres.push({
      id,
      name: data.name,
      parents: data.parents ?? [],
    })
  }

  if (data.parents) {
    const parents = data.parents
    allGenres = allGenres.map((genre) => (genre.id === data.id ? { ...genre, parents } : genre))
  }
  if (data.children) {
    const children = data.children
    allGenres = allGenres.map((genre) =>
      children.includes(genre.id) ? { ...genre, parentGenres: [...genre.parents, id] } : genre,
    )
  }

  const allGenresMap = new Map(allGenres.map((genre) => [genre.id, genre]))

  for (const genre of allGenres) {
    const cycle = detectCycleInner(genre.id, [], allGenresMap)
    if (cycle) {
      const formattedCycle = cycle.map((id) => allGenresMap.get(id)!.name).join(' → ')
      return formattedCycle
    }
  }
}

function detectCycleInner(
  id: number,
  stack: number[],
  allGenresMap: Map<number, CycleGenre>,
): number[] | false {
  if (stack.includes(id)) {
    return [...stack, id]
  }

  const genre = allGenresMap.get(id)
  if (!genre) return false

  for (const parentId of genre.parents) {
    const cycle = detectCycleInner(parentId, [...stack, id], allGenresMap)
    if (cycle) {
      return cycle
    }
  }

  return false
}
