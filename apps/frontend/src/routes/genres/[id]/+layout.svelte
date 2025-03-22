<script lang="ts">
  import { createGetPathToQuery } from '$lib/features/genres/queries/application/get-path-to'

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

  const treeState = getTreeStateStoreContext()

  $effect(() => {
    async function expandToCurrentGenre() {
      const selectedPath = treeState.getSelectedPath()
      if (selectedPath === undefined) {
        const genres = await data.streamed.genres
        const newPath = createGetPathToQuery(genres)(data.id)
        treeState.setSelectedPath(newPath)
        if (newPath !== undefined) {
          treeState.expandAlongPath(newPath)
        }
      } else {
        const selectedId = getSelectedGenreIdFromTreePath(selectedPath)
        if (selectedId === undefined || selectedId !== data.id) {
          const genres = await data.streamed.genres
          const newPath = createGetPathToQuery(genres)(data.id)
          treeState.setSelectedPath(newPath)
          if (newPath !== undefined) {
            treeState.expandAlongPath(newPath)
          }
        }
      }
    }

    void expandToCurrentGenre()
  })
</script>

{@render children?.()}
