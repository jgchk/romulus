<script lang="ts">
  import { MagnifyingGlass, X } from 'phosphor-svelte'
  import { createEventDispatcher } from 'svelte'

  import { tooltip } from '$lib/actions/tooltip'
  import Dialog from '$lib/atoms/Dialog.svelte'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import VirtualList from '$lib/atoms/VirtualList.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import { createSearchGenresQuery } from '$lib/features/genres/queries/application/search'
  import type { GenreStore } from '$lib/features/genres/queries/infrastructure'
  import type { TreeGenre } from '$lib/features/genres/queries/types'
  import { useDebounce } from '$lib/runes/use-debounce.svelte'
  import { tw } from '$lib/utils/dom'

  type Props = {
    filter?: string
    genres: GenreStore
  }

  let { filter = $bindable(''), genres }: Props = $props()

  const debouncedFilter = useDebounce(() => filter, 5000)

  let results = $derived(createSearchGenresQuery(genres)(debouncedFilter.current))

  const dispatch = createEventDispatcher<{ close: undefined; select: TreeGenre }>()

  const userSettings = getUserSettingsContext()
</script>

<Dialog title="Insert a genre link" on:close>
  <div class="flex items-center space-x-1">
    <Input
      class="flex-1"
      bind:value={filter}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.stopPropagation()
          e.preventDefault()
          debouncedFilter.current = filter
        }
      }}
    />
    <IconButton tooltip="Search" onClick={() => (debouncedFilter.current = filter)}>
      <MagnifyingGlass />
    </IconButton>
    <IconButton tooltip="Close" onClick={() => dispatch('close')}>
      <X />
    </IconButton>
  </div>

  {#if results.length > 0}
    <VirtualList items={results} height="300px">
      {#snippet children({ item: match })}
        <button
          type="button"
          class={tw(
            'block px-2 text-left text-gray-700 transition hover:font-bold dark:text-gray-400',
            match.genre.nsfw && !$userSettings.showNsfw && 'blur-sm',
          )}
          onclick={() => dispatch('select', match.genre)}
        >
          {match.genre.name}
          {#if match.genre.subtitle}
            &nbsp;
            <span class="text-sm text-gray-600">[{match.genre.subtitle}]</span>
          {/if}
          {#if match.matchedAka}
            &nbsp;
            <span class="text-sm">({match.matchedAka})</span>
          {/if}
          {#if $userSettings.showTypeTags && match.genre.type !== 'STYLE'}
            &nbsp;
            <GenreTypeChip type={match.genre.type} />
          {/if}
          {#if match.genre.nsfw}
            <span
              class="align-super text-xs font-bold text-error-500 transition dark:text-error-700"
              use:tooltip={{ content: 'NSFW' }}>N</span
            >
          {/if}
        </button>
      {/snippet}
    </VirtualList>
  {:else}
    <div class="flex w-full flex-col items-center justify-center text-gray-400">
      <div>No genres found.</div>
    </div>
  {/if}
</Dialog>
