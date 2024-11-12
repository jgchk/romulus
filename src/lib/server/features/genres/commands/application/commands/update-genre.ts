import type { DerivedChildError } from '../../domain/errors/derived-child'
import type { DerivedInfluenceError } from '../../domain/errors/derived-influence'
import type { DuplicateAkaError } from '../../domain/errors/duplicate-aka'
import type { GenreCycleError } from '../../domain/errors/genre-cycle'
import type { SelfInfluenceError } from '../../domain/errors/self-influence'
import type { GenreUpdate } from '../../domain/genre'
import { GenreHistory } from '../../domain/genre-history'
import type { GenreHistoryRepository } from '../../domain/genre-history-repository'
import type { GenreRepository } from '../../domain/genre-repository'
import type { GenreTreeRepository } from '../../domain/genre-tree-repository'
import { GenreNotFoundError } from '../errors/genre-not-found'

export class UpdateGenreCommand {
  constructor(
    private genreRepo: GenreRepository,
    private genreTreeRepo: GenreTreeRepository,
    private genreHistoryRepo: GenreHistoryRepository,
  ) {}

  async execute(
    id: number,
    data: GenreUpdate,
    accountId: number,
  ): Promise<
    | undefined
    | GenreNotFoundError
    | SelfInfluenceError
    | DuplicateAkaError
    | DerivedChildError
    | DerivedInfluenceError
    | GenreCycleError
  > {
    const genre = await this.genreRepo.findById(id)
    if (!genre) {
      return new GenreNotFoundError()
    }

    const updatedGenre = genre.withUpdate(data)
    if (updatedGenre instanceof Error) {
      return updatedGenre
    }

    const genreTree = await this.genreTreeRepo.get()
    const genreParents = data.parents ?? genreTree.getParents(id)
    const genreDerivedFrom = data.derivedFrom ?? genreTree.getDerivedFrom(id)
    const genreInfluences = data.influences ?? genreTree.getInfluences(id)

    const lastGenreHistory = await this.genreHistoryRepo.findLatestByGenreId(id)
    if (
      lastGenreHistory &&
      !updatedGenre.isChangedFrom(genreParents, genreDerivedFrom, genreInfluences, lastGenreHistory)
    ) {
      return
    }

    const treeError = genreTree.updateGenre(
      id,
      updatedGenre.name,
      genreParents,
      genreDerivedFrom,
      genreInfluences,
    )
    if (treeError) {
      return treeError
    }

    await this.genreRepo.save(updatedGenre)

    await this.genreTreeRepo.save(genreTree)

    const genreHistory = GenreHistory.fromGenre(
      id,
      updatedGenre,
      genreTree.getParents(id),
      genreTree.getDerivedFrom(id),
      genreTree.getInfluences(id),
      'UPDATE',
      accountId,
    )
    await this.genreHistoryRepo.create(genreHistory)
  }
}
