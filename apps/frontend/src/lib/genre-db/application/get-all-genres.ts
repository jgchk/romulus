import type { GenreDatabase } from '../infrastructure/db'
import type { TreeGenre } from '../types'

export type GetAllGenresQuery = () => Promise<TreeGenre[]>

export function createGetAllGenresQuery(db: GenreDatabase): GetAllGenresQuery {
  return async function getAllGenres() {
    const request = db.transaction('genres').objectStore('genres').getAll()
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = () => {
        reject(new Error('Error getting all genres'))
      }
    })
  }
}
