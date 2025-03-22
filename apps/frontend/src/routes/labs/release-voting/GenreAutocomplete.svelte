<script lang="ts">
  import type { AutocompleteProps } from '$lib/atoms/Autocomplete'
  import Autocomplete from '$lib/atoms/Autocomplete.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import { createSearchGenresQuery } from '$lib/features/genres/queries/search'
  import type { TreeGenre } from '$lib/features/genres/queries/types'
  import { cn } from '$lib/utils/dom'
  import type { Timeout } from '$lib/utils/types'

  type Props = Omit<AutocompleteProps<number>, 'value' | 'options' | 'onSelect' | 'option'> & {
    onSelect?: (genre: TreeGenre) => void
    genres: TreeGenre[]
  }

  let { onSelect, genres, ...rest }: Props = $props()

  let value = $state('')
  let debouncedFilter = $state('')

  let timeout: Timeout | undefined
  $effect(() => {
    const v = value
    clearTimeout(timeout)
    timeout = setTimeout(() => (debouncedFilter = v), 250)
    return () => clearTimeout(timeout)
  })

  let options = $derived(
    createSearchGenresQuery(genres)(debouncedFilter)
      .slice(0, 100)
      .map((match) => ({
        value: match,
        label: match.genre.name,
      })),
  )

  const userSettings = getUserSettingsContext()
</script>

<Autocomplete
  bind:value
  {options}
  onSelect={(option) => {
    value = option.label
    onSelect?.(option.value.genre)
  }}
  {...rest}
>
  {#snippet option({ option })}
    <div class={cn(option.value.genre.nsfw && !$userSettings.showNsfw && 'blur-sm')}>
      {option.value.genre.name}
      {#if option.value.genre.subtitle}
        &nbsp;
        <span class="text-[0.8rem] text-gray-500 group-hover:text-gray-400"
          >[{option.value.genre.subtitle}]</span
        >
      {/if}
      {#if option.value.matchedAka}
        &nbsp;
        <span class="text-[0.8rem]">({option.value.matchedAka})</span>
      {/if}
      {#if $userSettings.showTypeTags && option.value.genre.type !== 'STYLE'}
        &nbsp;
        <GenreTypeChip type={option.value.genre.type} />
      {/if}
    </div>
  {/snippet}
</Autocomplete>
