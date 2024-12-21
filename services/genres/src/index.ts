import { AuthorizationClient } from '@romulus/authorization/client'
import type { Sql } from 'postgres'

import { CompositionRoot } from './composition-root'
import {
  getDbConnection,
  getPostgresConnection,
  migrate,
} from './infrastructure/drizzle-postgres-connection'
import type { GenresRouter } from './web/router'
import { createGenresRouter } from './web/router'

export class GenresService {
  private constructor(
    private pg: Sql,
    private di: CompositionRoot,
    private authenticationBaseUrl: string,
    private authorizationBaseUrl: string,
  ) {}

  static async create(
    databaseUrl: string,
    authenticationBaseUrl: string,
    authorizationBaseUrl: string,
    systemUserToken: string,
  ): Promise<GenresService> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)
    await migrate(db)

    const di = new CompositionRoot(db)

    const authorization = new AuthorizationClient(authorizationBaseUrl, systemUserToken)
    const result = await authorization.ensurePermissions([
      { name: GenresPermission.CreateGenres, description: undefined },
      { name: GenresPermission.EditGenres, description: undefined },
      { name: GenresPermission.DeleteGenres, description: undefined },
      { name: GenresPermission.VoteGenreRelevance, description: undefined },
    ])
    if (result.isErr()) throw result.error

    return new GenresService(pg, di, authenticationBaseUrl, authorizationBaseUrl)
  }

  getRouter(): GenresRouter {
    return createGenresRouter()
  }

  async destroy(): Promise<void> {
    await this.pg.end()
  }
}
