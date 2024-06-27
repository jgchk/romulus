<script lang="ts">
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import Card from '$lib/atoms/Card.svelte'
  import SplitPane from '$lib/atoms/SplitPane.svelte'

  import type { LayoutData } from './$types'
  import GenreNavigator from './GenreNavigator/GenreNavigator.svelte'

  export let data: LayoutData

  let windowWidth = 0

  let leftPaneSize = data.leftPaneSize ?? 300
  $: if (browser) {
    document.cookie = `genres.leftPaneSize=${leftPaneSize}; path=/; max-age=31536000`
  }
</script>

<svelte:window bind:innerWidth={windowWidth} />

<SplitPane
  defaultSize={leftPaneSize}
  minSize={200}
  maxSize={windowWidth - 300}
  class="h-full pt-0"
  on:resize={(e) => (leftPaneSize = e.detail)}
  onSmallScreenCollapseto={$page.url.pathname === '/genres' ? 'left' : 'right'}
>
  <svelte:fragment slot="left">
    <GenreNavigator genres={data.streamed.genres} />
  </svelte:fragment>
  <svelte:fragment slot="right">
    <Card class="h-full overflow-auto">
      <slot />
    </Card>
  </svelte:fragment>
</SplitPane>
