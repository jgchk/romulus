<script lang="ts">
  import { createQuery, keepPreviousData } from '@tanstack/svelte-query'
  import { derived as derivedStore, writable } from 'svelte/store'

  import type { AutocompleteProps } from '$lib/atoms/Autocomplete'
  import Autocomplete from '$lib/atoms/Autocomplete.svelte'
  import type { SearchTracksResult } from '$lib/server/features/music-catalog/queries/application/search-tracks'
  import type { Timeout } from '$lib/utils/types'

  type Props = Omit<AutocompleteProps<number>, 'options' | 'onSelect' | 'option'> & {
    onSelect?: (track: SearchTracksResult['tracks'][number]) => void
  }

  let { value = $bindable(), onInput, onSelect, ...rest }: Props = $props()

  let debouncedFilter = writable('')

  let timeout: Timeout | undefined
  $effect(() => {
    const v = value
    clearTimeout(timeout)
    timeout = setTimeout(() => ($debouncedFilter = v), 250)
    return () => clearTimeout(timeout)
  })

  const optionsQuery = createQuery(
    derivedStore(debouncedFilter, ($debouncedFilter) => ({
      queryKey: ['tracks', 'search', { title: $debouncedFilter }],
      queryFn: () => fetchTracks($debouncedFilter),
      placeholderData: keepPreviousData,
    })),
  )

  let options = $derived(
    ($optionsQuery.data ?? []).map((track) => ({
      value: track,
      label: track.title,
    })),
  )

  async function fetchTracks(titleQuery: string) {
    const url = new URL('/api/tracks/search', window.location.origin)
    url.searchParams.set('title', titleQuery)

    const { tracks } = await fetch(url).then((res) => res.json() as Promise<SearchTracksResult>)
    return tracks
  }
</script>

<Autocomplete
  {value}
  {options}
  onInput={(newValue) => {
    value = newValue
    onInput?.(newValue)
  }}
  onSelect={(option) => onSelect?.(option.value)}
  {...rest}
/>
