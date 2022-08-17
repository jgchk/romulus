import { CrudOperation } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { addGenreHistory } from '../genre-history'
import { CreateGenreInput, EditGenreInput } from './inputs'
import {
  DefaultGenre,
  defaultGenreSelect,
  SimpleGenre,
  simpleGenreSelect,
  treeGenreSelect,
} from './outputs'
import { throwOnCycle } from './utils'

export const getGenres = () =>
  prisma.genre.findMany({ select: defaultGenreSelect })

export const getSimpleGenres = () =>
  prisma.genre.findMany({ select: simpleGenreSelect })

export const getTreeGenres = () =>
  prisma.genre.findMany({ select: treeGenreSelect })

export const getGenre = async (id: number): Promise<DefaultGenre> => {
  const genre = await prisma.genre.findUnique({
    where: { id },
    select: defaultGenreSelect,
  })

  if (!genre) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No genre with id '${id}'`,
    })
  }

  return genre
}

export const getSimpleGenre = async (id: number): Promise<SimpleGenre> => {
  const genre = await prisma.genre.findUnique({
    where: { id },
    select: simpleGenreSelect,
  })

  if (!genre) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No genre with id '${id}'`,
    })
  }

  return genre
}

export const createGenre = async (
  input: CreateGenreInput,
  accountId: number
): Promise<DefaultGenre> => {
  await throwOnCycle(input)

  const genre = await prisma.genre.create({
    data: {
      ...input,
      akas: { create: input.akas },
      parentGenres: input.parentGenres
        ? { connect: input.parentGenres.map((id) => ({ id })) }
        : undefined,
      influencedByGenres: input.influencedByGenres
        ? { connect: input.influencedByGenres.map((id) => ({ id })) }
        : undefined,
    },
    select: defaultGenreSelect,
  })

  await addGenreHistory(genre, CrudOperation.CREATE, accountId)

  return genre
}

export const editGenre = async (
  { id, data }: EditGenreInput,
  accountId: number
): Promise<DefaultGenre> => {
  let name = data.name

  if (name === undefined) {
    const genre = await prisma.genre.findUnique({
      where: { id },
      select: { name: true },
    })
    name = genre?.name
  }

  if (name === undefined) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No genre with id '${id}'`,
    })
  }

  await throwOnCycle({ id, ...data, name })

  const genre = await prisma.genre.update({
    where: { id },
    data: {
      ...data,
      akas: data.akas ? { deleteMany: {}, create: data.akas } : undefined,
      parentGenres: data.parentGenres
        ? { set: data.parentGenres.map((id) => ({ id })) }
        : undefined,
      influencedByGenres: data.influencedByGenres
        ? { set: data.influencedByGenres.map((id) => ({ id })) }
        : undefined,
    },
    select: defaultGenreSelect,
  })

  await addGenreHistory(genre, CrudOperation.UPDATE, accountId)

  return genre
}

export const deleteGenre = async (
  id: number,
  accountId: number
): Promise<{ id: number }> => {
  const genre = await prisma.genre.findUnique({
    where: { id },
    include: {
      akas: true,
      parentGenres: { select: { id: true } },
      childGenres: {
        include: {
          akas: true,
          parentGenres: { select: { id: true } },
          childGenres: { select: { id: true } },
          influencedByGenres: { select: { id: true } },
          influencesGenres: { select: { id: true } },
        },
      },
      influencedByGenres: { select: { id: true } },
      influencesGenres: {
        include: {
          akas: true,
          parentGenres: { select: { id: true } },
          childGenres: { select: { id: true } },
          influencedByGenres: { select: { id: true } },
          influencesGenres: { select: { id: true } },
        },
      },
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

  await addGenreHistory(genre, CrudOperation.DELETE, accountId)

  const relations = [...genre.childGenres, ...genre.influencesGenres]
  for (const genre of relations) {
    await addGenreHistory(genre, CrudOperation.UPDATE, accountId)
  }

  return { id }
}
