import type { GenreDatabase } from '../infrastructure/db'

export type ClearGenresCommand = () => Promise<void>

export function createClearGenresCommand(db: GenreDatabase): ClearGenresCommand {
  return function clearGenres() {
    const request = db.transaction('genres', 'readwrite').objectStore('genres').clear()
    return new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        resolve()
      }
      request.onerror = () => {
        reject(new Error('Error clearing genres'))
      }
    })
  }
}
