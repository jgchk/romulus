import { GenreHistory, GenreHistoryAka } from '@prisma/client'
import dotenv from 'dotenv'
import { equals, uniq } from 'ramda'

dotenv.config({ path: '.env.local' })

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
process.env.NODE_ENV = 'development'

import { prisma } from '../../src/server/prisma'

type FullGenreHistory = GenreHistory & {
  akas: GenreHistoryAka[]
}

const main = async () => {
  const allTreeGenreIds = [
    ...new Set(
      await prisma.genreHistory.findMany({ select: { treeGenreId: true } })
    ),
  ]

  for (const [i, { treeGenreId }] of allTreeGenreIds.entries()) {
    console.log(
      `[${i + 1}/${allTreeGenreIds.length}] Remove duplicate history entries...`
    )

    const history = await prisma.genreHistory.findMany({
      where: { treeGenreId },
      orderBy: { createdAt: 'asc' },
      include: { akas: true },
    })

    if (history.length < 2) {
      continue
    }

    const deleteIds = new Set<number>()

    let j = 1
    let last = history[j - 1]
    let curr = history[j]
    while (curr) {
      const changed = didChange(last, curr)

      if (!changed) {
        deleteIds.add(curr.id)
      }

      j += 1
      last = history[j - 1]
      curr = history[j]
    }

    if (deleteIds.size > 0) {
      console.log(`\tFound ${deleteIds.size} duplicates`)

      await prisma.$transaction(
        [...deleteIds].map((id) =>
          prisma.genreHistory.delete({ where: { id } })
        )
      )
    }
  }
}

const didChange = (a: FullGenreHistory, b: FullGenreHistory) => {
  if (a.name !== b.name) {
    return true
  }

  if (a.subtitle !== b.subtitle) {
    return true
  }

  if (a.type !== b.type) {
    return true
  }

  if (a.shortDescription !== b.shortDescription) {
    return true
  }

  if (a.longDescription !== b.longDescription) {
    return true
  }

  if (a.notes !== b.notes) {
    return true
  }

  if (!equals(new Set(a.parentGenreIds), new Set(b.parentGenreIds))) {
    return true
  }

  if (
    !equals(new Set(a.influencedByGenreIds), new Set(b.influencedByGenreIds))
  ) {
    return true
  }

  const aAkas = a.akas.map(getChangeableAkaData)
  const bAkas = b.akas.map(getChangeableAkaData)
  if (!equals(new Set(uniq(aAkas)), new Set(uniq(bAkas)))) {
    return true
  }

  return false
}

const getChangeableAkaData = (aka: GenreHistoryAka) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { genreId, ...data } = aka
  return data
}

void main()
