import type { GenreDatabase } from '../infrastructure/db'
import type { TreeGenre } from '../types'

export function createSetGenreCommand(db: GenreDatabase) {
  return function (genre: TreeGenre) {
    const request = db.transaction('genres', 'readwrite').objectStore('genres').put(genre)
    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        resolve()
      }
      request.onerror = () => {
        reject(new Error('Error setting genre'))
      }
    })
  }
}
