import type { IDrizzleConnection } from '$lib/server/db/connection'

import {
  type FindAllInclude,
  type GetAllGenresParams,
  GetAllGenresQuery,
} from './application/get-all-genres'

export class GenreQueryService {
  private getAllGenresQuery: GetAllGenresQuery

  constructor(db: IDrizzleConnection) {
    this.getAllGenresQuery = new GetAllGenresQuery(db)
  }

  async getAllGenres<I extends FindAllInclude = never>(params: GetAllGenresParams<I>) {
    return this.getAllGenresQuery.execute(params)
  }
}
