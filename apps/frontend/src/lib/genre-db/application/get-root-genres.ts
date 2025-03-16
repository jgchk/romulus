import type { GenreDatabase } from '../infrastructure/db'
import type { TreeGenre } from '../types'

export type GetRootGenresQuery = () => Promise<TreeGenre[]>

export function createGetRootGenresQuery(db: GenreDatabase): GetRootGenresQuery {
  return function getRootGenres() {
    const request = db
      .transaction('genres')
      .objectStore('genres')
      .index('parents')
      .getAll(IDBKeyRange.only([]))
    return new Promise<TreeGenre[]>((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = () => {
        reject(new Error('Error getting genre'))
      }
    })
  }
}
