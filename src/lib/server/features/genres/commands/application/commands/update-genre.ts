import type { GenreUpdate } from '../../domain/genre'
import { GenreHistory } from '../../domain/genre-history'
import type { GenreHistoryRepository } from '../../domain/genre-history-repository'
import type { GenreRepository } from '../../domain/genre-repository'
import { ApplicationError } from '../errors/base'

export class UpdateGenreCommand {
  constructor(
    private genreRepo: GenreRepository,
    private genreHistoryRepo: GenreHistoryRepository,
  ) {}

  async execute(id: number, data: GenreUpdate, accountId: number): Promise<void> {
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

    if (updatedGenre.hasDuplicateAkas()) {
      throw new DuplicateAkasError()
    }

    await this.genreRepo.save(updatedGenre)

    const genreHistory = GenreHistory.fromGenre(id, updatedGenre, 'UPDATE', accountId)
    await this.genreHistoryRepo.create(genreHistory)
  }
}

export class SelfInfluenceError extends ApplicationError {
  constructor() {
    super('SelfInfluenceError', 'A genre cannot influence itself')
  }
}

export class DuplicateAkasError extends ApplicationError {
  constructor() {
    super('DuplicateAkasError', 'A genre cannot have duplicate akas')
  }
}

export class NotFoundError extends ApplicationError {
  constructor() {
    super('NotFoundError', 'Genre not found')
  }
}

export class GenreCycleError extends ApplicationError {
  constructor(public cycle: string) {
    super('GenreCycleError', `Cycle detected: ${cycle}`)
  }
}

export class NoUpdatesError extends ApplicationError {
  constructor() {
    super('NoUpdatesError', 'No updates were made')
  }
}
