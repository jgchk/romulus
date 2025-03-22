<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  import Button from '$lib/atoms/Button.svelte'
  import ErrorText from '$lib/atoms/ErrorText.svelte'
  import Loader from '$lib/atoms/Loader.svelte'
  import { getUserContext } from '$lib/contexts/user'
  import { type GenreDatabase } from '$lib/genre-db/infrastructure/db'
  import { createGenreDatabaseQueries } from '$lib/genre-db/tanstack-query'

  import { getTreeStateStoreContext } from '../../tree-state-store.svelte'
  import GenreTreeNode from './GenreTreeNode.svelte'

  type Props = {
    genreDatabase: GenreDatabase
  }

  let { genreDatabase }: Props = $props()

  const treeState = getTreeStateStoreContext()

  const topLevelGenresQuery = createQuery(createGenreDatabaseQueries(genreDatabase).getRootGenres())

  let ref: HTMLElement | undefined = $state()

  const user = getUserContext()
</script>

<nav aria-label="Genre Tree" class="flex h-full w-full flex-col">
  {#if $topLevelGenresQuery.data}
    {@const topLevelGenres = $topLevelGenresQuery.data}
    {#if topLevelGenres.length > 0}
      <div bind:this={ref} class="flex-1 overflow-auto p-2 pl-1">
        <ul>
          {#each topLevelGenres as genre (genre.id)}
            <GenreTreeNode id={genre.id} path={[genre.id]} treeRef={ref} {genreDatabase} />
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
  {:else if $topLevelGenresQuery.error}
    <ErrorText errors={['Failed to fetch genres']} />
  {:else}
    <Loader />
  {/if}

  {#if treeState.isExpandedAtRootLevel()}
    <div class="w-full border-t border-gray-200 transition dark:border-gray-800">
      <Button class="w-full rounded-none" kind="text" onClick={() => treeState.collapseAll()}>
        Collapse All
      </Button>
    </div>
  {/if}
</nav>
