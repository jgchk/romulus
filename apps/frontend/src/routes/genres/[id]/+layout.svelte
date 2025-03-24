<script lang="ts">
  import { createGetPathToQuery } from '$lib/features/genres/queries/application/get-path-to'
  import { useGenres } from '$lib/features/genres/rune.svelte'

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

  const asyncGenresRune = $derived(useGenres(data.streamed.genres))

  $effect(() => {
    const selectedPath = treeState.getSelectedPath()
    if (selectedPath === undefined) {
      if (asyncGenresRune.data) {
        const genres = asyncGenresRune.data
        const newPath = createGetPathToQuery(genres)(data.id)
        treeState.setSelectedPath(newPath)
        if (newPath !== undefined) {
          treeState.expandAlongPath(newPath)
        }
      }
    } else {
      const selectedId = getSelectedGenreIdFromTreePath(selectedPath)
      if (selectedId === undefined || selectedId !== data.id) {
        if (asyncGenresRune.data) {
          const genres = asyncGenresRune.data
          const newPath = createGetPathToQuery(genres)(data.id)
          treeState.setSelectedPath(newPath)
          if (newPath !== undefined) {
            treeState.expandAlongPath(newPath)
          }
        }
      }
    }
  })
</script>

{@render children?.()}
