<script lang="ts">
  import { type ComponentProps } from 'svelte'

  import Select from '$lib/atoms/Select2.svelte'
  import { GENRE_TYPES, type GenreType, GenreTypeNames } from '$lib/types/genres'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type $$Props = Omit<ComponentProps<Select<GenreType>>, 'options'>

  export let value: $$Props['value'] = undefined

  const options = GENRE_TYPES.map((type) => ({ value: type, label: GenreTypeNames[type] }))
</script>

<Select bind:value {options} on:change {...$$restProps} />
