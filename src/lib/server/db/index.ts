import { getDbConnection } from './connection'
import { Database } from './wrapper'

export const db = new Database(getDbConnection())
