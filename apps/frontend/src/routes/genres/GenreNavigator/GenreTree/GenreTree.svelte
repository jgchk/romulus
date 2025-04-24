<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import VirtualList from '$lib/atoms/VirtualList.svelte'
  import { getUserContext } from '$lib/contexts/user'
  import { createGetRootGenresQuery } from '$lib/features/genres/queries/application/get-root-genres'
  import type { GenreStore } from '$lib/features/genres/queries/infrastructure'

  import { getTreeStateStoreContext } from '../../tree-state-store.svelte'
  import GenreTreeNode from './GenreTreeNode.svelte'

  let { genres, virtual = true }: { genres: GenreStore; virtual?: boolean } = $props()

  const treeState = getTreeStateStoreContext()

  let topLevelGenres = $derived(createGetRootGenresQuery(genres)())

  let ref: HTMLElement | undefined = $state()

  const user = getUserContext()
</script>

<nav aria-label="Genre Tree" class="flex h-full w-full flex-col">
  {#if topLevelGenres.length > 0}
    <div bind:this={ref} class="min-h-0 flex-1 p-2 pl-1">
      <ul class="h-full overflow-auto">
        {#if virtual}
          <VirtualList items={topLevelGenres.slice(0, 200)} itemHeight={24}>
            {#snippet children({ item: genreId })}
              <GenreTreeNode
                id={genreId}
                path={[genreId]}
                treeRef={ref}
                {genres}
                hasParent={false}
              />
            {/snippet}
          </VirtualList>
        {:else}
          {#each topLevelGenres as genreId (genreId)}
            <GenreTreeNode id={genreId} path={[genreId]} treeRef={ref} {genres} hasParent={false} />
          {/each}
        {/if}
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
