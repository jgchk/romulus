import type { GenreDatabase } from '../infrastructure/db'
import { createClearGenresCommand } from './clear-genres'
import { createGetChildrenQuery } from './get-children'
import { createGetDerivationsQuery } from './get-derivations'
import { createGetGenreQuery } from './get-genre'
import { createGetRootGenresQuery } from './get-root-genres'
import { createSeedGenresCommand } from './seed-genres'
import { createSetGenresCommand } from './set-genres'

export type GenreDatabaseApplication = ReturnType<typeof createGenreDatabaseApplication>

export function createGenreDatabaseApplication(db: GenreDatabase) {
  const clearGenres = createClearGenresCommand(db)
  const setGenres = createSetGenresCommand(db)
  const seedGenres = createSeedGenresCommand({ clearGenres, setGenres })

  const getChildren = createGetChildrenQuery(db)
  const getDerivations = createGetDerivationsQuery(db)
  const getGenre = createGetGenreQuery(db)
  const getRootGenres = createGetRootGenresQuery(db)

  return {
    clearGenres,
    setGenres,
    seedGenres,
    getChildren,
    getDerivations,
    getGenre,
    getRootGenres,
  }
}
