export type GenreDatabase = IDBDatabase

export function createGenreDatabase(idbFactory: IDBFactory = indexedDB): Promise<GenreDatabase> {
  const openRequest = idbFactory.open('genre-tree', 1)
  return new Promise<IDBDatabase>((resolve, reject) => {
    openRequest.onsuccess = () => {
      resolve(openRequest.result)
    }
    openRequest.onerror = () => {
      reject(new Error('Error loading genre database'))
    }
    openRequest.onupgradeneeded = () => {
      const db = openRequest.result
      const genresObjectStore = db.createObjectStore('genres', { keyPath: 'id' })
      genresObjectStore.createIndex('parents', 'parents')
    }
  })
}
