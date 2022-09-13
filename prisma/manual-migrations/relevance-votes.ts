import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve('.env.local') })

import { createAccount } from '../../src/server/db/account'
import { setGenreRelevanceVote } from '../../src/server/db/genre-relevance'
import { env } from '../../src/server/env'

const prisma = new PrismaClient()

const main = async () => {
  const systemAccount =
    (await prisma.account.findUnique({
      where: { username: env.SYSTEM_USERNAME },
    })) ??
    (await createAccount({
      username: env.SYSTEM_USERNAME,
      password: env.SYSTEM_PASSWORD,
    }))

  const allGenres = await prisma.genre.findMany({
    select: { id: true, relevance: true },
  })

  for (const genre of allGenres) {
    if (genre.relevance === 99) {
      continue
    }

    const editorId =
      (await getLastRelevanceEditorId(genre.id)) ?? systemAccount.id

    await setGenreRelevanceVote(
      {
        genreId: genre.id,
        relevance: genre.relevance,
      },
      editorId
    )
  }
}

const getLastRelevanceEditorId = async (genreId: number) => {
  const history = await prisma.genreHistory.findMany({
    where: { treeGenreId: genreId },
    orderBy: { createdAt: 'desc' },
    select: { relevance: true, accountId: true },
  })

  if (history.length === 0) {
    return null
  }

  let accountId: number | null = null
  if (history.length === 1) {
    accountId = history[0].accountId
  } else if (history.length > 1) {
    for (let i = 0; i < history.length - 1; i++) {
      const thisHistory = history[i]
      const nextHistory = history[i + 1]
      if (thisHistory.relevance !== nextHistory.relevance) {
        accountId = thisHistory.accountId
        break
      }
    }

    if (accountId === null) {
      accountId = history[history.length - 1].accountId
    }
  }

  return accountId
}

void main()
