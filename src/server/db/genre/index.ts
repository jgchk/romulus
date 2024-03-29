import { compareTwoStrings, toAscii } from '../../../utils/string'
import { prisma } from '../../prisma'
import { addGenreHistory } from '../genre-history'
import { setGenreRelevanceVote } from '../genre-relevance'
import { CreateGenreInput, EditGenreInput, Sort } from './inputs'
import {
  DefaultGenre,
  defaultGenreSelect,
  Match,
  SimpleGenre,
  simpleGenreSelect,
} from './outputs'
import { didChange, throwOnCycle } from './utils'
import { CrudOperation } from '@prisma/client'
import { TRPCError } from '@trpc/server'

export const getPaginatedGenres = async (
  page: number,
  size: number,
  sort: Sort[],
) => {
  const skip = page * size
  const result = await prisma.$transaction([
    prisma.genre.count(),
    prisma.genre.findMany({
      skip,
      take: size,
      orderBy: Object.fromEntries(
        sort.map((s) => [s.id, s.desc ? 'desc' : 'asc']),
      ),
      select: defaultGenreSelect,
    }),
  ])
  return {
    results: result[1],
    total: result[0],
  }
}

export const getSimpleGenres = async () =>
  prisma.genre.findMany({ select: simpleGenreSelect })

export const searchSimpleGenres = async (query: string) => {
  const allGenres = await prisma.genre.findMany({ select: simpleGenreSelect })

  const m: Match[] = []

  for (const genre of allGenres) {
    let name = genre.name
    if (genre.subtitle) {
      name += ` [${genre.subtitle}]`
    }
    const nameWeight = getMatchWeight(name, query)
    let match: Match = { id: genre.id, genre, weight: nameWeight }

    for (const aka of genre.akas) {
      // TODO: incorporate aka relevance
      const akaWeight = getMatchWeight(aka.name, query)
      if (akaWeight > match.weight) {
        match = {
          id: genre.id,
          genre,
          matchedAka: aka.name,
          weight: akaWeight,
        }
      }
    }

    if (match.weight >= WEIGHT_THRESHOLD) {
      m.push(match)
    }
  }

  return m
    .sort(
      (a, b) =>
        b.weight - a.weight ||
        a.genre.name.toLowerCase().localeCompare(b.genre.name.toLowerCase()),
    )
    .slice(0, 100)
}

const WEIGHT_THRESHOLD = 0.2
const toFilterString = (s: string) => toAscii(s.toLowerCase())
const getMatchWeight = (name: string, filter: string) => {
  const fName = toFilterString(name)
  const fFilter = toFilterString(filter)

  if (fName.length < 2 || fFilter.length < 2) {
    if (fName.startsWith(fFilter)) {
      return 1
    } else if (fName.includes(fFilter)) {
      return 0.5
    } else {
      return 0
    }
  }

  return compareTwoStrings(fName, fFilter)
}

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
  { relevance, ...input }: CreateGenreInput,
  accountId: number,
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

  if (relevance !== undefined) {
    await setGenreRelevanceVote({ genreId: genre.id, relevance }, accountId)
  }

  return genre
}

export const editGenre = async (
  { id, data: { relevance, ...data } }: EditGenreInput,
  accountId: number,
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

  if (relevance !== undefined) {
    await setGenreRelevanceVote({ genreId: id, relevance }, accountId)
  }

  const lastHistory = await prisma.genreHistory.findFirst({
    where: { treeGenreId: id },
    orderBy: { createdAt: 'desc' },
    include: { akas: true },
  })

  if (lastHistory && !didChange(data, lastHistory)) {
    return getGenre(id)
  }

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
  accountId: number,
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
        }),
      ),
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
