<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { createEventDispatcher } from 'svelte'

  import Multiselect from '$lib/atoms/Multiselect.svelte'
  import type { Artist } from '$lib/server/db/schema'

  import type { ArtistMultiselectProps } from './ArtistMultiselect'

  type $$Props = ArtistMultiselectProps

  export let value: NonNullable<$$Props['value']> = []

  const valuesQuery = createQuery({
    queryKey: ['artists', { ids: value }],
    queryFn: () => (value.length === 0 ? [] : fetchArtists(value)),
  })

  const optionsQuery = createQuery({
    queryKey: ['artists', {}],
    queryFn: () => fetchArtists(),
  })

  // let filter = ''
  //
  // let debouncedFilter = filter
  // let timeout: Timeout
  // $: {
  //   clearTimeout(timeout)
  //   timeout = setTimeout(() => {
  //     debouncedFilter = filter
  //   }, 250)
  // }

  $: values = ($valuesQuery.data ?? []).map((artist) => ({ value: artist.id, label: artist.name }))

  $: options = ($optionsQuery.data ?? []).map((artist) => ({
    value: artist.id,
    label: artist.name,
  }))

  const dispatch = createEventDispatcher<{
    change: { value: number[] }
  }>()

  async function fetchArtists(ids?: number[]) {
    const url = new URL('/api/artists', window.location.origin)
    if (ids?.length) {
      ids.forEach((id) => url.searchParams.append('ids', id.toString()))
    }

    const { data } = await fetch(url).then((res) => res.json() as Promise<{ data: Artist[] }>)
    return data
  }
</script>

<Multiselect
  value={values}
  virtual
  {options}
  on:change={(e) => {
    value = e.detail.value.map((v) => v.value)
    dispatch('change', { value })
  }}
  on:blur
  {...$$restProps}
/>
