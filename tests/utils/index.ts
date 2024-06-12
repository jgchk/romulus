import { inArray, type InferInsertModel } from 'drizzle-orm'
import { zip } from 'ramda'

import { hashPassword } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { accounts, genreParents, genres } from '$lib/server/db/schema'

import type { InsertTestGenre } from './genres'

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

export type CreatedGenre = Awaited<ReturnType<typeof createGenres>>[number]
export const createGenres = async (data: InsertTestGenre[]) => {
  if (data.length === 0) return []

  const parsedData: InferInsertModel<typeof genres>[] = data.map((genre) => ({
    ...genre,
    updatedAt: new Date(),
  }))

  const outputGenres = await db.transaction(async (tx) => {
    const ids = (await tx.insert(genres).values(parsedData).returning({ id: genres.id })).map(
      (res) => res.id,
    )

    const nameToIdMap = new Map(
      zip(
        parsedData.map((d) => d.name),
        ids,
      ),
    )

    const parentRelations: InferInsertModel<typeof genreParents>[] = data.flatMap((genre) => {
      const genreId = nameToIdMap.get(genre.name)
      if (!genreId) {
        throw new Error(`Genre ${genre.name} not found`)
      }

      return (
        genre.parents?.map((parentName) => {
          const parentId = nameToIdMap.get(parentName)
          if (!parentId) {
            throw new Error(`Parent genre ${parentName} not found`)
          }

          return {
            parentId,
            childId: genreId,
          }
        }) ?? []
      )
    })

    if (parentRelations.length > 0) {
      await tx.insert(genreParents).values(parentRelations)
    }

    return zip(data, ids).map(([data, id]) => ({ ...data, id }))
  })

  return outputGenres
}

export const deleteGenres = async () => {
  await db.delete(genres)
}
