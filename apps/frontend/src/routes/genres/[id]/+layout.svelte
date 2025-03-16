<script lang="ts">
  import { getGenreTreeStoreContext } from '../genre-tree-store.svelte'
  import {
    getSelectedGenreIdFromTreePath,
    getTreeStateStoreContext,
  } from '../tree-state-store.svelte'
  import type { LayoutData } from './$types'

  type Props = {
    data: LayoutData
    children?: import('svelte').Snippet
  }

  let { data, children }: Props = $props()

  const tree = getGenreTreeStoreContext()
  const treeState = getTreeStateStoreContext()

  $effect(() => {
    const selectedPath = treeState.getSelectedPath()
    if (selectedPath === undefined) {
      const newPath = tree.getPathTo(data.id)
      treeState.setSelectedPath(newPath)
      if (newPath !== undefined) {
        treeState.expandAlongPath(newPath)
      }
    } else {
      const selectedId = getSelectedGenreIdFromTreePath(selectedPath)
      if (selectedId === undefined || selectedId !== data.id) {
        const newPath = tree.getPathTo(data.id)
        treeState.setSelectedPath(newPath)
        if (newPath !== undefined) {
          treeState.expandAlongPath(newPath)
        }
      }
    }
  })
</script>

{@render children?.()}
