import type { GenreCycleError } from '../../domain/errors/genre-cycle'
import { GenreHistory } from '../../domain/genre-history'
import type { GenreHistoryRepository } from '../../domain/genre-history-repository'
import type { GenreRepository } from '../../domain/genre-repository'
import type { GenreTreeRepository } from '../../domain/genre-tree-repository'
import { GenreNotFoundError } from '../errors/genre-not-found'

export class DeleteGenreCommand {
  constructor(
    private genreRepo: GenreRepository,
    private genreTreeRepo: GenreTreeRepository,
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

    const genreTree = await this.genreTreeRepo.get()

    const genreParentsBeforeDeletion = genreTree.getParents(id)
    const genreDerivedFromBeforeDeletion = genreTree.getDerivedFrom(id)
    const genreInfluencesBeforeDeletion = genreTree.getInfluences(id)

    const childrenIds = genreTree.getGenreChildren(id)
    genreTree.deleteGenre(id)

    await this.genreTreeRepo.save(genreTree)

    await this.genreRepo.delete(id)

    const genreHistory = GenreHistory.fromGenre(
      id,
      genre,
      genreParentsBeforeDeletion,
      genreDerivedFromBeforeDeletion,
      genreInfluencesBeforeDeletion,
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
          genreTree.getDerivedFrom(childId),
          genreTree.getInfluences(childId),
          'UPDATE',
          accountId,
        )
        await this.genreHistoryRepo.create(childHistory)
      }),
    )
  }
}
