import { GenreHistory } from '../../domain/genre-history'
import type { GenreHistoryRepository } from '../../domain/genre-history-repository'
import type { GenreRepository } from '../../domain/genre-repository'
import { NotFoundError } from './update-genre'

export class DeleteGenreCommand {
  constructor(
    private genreRepo: GenreRepository,
    private genreHistoryRepo: GenreHistoryRepository,
  ) {}

  async execute(id: number, accountId: number): Promise<void> {
    const genre = await this.genreRepo.findById(id)
    if (!genre) {
      throw new NotFoundError()
    }

    const genreTree = await this.genreRepo.getGenreTree()
    const childrenIds = genreTree.getGenreChildren(id)
    genreTree.deleteGenre(id)

    await this.genreRepo.saveGenreTree(genreTree)

    await this.genreRepo.delete(id)

    const genreHistory = GenreHistory.fromGenre(id, genre, 'DELETE', accountId)
    await this.genreHistoryRepo.create(genreHistory)

    // save genre history for all children
    await Promise.all(
      [...childrenIds].map(async (childId) => {
        const child = await this.genreRepo.findById(childId)
        if (!child) return

        const childHistory = GenreHistory.fromGenre(childId, child, 'UPDATE', accountId)
        await this.genreHistoryRepo.create(childHistory)
      }),
    )
  }
}
