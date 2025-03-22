import { useLocalStorage } from '$lib/runes/use-local-storage.svelte'
import { usePromise } from '$lib/runes/use-promise.svelte'

import type { TreeGenre } from './queries/types'

export type AsyncGenresRune = {
  readonly data: TreeGenre[] | undefined
  readonly loading: boolean
  readonly error: Error | undefined
}

export function useGenres(promise: Promise<TreeGenre[]>): AsyncGenresRune {
  const ls = useLocalStorage<TreeGenre[] | undefined>('genre-tree', undefined)
  const p = usePromise<TreeGenre[] | undefined>(promise, undefined)

  const data = $derived(p.data ?? ls.value ?? undefined)

  $effect(() => {
    if (p.data) {
      ls.value = p.data
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
