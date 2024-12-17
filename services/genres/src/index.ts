import type { IAuthenticationApplication } from '@romulus/authentication'
import type { IAuthorizationApplication } from '@romulus/authorization'
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
  ) {}

  static async create(
    databaseUrl: string,
    authentication: IAuthenticationApplication,
    authorization: IAuthorizationApplication,
  ): Promise<GenresService> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)
    await migrate(db)

    const di = new CompositionRoot(db, authentication, authorization)

    await authorization.ensurePermissions([
      { name: GenresPermission.CreateGenres, description: undefined },
      { name: GenresPermission.EditGenres, description: undefined },
      { name: GenresPermission.DeleteGenres, description: undefined },
      { name: GenresPermission.VoteGenreRelevance, description: undefined },
    ])

    return new GenresService(pg, di)
  }

  use() {
    return {
      commands: () => this.di.commands(),
      queries: () => this.di.queries(),
    }
  }

  getRouter(): Router {
    return createRouter(
      createCommandsRouter(this.di.commands(), this.di.authentication()),
      createQueriesRouter(this.di.queries()),
    )
  }

  async destroy(): Promise<void> {
    await this.pg.end()
  }
}
