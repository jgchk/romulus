import type { IDrizzleConnection } from '../../shared/infrastructure/drizzle-database'
import { GetAllGenresQuery } from './get-all-genres'
import { GetGenreQuery } from './get-genre'
import { GetGenreHistoryQuery } from './get-genre-history'
import { GetGenreHistoryByAccountQuery } from './get-genre-history-by-account'
import { GetGenreRelevanceVoteByAccountQuery } from './get-genre-relevance-vote-by-account'
import { GetGenreRelevanceVotesByGenreQuery } from './get-genre-relevance-votes-by-genre'
import { GetGenreTreeQuery } from './get-genre-tree'
import { GetLatestGenreUpdatesQuery } from './get-latest-genre-updates'
import { GetRandomGenreIdQuery } from './get-random-genre-id'

export class GenreQueriesApplication {
  getAllGenres: GetAllGenresQuery['execute']
  getGenreHistoryByAccount: GetGenreHistoryByAccountQuery['execute']
  getGenreHistory: GetGenreHistoryQuery['execute']
  getGenreRelevanceVoteByAccount: GetGenreRelevanceVoteByAccountQuery['execute']
  getGenreRelevanceVotesByGenre: GetGenreRelevanceVotesByGenreQuery['execute']
  getGenreTree: GetGenreTreeQuery['execute']
  getGenre: GetGenreQuery['execute']
  getLatestGenreUpdates: GetLatestGenreUpdatesQuery['execute']
  getRandomGenreId: GetRandomGenreIdQuery['execute']

  constructor(db: IDrizzleConnection) {
    const getAllGenresQuery = new GetAllGenresQuery(db)
    const getGenreHistoryByAccountQuery = new GetGenreHistoryByAccountQuery(db)
    const getGenreHistoryQuery = new GetGenreHistoryQuery(db)
    const getGenreRelevanceVoteByAccountQuery = new GetGenreRelevanceVoteByAccountQuery(db)
    const getGenreRelevanceVotesByGenreQuery = new GetGenreRelevanceVotesByGenreQuery(db)
    const getGenreTreeQuery = new GetGenreTreeQuery(db)
    const getGenreQuery = new GetGenreQuery(db)
    const getLatestGenreUpdatesQuery = new GetLatestGenreUpdatesQuery(db)
    const getRandomGenreIdQuery = new GetRandomGenreIdQuery(db)

    this.getAllGenres = getAllGenresQuery.execute.bind(getAllGenresQuery)
    this.getGenreHistoryByAccount = getGenreHistoryByAccountQuery.execute.bind(
      getGenreHistoryByAccountQuery,
    )
    this.getGenreHistory = getGenreHistoryQuery.execute.bind(getGenreHistoryQuery)
    this.getGenreRelevanceVoteByAccount = getGenreRelevanceVoteByAccountQuery.execute.bind(
      getGenreRelevanceVoteByAccountQuery,
    )
    this.getGenreRelevanceVotesByGenre = getGenreRelevanceVotesByGenreQuery.execute.bind(
      getGenreRelevanceVotesByGenreQuery,
    )
    this.getGenreTree = getGenreTreeQuery.execute.bind(getGenreTreeQuery)
    this.getGenre = getGenreQuery.execute.bind(getGenreQuery)
    this.getLatestGenreUpdates = getLatestGenreUpdatesQuery.execute.bind(getLatestGenreUpdatesQuery)
    this.getRandomGenreId = getRandomGenreIdQuery.execute.bind(getRandomGenreIdQuery)
  }
}
