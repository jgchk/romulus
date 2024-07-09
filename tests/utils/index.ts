import { type InferInsertModel } from 'drizzle-orm'

import { hashPassword } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { accounts, genreInfluences, genreParents, genres } from '$lib/server/db/schema'

export type InsertTestGenre = Omit<InferInsertModel<typeof genres>, 'updatedAt'> & {
  akas?: { primary?: string[]; secondary?: string[]; tertiary?: string[] }
  parents?: string[]
  influences?: string[]
}

export type CreatedAccount = Awaited<ReturnType<typeof createAccounts>>[number]
export const createAccounts = async (accounts_: InferInsertModel<typeof accounts>[]) => {
  const hashedAccounts = await Promise.all(
    accounts_.map(async (account) => ({
      ...account,
      password: await hashPassword(account.password),
    })),
  )

  return db.accounts.insert(...hashedAccounts)
}

export const deleteAccounts = async (usernames: string[]) => {
  await db.accounts.deleteByUsername(...usernames)
}

export type CreatedGenre = Awaited<ReturnType<typeof createGenres>>[number]
export const createGenres = async (data: InsertTestGenre[]) => {
  if (data.length === 0) return []

  const outputGenres = await db.transaction(async (tx) => {
    const createdGenres = await tx.genres.insert(
      ...data.map((genre) => ({
        ...genre,
        akas: [
          ...(genre.akas?.primary?.map((name, i) => ({ name, relevance: 3, order: i })) ?? []),
          ...(genre.akas?.secondary?.map((name, i) => ({ name, relevance: 2, order: i })) ?? []),
          ...(genre.akas?.tertiary?.map((name, i) => ({ name, relevance: 1, order: i })) ?? []),
        ],
        parents: [],
        influencedBy: [],
        updatedAt: new Date(),
      })),
    )

    const nameToIdMap = new Map(createdGenres.map((genre) => [genre.name, genre.id]))

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
      await tx.genreParents.insert(...parentRelations)
    }

    const influenceRelations: InferInsertModel<typeof genreInfluences>[] = data.flatMap((genre) => {
      const genreId = nameToIdMap.get(genre.name)
      if (!genreId) {
        throw new Error(`Genre ${genre.name} not found`)
      }

      return (
        genre.influences?.map((influenceName) => {
          const influencerId = nameToIdMap.get(influenceName)
          if (!influencerId) {
            throw new Error(`Influence genre ${influenceName} not found`)
          }

          return {
            influencerId,
            influencedId: genreId,
          }
        }) ?? []
      )
    })

    if (influenceRelations.length > 0) {
      await tx.genreInfluences.insert(...influenceRelations)
    }

    return tx.genres.findByIds(createdGenres.map((genre) => genre.id))
  })

  return outputGenres
}

export const deleteGenres = async () => {
  await db.genres.deleteAll()
}
