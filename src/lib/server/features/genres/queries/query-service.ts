import type { IDrizzleConnection } from '$lib/server/db/connection'

import {
  GetAllGenresQuery,
  type GetAllGenresQueryIncludeFields,
  type GetAllGenresQueryInput,
} from './application/get-all-genres'

export class GenreQueryService {
  private getAllGenresQuery: GetAllGenresQuery

  constructor(db: IDrizzleConnection) {
    this.getAllGenresQuery = new GetAllGenresQuery(db)
  }

  async getAllGenres<I extends GetAllGenresQueryIncludeFields = never>(
    input: GetAllGenresQueryInput<I>,
  ) {
    return this.getAllGenresQuery.execute(input)
  }
}
