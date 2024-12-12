import type { Sql } from 'postgres'

import type { IAuthenticationService } from './commands/domain/authentication-service'
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

export class GenresService {
  private constructor(
    private pg: Sql,
    private di: CompositionRoot,
  ) {}

  static async create(
    databaseUrl: string,
    authenticationService: IAuthenticationService,
  ): Promise<GenresService> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)
    await migrate(db)

    const di = new CompositionRoot(db, authenticationService)

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
