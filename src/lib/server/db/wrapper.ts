import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import * as schema from './schema'

export interface IDatabase {
  transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T>
}

export class Database implements IDatabase {
  readonly db: PostgresJsDatabase<typeof schema>

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db
  }

  async transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T> {
    return this.db.transaction((tx) => fn(new Database(tx)))
  }
}
