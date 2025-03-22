import type { GenreDatabase } from '../infrastructure/db'
import { createClearGenresCommand } from './clear-genres'
import { createGetRootGenresQuery } from './get-root-genres'
import { createSeedGenresCommand } from './seed-genres'
import { createSetGenresCommand } from './set-genres'

export type GenreDatabaseApplication = ReturnType<typeof createGenreDatabaseApplication>

export function createGenreDatabaseApplication(db: GenreDatabase) {
  const clearGenres = createClearGenresCommand(db)
  const setGenres = createSetGenresCommand(db)
  const seedGenres = createSeedGenresCommand({ clearGenres, setGenres })

  const getRootGenres = createGetRootGenresQuery(db)

  return { clearGenres, setGenres, seedGenres, getRootGenres }
}
