<script lang="ts">
  import { pageTitle } from '$lib/utils/string'

  import GenreForm from '../GenreForm.svelte'
  import { treeState } from '../GenreNavigator/GenreTree/state'
  import type { PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  treeState.setSelectedId(undefined)
  treeState.setSelectedPath(undefined)
</script>

<svelte:head>
  <title>{pageTitle('New Genre', 'Genres')}</title>
</svelte:head>

<GenreForm data={data.form} showRelevance genres={data.streamed.genres} />
