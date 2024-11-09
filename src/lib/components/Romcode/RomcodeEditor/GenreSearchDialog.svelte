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
  import { searchGenres, type SimpleGenre } from '$lib/types/genres'
  import { tw } from '$lib/utils/dom'
  import type { Timeout } from '$lib/utils/types'

  export let filter = ''
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
    <IconButton tooltip="Search" onClick={() => (debouncedFilter = filter)}>
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
