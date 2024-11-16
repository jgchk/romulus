<script lang="ts">
  import type { AutocompleteProps } from '$lib/atoms/Autocomplete'
  import Autocomplete from '$lib/atoms/Autocomplete.svelte'
  import { searchGenres } from '$lib/types/genres'
  import type { Timeout } from '$lib/utils/types'

  import type { Genre } from './types'

  type Props = Omit<AutocompleteProps<number>, 'value' | 'options' | 'onSelect'> & {
    genres: Genre[]
    onSelect?: (genre: Genre) => void
  }

  let { onSelect, genres, ...rest }: Props = $props()

  let value = $state('')
  let debouncedFilter = $state('')

  let timeout: Timeout | undefined
  $effect(() => {
    const v = value
    clearTimeout(timeout)
    timeout = setTimeout(() => (debouncedFilter = v), 250)
    return () => clearTimeout(timeout)
  })

  let options = $derived(
    searchGenres(genres, debouncedFilter)
      .slice(0, 100)
      .map(({ genre }) => ({
        value: genre,
        label: genre.name,
      })),
  )
</script>

<Autocomplete
  bind:value
  {options}
  onSelect={(option) => {
    value = option.label
    onSelect?.(option.value)
  }}
  {...rest}
/>
