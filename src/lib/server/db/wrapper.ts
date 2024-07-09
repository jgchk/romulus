import { and, asc, desc, eq, inArray, type InferInsertModel, lt } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { omit } from 'ramda'

import { hasUpdate, makeUpdate } from '$lib/utils/db'

import * as schema from './schema'
import {
  accounts,
  genreAkas,
  genreHistory,
  genreHistoryAkas,
  genreInfluences,
  genreParents,
  genreRelevanceVotes,
  genres,
  passwordResetTokens,
} from './schema'

export class Database {
  readonly db: PostgresJsDatabase<typeof schema>

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db
  }

  async transaction<T>(fn: (db: Database) => Promise<T>): Promise<T> {
    return this.db.transaction((tx) => fn(new Database(tx)))
  }

  accounts = {
    insert: (...data: InferInsertModel<typeof accounts>[]) =>
      this.db.insert(accounts).values(data).returning(),

    findById: (id: number) =>
      this.db.query.accounts.findFirst({
        where: eq(accounts.id, id),
      }),

    findByUsername: (username: string) =>
      this.db.query.accounts.findFirst({
        where: eq(accounts.username, username),
      }),

    update: async (id: number, update: Partial<InferInsertModel<typeof accounts>>) => {
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

    deleteByUsername: (...usernames: string[]) =>
      this.db.delete(accounts).where(inArray(accounts.username, usernames)),

    deleteAll: () => this.db.delete(accounts),
  }

  passwordResetTokens = {
    insert: (...data: InferInsertModel<typeof passwordResetTokens>[]) =>
      this.db.insert(passwordResetTokens).values(data).returning(),

    findByTokenHash: (tokenHash: string) =>
      this.db.query.passwordResetTokens.findFirst({
        where: eq(passwordResetTokens.tokenHash, tokenHash),
      }),

    deleteByAccountId: (accountId: number) =>
      this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, accountId)),

    deleteByTokenHash: (tokenHash: string) =>
      this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.tokenHash, tokenHash)),
  }

  genres = {
    insert: async (
      ...data: (InferInsertModel<typeof genres> & {
        akas: Omit<InferInsertModel<typeof genreAkas>, 'genreId'>[]
        parents: number[]
        influencedBy: number[]
      })[]
    ) =>
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

    update: async (
      id: number,
      update: Partial<
        InferInsertModel<typeof genres> & {
          akas: Omit<InferInsertModel<typeof genreAkas>, 'genreId'>[]
          parents: number[]
          influencedBy: number[]
        }
      >,
    ) => {
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

    findByIdSimple: (id: number) =>
      this.db.query.genres.findFirst({
        where: eq(genres.id, id),
      }),

    findByIdDetail: (id: number) =>
      this.db.query.genres.findFirst({
        where: eq(genres.id, id),
        columns: {
          id: true,
          name: true,
          subtitle: true,
          type: true,
          relevance: true,
          shortDescription: true,
          longDescription: true,
          notes: true,
        },
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

    findByIdHistory: (id: number) =>
      this.db.query.genres.findFirst({
        where: eq(genres.id, id),
        with: {
          parents: {
            columns: { parentId: true },
          },
          children: {
            columns: { childId: true },
            with: {
              child: {
                with: {
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
                  akas: {
                    columns: {
                      name: true,
                      relevance: true,
                      order: true,
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
                  akas: {
                    columns: {
                      name: true,
                      relevance: true,
                      order: true,
                    },
                  },
                },
              },
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
      }),

    findByIdEdit: (id: number) =>
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

    findByIds: (ids: number[]) =>
      this.db.query.genres.findMany({
        where: inArray(genres.id, ids),
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
      }),

    findAllSimple: () =>
      this.db.query.genres
        .findMany({
          columns: {
            id: true,
            name: true,
          },
          with: {
            parents: {
              columns: { parentId: true },
            },
          },
        })
        .then((genres) =>
          genres.map((genre) => ({
            ...genre,
            parents: genre.parents.map((parent) => parent.parentId),
          })),
        ),

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

    deleteById: (id: number) => this.db.delete(genres).where(eq(genres.id, id)),

    deleteAll: () => this.db.delete(genres),
  }

  genreParents = {
    insert: (...data: InferInsertModel<typeof genreParents>[]) =>
      this.db.insert(genreParents).values(data).returning(),

    find: (parentId: number, childId: number) =>
      this.db.query.genreParents.findFirst({
        where: and(eq(genreParents.parentId, parentId), eq(genreParents.childId, childId)),
      }),

    update: async (
      parentId: number,
      childId: number,
      update: Partial<InferInsertModel<typeof genreParents>>,
    ) => {
      console.log({ hasUpdate: hasUpdate(update), update: makeUpdate(update) })
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

  genreInfluences = {
    insert: (...data: InferInsertModel<typeof genreInfluences>[]) =>
      this.db.insert(genreInfluences).values(data).returning(),
  }

  genreRelevanceVotes = {
    upsert: (data: InferInsertModel<typeof genreRelevanceVotes>) =>
      this.db
        .insert(genreRelevanceVotes)
        .values(data)
        .onConflictDoUpdate({
          target: [genreRelevanceVotes.genreId, genreRelevanceVotes.accountId],
          set: omit(['genreId', 'accountId'], data),
        }),

    findByGenreId: (genreId: number) =>
      this.db.query.genreRelevanceVotes.findMany({
        where: eq(genreRelevanceVotes.genreId, genreId),
      }),

    findByGenreIdAndAccountId: (genreId: number, accountId: number) =>
      this.db.query.genreRelevanceVotes.findFirst({
        where: and(
          eq(genreRelevanceVotes.genreId, genreId),
          eq(genreRelevanceVotes.accountId, accountId),
        ),
      }),

    deleteByGenreId: (genreId: number) =>
      this.db.delete(genreRelevanceVotes).where(eq(genreRelevanceVotes.genreId, genreId)),
  }

  genreHistory = {
    insert: async (
      ...data: (InferInsertModel<typeof genreHistory> & {
        akas: Omit<InferInsertModel<typeof genreHistoryAkas>, 'genreId'>[]
      })[]
    ) =>
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
        columns: {
          id: true,
          treeGenreId: true,
          name: true,
          subtitle: true,
          type: true,
          operation: true,
          createdAt: true,
          shortDescription: true,
          longDescription: true,
          notes: true,
          parentGenreIds: true,
          influencedByGenreIds: true,
        },
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

    findLatestByGenreId: (genreId: number) =>
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

    findPreviousByGenreId: (genreId: number, createdAt: Date) =>
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

    findByGenreId: (genreId: number) =>
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

    findByAccountId: (accountId: number) =>
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
