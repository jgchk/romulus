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

<div class="h-full overflow-auto p-4">
  {#if matches.length > 0}
    <VirtualList items={matches} let:item={match}>
      <a
        href="/genres/{match.genre.id}"
        class="block text-gray-700 hover:font-bold dark:text-gray-300"
        on:click={() => searchStore.clearFilter()}
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
      </a>
    </VirtualList>
  {:else}
    <div class="flex w-full flex-col items-center justify-center text-gray-400">
      <div>No genres found.</div>
      {#if $user && $user.permissions?.includes('EDIT_GENRES')}
        <div>
          <a href="/genres?view=create" class="text-primary-500 hover:underline">Create one.</a>
        </div>
      {/if}
    </div>
  {/if}
</div>
