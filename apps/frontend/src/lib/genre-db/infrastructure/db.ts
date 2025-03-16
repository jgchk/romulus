export function createGenreDatabase(): Promise<IDBDatabase> {
  const openRequest = indexedDB.open('genre-tree', 1)
  return new Promise<IDBDatabase>((resolve, reject) => {
    openRequest.onsuccess = () => {
      resolve(openRequest.result)
    }
    openRequest.onerror = () => {
      reject(new Error('Error loading genre database'))
    }
    openRequest.onupgradeneeded = () => {
      const db = openRequest.result
      db.createObjectStore('genres', { keyPath: 'id' })
    }
  })
}
