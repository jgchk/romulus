import { asc, desc } from 'drizzle-orm'

import { type IDrizzleConnection } from '../../infrastructure/drizzle-database.js'
import { genreAkas } from '../../infrastructure/drizzle-schema.js'

export type GetGenreTreeResult = {
  id: number
  name: string
  subtitle: string | null
  type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
  akas: string[]
  children: number[]
  derivedFrom: number[]
  derivations: number[]
  relevance: number
  nsfw: boolean
  updatedAt: Date
}[]

export class GetGenreTreeQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(): Promise<GetGenreTreeResult> {
    console.time('get-genre-tree all')

    console.time('get-genre-tree a')
    const [results, parentChildren, derivations, akas] = await Promise.all([
      this.db.query.genres.findMany({
        columns: {
          id: true,
          name: true,
          subtitle: true,
          type: true,
          relevance: true,
          nsfw: true,
          updatedAt: true,
        },
        orderBy: (genres, { asc }) => asc(genres.name),
      }),
      this.db.query.genreParents.findMany({
        columns: {
          parentId: true,
          childId: true,
        },
      }),
      this.db.query.genreDerivedFrom.findMany({
        columns: {
          derivedFromId: true,
          derivationId: true,
        },
      }),
      this.db.query.genreAkas.findMany({
        columns: {
          genreId: true,
          name: true,
        },
        orderBy: [desc(genreAkas.relevance), asc(genreAkas.order)],
      }),
    ])
    console.timeEnd('get-genre-tree a')

    console.time('get-genre-tree b')
    console.timeEnd('get-genre-tree b')

    console.time('get-genre-tree c')
    // Group relationships by parent/source ID for faster access
    const childrenByParent = new Map<number, number[]>()
    const derivationsBySource = new Map<number, number[]>()
    const derivedFromByDerivation = new Map<number, number[]>()
    const akasByGenre = new Map<number, string[]>()

    // Pre-allocate all relationship maps - this avoids the overhead of creating objects in the loop
    for (const { parentId, childId } of parentChildren) {
      if (!childrenByParent.has(parentId)) {
        childrenByParent.set(parentId, [])
      }
      childrenByParent.get(parentId)!.push(childId)
    }

    for (const { derivedFromId, derivationId } of derivations) {
      if (!derivationsBySource.has(derivedFromId)) {
        derivationsBySource.set(derivedFromId, [])
      }
      derivationsBySource.get(derivedFromId)!.push(derivationId)

      if (!derivedFromByDerivation.has(derivationId)) {
        derivedFromByDerivation.set(derivationId, [])
      }
      derivedFromByDerivation.get(derivationId)!.push(derivedFromId)
    }

    for (const { genreId, name } of akas) {
      if (!akasByGenre.has(genreId)) {
        akasByGenre.set(genreId, [])
      }
      akasByGenre.get(genreId)!.push(name)
    }
    console.timeEnd('get-genre-tree c')

    console.time('get-genre-tree g')
    // Generate final output in a single pass with optimized sorting
    const output: GetGenreTreeResult = []
    const nameById = new Map(results.map((genre) => [genre.id, genre.name]))

    for (const genre of results) {
      const genreId = genre.id
      const genreName = genre.name

      // Get children IDs and sort by name
      const childrenIds = childrenByParent.get(genreId) ?? []
      childrenIds.sort((a, b) => {
        const nameA = nameById.get(a) ?? ''
        const nameB = nameById.get(b) ?? ''
        return nameA.localeCompare(nameB)
      })

      // Get derivedFrom IDs and sort by name
      const derivedFromIds = derivedFromByDerivation.get(genreId) ?? []
      derivedFromIds.sort((a, b) => {
        const nameA = nameById.get(a) ?? ''
        const nameB = nameById.get(b) ?? ''
        return nameA.localeCompare(nameB)
      })

      // Get derivations IDs and sort by name
      const derivationsIds = derivationsBySource.get(genreId) ?? []
      derivationsIds.sort((a, b) => {
        const nameA = nameById.get(a) ?? ''
        const nameB = nameById.get(b) ?? ''
        return nameA.localeCompare(nameB)
      })

      output.push({
        id: genreId,
        name: genreName,
        subtitle: genre.subtitle,
        type: genre.type,
        akas: akasByGenre.get(genreId) ?? [],
        children: childrenIds,
        derivedFrom: derivedFromIds,
        derivations: derivationsIds,
        relevance: genre.relevance,
        nsfw: genre.nsfw,
        updatedAt: genre.updatedAt,
      })
    }
    console.timeEnd('get-genre-tree g')

    console.timeEnd('get-genre-tree all')

    return output
  }
}
