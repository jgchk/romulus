import type { IDrizzleConnection } from '$lib/server/db/connection'

import {
  GetAllGenresQuery,
  type GetAllGenresQueryIncludeFields,
  type GetAllGenresQueryInput,
} from './application/get-all-genres'
import { GetGenreQuery } from './application/get-genre'
import { GetGenreRelevanceVoteByAccountQuery } from './application/get-genre-relevance-vote-by-account'
import { GetGenreRelevanceVotesByGenreQuery } from './application/get-genre-relevance-votes-by-genre'
import { GetGenreTreeQuery } from './application/get-genre-tree'
import { GetLatestGenreUpdatesQuery } from './application/get-latest-genre-updates'
import { GetRandomGenreIdQuery } from './application/get-random-genre-id'

export class GenreQueryService {
  private getAllGenresQuery: GetAllGenresQuery
  private getGenreRelevanceVoteByAccountQuery: GetGenreRelevanceVoteByAccountQuery
  private getGenreRelevanceVotesByGenreQuery: GetGenreRelevanceVotesByGenreQuery
  private getGenreTreeQuery: GetGenreTreeQuery
  private getGenreQuery: GetGenreQuery
  private getLatestGenreUpdatesQuery: GetLatestGenreUpdatesQuery
  private getRandomGenreIdQuery: GetRandomGenreIdQuery

  constructor(db: IDrizzleConnection) {
    this.getAllGenresQuery = new GetAllGenresQuery(db)
    this.getGenreRelevanceVoteByAccountQuery = new GetGenreRelevanceVoteByAccountQuery(db)
    this.getGenreRelevanceVotesByGenreQuery = new GetGenreRelevanceVotesByGenreQuery(db)
    this.getGenreTreeQuery = new GetGenreTreeQuery(db)
    this.getGenreQuery = new GetGenreQuery(db)
    this.getLatestGenreUpdatesQuery = new GetLatestGenreUpdatesQuery(db)
    this.getRandomGenreIdQuery = new GetRandomGenreIdQuery(db)
  }

  getAllGenres<I extends GetAllGenresQueryIncludeFields = never>(input: GetAllGenresQueryInput<I>) {
    return this.getAllGenresQuery.execute(input)
  }

  getGenreRelevanceVoteByAccount(genreId: number, accountId: number) {
    return this.getGenreRelevanceVoteByAccountQuery.execute(genreId, accountId)
  }

  getGenreRelevanceVotesByGenre(genreId: number) {
    return this.getGenreRelevanceVotesByGenreQuery.execute(genreId)
  }

  getGenreTree() {
    return this.getGenreTreeQuery.execute()
  }

  getGenre(genreId: number) {
    return this.getGenreQuery.execute(genreId)
  }

  getLatestGenreUpdates() {
    return this.getLatestGenreUpdatesQuery.execute()
  }

  getRandomGenreId() {
    return this.getRandomGenreIdQuery.execute()
  }
}
