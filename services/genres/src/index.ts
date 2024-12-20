import { AuthenticationClient } from '@romulus/authentication/client'
import { AuthorizationClient } from '@romulus/authorization/client'
import type { Sql } from 'postgres'

import { GenresPermission } from './commands/domain/permissions'
import { createCommandsRouter } from './commands/web/router'
import { CompositionRoot } from './composition-root'
import { createQueriesRouter } from './queries/web/router'
import {
  getDbConnection,
  getPostgresConnection,
  migrate,
} from './shared/infrastructure/drizzle-postgres-connection'
import type { Router } from './shared/web/router'
import { createRouter } from './shared/web/router'

export { GenresPermission } from './commands/domain/permissions'
export { GenreCommandsClient, GenreCommandsClientError } from './commands/web/client'
export { GenreQueriesClient, GenreQueriesClientError } from './queries/web/client'
export { GenresClient } from './shared/web/client'

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

  getRouter(): Router {
    return createRouter(
      createCommandsRouter(
        this.di,
        (sessionToken) => new AuthenticationClient(this.authenticationBaseUrl, sessionToken),
        (sessionToken) => new AuthorizationClient(this.authorizationBaseUrl, sessionToken),
      ),
      createQueriesRouter(this.di.dbConnection()),
    )
  }

  async destroy(): Promise<void> {
    await this.pg.end()
  }
}
