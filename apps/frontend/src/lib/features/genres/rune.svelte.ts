import { useLocalStorage } from '$lib/runes/use-local-storage.svelte'
import { usePromise } from '$lib/runes/use-promise.svelte'

import type { TreeGenre } from './queries/types'

export function useGenres(promise: Promise<TreeGenre[]>, initialValue: TreeGenre[]) {
  const ls = useLocalStorage<TreeGenre[] | undefined>('genre-tree', undefined)
  const p = usePromise<TreeGenre[] | undefined>(promise, undefined)

  $effect(() => {
    if (p.data) {
      ls.value = p.data
    }
  })

  return {
    get data() {
      return p.data ?? ls.value ?? initialValue
    },
    get loading() {
      return p.loading
    },
    get error() {
      return p.error
    },
  }
}
