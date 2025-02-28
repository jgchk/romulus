<script lang="ts">
  import Loader from '$lib/atoms/Loader.svelte'
  import { pageTitle } from '$lib/utils/string'

  import { getTreeStateContext } from '../GenreNavigator/GenreTree/state'
  import type { PageData } from './$types'
  import GenresTable from './GenresTable.svelte'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  const treeState = getTreeStateContext()

  treeState.setSelectedId(undefined)
  treeState.setSelectedPath(undefined)
</script>

<svelte:head>
  <title>{pageTitle('Table', 'Genres')}</title>
</svelte:head>

{#await data.streamed.genres}
  <div class="center h-full max-h-96 w-full">
    <Loader size={32} class="text-primary-500" />
  </div>
{:then genres}
  <GenresTable {genres} {data} />
{/await}
