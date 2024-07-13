import { and, asc, desc, eq, inArray, lt } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { omit } from 'ramda'

import { hasUpdate, makeUpdate } from '$lib/utils/db'

import * as schema from './schema'
import {
  type Account,
  accounts,
  type Genre,
  type GenreAka,
  genreAkas,
  type GenreHistory,
  genreHistory,
  type GenreHistoryAka,
  genreHistoryAkas,
  type GenreInfluence,
  genreInfluences,
  type GenreParent,
  genreParents,
  type GenreRelevanceVote,
  genreRelevanceVotes,
  genres,
  type InsertAccount,
  type InsertGenre,
  type InsertGenreAka,
  type InsertGenreHistory,
  type InsertGenreHistoryAka,
  type InsertGenreInfluence,
  type InsertGenreParent,
  type InsertGenreRelevanceVote,
  type InsertPasswordResetToken,
  type PasswordResetToken,
  passwordResetTokens,
} from './schema'

export interface IDatabase {
  transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T>
  accounts: IAccountsDatabase
  passwordResetTokens: IPasswordResetTokensDatabase
  genres: IGenresDatabase
  genreParents: IGenreParentsDatabase
  genreInfluences: IGenreInfluencesDatabase
  genreRelevanceVotes: IGenreRelevanceVotesDatabase
  genreHistory: IGenreHistoryDatabase
}

export interface IAccountsDatabase {
  insert: (...data: InsertAccount[]) => Promise<Account[]>
  findById: (id: Account['id']) => Promise<Account | undefined>
  findByUsername: (username: Account['username']) => Promise<Account | undefined>
  update: (id: number, update: Partial<InsertAccount>) => Promise<Account>
  deleteByUsername: (...usernames: Account['username'][]) => Promise<void>
  deleteAll: () => Promise<void>
}

export interface IPasswordResetTokensDatabase {
  insert: (...data: InsertPasswordResetToken[]) => Promise<PasswordResetToken[]>
  findByTokenHash: (
    tokenHash: PasswordResetToken['tokenHash'],
  ) => Promise<PasswordResetToken | undefined>
  deleteByAccountId: (accountId: Account['id']) => Promise<void>
  deleteByTokenHash: (tokenHash: PasswordResetToken['tokenHash']) => Promise<void>
}

export interface IGenresDatabase {
  insert: (...data: ExtendedInsertGenre[]) => Promise<
    (Genre & {
      akas: Omit<GenreAka, 'genreId'>[]
      parents: Pick<GenreParent, 'parentId'>[]
      influencedBy: Pick<GenreInfluence, 'influencerId'>[]
    })[]
  >
  update: (
    id: Genre['id'],
    update: Partial<ExtendedInsertGenre>,
  ) => Promise<
    Genre & {
      akas: Omit<GenreAka, 'genreId'>[]
      parents: Pick<GenreParent, 'parentId'>[]
      influencedBy: Pick<GenreInfluence, 'influencerId'>[]
    }
  >
  findAllIds: () => Promise<Pick<Genre, 'id'>[]>
  findByIdSimple: (id: Genre['id']) => Promise<Genre | undefined>
  findByIdDetail: (id: Genre['id']) => Promise<
    | (Genre & {
        akas: Pick<GenreAka, 'name'>[]
        parents: { parent: Pick<Genre, 'id' | 'name' | 'type' | 'subtitle'> }[]
        children: { child: Pick<Genre, 'id' | 'name' | 'type'> }[]
        influencedBy: { influencer: Pick<Genre, 'id' | 'name' | 'type' | 'subtitle'> }[]
        influences: { influenced: Pick<Genre, 'id' | 'name' | 'type' | 'subtitle'> }[]
        history: { account: Pick<Account, 'id' | 'username'> | null }[]
      })
    | undefined
  >
  findByIdHistory: (id: Genre['id']) => Promise<
    | (Genre & {
        akas: Pick<GenreAka, 'name' | 'relevance' | 'order'>[]
        parents: Pick<GenreParent, 'parentId'>[]
        children: (Pick<GenreParent, 'childId'> & {
          child: Genre & {
            akas: Pick<GenreAka, 'name' | 'relevance' | 'order'>[]
            parents: Pick<GenreParent, 'parentId'>[]
            children: Pick<GenreParent, 'childId'>[]
            influencedBy: Pick<GenreInfluence, 'influencerId'>[]
          }
        })[]
        influencedBy: Pick<GenreInfluence, 'influencerId'>[]
        influences: {
          influenced: Genre & {
            akas: Pick<GenreAka, 'name' | 'relevance' | 'order'>[]
            parents: Pick<GenreParent, 'parentId'>[]
            children: Pick<GenreParent, 'childId'>[]
            influencedBy: Pick<GenreInfluence, 'influencerId'>[]
          }
        }[]
      })
    | undefined
  >
  findByIdEdit: (id: Genre['id']) => Promise<
    | (Genre & {
        akas: Pick<GenreAka, 'name' | 'relevance' | 'order'>[]
        parents: Pick<GenreParent, 'parentId'>[]
        influencedBy: Pick<GenreInfluence, 'influencerId'>[]
      })
    | undefined
  >
  findByIds: (ids: Genre['id'][]) => Promise<
    (Genre & {
      akas: Pick<GenreAka, 'name' | 'relevance' | 'order'>[]
      parents: Pick<GenreParent, 'parentId'>[]
      influencedBy: Pick<GenreInfluence, 'influencerId'>[]
    })[]
  >
  findAllSimple: () => Promise<
    (Pick<Genre, 'id' | 'name'> & { parents: Pick<GenreParent, 'parentId'>[] })[]
  >
  findAllTree: () => Promise<
    (Pick<Genre, 'id' | 'name' | 'subtitle' | 'type' | 'relevance' | 'updatedAt'> & {
      akas: GenreAka['name'][]
      parents: GenreParent['parentId'][]
      children: GenreParent['childId'][]
    })[]
  >
  deleteById: (id: Genre['id']) => Promise<void>
  deleteAll: () => Promise<void>
}
export type ExtendedInsertGenre = InsertGenre & {
  akas: Omit<InsertGenreAka, 'genreId'>[]
  parents: number[]
  influencedBy: number[]
}

export interface IGenreParentsDatabase {
  insert: (...data: InsertGenreParent[]) => Promise<GenreParent[]>
  find: (
    parentId: GenreParent['parentId'],
    childId: GenreParent['childId'],
  ) => Promise<GenreParent | undefined>
  update: (
    parentId: GenreParent['parentId'],
    childId: GenreParent['childId'],
    update: Partial<InsertGenreParent>,
  ) => Promise<GenreParent>
}

export interface IGenreInfluencesDatabase {
  insert: (...data: InsertGenreInfluence[]) => Promise<GenreInfluence[]>
}

export interface IGenreRelevanceVotesDatabase {
  upsert: (data: InsertGenreRelevanceVote) => Promise<GenreRelevanceVote>
  findByGenreId: (genreId: number) => Promise<GenreRelevanceVote[]>
  findByGenreIdAndAccountId: (
    genreId: GenreRelevanceVote['genreId'],
    accountId: GenreRelevanceVote['accountId'],
  ) => Promise<GenreRelevanceVote | undefined>
  deleteByGenreId: (genreId: GenreRelevanceVote['genreId']) => Promise<void>
}

export interface IGenreHistoryDatabase {
  insert: (
    ...data: (InsertGenreHistory & { akas: Omit<InsertGenreHistoryAka, 'genreId'>[] })[]
  ) => Promise<GenreHistory[]>
  findLatest: () => Promise<
    (GenreHistory & {
      akas: Pick<GenreHistoryAka, 'name'>[]
      account: Pick<Account, 'id' | 'username'> | null
    })[]
  >
  findLatestByGenreId: (
    genreId: GenreHistory['treeGenreId'],
  ) => Promise<
    (GenreHistory & { akas: Pick<GenreHistoryAka, 'name' | 'relevance' | 'order'>[] }) | undefined
  >
  findPreviousByGenreId: (
    genreId: GenreHistory['treeGenreId'],
    createdAt: Date,
  ) => Promise<(GenreHistory & { akas: Pick<GenreHistoryAka, 'name'>[] }) | undefined>
  findByGenreId: (genreId: GenreHistory['treeGenreId']) => Promise<
    (GenreHistory & {
      akas: Pick<GenreHistoryAka, 'name'>[]
      account: Pick<Account, 'id' | 'username'> | null
    })[]
  >
  findByAccountId: (
    accountId: NonNullable<GenreHistory['accountId']>,
  ) => Promise<
    Pick<
      GenreHistory,
      'id' | 'name' | 'type' | 'subtitle' | 'operation' | 'createdAt' | 'treeGenreId'
    >[]
  >
}

export class Database implements IDatabase {
  readonly db: PostgresJsDatabase<typeof schema>

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db
  }

  async transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T> {
    return this.db.transaction((tx) => fn(new Database(tx)))
  }

  accounts: IAccountsDatabase = {
    insert: (...data) => this.db.insert(accounts).values(data).returning(),

    findById: (id) =>
      this.db.query.accounts.findFirst({
        where: eq(accounts.id, id),
      }),

    findByUsername: (username) =>
      this.db.query.accounts.findFirst({
        where: eq(accounts.username, username),
      }),

    update: async (id, update) => {
      if (!hasUpdate(update)) {
        const account = await this.accounts.findById(id)
        if (!account) throw new Error(`Account not found: ${id}`)
        return account
      }

      const [account] = await this.db
        .update(accounts)
        .set(makeUpdate(update))
        .where(eq(accounts.id, id))
        .returning()

      return account
    },

    deleteByUsername: async (...usernames) => {
      await this.db.delete(accounts).where(inArray(accounts.username, usernames))
    },

    deleteAll: async () => {
      await this.db.delete(accounts)
    },
  }

  passwordResetTokens: IPasswordResetTokensDatabase = {
    insert: (...data) => this.db.insert(passwordResetTokens).values(data).returning(),

    findByTokenHash: (tokenHash) =>
      this.db.query.passwordResetTokens.findFirst({
        where: eq(passwordResetTokens.tokenHash, tokenHash),
      }),

    deleteByAccountId: async (accountId) => {
      await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, accountId))
    },

    deleteByTokenHash: async (tokenHash) => {
      await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.tokenHash, tokenHash))
    },
  }

  genres: IGenresDatabase = {
    insert: async (...data) =>
      this.db.transaction(async (tx) => {
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
          await tx.insert(schema.genreParents).values(parents)
        }

        const influencedBy = data.flatMap((entry, i) =>
          entry.influencedBy.map((influencerId) => ({ influencedId: entries[i].id, influencerId })),
        )
        if (influencedBy.length > 0) {
          await tx.insert(schema.genreInfluences).values(influencedBy)
        }

        return tx.query.genres.findMany({
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
      }),

    update: async (id, update) => {
      if (update.akas) {
        await this.db.delete(genreAkas).where(eq(genreAkas.genreId, id))
        if (update.akas.length > 0) {
          await this.db
            .insert(genreAkas)
            .values(update.akas.map((aka) => ({ ...aka, genreId: id })))
        }
      }

      if (update.parents) {
        await this.db.delete(genreParents).where(eq(genreParents.childId, id))
        if (update.parents.length > 0) {
          await this.db
            .insert(genreParents)
            .values(update.parents.map((parentId) => ({ parentId, childId: id })))
        }
      }

      if (update.influencedBy) {
        await this.db.delete(genreInfluences).where(eq(genreInfluences.influencedId, id))
        if (update.influencedBy.length > 0) {
          await this.db
            .insert(genreInfluences)
            .values(update.influencedBy.map((influencerId) => ({ influencerId, influencedId: id })))
        }
      }

      if (!hasUpdate(update)) {
        const genre = await this.genres.findByIdEdit(id)
        if (!genre) throw new Error(`Genre not found: ${id}`)
        return genre
      }

      await this.db.update(genres).set(makeUpdate(update)).where(eq(genres.id, id))

      const genre = await this.genres.findByIdEdit(id)
      if (!genre) throw new Error(`Genre not found: ${id}`)
      return genre
    },

    findAllIds: () =>
      this.db.query.genres.findMany({
        columns: {
          id: true,
        },
      }),

    findByIdSimple: (id) =>
      this.db.query.genres.findFirst({
        where: eq(genres.id, id),
      }),

    findByIdDetail: (id) =>
      this.db.query.genres.findFirst({
        where: eq(genres.id, id),
        with: {
          akas: {
            columns: { name: true },
            orderBy: [desc(genreAkas.relevance), asc(genreAkas.order)],
          },
          parents: {
            columns: {},
            with: {
              parent: {
                columns: { id: true, name: true, type: true, subtitle: true },
              },
            },
          },
          children: {
            columns: {},
            with: {
              child: {
                columns: { id: true, name: true, type: true },
              },
            },
          },
          influencedBy: {
            columns: {},
            with: {
              influencer: {
                columns: { id: true, name: true, type: true, subtitle: true },
              },
            },
          },
          influences: {
            columns: {},
            with: {
              influenced: {
                columns: { id: true, name: true, type: true, subtitle: true },
              },
            },
          },
          history: {
            columns: {},
            orderBy: [asc(genreHistory.createdAt)],
            with: {
              account: {
                columns: { id: true, username: true },
              },
            },
          },
        },
      }),

    findByIdHistory: (id) =>
      this.db.query.genres.findFirst({
        where: eq(genres.id, id),
        with: {
          akas: {
            columns: {
              name: true,
              relevance: true,
              order: true,
            },
          },
          parents: {
            columns: { parentId: true },
          },
          children: {
            columns: { childId: true },
            with: {
              child: {
                with: {
                  akas: {
                    columns: {
                      name: true,
                      relevance: true,
                      order: true,
                    },
                  },
                  parents: {
                    columns: { parentId: true },
                  },
                  children: {
                    columns: { childId: true },
                  },
                  influencedBy: {
                    columns: {
                      influencerId: true,
                    },
                  },
                },
              },
            },
          },
          influencedBy: {
            columns: {
              influencerId: true,
            },
          },
          influences: {
            with: {
              influenced: {
                with: {
                  akas: {
                    columns: {
                      name: true,
                      relevance: true,
                      order: true,
                    },
                  },
                  parents: {
                    columns: { parentId: true },
                  },
                  children: {
                    columns: { childId: true },
                  },
                  influencedBy: {
                    columns: {
                      influencerId: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),

    findByIdEdit: (id) =>
      this.db.query.genres.findFirst({
        where: eq(genres.id, id),
        with: {
          akas: {
            columns: {
              name: true,
              relevance: true,
              order: true,
            },
            orderBy: asc(genreAkas.order),
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
      }),

    findByIds: (ids) =>
      this.db.query.genres.findMany({
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
      }),

    findAllSimple: () =>
      this.db.query.genres.findMany({
        columns: {
          id: true,
          name: true,
        },
        with: {
          parents: {
            columns: { parentId: true },
          },
        },
      }),

    findAllTree: () =>
      this.db.query.genres
        .findMany({
          columns: {
            id: true,
            name: true,
            subtitle: true,
            type: true,
            relevance: true,
            updatedAt: true,
          },
          orderBy: (genres, { asc }) => asc(genres.name),
          with: {
            akas: {
              columns: { name: true },
              orderBy: [desc(genreAkas.relevance), asc(genreAkas.order)],
            },
            parents: {
              columns: { parentId: true },
              with: {
                parent: {
                  columns: { name: true },
                },
              },
            },
            children: {
              columns: { childId: true },
              with: {
                child: {
                  columns: { name: true },
                },
              },
            },
          },
        })
        .then((genres) =>
          genres.map(({ akas, parents, children, ...genre }) => ({
            ...genre,
            akas: akas.map((aka) => aka.name),
            parents: parents
              .sort((a, b) => a.parent.name.localeCompare(b.parent.name))
              .map((parent) => parent.parentId),
            children: children
              .sort((a, b) => a.child.name.localeCompare(b.child.name))
              .map((child) => child.childId),
          })),
        ),

    deleteById: async (id) => {
      await this.db.delete(genres).where(eq(genres.id, id))
    },

    deleteAll: async () => {
      await this.db.delete(genres)
    },
  }

  genreParents: IGenreParentsDatabase = {
    insert: (...data) => this.db.insert(genreParents).values(data).returning(),

    find: (parentId, childId) =>
      this.db.query.genreParents.findFirst({
        where: and(eq(genreParents.parentId, parentId), eq(genreParents.childId, childId)),
      }),

    update: async (parentId, childId, update) => {
      if (!hasUpdate(update)) {
        const genreParent = await this.genreParents.find(parentId, childId)
        if (!genreParent)
          throw new Error(`Genre Parent not found: { parentId: ${parentId}, childId: ${childId} }`)
        return genreParent
      }

      const [genreParent] = await this.db
        .update(genreParents)
        .set(makeUpdate(update))
        .where(and(eq(genreParents.parentId, parentId), eq(genreParents.childId, childId)))
        .returning()

      return genreParent
    },
  }

  genreInfluences: IGenreInfluencesDatabase = {
    insert: (...data) => this.db.insert(genreInfluences).values(data).returning(),
  }

  genreRelevanceVotes: IGenreRelevanceVotesDatabase = {
    upsert: (data) =>
      this.db
        .insert(genreRelevanceVotes)
        .values(data)
        .onConflictDoUpdate({
          target: [genreRelevanceVotes.genreId, genreRelevanceVotes.accountId],
          set: omit(['genreId', 'accountId'], data),
        })
        .returning()
        .then((res) => res[0]),

    findByGenreId: (genreId) =>
      this.db.query.genreRelevanceVotes.findMany({
        where: eq(genreRelevanceVotes.genreId, genreId),
      }),

    findByGenreIdAndAccountId: (genreId, accountId) =>
      this.db.query.genreRelevanceVotes.findFirst({
        where: and(
          eq(genreRelevanceVotes.genreId, genreId),
          eq(genreRelevanceVotes.accountId, accountId),
        ),
      }),

    deleteByGenreId: async (genreId) => {
      await this.db.delete(genreRelevanceVotes).where(eq(genreRelevanceVotes.genreId, genreId))
    },
  }

  genreHistory: IGenreHistoryDatabase = {
    insert: async (...data) =>
      this.db.transaction(async (tx) => {
        const values = await tx.insert(genreHistory).values(data).returning()

        const akas = data.flatMap((entry, i) =>
          entry.akas.map((aka) => ({ ...aka, genreId: values[i].id })),
        )

        if (akas.length > 0) {
          await tx.insert(genreHistoryAkas).values(akas)
        }

        return values
      }),

    findLatest: () =>
      this.db.query.genreHistory.findMany({
        orderBy: (genreHistory, { desc }) => desc(genreHistory.createdAt),
        with: {
          akas: {
            columns: { name: true },
            orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
          },
          account: {
            columns: {
              id: true,
              username: true,
            },
          },
        },
        limit: 100,
      }),

    findLatestByGenreId: (genreId) =>
      this.db.query.genreHistory.findFirst({
        where: eq(genreHistory.treeGenreId, genreId),
        orderBy: desc(genreHistory.createdAt),
        with: {
          akas: {
            columns: {
              name: true,
              relevance: true,
              order: true,
            },
            orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
          },
        },
      }),

    findPreviousByGenreId: (genreId, createdAt) =>
      this.db.query.genreHistory.findFirst({
        where: and(eq(genreHistory.treeGenreId, genreId), lt(genreHistory.createdAt, createdAt)),
        orderBy: desc(genreHistory.createdAt),
        with: {
          akas: {
            columns: { name: true },
            orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
          },
        },
      }),

    findByGenreId: (genreId) =>
      this.db.query.genreHistory.findMany({
        where: (genreHistory, { eq }) => eq(genreHistory.treeGenreId, genreId),
        orderBy: asc(genreHistory.createdAt),
        with: {
          akas: {
            columns: { name: true },
            orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
          },
          account: {
            columns: {
              id: true,
              username: true,
            },
          },
        },
      }),

    findByAccountId: (accountId) =>
      this.db.query.genreHistory.findMany({
        where: eq(genreHistory.accountId, accountId),
        columns: {
          id: true,
          name: true,
          type: true,
          subtitle: true,
          operation: true,
          createdAt: true,
          treeGenreId: true,
        },
        orderBy: desc(genreHistory.createdAt),
      }),
  }
}
