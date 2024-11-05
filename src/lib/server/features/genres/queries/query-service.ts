import type { IDrizzleConnection } from '$lib/server/db/connection'

import {
  GetAllGenresQuery,
  type GetAllGenresQueryIncludeFields,
  type GetAllGenresQueryInput,
} from './application/get-all-genres'
import { GetRandomGenreIdQuery } from './application/get-random-genre-id'

export class GenreQueryService {
  private getAllGenresQuery: GetAllGenresQuery
  private getRandomGenreIdQuery: GetRandomGenreIdQuery

  constructor(db: IDrizzleConnection) {
    this.getAllGenresQuery = new GetAllGenresQuery(db)
    this.getRandomGenreIdQuery = new GetRandomGenreIdQuery(db)
  }

  async getAllGenres<I extends GetAllGenresQueryIncludeFields = never>(
    input: GetAllGenresQueryInput<I>,
  ) {
    return this.getAllGenresQuery.execute(input)
  }

  async getRandomGenreId() {
    return this.getRandomGenreIdQuery.execute()
  }
}
