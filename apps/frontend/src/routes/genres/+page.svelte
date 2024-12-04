<script lang="ts">
  import { pageTitle } from '$lib/utils/string'

  import { treeState } from './GenreNavigator/GenreTree/state'

  treeState.setSelectedId(undefined)
  treeState.setSelectedPath(undefined)
</script>

<svelte:head>
  <title>{pageTitle('Genres')}</title>
</svelte:head>

<div class="flex h-full w-full items-center justify-center text-gray-400">Select a genre.</div>
