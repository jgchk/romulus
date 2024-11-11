import type { GenreCycleError } from '../../domain/errors/genre-cycle'
import { GenreHistory } from '../../domain/genre-history'
import type { GenreHistoryRepository } from '../../domain/genre-history-repository'
import type { GenreRepository } from '../../domain/genre-repository'
import { GenreNotFoundError } from '../errors/genre-not-found'

export class DeleteGenreCommand {
  constructor(
    private genreRepo: GenreRepository,
    private genreHistoryRepo: GenreHistoryRepository,
  ) {}

  async execute(
    id: number,
    accountId: number,
  ): Promise<undefined | GenreNotFoundError | GenreCycleError> {
    const genre = await this.genreRepo.findById(id)
    if (!genre) {
      return new GenreNotFoundError()
    }

    const genreTree = await this.genreRepo.getGenreTree()

    const genreParentsBeforeDeletion = genreTree.getParents(id)

    const childrenIds = genreTree.getGenreChildren(id)
    const treeError = genreTree.deleteGenre(id)
    if (treeError) {
      return treeError
    }

    await this.genreRepo.saveGenreTree(genreTree)

    await this.genreRepo.delete(id)

    const genreHistory = GenreHistory.fromGenre(
      id,
      genre,
      genreParentsBeforeDeletion,
      'DELETE',
      accountId,
    )
    await this.genreHistoryRepo.create(genreHistory)

    // save genre history for all children
    await Promise.all(
      [...childrenIds].map(async (childId) => {
        const child = await this.genreRepo.findById(childId)
        if (!child) return

        const childHistory = GenreHistory.fromGenre(
          childId,
          child,
          genreTree.getParents(childId),
          'UPDATE',
          accountId,
        )
        await this.genreHistoryRepo.create(childHistory)
      }),
    )
  }
}
