import { sql } from 'drizzle-orm'

import { type IDrizzleConnection } from '../../infrastructure/drizzle-database.js'
import { genreHistory, genreHistoryAkas } from '../../infrastructure/drizzle-schema.js'

export type GetLatestGenreUpdatesResult = {
  genre: {
    id: number
    name: string
    subtitle: string | null
    akas: {
      primary: string[]
      secondary: string[]
      tertiary: string[]
    }
    type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
    nsfw: boolean
    shortDescription: string | null
    longDescription: string | null
    notes: string | null
    parentGenreIds: number[]
    derivedFromGenreIds: number[]
    influencedByGenreIds: number[]
    treeGenreId: number
    createdAt: Date
    operation: 'CREATE' | 'UPDATE' | 'DELETE'
    accountId: number | null
  }
  previousHistory:
    | {
        name: string
        subtitle: string | null
        akas: {
          primary: string[]
          secondary: string[]
          tertiary: string[]
        }
        type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
        nsfw: boolean
        shortDescription: string | null
        longDescription: string | null
        notes: string | null
        parentGenreIds: number[]
        derivedFromGenreIds: number[]
        influencedByGenreIds: number[]
        treeGenreId: number
        createdAt: Date
        operation: 'CREATE' | 'UPDATE' | 'DELETE'
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
        curr_aka.relevance AS curr_aka_relevance,
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
        prev.subtitle AS prev_subtitle,
        prev_aka.name AS prev_aka_name,
        prev_aka.relevance as prev_aka_relevance
      FROM latest_entries curr
      LEFT JOIN ${genreHistoryAkas} curr_aka ON curr_aka."genreId" = curr.id
      LEFT JOIN LATERAL (
        SELECT *
        FROM ${genreHistory} prev_inner
        WHERE prev_inner."treeGenreId" = curr."treeGenreId"
          AND prev_inner."createdAt" < curr."createdAt"
        ORDER BY prev_inner."createdAt" DESC
        LIMIT 1
      ) prev ON true
      LEFT JOIN ${genreHistoryAkas} prev_aka ON prev_aka."genreId" = prev.id
      ORDER BY curr."createdAt" DESC, curr_aka.order ASC, prev_aka.order ASC;
    `

    const res = (await this.db.execute(statement)) as
      | { rows: Record<string, unknown>[] }
      | Record<string, unknown>[]
    const rows = 'rows' in res ? res.rows : res

    const transformedResults = new Map<
      number,
      {
        genre: GetLatestGenreUpdatesResult[number]['genre']
        previousHistory?: GetLatestGenreUpdatesResult[number]['previousHistory']
        akas: {
          primary: string[]
          secondary: string[]
          tertiary: string[]
        }
        previousAkas: {
          primary: string[]
          secondary: string[]
          tertiary: string[]
        }
      }
    >()

    for (const row of rows) {
      if (!transformedResults.has(row.id as number)) {
        transformedResults.set(row.id as number, {
          genre: {
            id: row.id as number,
            name: row.name as string,
            subtitle: row.subtitle as string | null,
            akas: {
              primary: [],
              secondary: [],
              tertiary: [],
            },
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
          },
          previousHistory: row.prev_id
            ? {
                name: row.prev_name as string,
                subtitle: row.prev_subtitle as string | null,
                akas: {
                  primary: [],
                  secondary: [],
                  tertiary: [],
                },
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
              }
            : undefined,
          akas: {
            primary: [],
            secondary: [],
            tertiary: [],
          },
          previousAkas: {
            primary: [],
            secondary: [],
            tertiary: [],
          },
        })
      }

      const entry = transformedResults.get(row.id as number)!

      if (row.curr_aka_name) {
        const relevance = row.curr_aka_relevance as number
        if (relevance === 3) {
          if (!entry.akas.primary.includes(row.curr_aka_name as string)) {
            entry.akas.primary.push(row.curr_aka_name as string)
          }
        } else if (relevance === 2) {
          if (!entry.akas.secondary.includes(row.curr_aka_name as string)) {
            entry.akas.secondary.push(row.curr_aka_name as string)
          }
        } else if (relevance === 1) {
          if (!entry.akas.tertiary.includes(row.curr_aka_name as string)) {
            entry.akas.tertiary.push(row.curr_aka_name as string)
          }
        } else {
          throw new Error(`Unexpected relevance value: ${relevance}`)
        }
      }

      if (row.prev_aka_name) {
        const relevance = row.prev_aka_relevance as number
        if (relevance === 3) {
          if (!entry.previousAkas.primary.includes(row.prev_aka_name as string)) {
            entry.previousAkas.primary.push(row.prev_aka_name as string)
          }
        } else if (relevance === 2) {
          if (!entry.previousAkas.secondary.includes(row.prev_aka_name as string)) {
            entry.previousAkas.secondary.push(row.prev_aka_name as string)
          }
        } else if (relevance === 1) {
          if (!entry.previousAkas.tertiary.includes(row.prev_aka_name as string)) {
            entry.previousAkas.tertiary.push(row.prev_aka_name as string)
          }
        } else {
          throw new Error(`Unexpected relevance value: ${relevance}`)
        }
      }
    }

    return Array.from(transformedResults.values()).map((entry) => ({
      genre: {
        ...entry.genre,
        akas: entry.akas,
      },
      previousHistory: entry.previousHistory
        ? {
            ...entry.previousHistory,
            akas: entry.previousAkas,
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
