import { waitFor } from '@testing-library/svelte'
import { get } from 'svelte/store'
import { describe, expect, it, vi } from 'vitest'

import { BaseUserSettingsStore } from './base-store'
import type { UserSettingsRepository } from './repository'

describe('UserSettingsStore', () => {
  const initialSettings = Object.freeze({
    darkMode: false,
    genreRelevanceFilter: 0,
    showRelevanceTags: true,
    showTypeTags: true,
    showNsfw: false,
  } as const)

  class MockRepository implements UserSettingsRepository {
    save = vi.fn().mockResolvedValue(undefined)
  }

  function setup() {
    const mockRepository = new MockRepository()
    const store = new BaseUserSettingsStore(initialSettings, mockRepository)
    return { store, mockRepository }
  }

  it('initializes with the provided initial value', () => {
    const { store } = setup()
    expect(get(store)).toEqual(initialSettings)
  })

  it('updates the store value when set is called', () => {
    const { store, mockRepository } = setup()

    const newSettings = { ...initialSettings, darkMode: true }
    store.set(newSettings)

    expect(get(store)).toEqual(newSettings)
    expect(mockRepository.save).toHaveBeenCalledWith(newSettings)
  })

  it('reverts the store value if repository save fails', async () => {
    const { store, mockRepository } = setup()

    mockRepository.save.mockRejectedValueOnce(new Error('Save failed'))

    const newSettings = { ...initialSettings, darkMode: true }
    store.set(newSettings)

    await waitFor(() => {
      expect(get(store)).toEqual(initialSettings)
    })
  })

  it('updates the store value when update is called', () => {
    const { store, mockRepository } = setup()

    store.update((settings) => ({ ...settings, genreRelevanceFilter: 5 }))

    expect(get(store)).toEqual({
      ...initialSettings,
      genreRelevanceFilter: 5,
    })
    expect(mockRepository.save).toHaveBeenCalledWith({
      ...initialSettings,
      genreRelevanceFilter: 5,
    })
  })

  it('reverts the store value if repository save fails during update', async () => {
    const { store, mockRepository } = setup()

    mockRepository.save.mockRejectedValueOnce(new Error('Save failed'))

    store.update((settings) => ({ ...settings, genreRelevanceFilter: 5 }))

    await waitFor(() => {
      expect(get(store)).toEqual(initialSettings)
    })
  })

  it('subscribes to store changes', () => {
    const { store } = setup()

    const subscriber = vi.fn()
    store.subscribe(subscriber)

    store.set({ ...initialSettings, darkMode: true })

    expect(subscriber).toHaveBeenCalledWith({ ...initialSettings, darkMode: true })
  })
})
