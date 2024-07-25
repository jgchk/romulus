<script lang="ts">
  import { MagnifyingGlass, X } from 'phosphor-svelte'
  import { createEventDispatcher } from 'svelte'

  import Dialog from '$lib/atoms/Dialog.svelte'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import VirtualList from '$lib/atoms/VirtualList.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import { searchGenres, type SimpleGenre } from '$lib/types/genres'
  import type { Timeout } from '$lib/utils/types'

  export let filter: string = ''
  export let genres: SimpleGenre[]

  let debouncedFilter = filter

  let timeout: Timeout
  $: {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedFilter = filter
    }, 250)
  }

  $: results = searchGenres(genres, debouncedFilter)

  const dispatch = createEventDispatcher<{ close: undefined; select: SimpleGenre }>()

  const userSettings = getUserSettingsContext()
</script>

<Dialog title="Insert a genre link" on:close>
  <div class="flex items-center space-x-1">
    <Input class="flex-1" bind:value={filter} />
    <IconButton tooltip="Search" on:click={() => (debouncedFilter = filter)}>
      <MagnifyingGlass />
    </IconButton>
    <IconButton tooltip="Close" on:click={() => dispatch('close')}>
      <X />
    </IconButton>
  </div>

  {#if results.length > 0}
    <VirtualList items={results} let:item={match} height="300px">
      <button
        type="button"
        class="block text-left text-gray-700 transition hover:font-bold dark:text-gray-400"
        on:click={() => dispatch('select', match.genre)}
      >
        {match.genre.name}
        {#if match.genre.subtitle}
          {' '}
          <span class="text-sm text-gray-600">[{match.genre.subtitle}]</span>
        {/if}
        {#if match.matchedAka}
          {' '}
          <span class="text-sm">({match.matchedAka})</span>
        {/if}
        {#if $userSettings.showTypeTags && match.genre.type !== 'STYLE'}
          {' '}
          <GenreTypeChip type={match.genre.type} />
        {/if}
      </button>
    </VirtualList>
  {:else}
    <div class="flex w-full flex-col items-center justify-center text-gray-400">
      <div>No genres found.</div>
    </div>
  {/if}
</Dialog>
