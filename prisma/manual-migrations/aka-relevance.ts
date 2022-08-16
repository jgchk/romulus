import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_AKA_RELEVANCE = 3

const main = async () => {
  const allGenres = await prisma.genre.findMany({})

  for (const [i, genre] of allGenres.entries()) {
    console.log(`[${i}/${allGenres.length - 1}] Updating genres`)
    await prisma.$transaction(
      genre.oldAkas.map((oldAka, i) =>
        prisma.genreAka.upsert({
          where: { genreId_name: { genreId: genre.id, name: oldAka } },
          create: {
            name: oldAka,
            relevance: DEFAULT_AKA_RELEVANCE,
            genreId: genre.id,
            order: i,
          },
          update: {},
        })
      )
    )
  }

  const allGenreHistory = await prisma.genreHistory.findMany({})

  for (const [i, genreHistory] of allGenreHistory.entries()) {
    console.log(`[${i}/${allGenreHistory.length - 1}] Updating genre history`)
    await prisma.$transaction(
      genreHistory.oldAkas.map((oldAka, i) =>
        prisma.genreHistoryAka.upsert({
          where: { genreId_name: { genreId: genreHistory.id, name: oldAka } },
          create: {
            name: oldAka,
            relevance: DEFAULT_AKA_RELEVANCE,
            genreId: genreHistory.id,
            order: i,
          },
          update: {},
        })
      )
    )
  }
}

void main()
