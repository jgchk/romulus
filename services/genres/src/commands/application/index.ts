import type { GenreHistoryRepository } from '../domain/genre-history-repository'
import type { GenreRelevanceVoteRepository } from '../domain/genre-relevance-vote-repository'
import type { GenreRepository } from '../domain/genre-repository'
import type { GenreTreeRepository } from '../domain/genre-tree-repository'
import { CreateGenreCommand } from './commands/create-genre'
import { DeleteGenreCommand } from './commands/delete-genre'
import { UpdateGenreCommand } from './commands/update-genre'
import { VoteGenreRelevanceCommand } from './commands/vote-genre-relevance'

export class GenreCommandsApplication {
  createGenre: CreateGenreCommand['execute']
  deleteGenre: DeleteGenreCommand['execute']
  updateGenre: UpdateGenreCommand['execute']
  voteGenreRelevance: VoteGenreRelevanceCommand['execute']

  constructor(
    genreRepo: GenreRepository,
    genreTreeRepo: GenreTreeRepository,
    genreHistoryRepo: GenreHistoryRepository,
    genreRelevanceVoteRepo: GenreRelevanceVoteRepository,
  ) {
    const createGenreCommand = new CreateGenreCommand(genreRepo, genreTreeRepo, genreHistoryRepo)
    const deleteGenreCommand = new DeleteGenreCommand(genreRepo, genreTreeRepo, genreHistoryRepo)
    const updateGenreCommand = new UpdateGenreCommand(genreRepo, genreTreeRepo, genreHistoryRepo)
    const voteGenreRelevanceCommand = new VoteGenreRelevanceCommand(genreRelevanceVoteRepo)

    this.createGenre = createGenreCommand.execute.bind(createGenreCommand)
    this.deleteGenre = deleteGenreCommand.execute.bind(deleteGenreCommand)
    this.updateGenre = updateGenreCommand.execute.bind(updateGenreCommand)
    this.voteGenreRelevance = voteGenreRelevanceCommand.execute.bind(voteGenreRelevanceCommand)
  }
}
