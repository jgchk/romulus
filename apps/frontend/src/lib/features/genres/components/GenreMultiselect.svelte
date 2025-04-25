<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  import Loader from '$lib/atoms/Loader.svelte'
  import { Multiselect } from '$lib/atoms/Multiselect'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import { createGetGenreQuery } from '$lib/features/genres/queries/application/get-genre'
  import { createSearchGenresQuery } from '$lib/features/genres/queries/application/search'
  import { type GenreStore } from '$lib/features/genres/queries/infrastructure'
  import { type TreeGenre } from '$lib/features/genres/queries/types'
  import { genreQueries } from '$lib/features/genres/tanstack'
  import { useDebounce } from '$lib/runes/use-debounce.svelte'
  import { cn } from '$lib/utils/dom'

  let {
    value = $bindable([]),
    onChange,
    exclude = [],
    id,
    class: class_,
  }: {
    value?: number[]
    onChange?: (value: number[]) => void
    exclude?: number[]
    id?: string
    class?: string
  } = $props()

  const userSettings = getUserSettingsContext()

  let excludeSet = $derived(new Set(exclude))

  let filter = $state('')
  const debouncedFilter = useDebounce(() => filter, 250)

  const genreTreeQuery = createQuery(genreQueries.tree())

  const genres: GenreStore = $derived($genreTreeQuery.data ?? new Map<number, TreeGenre>())

  let options = $derived(
    createSearchGenresQuery(genres)(debouncedFilter.current)
      .filter((match) => !excludeSet.has(match.id) && !value.includes(match.id))
      .slice(0, 100),
  )

  const selectedItems = $derived(
    value.map((id) => ({ id, genre: createGetGenreQuery(genres)(id) })),
  )
</script>

<Multiselect.Root
  value={value.map((v) => v.toString())}
  options={options.map(({ id }) => id.toString())}
  onChange={(vs) => {
    value = vs.map((v) => Number.parseInt(v))
    onChange?.(value)
  }}
  class={class_}
>
  <Multiselect.Trigger>
    {#each selectedItems as { id, genre } (id)}
      <Multiselect.SelectedItem value={id.toString()}>
        {#if genre === undefined}
          {#if !!$genreTreeQuery.data || !!$genreTreeQuery.error}
            Unknown
          {:else}
            <Loader size={10} />
          {/if}
        {:else}
          <div class={cn(genre.nsfw && !$userSettings.showNsfw && 'blur-sm')}>
            <span>{genre.name}</span>{#if genre.subtitle}&nbsp;<span class="text-xs text-gray-500"
                >[{genre.subtitle}]</span
              >{/if}{#if $userSettings.showTypeTags && genre.type !== 'STYLE'}
              &nbsp;
              <GenreTypeChip type={genre.type} class="dark:border dark:border-gray-700" />
            {/if}
          </div>
        {/if}
      </Multiselect.SelectedItem>
    {/each}
    <Multiselect.Input {id} bind:value={filter} />
  </Multiselect.Trigger>
  <Multiselect.Options>
    {#if $genreTreeQuery.data}
      {#each options as genreMatch (genreMatch.id)}
        <Multiselect.Option value={genreMatch.id.toString()}>
          <div class={cn(genreMatch.genre.nsfw && !$userSettings.showNsfw && 'blur-sm')}>
            {genreMatch.genre.name}
            {#if genreMatch.genre.subtitle}
              &nbsp;
              <span class="text-[0.8rem] text-gray-500 group-hover:text-gray-400"
                >[{genreMatch.genre.subtitle}]</span
              >
            {/if}
            {#if genreMatch.matchedAka}
              &nbsp;
              <span class="text-[0.8rem]">({genreMatch.matchedAka})</span>
            {/if}
            {#if $userSettings.showTypeTags && genreMatch.genre.type !== 'STYLE'}
              &nbsp;
              <GenreTypeChip type={genreMatch.genre.type} />
            {/if}
          </div>
        </Multiselect.Option>
      {/each}
    {:else if $genreTreeQuery.error}
      <div class="flex w-full items-center justify-center p-2 text-sm text-error-500">
        Error loading genres
      </div>
    {:else}
      <Loader size={32} />
    {/if}
  </Multiselect.Options>
</Multiselect.Root>
