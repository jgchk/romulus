import type { Timeout } from '$lib/utils/types'

export function useDebounce<T>(getter: () => T, wait: number) {
  let debounced = $state<T>(getter())

  let timeout: Timeout | undefined

  $effect(() => {
    const value = getter()
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debounced = value
    }, wait)
    return () => clearTimeout(timeout)
  })

  return {
    get current() {
      return debounced
    },
    set current(value: T) {
      debounced = value
      clearTimeout(timeout)
    },
  }
}
