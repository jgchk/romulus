import { create } from 'zustand'

interface SearchState {
  filter: string
  debouncedFilter: string
  setFilter: (filter: string) => void
  setFilterImmediately: (filter: string) => void
  clearFilter: () => void
}

let timeout: NodeJS.Timeout | undefined
export const useSearchState = create<SearchState>()((set) => ({
  filter: '',
  debouncedFilter: '',
  setFilter: (filter) => {
    set({ filter })

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => set({ debouncedFilter: filter }), 500)
  },
  setFilterImmediately: (filter) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    set({ filter, debouncedFilter: filter })
  },

  clearFilter: () => {
    if (timeout) {
      clearTimeout(timeout)
    }
    set({ filter: '', debouncedFilter: '' })
  },
}))
