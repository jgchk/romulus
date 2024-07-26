import { and, eq } from 'drizzle-orm'

import { hasUpdate, makeUpdate } from '$lib/utils/db'

import type { DbConnection } from '../connection'
import { type GenreParent, genreParents, type InsertGenreParent } from '../schema'

export interface IGenreParentsDatabase {
  insert: (...data: InsertGenreParent[]) => Promise<GenreParent[]>
  find: (
    parentId: GenreParent['parentId'],
    childId: GenreParent['childId'],
  ) => Promise<GenreParent | undefined>
  update: (
    parentId: GenreParent['parentId'],
    childId: GenreParent['childId'],
    update: Partial<InsertGenreParent>,
  ) => Promise<GenreParent>
}

export class GenreParentsDatabase implements IGenreParentsDatabase {
  constructor(private db: DbConnection) {}

  insert(...data: InsertGenreParent[]) {
    return this.db.insert(genreParents).values(data).returning()
  }

  find(parentId: GenreParent['parentId'], childId: GenreParent['childId']) {
    return this.db.query.genreParents.findFirst({
      where: and(eq(genreParents.parentId, parentId), eq(genreParents.childId, childId)),
    })
  }

  async update(
    parentId: GenreParent['parentId'],
    childId: GenreParent['childId'],
    update: Partial<InsertGenreParent>,
  ) {
    if (!hasUpdate(update)) {
      const genreParent = await this.find(parentId, childId)
      if (!genreParent)
        throw new Error(`Genre Parent not found: { parentId: ${parentId}, childId: ${childId} }`)
      return genreParent
    }

    const [genreParent] = await this.db
      .update(genreParents)
      .set(makeUpdate(update))
      .where(and(eq(genreParents.parentId, parentId), eq(genreParents.childId, childId)))
      .returning()

    return genreParent
  }
}
