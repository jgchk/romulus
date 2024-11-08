<script lang="ts">
  import { type ComponentProps, createEventDispatcher } from 'svelte'

  import type { Option } from '$lib/atoms/Select'
  import Select from '$lib/atoms/Select.svelte'
  import { GENRE_TYPES, type GenreType, GenreTypeNames } from '$lib/types/genres'

  type $$Props = Omit<ComponentProps<Select<GenreType>>, 'options'>

  export let value: $$Props['value'] = undefined

  const options = GENRE_TYPES.map((type) => ({ value: type, label: GenreTypeNames[type] }))

  const dispatch = createEventDispatcher<{ change: Option<GenreType> }>()
</script>

<Select bind:value {options} onChange={(option) => dispatch('change', option)} {...$$restProps} />
