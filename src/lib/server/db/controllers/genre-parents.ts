import { and, eq } from 'drizzle-orm'

import { hasUpdate, makeUpdate } from '$lib/utils/db'

import type { IDrizzleConnection } from '../connection'
import { type GenreParent, genreParents, type InsertGenreParent } from '../schema'

export class GenreParentsDatabase {
  insert(data: InsertGenreParent[], conn: IDrizzleConnection): Promise<GenreParent[]> {
    return conn.insert(genreParents).values(data).returning()
  }

  find(
    parentId: GenreParent['parentId'],
    childId: GenreParent['childId'],
    conn: IDrizzleConnection,
  ): Promise<GenreParent | undefined> {
    return conn.query.genreParents.findFirst({
      where: and(eq(genreParents.parentId, parentId), eq(genreParents.childId, childId)),
    })
  }

  findByParentId(
    parentId: GenreParent['parentId'],
    conn: IDrizzleConnection,
  ): Promise<GenreParent[]> {
    return conn.query.genreParents.findMany({
      where: eq(genreParents.parentId, parentId),
    })
  }

  async update(
    parentId: GenreParent['parentId'],
    childId: GenreParent['childId'],
    update: Partial<InsertGenreParent>,
    conn: IDrizzleConnection,
  ): Promise<GenreParent> {
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
