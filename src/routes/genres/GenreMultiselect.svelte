<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Multiselect from '$lib/atoms/Multiselect.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { userSettings } from '$lib/contexts/user-settings'
  import { type GenreMatch, searchGenres } from '$lib/types/genres'
  import { isDefined, type Timeout } from '$lib/utils/types'

  import type { GenreMultiselectProps, MultiselectGenre } from './GenreMultiselect'

  type $$Props = GenreMultiselectProps

  export let value: $$Props['value']
  export let genres: $$Props['genres']
  export let exclude: $$Props['exclude'] = []

  $: excludeSet = new Set(exclude)

  $: values = value
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
    .filter(isDefined)

  let filter = ''

  let debouncedFilter = filter
  let timeout: Timeout
  $: {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedFilter = filter
    }, 250)
  }

  $: options = searchGenres(genres, debouncedFilter)
    .filter((match) => !excludeSet.has(match.genre.id))
    .map((match) => ({
      value: match.genre.id,
      label: match.genre.name,
      data: match,
    }))

  const dispatch = createEventDispatcher<{
    change: { value: number[] }
  }>()
</script>

<Multiselect
  value={values}
  virtual
  bind:filter
  {options}
  on:change={(e) => {
    value = e.detail.value.map((v) => v.value)
    dispatch('change', { value })
  }}
  on:blur
  {...$$restProps}
>
  <svelte:fragment slot="selected" let:option>
    <span>{option.data.genre.name}</span>{#if option.data.genre.subtitle}{' '}<span
        class="text-xs text-gray-500">[{option.data.genre.subtitle}]</span
      >{/if}{#if $userSettings.showTypeTags && option.data.genre.type !== 'STYLE'}
      {' '}
      <GenreTypeChip type={option.data.genre.type} class="dark:border dark:border-gray-700" />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="option" let:option>
    {option.data.genre.name}
    {#if option.data.genre.subtitle}
      {' '}
      <span class="text-[0.8rem] text-gray-500 group-hover:text-gray-400"
        >[{option.data.genre.subtitle}]</span
      >
    {/if}
    {#if option.data.matchedAka}
      {' '}
      <span class="text-[0.8rem]">({option.data.matchedAka})</span>
    {/if}
    {#if $userSettings.showTypeTags && option.data.genre.type !== 'STYLE'}
      {' '}
      <GenreTypeChip type={option.data.genre.type} />
    {/if}
  </svelte:fragment>
</Multiselect>
