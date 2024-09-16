<script lang="ts">
  import { createQuery, keepPreviousData } from '@tanstack/svelte-query'
  import { derived, writable } from 'svelte/store'

  import type { AutocompleteProps } from '$lib/atoms/Autocomplete'
  import Autocomplete from '$lib/atoms/Autocomplete.svelte'
  import type { SearchArtistsResult } from '$lib/server/features/music-catalog/queries/application/search-artists'
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
      queryKey: ['artists', 'search', { title: $debouncedFilter }],
      queryFn: () => fetchArtists($debouncedFilter),
      placeholderData: keepPreviousData,
    })),
  )

  $: options = ($optionsQuery.data ?? []).map((artist) => ({
    value: artist,
    label: artist.name,
  }))

  async function fetchArtists(nameQuery: string) {
    const url = new URL('/api/artists/search', window.location.origin)
    url.searchParams.set('name', nameQuery)

    const { artists } = await fetch(url).then((res) => res.json() as Promise<SearchArtistsResult>)
    return artists
  }
</script>

<Autocomplete
  {value}
  {options}
  on:input={(e) => (value = e.detail.value)}
  on:input
  on:select
  {...$$restProps}
/>
