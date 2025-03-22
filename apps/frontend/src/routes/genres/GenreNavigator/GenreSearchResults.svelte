<script lang="ts" module>
</script>

<script lang="ts">
  import VirtualList from '$lib/atoms/VirtualList.svelte'
  import { getUserContext } from '$lib/contexts/user'
  import { createSearchGenresQuery } from '$lib/features/genres/queries/search'
  import type { TreeGenre } from '$lib/features/genres/queries/types'

  import GenreSearchResult from './GenreSearchResult.svelte'
  import { searchStore } from './state'

  let { genres }: { genres: TreeGenre[] } = $props()

  let matches = $derived(createSearchGenresQuery(genres)($searchStore.debouncedFilter))

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
