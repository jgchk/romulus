<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import SplitPane from '$lib/atoms/SplitPane.svelte'

  import type { LayoutData } from './$types'
  import GenreNavigator from './GenreNavigator/GenreNavigator.svelte'

  export let data: LayoutData

  let windowWidth = 0
</script>

<svelte:window bind:innerWidth={windowWidth} />

<SplitPane
  defaultSize={300}
  minSize={200}
  maxSize={windowWidth - 300}
  class="hidden h-full pt-0 md:flex"
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
