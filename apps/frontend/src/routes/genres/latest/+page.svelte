<script lang="ts">
  import { pageTitle } from '$lib/utils/string'

  import GenreDiff from '../GenreDiff.svelte'
  import { getTreeStateStoreContext } from '../tree-state-store.svelte'
  import type { PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  const treeState = getTreeStateStoreContext()

  treeState.setSelectedPath(undefined)
</script>

<svelte:head>
  <title>{pageTitle('Latest', 'Genres')}</title>
</svelte:head>

<div class="h-full w-full overflow-auto p-4">
  <div class="max-w-lg space-y-3">
    {#each data.genreHistory as entry (entry.genre.id)}
      <GenreDiff
        previousHistory={entry.previousHistory}
        currentHistory={entry.genre}
        genres={data.streamed.genres}
        genreDatabase={data.genreDatabase}
      />
    {/each}
  </div>
</div>
