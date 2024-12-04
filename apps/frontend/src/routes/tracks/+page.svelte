<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'

  import type { PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()
</script>

<Card class="h-full w-full space-y-2 p-4">
  <div class="flex flex-wrap items-start justify-start gap-2">
    {#each data.tracks as track (track.id)}
      <a href="/tracks/{track.id}">{track.title}</a>
    {/each}
  </div>
</Card>
