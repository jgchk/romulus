import { asc, desc } from 'drizzle-orm'

import type { IDrizzleConnection } from '../../infrastructure/drizzle-database.js'
import { genreAkas } from '../../infrastructure/drizzle-schema.js'

export type GetGenreTreeResult = {
  id: number
  name: string
  subtitle: string | null
  type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
  akas: string[]
  parents: number[]
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
    const results = await this.db.query.genres.findMany({
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
      with: {
        akas: {
          columns: { name: true },
          orderBy: [desc(genreAkas.relevance), asc(genreAkas.order)],
        },
      },
    })

    const parentChildren = await this.db.query.genreParents.findMany({
      columns: {
        parentId: true,
        childId: true,
      },
    })

    const derivations = await this.db.query.genreDerivedFrom.findMany({
      columns: {
        derivedFromId: true,
        derivationId: true,
      },
    })

    const genresMap = new Map(
      results.map((genre) => [
        genre.id,
        {
          ...genre,
          parents: [] as { id: number; name: string }[],
          children: [] as { id: number; name: string }[],
          derivedFrom: [] as { id: number; name: string }[],
          derivations: [] as { id: number; name: string }[],
        },
      ]),
    )

    for (const { parentId, childId } of parentChildren) {
      const parent = genresMap.get(parentId)
      const child = genresMap.get(childId)
      if (parent && child) {
        parent.children.push({ id: childId, name: child.name })
        child.parents.push({ id: parentId, name: parent.name })
      }
    }

    for (const { derivedFromId, derivationId } of derivations) {
      const derivedFrom = genresMap.get(derivedFromId)
      const derivation = genresMap.get(derivationId)
      if (derivedFrom && derivation) {
        derivedFrom.derivations.push({ id: derivationId, name: derivation.name })
        derivation.derivedFrom.push({ id: derivedFromId, name: derivedFrom.name })
      }
    }

    return [...genresMap.values()].map(({ akas, parents, children, ...genre }) => ({
      ...genre,
      akas: akas.map((aka) => aka.name),
      parents: parents.sort((a, b) => a.name.localeCompare(b.name)).map((parent) => parent.id),
      children: children.sort((a, b) => a.name.localeCompare(b.name)).map((child) => child.id),
      derivedFrom: genre.derivedFrom
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((derivedFrom) => derivedFrom.id),
      derivations: genre.derivations
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((derivation) => derivation.id),
    }))
  }
}
