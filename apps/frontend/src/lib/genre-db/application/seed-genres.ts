import type { TreeGenre } from '../types'
import type { ClearGenresCommand } from './clear-genres'
import type { SetGenresCommand } from './set-genres'

export type SeedGenresCommand = (genres: TreeGenre[]) => Promise<void>

export function createSeedGenresCommand({
  clearGenres,
  setGenres,
}: {
  clearGenres: ClearGenresCommand
  setGenres: SetGenresCommand
}): SeedGenresCommand {
  return async function seedGenres(genres: TreeGenre[]) {
    await clearGenres()
    await setGenres(genres)
  }
}
