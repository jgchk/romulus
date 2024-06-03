import { inArray, type InferInsertModel } from 'drizzle-orm'
import { splitEvery } from 'ramda'

import { hashPassword } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { accounts, genreParents, genres } from '$lib/server/db/schema'
import type { GenreType } from '$lib/types/genres'

export const createAccounts = async (accounts_: InferInsertModel<typeof accounts>[]) => {
  const hashedAccounts = await Promise.all(
    accounts_.map(async (account) => ({
      ...account,
      password: await hashPassword(account.password),
    })),
  )

  await db.insert(accounts).values(hashedAccounts)
}

export const deleteAccounts = async (usernames: string[]) => {
  await db.delete(accounts).where(inArray(accounts.username, usernames))
}

export const createGenres = async () => {
  const { default: data } = await import('./genres.json', { assert: { type: 'json' } })

  const parsedData: InferInsertModel<typeof genres>[] = data.map((genre) => ({
    ...genre,
    type: genre.type as GenreType,
    updatedAt: new Date(),
  }))

  const parentRelations: InferInsertModel<typeof genreParents>[] = data.flatMap((genre) =>
    genre.parentGenres.map((parent) => ({
      parentId: parent.id,
      childId: genre.id,
    })),
  )

  await db.transaction(async (tx) => {
    await Promise.all(
      splitEvery(100, parsedData).map((parsedData) => tx.insert(genres).values(parsedData)),
    )
    await tx.insert(genreParents).values(parentRelations)
  })
}

export const deleteGenres = async () => {
  await db.delete(genres)
}
