import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import { type GenreOperation, UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { median } from '$lib/utils/math'

import type { IGenresDatabase } from './db/controllers/genre'
import type { genreHistoryAkas, genres } from './db/schema'
import type { IDatabase } from './db/wrapper'

export class GenreCycleError extends Error {
  constructor(public cycle: string) {
    super(`Cycle detected: ${cycle}`)
  }
}

type CycleGenre = { id: number; name: string; parents: number[] }

export async function detectCycle(
  data: {
    id?: number
    name: string
    parents?: number[]
    children?: number[]
  },
  genresDb: IGenresDatabase,
) {
  let allGenres = await genresDb.findAllSimple().then((genres) =>
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

export async function setRelevanceVote(
  id: number,
  relevance: number,
  accountId: number,
  db: IDatabase,
  genresDb: IGenresDatabase,
) {
  if (relevance === UNSET_GENRE_RELEVANCE) {
    await db.genreRelevanceVotes.deleteByGenreId(id)
    await updateRelevance(id, db, genresDb)
    return
  }

  await db.genreRelevanceVotes.upsert({
    genreId: id,
    accountId,
    relevance,
    updatedAt: new Date(),
  })

  await updateRelevance(id, db, genresDb)
}

async function updateRelevance(genreId: number, db: IDatabase, genresDb: IGenresDatabase) {
  const votes = await db.genreRelevanceVotes.findByGenreId(genreId)

  const relevance =
    votes.length === 0
      ? UNSET_GENRE_RELEVANCE
      : Math.round(median(votes.map((vote) => vote.relevance)))

  await genresDb.update(genreId, { relevance })
}

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
