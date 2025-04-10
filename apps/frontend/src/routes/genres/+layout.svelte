<script lang="ts">
  import { getQueryClientContext } from '@tanstack/svelte-query'
  import type { Snippet } from 'svelte'

  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import Card from '$lib/atoms/Card.svelte'
  import SplitPane from '$lib/atoms/SplitPane.svelte'
  import { genreQueries, getGenreTreeFromCache } from '$lib/features/genres/tanstack'

  import type { LayoutData } from './$types'
  import GenreNavigator from './GenreNavigator/GenreNavigator.svelte'
  import { createTreeStateStore, setTreeStateStoreContext } from './tree-state-store.svelte'

  type Props = {
    data: LayoutData
    children?: Snippet
  }

  let { data, children }: Props = $props()

  let windowWidth = $state(0)

  let leftPaneSize = $state(data.leftPaneSize ?? 300)
  $effect(() => {
    if (browser) {
      document.cookie = `genres.leftPaneSize=${leftPaneSize}; path=/; max-age=31536000`
    }
  })

  setTreeStateStoreContext(createTreeStateStore())

  const queryClient = getQueryClientContext()
  $effect(() => {
    async function loadGenreTreeFromCache() {
      const cached = await getGenreTreeFromCache()
      if (cached) {
        queryClient.setQueryData(genreQueries.tree().queryKey, cached)
      }
    }

    void loadGenreTreeFromCache()
  })
</script>

<svelte:window bind:innerWidth={windowWidth} />

<SplitPane
  minSize={200}
  maxSize={windowWidth - 300}
  defaultSize={leftPaneSize}
  class="h-full pt-0"
  on:resize={(e) => (leftPaneSize = e.detail)}
  onSmallScreenCollapseto={$page.url.pathname === '/genres' ? 'left' : 'right'}
>
  {#snippet left()}
    <GenreNavigator />
  {/snippet}
  {#snippet right()}
    <Card class="h-full overflow-auto">
      {@render children?.()}
    </Card>
  {/snippet}
</SplitPane>
