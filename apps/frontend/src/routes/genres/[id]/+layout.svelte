<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  import { goto } from '$app/navigation'
  import {
    getTreeStateStoreContext,
    stringifyTreePath,
    useSelectedTreePath,
  } from '$lib/features/genres/components/GenreTree/tree-state-store.svelte'
  import { createGetPathToQuery } from '$lib/features/genres/queries/application/get-path-to'
  import { genreQueries } from '$lib/features/genres/tanstack'

  import type { LayoutData } from './$types'

  type Props = {
    data: LayoutData
    children?: import('svelte').Snippet
  }

  let { data, children }: Props = $props()

  const treeState = getTreeStateStoreContext()

  const genreTreeQuery = createQuery(genreQueries.tree())

  const getSelectedPath = useSelectedTreePath()

  $effect(() => {
    if (getSelectedPath() === undefined) {
      if ($genreTreeQuery.data) {
        const genres = $genreTreeQuery.data
        const newPath = createGetPathToQuery(genres)(data.id)
        if (newPath !== undefined) {
          void goto(`?selected-path=${stringifyTreePath(newPath)}`, {
            replaceState: true,
            noScroll: true,
          })
        }
      }
    }
  })

  $effect(() => {
    const selectedPath = getSelectedPath()
    if (selectedPath !== undefined) {
      treeState.expandAlongPath(selectedPath)
    }
  })
</script>

{@render children?.()}
