<script lang="ts" context="module">
</script>

<script lang="ts">
  import VirtualList from '$lib/atoms/VirtualList.svelte'
  import { getUserContext } from '$lib/contexts/user'
  import { searchGenres } from '$lib/types/genres'

  import GenreSearchResult from './GenreSearchResult.svelte'
  import type { TreeGenre } from './GenreTree/state'
  import { searchStore } from './state'

  export let genres: TreeGenre[]

  $: matches = searchGenres(genres, $searchStore.debouncedFilter)

  const user = getUserContext()
</script>

<div aria-label="Genre Search Results" class="h-full overflow-auto p-4">
  {#if matches.length > 0}
    <VirtualList items={matches} let:item={match}>
      <GenreSearchResult {match} />
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
