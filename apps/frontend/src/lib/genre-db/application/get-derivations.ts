import type { GenreDatabase } from '../infrastructure/db'
import type { TreeGenre } from '../types'

export function createGetDerivationsQuery(db: GenreDatabase) {
  return async function getDerivations(id: number) {
    const request = db
      .transaction('genres')
      .objectStore('genres')
      .index('derivedFrom-multi')
      .getAll(IDBKeyRange.only(id))
    return new Promise<TreeGenre[]>((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = () => {
        reject(new Error('Error getting derivations'))
      }
    })
  }
}
