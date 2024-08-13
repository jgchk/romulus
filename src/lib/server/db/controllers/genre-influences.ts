import type { IDrizzleConnection } from '../connection'
import { type GenreInfluence, genreInfluences, type InsertGenreInfluence } from '../schema'

export class GenreInfluencesDatabase {
  insert(data: InsertGenreInfluence[], conn: IDrizzleConnection): Promise<GenreInfluence[]> {
    return conn.insert(genreInfluences).values(data).returning()
  }
}
