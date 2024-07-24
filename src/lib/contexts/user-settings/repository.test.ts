import { describe, expect, it, vi } from 'vitest'

import { LocalUserSettingsRepository, RemoteUserSettingsRepository } from './repository'

const testSettings = Object.freeze({
  darkMode: true,
  genreRelevanceFilter: 50,
  showRelevanceTags: false,
  showTypeTags: true,
  showNsfw: false,
} as const)

describe('RemoteUserSettingsRepository', () => {
  it('saves settings to the remote API', async () => {
    const accountId = 123
    const repository = new RemoteUserSettingsRepository(accountId)

    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true })
    global.fetch = fetchMock

    await repository.save(testSettings)

    expect(fetchMock).toHaveBeenCalledWith(`/api/accounts/${accountId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testSettings),
    })
  })

  it('rejects with an error if the save operation fails', async () => {
    const accountId = 123
    const repository = new RemoteUserSettingsRepository(accountId)

    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('Save failed'))
    global.fetch = fetchMock

    await expect(repository.save(testSettings)).rejects.toThrowError('Save failed')
  })
})

describe('LocalUserSettingsRepository', () => {
  class MockLocalStorage implements Storage {
    clear = vi.fn()
    getItem = vi.fn()
    key = vi.fn()
    removeItem = vi.fn()
    setItem = vi.fn()
    get length() {
      return 0
    }
  }

  function setup() {
    const localStorageMock = new MockLocalStorage()
    const repository = new LocalUserSettingsRepository(localStorageMock)
    return { localStorageMock, repository }
  }

  it('saves settings to local storage', async () => {
    const { localStorageMock, repository } = setup()

    await repository.save(testSettings)

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'userSettings',
      JSON.stringify(testSettings),
    )
  })

  it('rejects with an error if the save operation fails', async () => {
    const { localStorageMock, repository } = setup()

    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Save failed')
    })

    await expect(repository.save(testSettings)).rejects.toThrowError('Save failed')
  })
})
