<script lang="ts">
  import { type ComponentProps, createEventDispatcher } from 'svelte'

  import Multiselect from '$lib/atoms/Multiselect.svelte'
  import type { Option } from '$lib/atoms/Select'

  import type { TreeGenre } from '../../GenreNavigator/GenreTree/state'

  type Opt = Option<{ value: number }>

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface $$Props extends Omit<ComponentProps<Multiselect<Opt>>, 'value' | 'options'> {
    value: number[]
    genres: TreeGenre[]
  }

  export let value: $$Props['value']
  export let genres: $$Props['genres']

  $: values = value.map(
    (id): Opt => ({
      value: id,
      label: genres.find((genre) => genre.id === id)?.name ?? 'Unknown',
    }),
  )
  $: options = genres.map((genre) => ({
    value: genre.id,
    label: genre.name,
  }))

  const dispatch = createEventDispatcher<{
    change: { value: number[] }
  }>()
</script>

<Multiselect
  value={values}
  {options}
  on:change={(e) => {
    value = e.detail.value.map((v) => v.value)
    dispatch('change', { value })
  }}
  on:blur
  {...$$restProps}
/>
