import { NotFoundError } from '$lib/server/api/genres/types'
import { GenreCycleError, NoUpdatesError, SelfInfluenceError } from '$lib/server/api/genres/update'

import { type GenreUpdate } from '../../domain/genre'
import { GenreHistory } from '../../domain/genre-history'
import type { GenreRepository } from '../../infrastructure/repositories/genre/genre-repository'
import type { GenreHistoryRepository } from '../../infrastructure/repositories/genre-history/genre-history-repository'

export type CreateRelease = {
  title: string
  art?: string
  artists: number[]
  tracks: (number | { title: string; artists: number[] })[]
}

export class GenreService {
  constructor(
    private genreRepo: GenreRepository,
    private genreHistoryRepo: GenreHistoryRepository,
  ) {}

  async updateGenre(id: number, data: GenreUpdate, accountId: number): Promise<void> {
    const genre = await this.genreRepo.findById(id)
    if (!genre) {
      throw new NotFoundError()
    }

    genre.update(data)

    if (genre.doesInfluenceSelf()) {
      throw new SelfInfluenceError()
    }

    const lastGenreHistory = await this.genreHistoryRepo.findLatestByGenreId(id)
    if (lastGenreHistory && !genre.isChangedFrom(lastGenreHistory)) {
      throw new NoUpdatesError()
    }

    const genreTree = await this.genreRepo.getGenreTree()
    genreTree.updateGenre(id, genre)

    const cycle = genreTree.findCycle()
    if (cycle) {
      throw new GenreCycleError(cycle)
    }

    await this.genreRepo.update(id, genre)

    const genreHistory = GenreHistory.fromGenre(genre, 'UPDATE', accountId)
    await this.genreHistoryRepo.create(genreHistory)
  }
}
