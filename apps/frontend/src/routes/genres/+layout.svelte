<script lang="ts">
  import type { Snippet } from 'svelte'

  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import Card from '$lib/atoms/Card.svelte'
  import SplitPane from '$lib/atoms/SplitPane.svelte'
  import GenreNavigator from '$lib/features/genres/components/GenreNavigator/GenreNavigator.svelte'

  import type { LayoutData } from './$types'
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
