import type { IDatabase } from './wrapper'

export default class MockDatabase implements IDatabase {
  async transaction<T>(fn: (tx: IDatabase) => Promise<T>): Promise<T> {
    return fn(this)
  }
}
