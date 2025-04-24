import { asc, desc } from 'drizzle-orm'

import type { IDrizzleConnection } from '../../infrastructure/drizzle-database.js'
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
    const genresMap = new Map<
      number,
      {
        id: number
        name: string
        subtitle: string | null
        type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
        akas: string[]
        children: { id: number; name: string }[]
        derivedFrom: { id: number; name: string }[]
        derivations: { id: number; name: string }[]
        relevance: number
        nsfw: boolean
        updatedAt: Date
      }
    >()
    console.timeEnd('get-genre-tree b')

    console.time('get-genre-tree c')
    for (const genre of results) {
      genresMap.set(genre.id, {
        ...genre,
        akas: [] as string[],
        children: [] as { id: number; name: string }[],
        derivedFrom: [] as { id: number; name: string }[],
        derivations: [] as { id: number; name: string }[],
      })
    }
    console.timeEnd('get-genre-tree c')

    console.time('get-genre-tree d')
    for (const { parentId, childId } of parentChildren) {
      const parent = genresMap.get(parentId)
      const child = genresMap.get(childId)
      if (parent && child) {
        parent.children.push({ id: childId, name: child.name })
      }
    }
    console.timeEnd('get-genre-tree d')

    console.time('get-genre-tree e')
    for (const { derivedFromId, derivationId } of derivations) {
      const derivedFrom = genresMap.get(derivedFromId)
      const derivation = genresMap.get(derivationId)
      if (derivedFrom && derivation) {
        derivedFrom.derivations.push({ id: derivationId, name: derivation.name })
        derivation.derivedFrom.push({ id: derivedFromId, name: derivedFrom.name })
      }
    }
    console.timeEnd('get-genre-tree e')

    console.time('get-genre-tree f')
    for (const { genreId, name } of akas) {
      const genre = genresMap.get(genreId)
      if (genre) {
        genre.akas.push(name)
      }
    }
    console.timeEnd('get-genre-tree f')

    console.time('get-genre-tree g')
    const output = [...genresMap.values()].map(({ children, ...genre }) => ({
      ...genre,
      children: children.sort((a, b) => a.name.localeCompare(b.name)).map((child) => child.id),
      derivedFrom: genre.derivedFrom
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((derivedFrom) => derivedFrom.id),
      derivations: genre.derivations
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((derivation) => derivation.id),
    }))
    console.timeEnd('get-genre-tree g')

    console.timeEnd('get-genre-tree all')

    return output
  }
}
