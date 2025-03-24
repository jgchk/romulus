<script lang="ts">
  import Loader from '$lib/atoms/Loader.svelte'
  import { useGenres } from '$lib/features/genres/rune.svelte'
  import { pageTitle } from '$lib/utils/string'

  import { getTreeStateStoreContext } from '../tree-state-store.svelte'
  import type { PageData } from './$types'
  import GenresTable from './GenresTable.svelte'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  const treeState = getTreeStateStoreContext()

  treeState.setSelectedPath(undefined)

  const asyncGenresRune = useGenres(data.streamed.genres)
</script>

<svelte:head>
  <title>{pageTitle('Table', 'Genres')}</title>
</svelte:head>

{#if asyncGenresRune.data}
  <GenresTable genres={asyncGenresRune.data} {data} />
{:else if asyncGenresRune.error}
  <div>Error fetching genres</div>
{:else}
  <div class="center h-full max-h-96 w-full">
    <Loader size={32} class="text-primary-500" />
  </div>
{/if}
