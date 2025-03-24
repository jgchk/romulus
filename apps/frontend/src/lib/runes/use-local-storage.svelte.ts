import { parse, stringify } from 'devalue'
import { onMount } from 'svelte'

export function useLocalStorage<T>(key: string, initialValue: T) {
  let value = $state<T>(initialValue)

  onMount(() => {
    const currentValue = localStorage.getItem(key)
    if (currentValue) value = parse(currentValue) as T
  })

  const save = () => {
    if (value) {
      localStorage.setItem(key, stringify(value))
    } else {
      localStorage.removeItem(key)
    }
  }

  return {
    get value() {
      return value
    },
    set value(v: T) {
      value = v
      save()
    },
  }
}
