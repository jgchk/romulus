import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { Genre, type GenreConstructorParams } from '../../domain/genre'
import { GenreHistory } from '../../domain/genre-history'
import type { GenreHistoryRepository } from '../../domain/genre-history-repository'
import type { GenreRelevanceVoteRepository } from '../../domain/genre-relevance-vote-repository'
import type { GenreRepository } from '../../domain/genre-repository'
import { GenreCycleError, SelfInfluenceError } from './update-genre'

export class CreateGenreCommand {
  constructor(
    private genreRepo: GenreRepository,
    private genreHistoryRepo: GenreHistoryRepository,
    private genreRelevanceVoteRepo: GenreRelevanceVoteRepository,
  ) {}

  async execute(data: GenreConstructorParams, accountId: number): Promise<{ id: number }> {
    const genre = new Genre(data)

    if (genre.hasSelfInfluence()) {
      throw new SelfInfluenceError()
    }

    const genreTree = await this.genreRepo.getGenreTree()
    genreTree.insertGenre(genre)

    const cycle = genreTree.findCycle()
    if (cycle) {
      throw new GenreCycleError(cycle)
    }

    const { id } = await this.genreRepo.save(genre)

    const genreHistory = GenreHistory.fromGenre(id, genre, 'CREATE', accountId)
    await this.genreHistoryRepo.create(genreHistory)

    if (data.relevance !== UNSET_GENRE_RELEVANCE) {
      await this.genreRelevanceVoteRepo.save(id, accountId, data.relevance)
    }

    return { id }
  }
}
