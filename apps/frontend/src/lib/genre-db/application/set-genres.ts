import type { GenreDatabase } from '../infrastructure/db'
import type { TreeGenre } from '../types'

export type SetGenresCommand = (genres: TreeGenre[]) => Promise<void>

export function createSetGenresCommand(db: GenreDatabase): SetGenresCommand {
  return async function setGenres(genres: TreeGenre[]) {
    const transaction = db.transaction('genres', 'readwrite')
    const objectStore = transaction.objectStore('genres')

    for (const genre of genres) {
      objectStore.put(genre)
    }

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new Error('Error setting genres'))
    })
  }
}
