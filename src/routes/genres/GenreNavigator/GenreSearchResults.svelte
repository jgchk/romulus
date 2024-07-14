<script lang="ts" context="module">
</script>

<script lang="ts">
  import VirtualList from '$lib/atoms/VirtualList.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { user, userSettings } from '$lib/contexts/user'
  import { searchGenres } from '$lib/types/genres'

  import type { TreeGenre } from './GenreTree/state'
  import { searchStore } from './state'

  export let genres: TreeGenre[]

  $: matches = searchGenres(genres, $searchStore.debouncedFilter)
</script>

<div aria-label="Genre Search Results" class="h-full overflow-auto p-4">
  {#if matches.length > 0}
    <VirtualList items={matches} let:item={match}>
      <a
        href="/genres/{match.genre.id}"
        class="group block truncate rounded border border-black border-opacity-0 px-1.5 text-[0.93rem] text-gray-600 transition hover:border-opacity-[0.03] hover:bg-gray-200 hover:text-black dark:border-white dark:border-opacity-0 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        on:click={() => searchStore.clearFilter()}
      >
        {match.genre.name}
        {#if match.genre.subtitle}
          {' '}
          <span
            class="text-[0.8rem] text-gray-500 transition group-hover:text-gray-600 dark:group-hover:text-gray-400"
            >[{match.genre.subtitle}]</span
          >
        {/if}
        {#if match.matchedAka}
          {' '}
          <span class="text-[0.8rem]">({match.matchedAka})</span>
        {/if}
        {#if $userSettings.showTypeTags && match.genre.type !== 'STYLE'}
          {' '}
          <GenreTypeChip type={match.genre.type} />
        {/if}
      </a>
    </VirtualList>
  {:else}
    <div
      class="flex w-full flex-col items-center justify-center text-gray-600 transition dark:text-gray-400"
    >
      <div>No genres found.</div>
      {#if $user && $user.permissions?.includes('EDIT_GENRES')}
        <div>
          <a href="/genres/create" class="text-primary-500 hover:underline">Create one.</a>
        </div>
      {/if}
    </div>
  {/if}
</div>
