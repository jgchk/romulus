<script lang="ts">
  import { type ComponentProps } from 'svelte'

  import Select from '$lib/atoms/Select.svelte'
  import { GENRE_TYPES, type GenreType, GenreTypeNames } from '$lib/types/genres'

  type Props = Omit<ComponentProps<Select<GenreType>>, 'options'>

  let { value = $bindable(undefined), ...rest }: Props = $props()

  const options = GENRE_TYPES.map((type) => ({ value: type, label: GenreTypeNames[type] }))
</script>

<Select bind:value {options} {...rest} />
