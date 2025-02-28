<script lang="ts">
  import { getTreeStateContext } from '../GenreNavigator/GenreTree/state'
  import type { LayoutData } from './$types'

  type Props = {
    data: LayoutData
    children?: import('svelte').Snippet
  }

  let { data, children }: Props = $props()

  const treeState = getTreeStateContext()

  treeState.setSelectedId(data.id)
  $effect(() => {
    treeState.setSelectedId(data.id)
  })
</script>

{@render children?.()}
