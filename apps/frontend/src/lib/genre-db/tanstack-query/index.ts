import { createGenreDatabaseApplication } from '../application'
import type { GenreDatabase } from '../infrastructure/db'
import { createGetChildrenQuery } from './get-children'
import { createGetRootGenresQuery } from './get-root-genres'

export function createGenreDatabaseQueries(db: GenreDatabase) {
  const app = createGenreDatabaseApplication(db)

  const getChildren = (id: number) => createGetChildrenQuery(id, app.getChildren)
  const getRootGenres = () => createGetRootGenresQuery(app.getRootGenres)

  return { getChildren, getRootGenres }
}
