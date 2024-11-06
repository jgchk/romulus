import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import { type Genre, genres } from '../schema'

export class GenresDatabase {
  async findByName(name: string, conn: IDrizzleConnection): Promise<Genre[]> {
    return conn.query.genres.findMany({
      where: eq(genres.name, name),
    })
  }
}
