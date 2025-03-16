import type { GenreDatabase } from '../infrastructure/db'

export function createGetGenreQuery(db: GenreDatabase) {
  return async function (id: number) {
    const request = db.transaction('genres').objectStore('genres').get(id)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = () => {
        reject(new Error('Error getting genre'))
      }
    })
  }
}
