import type { GenreDatabase } from '../infrastructure/db'
import type { TreeGenre } from '../types'

export type SetGenreCommand = (genre: TreeGenre) => Promise<void>

export function createSetGenreCommand(db: GenreDatabase): SetGenreCommand {
  return function setGenre(genre: TreeGenre) {
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
