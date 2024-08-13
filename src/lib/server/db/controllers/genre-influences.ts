import type { IDrizzleConnection } from '../connection'
import { type GenreInfluence, genreInfluences, type InsertGenreInfluence } from '../schema'

export type IGenreInfluencesDatabase<T> = {
  insert: (data: InsertGenreInfluence[], conn: T) => Promise<GenreInfluence[]>
}

export class GenreInfluencesDatabase implements IGenreInfluencesDatabase<IDrizzleConnection> {
  insert(data: InsertGenreInfluence[], conn: IDrizzleConnection) {
    return conn.insert(genreInfluences).values(data).returning()
  }
}
