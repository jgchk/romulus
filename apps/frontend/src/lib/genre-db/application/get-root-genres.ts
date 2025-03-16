import type { GenreDatabase } from '../infrastructure/db'
import type { TreeGenre } from '../types'

export function createGetRootGenresQuery(db: GenreDatabase) {
  return function () {
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
