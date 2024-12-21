import type { Sql } from 'postgres'

import type { IAuthorizerRepository } from '../domain/repository'
import type { IDrizzleConnection } from './drizzle-database'
import { getDbConnection, getPostgresConnection } from './drizzle-postgres-connection'
import { DrizzleAuthorizerRepository } from './drizzle-repository'

export class AuthorizationInfrastructure {
  private pg: Sql

  constructor(private databaseUrl: string) {
    this.pg = getPostgresConnection(this.databaseUrl)
  }

  dbConnection(): IDrizzleConnection {
    return getDbConnection(this.pg)
  }

  authorizerRepo(): IAuthorizerRepository {
    return new DrizzleAuthorizerRepository(this.dbConnection())
  }
}
