import type { IDrizzleConnection } from '$lib/server/db/connection'

import {
  type FindAllInclude,
  GetAllGenresQuery,
  type GetManyGenresParams,
} from './application/get-all-genres'

export class GenreQueryService {
  private getAllGenresQuery: GetAllGenresQuery

  constructor(db: IDrizzleConnection) {
    this.getAllGenresQuery = new GetAllGenresQuery(db)
  }

  async getAllGenres<I extends FindAllInclude = never>(params: GetManyGenresParams<I>) {
    return this.getAllGenresQuery.execute(params)
  }
}
