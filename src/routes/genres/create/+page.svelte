<script lang="ts">
  import GenreForm from '../GenreForm.svelte'
  import { treeState } from '../GenreNavigator/GenreTree/state'
  import type { PageData } from './$types'

  export let data: PageData

  treeState.setSelectedId(undefined)
  treeState.setSelectedPath(undefined)
</script>

<GenreForm data={data.form} showRelevance genres={data.streamed.genres} />
