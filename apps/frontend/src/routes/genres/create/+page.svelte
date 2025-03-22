<script lang="ts">
  import { createGenreStore } from '$lib/features/genres/queries/infrastructure'
  import { pageTitle } from '$lib/utils/string'

  import GenreForm from '../GenreForm.svelte'
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
  <title>{pageTitle('New Genre', 'Genres')}</title>
</svelte:head>

<GenreForm data={data.form} showRelevance genres={data.streamed.genres.then(createGenreStore)} />
