import type { GenreDatabase } from '../infrastructure/db'

export function createGetGenreCountQuery(db: GenreDatabase) {
  return function () {
    const request = db.transaction('genres').objectStore('genres').count()
    return new Promise<number>((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = () => {
        reject(new Error('Error getting genre count'))
      }
    })
  }
}
