<script lang="ts">
  import { createQuery, keepPreviousData } from '@tanstack/svelte-query'
  import { createEventDispatcher } from 'svelte'
  import { derived, writable } from 'svelte/store'

  import type { AutocompleteProps } from '$lib/atoms/Autocomplete'
  import Autocomplete from '$lib/atoms/Autocomplete.svelte'
  import type { SearchTracksResult } from '$lib/server/features/music-catalog/queries/application/search-tracks'
  import type { Timeout } from '$lib/utils/types'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type $$Props = Omit<AutocompleteProps<number>, 'options'>

  let value = ''

  let debouncedFilter = writable(value)
  let timeout: Timeout
  $: {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      $debouncedFilter = value
    }, 250)
  }

  const optionsQuery = createQuery(
    derived(debouncedFilter, ($debouncedFilter) => ({
      queryKey: ['tracks', 'search', { title: $debouncedFilter }],
      queryFn: () => fetchTracks($debouncedFilter),
      placeholderData: keepPreviousData,
    })),
  )

  $: options = ($optionsQuery.data ?? []).map((track) => ({
    value: track,
    label: track.title,
  }))

  async function fetchTracks(titleQuery: string) {
    const url = new URL('/api/tracks/search', window.location.origin)
    url.searchParams.set('title', titleQuery)

    const { tracks } = await fetch(url).then((res) => res.json() as Promise<SearchTracksResult>)
    return tracks
  }

  const dispatch = createEventDispatcher<{
    select: { track: SearchTracksResult['tracks'][number] }
  }>()
</script>

<Autocomplete
  {value}
  {options}
  on:input={(e) => (value = e.detail.value)}
  on:input
  on:select={(e) => dispatch('select', { track: e.detail.option.value })}
  {...$$restProps}
/>
