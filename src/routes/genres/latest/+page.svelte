<script lang="ts">
  import GenreDiff from '../GenreDiff.svelte'
  import { treeState } from '../GenreNavigator/GenreTree/state'
  import type { PageData } from './$types'

  export let data: PageData

  treeState.setSelectedId(undefined)
  treeState.setSelectedPath(undefined)
</script>

<div class="h-full w-full overflow-auto p-4">
  <div class="max-w-lg space-y-3">
    {#each data.genreHistory as entry (entry.id)}
      <GenreDiff
        previousHistory={entry.previousHistory}
        currentHistory={entry}
        genres={data.streamed.genres}
      />
    {/each}
  </div>
</div>
