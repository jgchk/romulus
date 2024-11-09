<script lang="ts">
  import { createQuery, keepPreviousData } from '@tanstack/svelte-query'
  import { createEventDispatcher } from 'svelte'
  import { derived, writable } from 'svelte/store'

  import Multiselect from '$lib/atoms/Multiselect.svelte'
  import type { SearchArtistsResult } from '$lib/server/features/music-catalog/queries/application/search-artists'
  import type { Timeout } from '$lib/utils/types'

  import type { ArtistMultiselectProps } from './ArtistMultiselect'

  type $$Props = ArtistMultiselectProps

  export let value: NonNullable<$$Props['value']> = []

  let filter = ''

  let debouncedFilter = writable(filter)
  let timeout: Timeout
  $: {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      $debouncedFilter = filter
    }, 250)
  }

  const optionsQuery = createQuery(
    derived(debouncedFilter, ($debouncedFilter) => ({
      queryKey: ['artists', 'search', { name: $debouncedFilter }],
      queryFn: () => fetchArtists($debouncedFilter),
      placeholderData: keepPreviousData,
    })),
  )

  $: values = value.map((artist) => ({ value: artist.id, label: artist.name }))

  $: options = ($optionsQuery.data ?? []).map((artist) => ({
    value: artist.id,
    label: artist.name,
  }))

  const dispatch = createEventDispatcher<{
    change: { value: NonNullable<$$Props['value']> }
  }>()

  async function fetchArtists(nameQuery: string) {
    const url = new URL('/api/artists/search', window.location.origin)
    url.searchParams.set('name', nameQuery)

    const { artists } = await fetch(url).then((res) => res.json() as Promise<SearchArtistsResult>)
    return artists
  }
</script>

<Multiselect
  value={values}
  virtual
  {options}
  reorderable
  bind:filter
  onChange={(nv) => {
    const newValue = nv.map((v) => ({ id: v.value, name: v.label }))
    value = newValue
    dispatch('change', { value: newValue })
  }}
  {...$$restProps}
/>
