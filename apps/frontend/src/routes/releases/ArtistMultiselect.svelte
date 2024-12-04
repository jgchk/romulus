<script lang="ts">
  import { createQuery, keepPreviousData } from '@tanstack/svelte-query'
  import { derived as derivedStore, writable } from 'svelte/store'

  import Multiselect from '$lib/atoms/Multiselect.svelte'
  import type { SearchArtistsResult } from '$lib/server/features/music-catalog/queries/application/search-artists'
  import type { Timeout } from '$lib/utils/types'

  import type { ArtistMultiselectProps } from './ArtistMultiselect'

  type Props = ArtistMultiselectProps

  let { value = $bindable([]), onChange, ...rest }: Props = $props()

  let filter = $state('')

  let debouncedFilter = writable('')

  let timeout: Timeout | undefined
  $effect(() => {
    const v = filter
    clearTimeout(timeout)
    timeout = setTimeout(() => ($debouncedFilter = v), 250)
    return () => clearTimeout(timeout)
  })

  const optionsQuery = createQuery(
    derivedStore(debouncedFilter, ($debouncedFilter) => ({
      queryKey: ['artists', 'search', { name: $debouncedFilter }],
      queryFn: () => fetchArtists($debouncedFilter),
      placeholderData: keepPreviousData,
    })),
  )

  let values = $derived(value.map((artist) => ({ value: artist.id, label: artist.name })))

  let options = $derived(
    ($optionsQuery.data ?? []).map((artist) => ({
      value: artist.id,
      label: artist.name,
    })),
  )

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
    onChange?.(newValue)
  }}
  {...rest}
/>
