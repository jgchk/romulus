import { inArray, type InferInsertModel } from 'drizzle-orm'

import { hashPassword } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { accounts, genreAkas, genreInfluences, genreParents, genres } from '$lib/server/db/schema'

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

  return db.insert(accounts).values(hashedAccounts).returning()
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
    const createdGenres = await tx.insert(genres).values(parsedData).returning()

    const nameToIdMap = new Map(createdGenres.map((genre) => [genre.name, genre.id]))

    const akas: InferInsertModel<typeof genreAkas>[] = data.flatMap((genre) => {
      const genreId = nameToIdMap.get(genre.name)
      if (!genreId) {
        throw new Error(`Genre ${genre.name} not found`)
      }

      return [
        ...(genre.akas?.primary?.map((name, i) => ({ genreId, name, relevance: 3, order: i })) ??
          []),
        ...(genre.akas?.secondary?.map((name, i) => ({ genreId, name, relevance: 2, order: i })) ??
          []),
        ...(genre.akas?.tertiary?.map((name, i) => ({ genreId, name, relevance: 1, order: i })) ??
          []),
      ]
    })

    if (akas.length > 0) {
      await tx.insert(genreAkas).values(akas)
    }

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
      await tx.insert(genreInfluences).values(influenceRelations)
    }

    return tx.query.genres.findMany({
      where: inArray(
        genres.id,
        createdGenres.map((genre) => genre.id),
      ),
      with: {
        parents: {
          columns: {
            parentId: true,
          },
        },
        influencedBy: {
          columns: {
            influencerId: true,
          },
        },
        akas: {
          columns: {
            name: true,
            relevance: true,
            order: true,
          },
        },
      },
    })
  })

  return outputGenres
}

export const deleteGenres = async () => {
  await db.delete(genres)
}
