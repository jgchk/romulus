import type { DbConnection } from '../connection'
import { type GenreInfluence, genreInfluences, type InsertGenreInfluence } from '../schema'

export interface IGenreInfluencesDatabase {
  insert: (...data: InsertGenreInfluence[]) => Promise<GenreInfluence[]>
}

export class GenreInfluencesDatabase implements IGenreInfluencesDatabase {
  constructor(private db: DbConnection) {}

  insert(...data: InsertGenreInfluence[]) {
    return this.db.insert(genreInfluences).values(data).returning()
  }
}
