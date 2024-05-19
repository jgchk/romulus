<script lang="ts">
  import { treeState } from '../GenreNavigator/GenreTree/state'
  import type { LayoutData } from './$types'

  export let data: LayoutData

  $: treeState.setSelectedId(data.id)
</script>

<slot />
