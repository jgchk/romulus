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

  type $$Props = Omit<ComponentProps<Select<number>>, 'options'>

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

  const dispatch = createEventDispatcher<{ change: Option<number> }>()
</script>

<Select bind:value {options} onChange={(option) => dispatch('change', option)} {...$$restProps} />
