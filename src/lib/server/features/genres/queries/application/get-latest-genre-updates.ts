import { sql } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { genreHistory } from '$lib/server/db/schema'

export type GetLatestGenreUpdatesResult = {
  genre: {
    id: number
    name: string
    subtitle: string | null
    akas: string[]
    type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
    shortDescription: string | null
    longDescription: string | null
    nsfw: boolean
    notes: string | null
    parentGenreIds: number[]
    derivedFromGenreIds: number[]
    influencedByGenreIds: number[]
    treeGenreId: number
    createdAt: Date
    operation: 'CREATE' | 'UPDATE' | 'DELETE'
    accountId: number | null
    account: { id: number; username: string } | null
  }
  previousHistory:
    | {
        id: number
        name: string
        subtitle: string | null
        akas: string[]
        type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
        shortDescription: string | null
        longDescription: string | null
        nsfw: boolean
        notes: string | null
        parentGenreIds: number[]
        derivedFromGenreIds: number[]
        influencedByGenreIds: number[]
        treeGenreId: number
        createdAt: Date
        operation: 'CREATE' | 'UPDATE' | 'DELETE'
        accountId: number | null
      }
    | undefined
}[]

export class GetLatestGenreUpdatesQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(): Promise<GetLatestGenreUpdatesResult> {
    const statement = sql`
      WITH latest_entries AS (
        SELECT *
        FROM ${genreHistory}
        ORDER BY ${genreHistory.createdAt} DESC
        LIMIT 50
      )
      SELECT
        curr.*,
        curr_aka.name AS curr_aka_name,
        prev.id AS prev_id,
        prev.name AS prev_name,
        prev.type AS prev_type,
        prev."shortDescription" AS "prev_shortDescription",
        prev."longDescription" AS "prev_longDescription",
        prev.nsfw AS prev_nsfw,
        prev.notes AS prev_notes,
        prev."parentGenreIds" AS "prev_parentGenreIds",
        prev."derivedFromGenreIds" AS "prev_derivedFromGenreIds",
        prev."influencedByGenreIds" AS "prev_influencedByGenreIds",
        prev."treeGenreId" AS "prev_treeGenreId",
        prev."createdAt" AS "prev_createdAt",
        prev.operation AS prev_operation,
        prev."accountId" AS "prev_accountId",
        prev.subtitle AS prev_subtitle,
        prev_aka.name AS prev_aka_name,
        acc.id AS account_id,
        acc.username AS account_username
      FROM latest_entries curr
      LEFT JOIN "GenreHistoryAka" curr_aka ON curr_aka."genreId" = curr.id
      LEFT JOIN "Account" acc ON acc.id = curr."accountId"
      LEFT JOIN LATERAL (
        SELECT *
        FROM "GenreHistory" prev_inner
        WHERE prev_inner."treeGenreId" = curr."treeGenreId"
          AND prev_inner."createdAt" < curr."createdAt"
        ORDER BY prev_inner."createdAt" DESC
        LIMIT 1
      ) prev ON true
      LEFT JOIN "GenreHistoryAka" prev_aka ON prev_aka."genreId" = prev.id
      ORDER BY curr."createdAt" DESC;
    `

    const res = (await this.db.execute(statement)) as
      | { rows: Record<string, unknown>[] }
      | Record<string, unknown>[]
    const rows = 'rows' in res ? res.rows : res

    console.log('rows', rows)

    const transformedResults = new Map<
      number,
      {
        genre: GetLatestGenreUpdatesResult[number]['genre']
        previousHistory?: GetLatestGenreUpdatesResult[number]['previousHistory']
        akas: Set<string>
        previousAkas: Set<string>
      }
    >()

    for (const row of rows) {
      if (!transformedResults.has(row.id as number)) {
        transformedResults.set(row.id as number, {
          genre: {
            id: row.id as number,
            name: row.name as string,
            subtitle: row.subtitle as string | null,
            akas: [],
            type: row.type as 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT',
            shortDescription: row.shortDescription as string | null,
            longDescription: row.longDescription as string | null,
            nsfw: row.nsfw as boolean,
            notes: row.notes as string | null,
            parentGenreIds: (row.parentGenreIds as number[]) ?? [],
            derivedFromGenreIds: (row.derivedFromGenreIds as number[]) ?? [],
            influencedByGenreIds: (row.influencedByGenreIds as number[]) ?? [],
            treeGenreId: row.treeGenreId as number,
            createdAt: this.parsePostgresTimestamp(row.createdAt as string),
            operation: row.operation as 'CREATE' | 'UPDATE' | 'DELETE',
            accountId: row.accountId as number | null,
            account: row.account_id
              ? {
                  id: row.account_id as number,
                  username: row.account_username as string,
                }
              : null,
          },
          previousHistory: row.prev_id
            ? {
                id: row.prev_id as number,
                name: row.prev_name as string,
                subtitle: row.prev_subtitle as string | null,
                akas: [],
                type: row.prev_type as 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT',
                shortDescription: row.prev_shortDescription as string | null,
                longDescription: row.prev_longDescription as string | null,
                nsfw: row.prev_nsfw as boolean,
                notes: row.prev_notes as string | null,
                parentGenreIds: (row.prev_parentGenreIds as number[]) ?? [],
                derivedFromGenreIds: (row.prev_derivedFromGenreIds as number[]) ?? [],
                influencedByGenreIds: (row.prev_influencedByGenreIds as number[]) ?? [],
                treeGenreId: row.prev_treeGenreId as number,
                createdAt: this.parsePostgresTimestamp(row.prev_createdAt as string),
                operation: row.prev_operation as 'CREATE' | 'UPDATE' | 'DELETE',
                accountId: row.prev_accountId as number | null,
              }
            : undefined,
          akas: new Set(),
          previousAkas: new Set(),
        })
      }

      const entry = transformedResults.get(row.id as number)!

      if (row.curr_aka_name) {
        entry.akas.add(row.curr_aka_name as string)
      }

      if (row.prev_aka_name) {
        entry.previousAkas.add(row.prev_aka_name as string)
      }
    }

    return Array.from(transformedResults.values()).map((entry) => ({
      genre: {
        ...entry.genre,
        akas: Array.from(entry.akas),
      },
      previousHistory: entry.previousHistory
        ? {
            ...entry.previousHistory,
            akas: Array.from(entry.previousAkas),
          }
        : undefined,
    }))
  }

  private parsePostgresTimestamp(timestamp: string): Date {
    // Add 'T' and 'Z' to make it ISO 8601 compliant
    // Replace space with 'T' and append 'Z' for UTC
    return new Date(timestamp.replace(' ', 'T') + 'Z')
  }
}
