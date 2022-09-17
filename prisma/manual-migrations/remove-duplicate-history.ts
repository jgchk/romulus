import { GenreHistory, GenreHistoryAka } from '@prisma/client'
import dotenv from 'dotenv'
import { equals } from 'ramda'

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
  const aData = getChangeableData(a)
  const bData = getChangeableData(b)
  return !equals(aData, bData)
}

const getChangeableData = (history: FullGenreHistory) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, operation, accountId, ...data } = history
  return data
}

void main()
