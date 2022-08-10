import { Genre, GenreOperation } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'

type BasicGenre = {
  id: number
  name: string
  parentGenres: {
    id: number
  }[]
}

const detectCycleInner = (
  id: number,
  stack: number[],
  allGenresMap: Record<number, BasicGenre>
): number[] | false => {
  if (stack.includes(id)) {
    return [...stack, id]
  }

  const genre = allGenresMap[id]
  const parentIds = genre.parentGenres.map((g) => g.id)

  for (const parentId of parentIds) {
    const cycle = detectCycleInner(parentId, [...stack, id], allGenresMap)
    if (cycle) {
      return cycle
    }
  }

  return false
}

const detectCycle = async (data: {
  id?: number
  name: string
  parentGenres?: number[]
  childGenres?: number[]
}) => {
  let allGenres: BasicGenre[] = await prisma.genre.findMany({
    select: { id: true, name: true, parentGenres: { select: { id: true } } },
  })

  // if the user has made any updates to parent/child genres,
  // temporarily apply those updates before checking for cycles
  const id = data.id ?? -1
  if (!allGenres.some((genre) => genre.id === id)) {
    allGenres.push({
      id,
      name: data.name,
      parentGenres: data.parentGenres?.map((id) => ({ id })) ?? [],
    })
  }

  if (data.parentGenres) {
    const parentGenres = data.parentGenres
    allGenres = allGenres.map((genre) =>
      genre.id === data.id
        ? { ...genre, parentGenres: parentGenres.map((id) => ({ id })) }
        : genre
    )
  }
  if (data.childGenres) {
    const childGenres = data.childGenres
    allGenres = allGenres.map((genre) =>
      childGenres.includes(genre.id)
        ? { ...genre, parentGenres: [...genre.parentGenres, { id }] }
        : genre
    )
  }

  const allGenresMap: Record<number, BasicGenre> = Object.fromEntries(
    allGenres.map((genre) => [genre.id, genre])
  )

  for (const genre of allGenres) {
    const cycle = detectCycleInner(genre.id, [], allGenresMap)
    if (cycle) {
      const formattedCycle = cycle
        .map((id) => allGenresMap[id].name)
        .join(' → ')
      return formattedCycle
    }
  }

  return false
}

export const throwOnCycle = async (data: {
  id?: number
  name: string
  parentGenres?: number[]
  childGenres?: number[]
}) => {
  const cycle = await detectCycle(data)
  if (cycle) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Cycle detected in genre tree:\n${cycle}`,
    })
  }
}

export const addGenreHistory = (
  genre: Omit<Genre, 'createdAt' | 'updatedAt'> & {
    parentGenres: { id: number }[]
    childGenres: { id: number }[]
    influencedByGenres: { id: number }[]
    influencesGenres: { id: number }[]
    contributors?: unknown
    createdAt?: unknown
    updatedAt?: unknown
  },
  operation: GenreOperation,
  accountId: number
) => {
  const {
    id,
    parentGenres,
    childGenres,
    influencedByGenres,
    influencesGenres,

    /* eslint-disable @typescript-eslint/no-unused-vars */
    contributors,
    createdAt,
    updatedAt,
    /* eslint-enable @typescript-eslint/no-unused-vars */

    ...data
  } = genre
  return prisma.genreHistory.create({
    data: {
      ...data,
      parentGenreIds: parentGenres.map((g) => g.id),
      childGenreIds: childGenres.map((g) => g.id),
      influencedByGenreIds: influencedByGenres.map((g) => g.id),
      influencesGenreIds: influencesGenres.map((g) => g.id),
      treeGenreId: id,
      operation,
      accountId,
    },
  })
}

export const addGenreHistoryById = async (
  id: number,
  operation: GenreOperation,
  accountId: number
) => {
  const updatedGenre = await prisma.genre.findUnique({
    where: { id },
    include: {
      parentGenres: { select: { id: true } },
      childGenres: { select: { id: true } },
      influencedByGenres: { select: { id: true } },
      influencesGenres: { select: { id: true } },
    },
  })
  if (!updatedGenre) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No genre with id '${id}'`,
    })
  }

  await addGenreHistory(updatedGenre, operation, accountId)
}
