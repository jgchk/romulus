import { GenreOperation } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { setDiff } from '../../../utils/set'
import { check } from '../../../utils/validators'
import { prisma } from '../../prisma'
import { DefaultGenre, defaultGenreSelect } from './types'
import { throwOnCycle } from './utils'
import { addGenreHistory, addGenreHistoryById } from './utils'
import { CreateGenreInput, EditGenreInput, LocationIdInput } from './validators'

export const createGenre = async (
  input: CreateGenreInput,
  accountId: number
): Promise<DefaultGenre> => {
  await throwOnCycle(input)

  const locationIds = input.locations
    ? await Promise.all(
        input.locations.map(async (location) => {
          if (check(LocationIdInput, location)) {
            return location.id
          }

          const dbLocation = await prisma.location.create({
            data: location,
            select: { id: true },
          })

          return dbLocation.id
        })
      )
    : undefined

  const genre = await prisma.genre.create({
    data: {
      ...input,
      locations: locationIds
        ? { connect: locationIds.map((id) => ({ id })) }
        : undefined,
      parentGenres: input.parentGenres
        ? { connect: input.parentGenres.map((id) => ({ id })) }
        : undefined,
      childGenres: input.childGenres
        ? { connect: input.childGenres.map((id) => ({ id })) }
        : undefined,
      influencedByGenres: input.influencedByGenres
        ? { connect: input.influencedByGenres.map((id) => ({ id })) }
        : undefined,
      influencesGenres: input.influencesGenres
        ? { connect: input.influencesGenres.map((id) => ({ id })) }
        : undefined,
      contributors: { connect: { id: accountId } },
    },
    select: defaultGenreSelect,
  })

  await addGenreHistory(genre, GenreOperation.CREATE, accountId)

  const relationIds = [
    ...(input.parentGenres ?? []),
    ...(input.childGenres ?? []),
    ...(input.influencedByGenres ?? []),
    ...(input.influencesGenres ?? []),
  ]
  await Promise.all(
    relationIds.map((id) =>
      addGenreHistoryById(id, GenreOperation.UPDATE, accountId)
    )
  )

  return genre
}

export const editGenre = async (
  { id, data }: EditGenreInput,
  accountId: number
): Promise<DefaultGenre> => {
  await throwOnCycle({ id, ...data })

  const originalGenre = await prisma.genre.findUnique({
    where: { id },
    select: {
      parentGenres: { select: { id: true } },
      childGenres: { select: { id: true } },
      influencedByGenres: { select: { id: true } },
      influencesGenres: { select: { id: true } },
    },
  })
  if (!originalGenre) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No genre with id '${id}'`,
    })
  }

  const parentGenresUpdated =
    !!data.parentGenres &&
    setDiff(
      new Set(originalGenre.parentGenres.map((g) => g.id)),
      new Set(data.parentGenres)
    )
  const childGenresUpdated =
    !!data.childGenres &&
    setDiff(
      new Set(originalGenre.childGenres.map((g) => g.id)),
      new Set(data.childGenres)
    )
  const influencedByGenresUpdated =
    !!data.influencedByGenres &&
    setDiff(
      new Set(originalGenre.influencedByGenres.map((g) => g.id)),
      new Set(data.influencedByGenres)
    )
  const influencesGenresUpdated =
    !!data.influencesGenres &&
    setDiff(
      new Set(originalGenre.influencesGenres.map((g) => g.id)),
      new Set(data.influencesGenres)
    )

  const genre = await prisma.genre.update({
    where: { id },
    data: {
      ...data,
      parentGenres: data.parentGenres
        ? { set: data.parentGenres.map((id) => ({ id })) }
        : undefined,
      childGenres: data.childGenres
        ? { set: data.childGenres.map((id) => ({ id })) }
        : undefined,
      influencedByGenres: data.influencedByGenres
        ? { set: data.influencedByGenres.map((id) => ({ id })) }
        : undefined,
      influencesGenres: data.influencesGenres
        ? { set: data.influencesGenres.map((id) => ({ id })) }
        : undefined,
      contributors: { connect: { id: accountId } },
    },
    select: defaultGenreSelect,
  })

  await addGenreHistory(genre, GenreOperation.UPDATE, accountId)

  const updatedRelationIds = [
    ...(parentGenresUpdated
      ? [...parentGenresUpdated.added, ...parentGenresUpdated.removed]
      : []),
    ...(childGenresUpdated
      ? [...childGenresUpdated.added, ...childGenresUpdated.removed]
      : []),
    ...(influencedByGenresUpdated
      ? [
          ...influencedByGenresUpdated.added,
          ...influencedByGenresUpdated.removed,
        ]
      : []),
    ...(influencesGenresUpdated
      ? [...influencesGenresUpdated.added, ...influencesGenresUpdated.removed]
      : []),
  ]
  await Promise.all(
    updatedRelationIds.map((id) =>
      addGenreHistoryById(id, GenreOperation.UPDATE, accountId)
    )
  )

  return genre
}

export const deleteGenre = async (
  id: number,
  accountId: number
): Promise<{ id: number }> => {
  const genre = await prisma.genre.findUnique({
    where: { id },
    include: {
      parentGenres: { select: { id: true } },
      childGenres: { select: { id: true } },
      influencedByGenres: { select: { id: true } },
      influencesGenres: { select: { id: true } },
    },
  })
  if (!genre) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No genre with id '${id}'`,
    })
  }

  // move child genres under deleted genre's parents
  await prisma.$transaction([
    ...genre.childGenres.flatMap((childGenre) =>
      genre.parentGenres.map((parentGenre) =>
        prisma.genre.update({
          where: { id: childGenre.id },
          data: { parentGenres: { connect: { id: parentGenre.id } } },
        })
      )
    ),
    prisma.genre.delete({ where: { id } }),
  ])

  await addGenreHistory(genre, GenreOperation.DELETE, accountId)

  const relationIds = [
    ...genre.parentGenres.map((g) => g.id),
    ...genre.childGenres.map((g) => g.id),
    ...genre.influencedByGenres.map((g) => g.id),
    ...genre.influencesGenres.map((g) => g.id),
  ]
  await Promise.all(
    relationIds.map((id) =>
      addGenreHistoryById(id, GenreOperation.UPDATE, accountId)
    )
  )

  return { id }
}
