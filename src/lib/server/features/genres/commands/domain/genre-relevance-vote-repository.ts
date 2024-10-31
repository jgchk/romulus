export type GenreRelevanceVoteRepository = {
  save(genreId: number, accountId: number, relevance: number): Promise<void>
}
