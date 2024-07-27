import { and, eq } from 'drizzle-orm'

import { hasUpdate, makeUpdate } from '$lib/utils/db'

import type { IDrizzleConnection } from '../connection'
import { type GenreParent, genreParents, type InsertGenreParent } from '../schema'

export interface IGenreParentsDatabase<T> {
  insert: (data: InsertGenreParent[], conn: T) => Promise<GenreParent[]>
  find: (
    parentId: GenreParent['parentId'],
    childId: GenreParent['childId'],
    conn: T,
  ) => Promise<GenreParent | undefined>
  update: (
    parentId: GenreParent['parentId'],
    childId: GenreParent['childId'],
    update: Partial<InsertGenreParent>,
    conn: T,
  ) => Promise<GenreParent>
}

export class GenreParentsDatabase implements IGenreParentsDatabase<IDrizzleConnection> {
  insert(data: InsertGenreParent[], conn: IDrizzleConnection) {
    return conn.insert(genreParents).values(data).returning()
  }

  find(
    parentId: GenreParent['parentId'],
    childId: GenreParent['childId'],
    conn: IDrizzleConnection,
  ) {
    return conn.query.genreParents.findFirst({
      where: and(eq(genreParents.parentId, parentId), eq(genreParents.childId, childId)),
    })
  }

  async update(
    parentId: GenreParent['parentId'],
    childId: GenreParent['childId'],
    update: Partial<InsertGenreParent>,
    conn: IDrizzleConnection,
  ) {
    if (!hasUpdate(update)) {
      const genreParent = await this.find(parentId, childId, conn)
      if (!genreParent)
        throw new Error(`Genre Parent not found: { parentId: ${parentId}, childId: ${childId} }`)
      return genreParent
    }

    const [genreParent] = await conn
      .update(genreParents)
      .set(makeUpdate(update))
      .where(and(eq(genreParents.parentId, parentId), eq(genreParents.childId, childId)))
      .returning()

    return genreParent
  }
}
