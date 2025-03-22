<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import { getUserContext } from '$lib/contexts/user'
  import { createGetRootGenresQuery } from '$lib/features/genres/queries/get-root-genres'
  import type { TreeGenre } from '$lib/features/genres/queries/types'

  import { getTreeStateStoreContext } from '../../tree-state-store.svelte'
  import GenreTreeNode from './GenreTreeNode.svelte'

  let { genres }: { genres: TreeGenre[] } = $props()

  const treeState = getTreeStateStoreContext()

  let topLevelGenres = $derived(createGetRootGenresQuery(genres)())

  let ref: HTMLElement | undefined = $state()

  const user = getUserContext()
</script>

<nav aria-label="Genre Tree" class="flex h-full w-full flex-col">
  {#if topLevelGenres.length > 0}
    <div bind:this={ref} class="flex-1 overflow-auto p-2 pl-1">
      <ul>
        {#each topLevelGenres as genreId (genreId)}
          <GenreTreeNode id={genreId} path={[genreId]} treeRef={ref} {genres} />
        {/each}
      </ul>
    </div>
  {:else}
    <div class="flex w-full flex-1 flex-col items-center justify-center text-gray-400">
      <div>No genres found.</div>
      {#if $user?.permissions.genres.canCreate}
        <div>
          <a href="/genres/create" class="text-primary-500 hover:underline">Create one.</a>
        </div>
      {/if}
    </div>
  {/if}

  {#if treeState.isExpandedAtRootLevel()}
    <div class="w-full border-t border-gray-200 transition dark:border-gray-800">
      <Button class="w-full rounded-none" kind="text" onClick={() => treeState.collapseAll()}>
        Collapse All
      </Button>
    </div>
  {/if}
</nav>
