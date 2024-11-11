import type { DuplicateAkaError } from '../../domain/errors/duplicate-aka'
import type { GenreCycleError } from '../../domain/errors/genre-cycle'
import type { SelfInfluenceError } from '../../domain/errors/self-influence'
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

  async execute(
    id: number,
    data: GenreUpdate,
    accountId: number,
  ): Promise<void | SelfInfluenceError | DuplicateAkaError | GenreCycleError> {
    const genre = await this.genreRepo.findById(id)
    if (!genre) {
      throw new NotFoundError()
    }

    const updatedGenre = genre.withUpdate(data)
    if (updatedGenre instanceof Error) {
      return updatedGenre
    }

    const lastGenreHistory = await this.genreHistoryRepo.findLatestByGenreId(id)
    if (lastGenreHistory && !updatedGenre.isChangedFrom(lastGenreHistory)) {
      throw new NoUpdatesError()
    }

    const genreTree = await this.genreRepo.getGenreTree()
    const treeError = genreTree.updateGenre(id, updatedGenre)
    if (treeError) {
      return treeError
    }

    await this.genreRepo.save(updatedGenre)

    const genreHistory = GenreHistory.fromGenre(id, updatedGenre, 'UPDATE', accountId)
    await this.genreHistoryRepo.create(genreHistory)
  }
}

export class NotFoundError extends ApplicationError {
  constructor() {
    super('NotFoundError', 'Genre not found')
  }
}

export class NoUpdatesError extends ApplicationError {
  constructor() {
    super('NoUpdatesError', 'No updates were made')
  }
}
