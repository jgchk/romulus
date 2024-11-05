import type { IDrizzleConnection } from '$lib/server/db/connection'

import {
  GetAllGenresQuery,
  type GetAllGenresQueryIncludeFields,
  type GetAllGenresQueryInput,
} from './application/get-all-genres'
import { GetGenreTreeQuery } from './application/get-genre-tree'
import { GetRandomGenreIdQuery } from './application/get-random-genre-id'

export class GenreQueryService {
  private getAllGenresQuery: GetAllGenresQuery
  private getGenreTreeQuery: GetGenreTreeQuery
  private getRandomGenreIdQuery: GetRandomGenreIdQuery

  constructor(db: IDrizzleConnection) {
    this.getAllGenresQuery = new GetAllGenresQuery(db)
    this.getGenreTreeQuery = new GetGenreTreeQuery(db)
    this.getRandomGenreIdQuery = new GetRandomGenreIdQuery(db)
  }

  async getAllGenres<I extends GetAllGenresQueryIncludeFields = never>(
    input: GetAllGenresQueryInput<I>,
  ) {
    return this.getAllGenresQuery.execute(input)
  }

  async getGenreTree() {
    return this.getGenreTreeQuery.execute()
  }

  async getRandomGenreId() {
    return this.getRandomGenreIdQuery.execute()
  }
}
