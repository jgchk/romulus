import { and, asc, desc, eq, inArray, lt } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { omit } from 'ramda'

import { hasUpdate, makeUpdate } from '$lib/utils/db'

import * as schema from './schema'
import {
  type Account,
  accounts,
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
  type InsertAccount,
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
      'id' | 'name' | 'type' | 'subtitle' | 'operation' | 'createdAt' | 'treeGenreId' | 'nsfw'
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
          nsfw: true,
        },
        orderBy: desc(genreHistory.createdAt),
      }),
  }
}
