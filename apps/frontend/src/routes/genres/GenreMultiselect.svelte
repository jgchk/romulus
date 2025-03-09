<script lang="ts">
  import Multiselect from '$lib/atoms/Multiselect.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import { type GenreMatch, searchGenres } from '$lib/types/genres'
  import { cn } from '$lib/utils/dom'
  import { isDefined, type Timeout } from '$lib/utils/types'

  import type { GenreMultiselectProps, MultiselectGenre } from './GenreMultiselect'

  type Props = GenreMultiselectProps

  let { value = $bindable(), genres, exclude = [], onChange = undefined, ...rest }: Props = $props()

  let excludeSet = $derived(new Set(exclude))

  let values = $derived(
    value
      .map((id) => {
        const genre = genres.find((genre) => genre.id === id)
        if (!genre) return

        const data: GenreMatch<MultiselectGenre> = {
          id,
          genre,
          weight: 0,
        }

        return {
          value: id,
          label: genre.name,
          data,
        }
      })
      .filter(isDefined),
  )

  let filter = $state('')

  let debouncedFilter = $state('')

  let timeout: Timeout | undefined
  $effect(() => {
    const v = filter
    clearTimeout(timeout)
    timeout = setTimeout(() => (debouncedFilter = v), 250)
    return () => clearTimeout(timeout)
  })

  let options = $derived(
    searchGenres(genres, debouncedFilter)
      .filter((match) => !excludeSet.has(match.genre.id))
      .slice(0, 100)
      .map((match) => ({
        value: match.genre.id,
        label: match.genre.name,
        data: match,
      })),
  )

  const userSettings = getUserSettingsContext()
</script>

<Multiselect
  value={values}
  virtual
  bind:filter
  {options}
  onChange={(newValue) => {
    value = newValue.map((v) => v.value)
    onChange?.(value)
  }}
  {...rest}
>
  {#snippet selected({ option })}
    <div class={cn(option.data.genre.nsfw && !$userSettings.showNsfw && 'blur-sm')}>
      <span>{option.data.genre.name}</span>{#if option.data.genre.subtitle}&nbsp;<span
          class="text-xs text-gray-500">[{option.data.genre.subtitle}]</span
        >{/if}{#if $userSettings.showTypeTags && option.data.genre.type !== 'STYLE'}
        &nbsp;
        <GenreTypeChip type={option.data.genre.type} class="dark:border dark:border-gray-700" />
      {/if}
    </div>
  {/snippet}

  {#snippet option({ option })}
    <div class={cn(option.data.genre.nsfw && !$userSettings.showNsfw && 'blur-sm')}>
      {option.data.genre.name}
      {#if option.data.genre.subtitle}
        &nbsp;
        <span class="text-[0.8rem] text-gray-500 group-hover:text-gray-400"
          >[{option.data.genre.subtitle}]</span
        >
      {/if}
      {#if option.data.matchedAka}
        &nbsp;
        <span class="text-[0.8rem]">({option.data.matchedAka})</span>
      {/if}
      {#if $userSettings.showTypeTags && option.data.genre.type !== 'STYLE'}
        &nbsp;
        <GenreTypeChip type={option.data.genre.type} />
      {/if}
    </div>
  {/snippet}
</Multiselect>
