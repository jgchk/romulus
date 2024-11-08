<script lang="ts">
  import { pageTitle } from '$lib/utils/string'

  import GenreDiff from '../GenreDiff.svelte'
  import { treeState } from '../GenreNavigator/GenreTree/state'
  import type { PageData } from './$types'

  export let data: PageData

  treeState.setSelectedId(undefined)
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
      />
    {/each}
  </div>
</div>
