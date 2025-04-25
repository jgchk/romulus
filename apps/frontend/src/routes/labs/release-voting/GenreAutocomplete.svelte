<script lang="ts">
  import { type AutocompleteProps } from '$lib/atoms/Autocomplete'
  import Autocomplete from '$lib/atoms/Autocomplete.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import { createSearchGenresQuery } from '$lib/features/genres/queries/application/search'
  import { type GenreStore } from '$lib/features/genres/queries/infrastructure'
  import { type TreeGenre } from '$lib/features/genres/queries/types'
  import { useDebounce } from '$lib/runes/use-debounce.svelte'
  import { cn } from '$lib/utils/dom'

  type Props = Omit<AutocompleteProps<number>, 'value' | 'options' | 'onSelect' | 'option'> & {
    onSelect?: (genre: TreeGenre) => void
    genres: GenreStore
  }

  let { onSelect, genres, ...rest }: Props = $props()

  let value = $state('')
  const debouncedFilter = useDebounce(() => value, 250)

  let options = $derived(
    createSearchGenresQuery(genres)(debouncedFilter.current)
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
