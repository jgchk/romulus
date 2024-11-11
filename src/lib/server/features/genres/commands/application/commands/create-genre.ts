import { SelfInfluenceError } from '../../domain/errors/self-influence'
import { Genre, type GenreConstructorParams } from '../../domain/genre'
import { GenreHistory } from '../../domain/genre-history'
import type { GenreHistoryRepository } from '../../domain/genre-history-repository'
import type { GenreRepository } from '../../domain/genre-repository'
import { GenreCycleError } from './update-genre'
import type { VoteGenreRelevanceCommand } from './vote-genre-relevance'

export class CreateGenreCommand {
  constructor(
    private genreRepo: GenreRepository,
    private genreHistoryRepo: GenreHistoryRepository,
    private voteGenreRelevanceCommand: VoteGenreRelevanceCommand,
  ) {}

  async execute(
    data: GenreConstructorParams,
    accountId: number,
  ): Promise<{ id: number } | SelfInfluenceError> {
    const genre = Genre.create(data)

    if (genre instanceof SelfInfluenceError) {
      return genre
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

    // TODO: Remove this from the command and instead call the two commands from the BFFE function
    await this.voteGenreRelevanceCommand.execute(id, data.relevance, accountId)

    return { id }
  }
}
