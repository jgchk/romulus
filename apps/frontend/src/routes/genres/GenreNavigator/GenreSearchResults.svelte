<script lang="ts" module>
</script>

<script lang="ts">
  import VirtualList from '$lib/atoms/VirtualList.svelte'
  import { getUserContext } from '$lib/contexts/user'

  import { getGenreTreeStoreContext } from '../genre-tree-store.svelte'
  import GenreSearchResult from './GenreSearchResult.svelte'
  import { searchStore } from './state'

  const tree = getGenreTreeStoreContext()
  let matches = $derived(tree.search($searchStore.debouncedFilter))

  const user = getUserContext()
</script>

<div aria-label="Genre Search Results" class="h-full overflow-auto p-4">
  {#if matches.length > 0}
    <VirtualList items={matches}>
      {#snippet children({ item: match })}
        <GenreSearchResult {match} />
      {/snippet}
    </VirtualList>
  {:else}
    <div
      class="flex w-full flex-col items-center justify-center text-gray-600 transition dark:text-gray-400"
    >
      <div>No genres found.</div>
      {#if $user?.permissions.genres.canCreate}
        <div>
          <a href="/genres/create" class="text-primary-500 hover:underline">Create one.</a>
        </div>
      {/if}
    </div>
  {/if}
</div>
