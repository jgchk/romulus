import type { GenreRelevance, GenreRelevanceVote } from './genre-relevance-vote'

export type GenreRelevanceVoteRepository = {
  save(genreRelevanceVote: GenreRelevanceVote): Promise<void>
  delete(genreId: number, accountId: number): Promise<void>

  findByGenreId(genreId: number): Promise<GenreRelevanceVote[]>
  saveRelevance(genreId: number, relevance: GenreRelevance | undefined): Promise<void>
}
