<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import { getUserContext } from '$lib/contexts/user'

  import GenreTreeNode from './GenreTreeNode.svelte'
  import { getNewPath, isPathValid } from './path'
  import { type TreeGenre, treeState } from './state'

  type Props = {
    genres: TreeGenre[]
  }

  let { genres }: Props = $props()

  $effect(() => {
    treeState.setGenres(genres)
  })

  let topLevelGenres = $derived(
    genres.filter((genre) => genre.parents.length === 0 && genre.derivedFrom.length === 0),
  )

  $effect(() => {
    if ($treeState.selectedId !== undefined) {
      if (
        $treeState.selectedPath === undefined ||
        !isPathValid($treeState.genres, $treeState.selectedId, $treeState.selectedPath)
      ) {
        const newPath = getNewPath(
          $treeState.genres,
          $treeState.expanded,
          undefined,
          $treeState.selectedId,
        )
        treeState.setSelectedPath(newPath?.path)
      }
    }
  })

  let isAnyTopLevelExpanded = $derived(
    [...$treeState.expanded].some((key) => {
      const isTopLevel = !key.includes('-')
      if (!isTopLevel) return false

      const genre = genres.find((genre) => genre.id === parseInt(key))
      if (!genre) return false

      const hasChildren = genre.children.length > 0
      const hasDerivations = genre.derivations.length > 0
      return hasChildren || hasDerivations
    }),
  )

  let ref: HTMLElement | undefined = $state()

  const user = getUserContext()
</script>

<nav aria-label="Genre Tree" class="flex h-full w-full flex-col">
  {#if topLevelGenres.length > 0}
    <div bind:this={ref} class="flex-1 overflow-auto p-2 pl-1">
      <ul>
        {#each topLevelGenres as genre (genre.id)}
          <GenreTreeNode id={genre.id} path={[genre.id]} treeRef={ref} />
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

  {#if isAnyTopLevelExpanded}
    <div class="w-full border-t border-gray-200 transition dark:border-gray-800">
      <Button class="w-full rounded-none" kind="text" onClick={() => treeState.collapseAll()}>
        Collapse All
      </Button>
    </div>
  {/if}
</nav>
