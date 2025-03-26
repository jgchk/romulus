<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { createGetPathToQuery } from '$lib/features/genres/queries/application/get-path-to'
  import { genreQueries } from '$lib/features/genres/tanstack'

  import {
    getTreeStateStoreContext,
    stringifyTreePath,
    unstringifyTreePath,
  } from '../tree-state-store.svelte'
  import type { LayoutData } from './$types'

  type Props = {
    data: LayoutData
    children?: import('svelte').Snippet
  }

  let { data, children }: Props = $props()

  const treeState = getTreeStateStoreContext()

  const genreTreeQuery = createQuery(genreQueries.tree())

  const selectedPath = $derived.by(() => {
    const selectedPathString = page.url.searchParams.get('selected-path')
    const selectedPath =
      selectedPathString === null ? undefined : unstringifyTreePath(selectedPathString)
    return selectedPath
  })

  $effect(() => {
    if (selectedPath === undefined) {
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
    if (selectedPath !== undefined) {
      treeState.expandAlongPath(selectedPath)
    }
  })
</script>

{@render children?.()}
