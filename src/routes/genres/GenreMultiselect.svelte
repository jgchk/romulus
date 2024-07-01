<script lang="ts">
  import { type ComponentProps, createEventDispatcher } from 'svelte'

  import Multiselect from '$lib/atoms/Multiselect.svelte'
  import type { Option } from '$lib/atoms/Select'
  import { isDefined } from '$lib/utils/types'

  import GenreMultiselectOption from './GenreMultiselectOption.svelte'
  import type { TreeGenre } from './GenreNavigator/GenreTree/state'

  type Opt = Option<{ value: number }>

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface $$Props extends Omit<ComponentProps<Multiselect<Opt>>, 'value' | 'options'> {
    value: number[]
    genres: TreeGenre[]
    exclude?: number[]
  }

  export let value: $$Props['value']
  export let genres: $$Props['genres']
  export let exclude: $$Props['exclude'] = []

  $: excludeSet = new Set(exclude)

  $: values = value
    .map((id) => {
      const genre = genres.find((genre) => genre.id === id)
      if (!genre) return
      return {
        value: id,
        label: genre.name,
        data: genre,
      }
    })
    .filter(isDefined)

  $: options = genres
    .filter((genre) => !excludeSet.has(genre.id))
    .map((genre) => ({
      value: genre.id,
      label: genre.name,
      data: genre,
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
>
  <svelte:fragment slot="selected" let:option>
    <GenreMultiselectOption genre={option.data} />
  </svelte:fragment>

  <svelte:fragment slot="option" let:option>
    <GenreMultiselectOption genre={option.data} />
  </svelte:fragment>
</Multiselect>
