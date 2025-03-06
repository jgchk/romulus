import postgres from 'postgres'

import { env } from '../env.js'

export async function migrateGenres(
  migrateSchema: () => Promise<void>,
  execQuery: (query: string) => Promise<void>,
) {
  await migrateSchema()

  const monolith = postgres(env.MONOLITH_DATABASE_URL)

  await migrateGenreDocuments(monolith, execQuery)
  await migrateAkas(monolith, execQuery)
  await migrateDerived(monolith, execQuery)
  await migrateGenreHistory(monolith, execQuery)
  await migrateGenreHistoryAkas(monolith, execQuery)
  await migrateInfluences(monolith, execQuery)
  await migrateParents(monolith, execQuery)
  await migrateRelevanceVotes(monolith, execQuery)
}

async function migrateGenreDocuments(
  monolith: postgres.Sql,
  execQuery: (query: string) => Promise<void>,
) {
  const genres = (await monolith`SELECT * FROM "Genre"`).map((row) => ({
    id: row.id as number,
    name: row.name as string,
    shortDescription: row.shortDescription as string | null,
    longDescription: row.longDescription as string | null,
    createdAt: row.createdAt as Date,
    updatedAt: row.updatedAt as Date,
    notes: row.notes as string | null,
    type: row.type as string,
    relevance: row.relevance as number,
    subtitle: row.subtitle as string | null,
    nsfw: row.nsfw as boolean,
  }))

  if (genres.length === 0) return

  await execQuery(`
    INSERT INTO "Genre"
      (id, name, "shortDescription", "longDescription", "createdAt", "updatedAt", notes, type, relevance, subtitle, nsfw)
    VALUES
      ${genres.map((genre) => `(${genre.id}, ${processString(genre.name)}, ${processString(genre.shortDescription)}, ${processString(genre.longDescription)}, '${genre.createdAt.toISOString()}', '${genre.updatedAt.toISOString()}', ${processString(genre.notes)}, '${genre.type}', ${genre.relevance}, ${processString(genre.subtitle)}, ${genre.nsfw})`).join(', ')}
  `)
}

async function migrateAkas(monolith: postgres.Sql, execQuery: (query: string) => Promise<void>) {
  const akas = (await monolith`SELECT * FROM "GenreAka"`).map((row) => ({
    genreId: row.genreId as number,
    name: row.name as string,
    relevance: row.relevance as number,
    order: row.order as number,
  }))

  if (akas.length === 0) return

  await execQuery(`
    INSERT INTO "GenreAka"
      ("genreId", name, relevance, "order")
    VALUES
      ${akas.map((aka) => `(${aka.genreId}, ${processString(aka.name)}, ${aka.relevance}, ${aka.order})`).join(', ')}
  `)
}

async function migrateDerived(monolith: postgres.Sql, execQuery: (query: string) => Promise<void>) {
  const derived = (await monolith`SELECT * FROM "GenreDerivedFrom"`).map((row) => ({
    derivedFromId: row.derivedFromId as number,
    derivationId: row.derivationId as number,
  }))

  if (derived.length === 0) return

  await execQuery(`
    INSERT INTO "GenreDerivedFrom"
      ("derivedFromId", "derivationId")
    VALUES
      ${derived.map((derived) => `(${derived.derivedFromId}, ${derived.derivationId})`).join(', ')}
  `)
}

async function migrateGenreHistory(
  monolith: postgres.Sql,
  execQuery: (query: string) => Promise<void>,
) {
  const history = (await monolith`SELECT * FROM "GenreHistory"`).map((row) => ({
    id: row.id as number,
    name: row.name as string,
    type: row.type as string,
    shortDescription: row.shortDescription as string | null,
    longDescription: row.longDescription as string | null,
    notes: row.notes as string | null,
    parentGenreIds: row.parentGenreIds as number[],
    influencedByGenreIds: row.influencedByGenreIds as number[],
    treeGenreId: row.treeGenreId as number,
    createdAt: row.createdAt as Date,
    operation: row.operation as string,
    accountId: row.accountId as number | null,
    subtitle: row.subtitle as string | null,
    nsfw: row.nsfw as boolean,
    derivedFromGenreIds: row.derivedFromGenreIds as number[] | null,
  }))

  if (history.length === 0) return

  await execQuery(`
    INSERT INTO "GenreHistory"
      (id, name, type, "shortDescription", "longDescription", notes, "parentGenreIds", "influencedByGenreIds", "treeGenreId", "createdAt", operation, "accountId", subtitle, nsfw, "derivedFromGenreIds")
    VALUES
      ${history.map((entry) => `(${entry.id}, ${processString(entry.name)}, ${processString(entry.type)}, ${processString(entry.shortDescription)}, ${processString(entry.longDescription)}, ${processString(entry.notes)}, ${processArray(entry.parentGenreIds)}, ${processArray(entry.influencedByGenreIds)}, ${entry.treeGenreId}, '${entry.createdAt.toISOString()}', '${entry.operation}', ${entry.accountId}, ${processString(entry.subtitle)}, ${entry.nsfw}, ${entry.derivedFromGenreIds === null ? 'null' : processArray(entry.derivedFromGenreIds)})`).join(', ')}
  `)
}

async function migrateGenreHistoryAkas(
  monolith: postgres.Sql,
  execQuery: (query: string) => Promise<void>,
) {
  const akas = (await monolith`SELECT * FROM "GenreHistoryAka"`).map((row) => ({
    genreId: row.genreId as number,
    name: row.name as string,
    relevance: row.relevance as number,
    order: row.order as number,
  }))

  if (akas.length === 0) return

  await execQuery(`
    INSERT INTO "GenreHistoryAka"
      ("genreId", name, relevance, "order")
    VALUES
      ${akas.map((aka) => `(${aka.genreId}, ${processString(aka.name)}, ${aka.relevance}, ${aka.order})`).join(', ')}
  `)
}

async function migrateInfluences(
  monolith: postgres.Sql,
  execQuery: (query: string) => Promise<void>,
) {
  const influences = (await monolith`SELECT * FROM "GenreInfluences"`).map((row) => ({
    influencedId: row.influencedId as number,
    influencerId: row.influencerId as number,
  }))

  if (influences.length === 0) return

  await execQuery(`
    INSERT INTO "GenreInfluences"
      ("influencedId", "influencerId")
    VALUES
      ${influences.map((derived) => `(${derived.influencedId}, ${derived.influencerId})`).join(', ')}
  `)
}

async function migrateParents(monolith: postgres.Sql, execQuery: (query: string) => Promise<void>) {
  const parents = (await monolith`SELECT * FROM "GenreParents"`).map((row) => ({
    parentId: row.parentId as number,
    childId: row.childId as number,
  }))

  if (parents.length === 0) return

  await execQuery(`
    INSERT INTO "GenreParents"
      ("parentId", "childId")
    VALUES
      ${parents.map((parent) => `(${parent.parentId}, ${parent.childId})`).join(', ')}
  `)
}

async function migrateRelevanceVotes(
  monolith: postgres.Sql,
  execQuery: (query: string) => Promise<void>,
) {
  const votes = (await monolith`SELECT * FROM "GenreRelevanceVote"`).map((row) => ({
    genreId: row.genreId as number,
    accountId: row.accountId as number,
    relevance: row.relevance as number,
    createdAt: row.createdAt as Date,
    updatedAt: row.updatedAt as Date,
  }))

  if (votes.length === 0) return

  await execQuery(`
    INSERT INTO "GenreRelevanceVote"
      ("genreId", "accountId", relevance, "createdAt", "updatedAt")
    VALUES
      ${votes.map((parent) => `(${parent.genreId}, ${parent.accountId}, ${parent.relevance}, '${parent.createdAt.toISOString()}', '${parent.updatedAt.toISOString()}')`).join(', ')}
  `)
}

function processString(value: string | null) {
  return stringOrNull(escapeQuotes(value))
}

function stringOrNull(value: string | null) {
  return value === null ? 'null' : `'${value}'`
}

function escapeQuotes(value: string | null) {
  return value?.replaceAll(/'/g, "''") ?? null
}

function processArray(value: number[]) {
  return value.length === 0 ? "'{}'" : `'{${value.join(',')}}'`
}
