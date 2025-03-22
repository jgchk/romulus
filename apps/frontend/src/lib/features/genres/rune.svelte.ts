import { useLocalStorage } from '$lib/runes/use-local-storage.svelte'
import { usePromise } from '$lib/runes/use-promise.svelte'

import { createGenreStore, type GenreStore } from './queries/infrastructure'
import type { TreeGenre } from './queries/types'

export type AsyncGenresRune = {
  readonly data: GenreStore | undefined
  readonly loading: boolean
  readonly error: Error | undefined
}

export function useGenres(promise: Promise<GenreStore>): AsyncGenresRune {
  const ls = useLocalStorage<TreeGenre[] | undefined>('genre-tree', undefined)
  const p = usePromise<GenreStore | undefined>(promise, undefined)

  const data = $derived(
    p.data ?? (ls.value !== undefined ? createGenreStore(ls.value) : undefined) ?? undefined,
  )

  $effect(() => {
    if (p.data) {
      ls.value = p.data.values().toArray()
    }
  })

  return {
    get data() {
      return data
    },
    get loading() {
      return p.loading
    },
    get error() {
      return p.error
    },
  }
}
