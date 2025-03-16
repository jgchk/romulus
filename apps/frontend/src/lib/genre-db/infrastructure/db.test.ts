import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'

import { createGenreDatabase } from './db'

describe('createGenreDatabase', () => {
  it('should open an IndexedDB database', async () => {
    const db = await createGenreDatabase()
    expect(db).toBeInstanceOf(IDBDatabase)
  })

  it('should create a database with the correct name', async () => {
    const db = await createGenreDatabase()
    expect(db.name).toBe('genre-tree')
  })

  it('should create a database with the correct version', async () => {
    const db = await createGenreDatabase()
    expect(db.version).toBe(1)
  })

  it('should set up a database with the correct object store', async () => {
    const db = await createGenreDatabase()
    expect(db.objectStoreNames).toContain('genres')
  })

  it('should set up the object store with the correct key path', async () => {
    const db = await createGenreDatabase()
    expect(db.transaction('genres').objectStore('genres').keyPath).toBe('id')
  })

  describe('onerror', () => {
    let mockOpen: MockInstance

    beforeEach(() => {
      mockOpen = vi.spyOn(window.indexedDB, 'open').mockImplementation(() => {
        const request = {
          onsuccess: null,
          onerror: null,
        } as unknown as IDBOpenDBRequest

        // Simulate an error by triggering the onerror callback
        setTimeout(() => {
          if (request.onerror) {
            request.onerror(new Event('error'))
          }
        }, 0)

        return request
      })
    })

    afterEach(() => {
      mockOpen.mockRestore()
    })

    it('should reject if the database cannot be opened', async () => {
      await expect(createGenreDatabase()).rejects.toThrow('Error loading genre database')
    })
  })
})
