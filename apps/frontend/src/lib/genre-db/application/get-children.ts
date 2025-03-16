import type { GenreDatabase } from '../infrastructure/db'
import type { TreeGenre } from '../types'

export type GetChildrenQuery = (id: number) => Promise<TreeGenre[]>

export function createGetChildrenQuery(db: GenreDatabase): GetChildrenQuery {
  return async function getChildren(id: number) {
    const request = db
      .transaction('genres')
      .objectStore('genres')
      .index('parents-multi')
      .getAll(IDBKeyRange.only(id))
    return new Promise<TreeGenre[]>((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = () => {
        reject(new Error('Error getting children'))
      }
    })
  }
}
