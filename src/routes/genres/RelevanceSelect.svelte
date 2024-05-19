<script lang="ts">
  import { type ComponentProps, createEventDispatcher } from 'svelte'

  import type { Option } from '$lib/atoms/Select'
  import Select from '$lib/atoms/Select.svelte'
  import {
    getGenreRelevanceText,
    MAX_GENRE_RELEVANCE,
    MIN_GENRE_RELEVANCE,
    UNSET_GENRE_RELEVANCE,
  } from '$lib/types/genres'
  import { range } from '$lib/utils/array'

  type Opt = Option<{ value: number }>

  interface $$Props extends Omit<ComponentProps<Select<Opt>>, 'value' | 'options'> {
    value?: number
  }

  export let value: $$Props['value'] = undefined

  const options = [
    ...range(MIN_GENRE_RELEVANCE, MAX_GENRE_RELEVANCE + 1)
      .reverse()
      .map((r) => ({
        value: r,
        label: `${r} - ${getGenreRelevanceText(r)}`,
      })),
    { value: UNSET_GENRE_RELEVANCE, label: 'Unset' },
  ]

  const valueOption = options.find((o) => o.value === value)

  const dispatch = createEventDispatcher<{
    change: { value: number | undefined }
  }>()
</script>

<Select
  value={valueOption}
  {options}
  on:change={(e) => {
    value = e.detail.value?.value
    dispatch('change', { value })
  }}
  on:blur
  {...$$restProps}
/>
