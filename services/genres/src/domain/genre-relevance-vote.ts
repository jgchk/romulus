import type { GenreRelevance } from './genre-relevance.js'

export class GenreRelevanceVote {
  constructor(
    public genreId: number,
    public accountId: number,
    public relevance: GenreRelevance,
  ) {}
}
