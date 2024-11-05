import { inArray, type InferInsertModel } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import {
  type accounts,
  type Genre,
  type GenreAka,
  genreAkas,
  genreInfluences,
  genreParents,
  genres,
  type InsertGenre,
  type InsertGenreAka,
} from '$lib/server/db/schema'
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
    const createdGenres = await insertGenre(
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

    const outputGenres = await findGenresByIds(
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

type ExtendedInsertGenre = InsertGenre & {
  akas: Omit<InsertGenreAka, 'genreId'>[]
  parents: number[]
  influencedBy: number[]
}

function insertGenre(
  data: ExtendedInsertGenre[],
  conn: IDrizzleConnection,
): Promise<
  (Genre & {
    akas: Omit<GenreAka, 'genreId'>[]
    parents: number[]
    influencedBy: number[]
  })[]
> {
  return conn.transaction(async (tx) => {
    const entries = await tx.insert(genres).values(data).returning()

    const akas = data.flatMap((entry, i) =>
      entry.akas.map((aka) => ({ ...aka, genreId: entries[i].id })),
    )
    if (akas.length > 0) {
      await tx.insert(genreAkas).values(akas)
    }

    const parents = data.flatMap((entry, i) =>
      entry.parents.map((parentId) => ({ childId: entries[i].id, parentId })),
    )
    if (parents.length > 0) {
      await tx.insert(genreParents).values(parents)
    }

    const influencedBy = data.flatMap((entry, i) =>
      entry.influencedBy.map((influencerId) => ({ influencedId: entries[i].id, influencerId })),
    )
    if (influencedBy.length > 0) {
      await tx.insert(genreInfluences).values(influencedBy)
    }

    const results = await tx.query.genres.findMany({
      where: inArray(
        genres.id,
        entries.map((entry) => entry.id),
      ),
      with: {
        akas: true,
        parents: {
          columns: { parentId: true },
        },
        influencedBy: {
          columns: { influencerId: true },
        },
      },
    })

    return results.map((genre) => ({
      ...genre,
      influencedBy: genre.influencedBy.map(({ influencerId }) => influencerId),
      parents: genre.parents.map(({ parentId }) => parentId),
    }))
  })
}

async function findGenresByIds(ids: Genre['id'][], conn: IDrizzleConnection) {
  if (ids.length === 0) return []

  const results = await conn.query.genres.findMany({
    where: inArray(genres.id, ids),
    with: {
      akas: {
        columns: {
          name: true,
          relevance: true,
          order: true,
        },
      },
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
    },
  })

  return results.map((genre) => ({
    ...genre,
    parents: genre.parents.map(({ parentId }) => parentId),
    influencedBy: genre.influencedBy.map(({ influencerId }) => influencerId),
  }))
}

export const deleteGenres = async (ids: number[], dbConnection: IDrizzleConnection) => {
  if (ids.length === 0) return

  await dbConnection.delete(genres).where(inArray(genres.id, ids))

  const genreHistoryDb = new GenreHistoryDatabase()
  await genreHistoryDb.deleteByGenreIds(ids, dbConnection)
}
