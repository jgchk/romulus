import type { GenreDatabase } from '../infrastructure/db'
import type { TreeGenre } from '../types'

export type GetGenreQuery = (id: number) => Promise<TreeGenre | undefined>

export function createGetGenreQuery(db: GenreDatabase): GetGenreQuery {
  return async function getGenre(id: number) {
    const request = db.transaction('genres').objectStore('genres').get(id)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        resolve(request.result)
      }
      request.onerror = () => {
        reject(new Error('Error getting genre'))
      }
    })
  }
}
