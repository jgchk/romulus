import { writable } from 'svelte/store'

type SearchState = {
  filter: string
  debouncedFilter: string
}

function createSearchStore() {
  const { subscribe, set, update } = writable<SearchState>({ filter: '', debouncedFilter: '' })

  let timeout: ReturnType<typeof setTimeout>

  // Function to set filter with debouncing
  function setFilter(filter: string) {
    update((state) => ({ ...state, filter }))

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      update((state) => ({ ...state, debouncedFilter: filter }))
    }, 250)
  }

  // Function to set filter immediately without debouncing
  function setFilterImmediately(filter: string) {
    if (timeout) {
      clearTimeout(timeout)
    }
    set({ filter, debouncedFilter: filter })
  }

  // Function to clear filter
  function clearFilter() {
    if (timeout) {
      clearTimeout(timeout)
    }
    set({ filter: '', debouncedFilter: '' })
  }

  return {
    subscribe,
    setFilter,
    setFilterImmediately,
    clearFilter,
  }
}

export const searchStore = createSearchStore()
