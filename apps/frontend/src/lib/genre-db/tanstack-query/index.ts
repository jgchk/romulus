import { createGenreDatabaseApplication } from '../application'
import type { GenreDatabase } from '../infrastructure/db'
import { createGetRootGenresQuery } from './get-root-genres'

export function createGenreDatabaseQueries(db: GenreDatabase) {
  const app = createGenreDatabaseApplication(db)

  const getRootGenres = () => createGetRootGenresQuery(app.getRootGenres)

  return { getRootGenres }
}
