import { type InferInsertModel } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { type accounts, genreInfluences, genreParents, type genres } from '$lib/server/db/schema'
import { type Account } from '$lib/server/db/schema'
import { BcryptHashRepository } from '$lib/server/features/authentication/infrastructure/hash/bcrypt-hash-repository'
import { createGenreHistoryEntry } from '$lib/server/genres'

export type InsertTestGenre = Omit<InferInsertModel<typeof genres>, 'updatedAt'> & {
  akas?: { primary?: string[]; secondary?: string[]; tertiary?: string[] }
  parents?: string[]
  influences?: string[]
}

export type CreatedAccount = Awaited<ReturnType<typeof createAccounts>>[number]
export const createAccounts = async (
  accounts_: InferInsertModel<typeof accounts>[],
  connection: IDrizzleConnection,
): Promise<Account[]> => {
  const hashRepository = new BcryptHashRepository()

  const hashedAccounts = await Promise.all(
    accounts_.map(async (account) => ({
      ...account,
      password: await hashRepository.hash(account.password),
    })),
  )

  const accountsDb = new AccountsDatabase()
  return accountsDb.insert(hashedAccounts, connection)
}

export const deleteAccounts = async (usernames: string[], connection: IDrizzleConnection) => {
  const accountsDb = new AccountsDatabase()
  await accountsDb.deleteByUsername(usernames, connection)
}

export type CreatedGenre = Awaited<ReturnType<typeof createGenres>>[number]
export const createGenres = async (
  data: InsertTestGenre[],
  accountId: number,
  connection: IDrizzleConnection,
) => {
  if (data.length === 0) return []

  const outputGenres = await connection.transaction(async (tx) => {
    const genresDb = new GenresDatabase()

    const createdGenres = await genresDb.insert(
      data.map((genre) => ({
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
      tx,
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

    const outputGenres = await genresDb.findByIds(
      createdGenres.map((genre) => genre.id),
      tx,
    )

    await Promise.all(
      outputGenres.map((genre) =>
        createGenreHistoryEntry({
          genre,
          accountId,
          operation: 'CREATE',
          connection: tx,
        }),
      ),
    )

    return createdGenres
  })

  return outputGenres
}

export const deleteGenres = async (ids: number[], dbConnection: IDrizzleConnection) => {
  const genresDb = new GenresDatabase()
  await genresDb.deleteByIds(ids, dbConnection)

  const genreHistoryDb = new GenreHistoryDatabase()
  await genreHistoryDb.deleteByGenreIds(ids, dbConnection)
}
