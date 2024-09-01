import { type GenreUpdate } from '../domain/genre'
import { GenreHistory } from '../domain/genre-history'
import type { GenreRepository } from '../infrastructure/genre/genre-repository'
import type { GenreHistoryRepository } from '../infrastructure/genre-history/genre-history-repository'

export type CreateRelease = {
  title: string
  art?: string
  artists: number[]
  tracks: (number | { title: string; artists: number[] })[]
}

export class SelfInfluenceError extends Error {
  constructor() {
    super('A genre cannot influence itself')
  }
}

export class NotFoundError extends Error {
  constructor() {
    super('Genre not found')
  }
}

export class GenreCycleError extends Error {
  constructor(public cycle: string) {
    super(`Cycle detected: ${cycle}`)
  }
}

export class NoUpdatesError extends Error {
  constructor() {
    super('No updates were made')
  }
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

    const updatedGenre = genre.withUpdate(data)
    if (updatedGenre.hasSelfInfluence()) {
      throw new SelfInfluenceError()
    }

    const lastGenreHistory = await this.genreHistoryRepo.findLatestByGenreId(id)
    if (lastGenreHistory && !updatedGenre.isChangedFrom(lastGenreHistory)) {
      throw new NoUpdatesError()
    }

    const genreTree = await this.genreRepo.getGenreTree()
    genreTree.updateGenre(id, updatedGenre)

    const cycle = genreTree.findCycle()
    if (cycle) {
      throw new GenreCycleError(cycle)
    }

    await this.genreRepo.update(id, updatedGenre)

    const genreHistory = GenreHistory.fromGenre(updatedGenre, 'UPDATE', accountId)
    await this.genreHistoryRepo.create(genreHistory)
  }
}
