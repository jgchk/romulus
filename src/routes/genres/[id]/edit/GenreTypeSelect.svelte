<script lang="ts">
  import { type ComponentProps, createEventDispatcher } from 'svelte'

  import type { Option } from '$lib/atoms/Select'
  import Select from '$lib/atoms/Select.svelte'
  import { GENRE_TYPES, type GenreType, GenreTypeNames } from '$lib/types/genres'

  type Opt = Option<{ value: GenreType }>

  interface $$Props extends Omit<ComponentProps<Select<Opt>>, 'value' | 'options'> {
    value?: GenreType
  }

  export let value: $$Props['value'] = undefined

  const options = GENRE_TYPES.map((type) => ({ value: type, label: GenreTypeNames[type] }))

  const valueOption = options.find((o) => o.value === value)

  const dispatch = createEventDispatcher<{
    change: { value: GenreType }
  }>()
</script>

<Select
  value={valueOption}
  {options}
  on:change={(e) => {
    value = e.detail.value?.value
    if (value) {
      dispatch('change', { value })
    }
  }}
  on:blur
  {...$$restProps}
/>
