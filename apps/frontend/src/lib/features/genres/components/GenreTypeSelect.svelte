<script lang="ts">
  import { Select } from '$lib/atoms/Select'
  import type { GenreType } from '$lib/types/genres'
  import { GENRE_TYPES, GenreTypeNames } from '$lib/types/genres'

  type Props = {
    id?: string
    class?: string
    value?: GenreType
    onChange?: (value: GenreType | undefined) => void
  }

  let { value = $bindable(undefined), id, class: class_, onChange }: Props = $props()

  const options = GENRE_TYPES
</script>

<Select.Root
  bind:value
  options={[...options]}
  onChange={onChange as (value: string | undefined) => void}
  class={class_}
>
  <Select.Trigger {id}>
    {#if value !== undefined}
      {GenreTypeNames[value]}
    {/if}
  </Select.Trigger>
  <Select.Options>
    {#each options as option (option)}
      <Select.Option value={option}>
        {GenreTypeNames[option]}
      </Select.Option>
    {/each}
  </Select.Options>
</Select.Root>
