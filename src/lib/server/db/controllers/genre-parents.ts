import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import { type GenreParent, genreParents, type InsertGenreParent } from '../schema'

export class GenreParentsDatabase {
  insert(data: InsertGenreParent[], conn: IDrizzleConnection): Promise<GenreParent[]> {
    return conn.insert(genreParents).values(data).returning()
  }

  findByParentId(
    parentId: GenreParent['parentId'],
    conn: IDrizzleConnection,
  ): Promise<GenreParent[]> {
    return conn.query.genreParents.findMany({
      where: eq(genreParents.parentId, parentId),
    })
  }
}
