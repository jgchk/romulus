import type { InferInsertModel } from 'drizzle-orm'

import { type GenreOperation, UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { median } from '$lib/utils/math'

import type { IGenresDatabase } from './db/controllers/genre'
import type { IGenreHistoryDatabase } from './db/controllers/genre-history'
import type { IGenreRelevanceVotesDatabase } from './db/controllers/genre-relevance-votes'
import type { Genre, genreHistoryAkas } from './db/schema'

export class GenreCycleError extends Error {
  constructor(public cycle: string) {
    super(`Cycle detected: ${cycle}`)
  }
}

type CycleGenre = { id: number; name: string; parents: number[] }

export async function detectCycle<T>(
  data: {
    id?: number
    name: string
    parents?: number[]
    children?: number[]
  },
  genresDb: IGenresDatabase<T>,
  connection: T,
) {
  let allGenres = await genresDb.findAllSimple(connection)

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

export async function setRelevanceVote<T>(
  id: number,
  relevance: number,
  accountId: number,
  genresDb: IGenresDatabase<T>,
  genreRelevanceVotesDb: IGenreRelevanceVotesDatabase<T>,
  connection: T,
) {
  if (relevance === UNSET_GENRE_RELEVANCE) {
    await genreRelevanceVotesDb.deleteByGenreId(id, connection)
    await updateRelevance(id, genresDb, genreRelevanceVotesDb, connection)
    return
  }

  await genreRelevanceVotesDb.upsert(
    {
      genreId: id,
      accountId,
      relevance,
      updatedAt: new Date(),
    },
    connection,
  )

  await updateRelevance(id, genresDb, genreRelevanceVotesDb, connection)
}

async function updateRelevance<T>(
  genreId: number,
  genresDb: IGenresDatabase<T>,
  genreRelevanceVotesDb: IGenreRelevanceVotesDatabase<T>,
  connection: T,
) {
  const votes = await genreRelevanceVotesDb.findByGenreId(genreId, connection)

  const relevance =
    votes.length === 0
      ? UNSET_GENRE_RELEVANCE
      : Math.round(median(votes.map((vote) => vote.relevance)))

  await genresDb.update(genreId, { relevance }, connection)
}

export async function createGenreHistoryEntry<T>({
  genre,
  accountId,
  operation,
  genreHistoryDb,
  connection,
}: {
  genre: Pick<
    Genre,
    'id' | 'name' | 'type' | 'shortDescription' | 'longDescription' | 'notes' | 'subtitle' | 'nsfw'
  > & {
    parents: number[]
    influencedBy: number[]
    akas: Omit<InferInsertModel<typeof genreHistoryAkas>, 'genreId'>[]
  }
  accountId: number
  operation: GenreOperation
  genreHistoryDb: IGenreHistoryDatabase<T>
  connection: T
}) {
  await genreHistoryDb.insert(
    [
      {
        name: genre.name,
        type: genre.type,
        shortDescription: genre.shortDescription,
        longDescription: genre.longDescription,
        notes: genre.notes,
        parentGenreIds: genre.parents,
        influencedByGenreIds: genre.influencedBy,
        treeGenreId: genre.id,
        nsfw: genre.nsfw,
        operation,
        accountId,
        subtitle: genre.subtitle,
        akas: genre.akas,
      },
    ],
    connection,
  )
}
