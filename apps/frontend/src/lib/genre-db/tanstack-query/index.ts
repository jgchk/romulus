import { createGenreDatabaseApplication } from '../application'
import type { GenreDatabase } from '../infrastructure/db'
import { createGetChildrenQuery } from './get-children'
import { createGetDerivationsQuery } from './get-derivations'
import { createGetRootGenresQuery } from './get-root-genres'

export function createGenreDatabaseQueries(db: GenreDatabase) {
  const app = createGenreDatabaseApplication(db)

  const getChildren = (id: number) => createGetChildrenQuery(id, app.getChildren)
  const getDerivations = (id: number) => createGetDerivationsQuery(id, app.getDerivations)
  const getRootGenres = () => createGetRootGenresQuery(app.getRootGenres)

  return { getChildren, getDerivations, getRootGenres }
}
