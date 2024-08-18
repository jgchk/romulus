<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import Release from '$lib/components/Release.svelte'

  import type { PageData } from './$types'

  export let data: PageData
</script>

<Card class="h-full w-full p-4">
  <h1 class="text-2xl">{data.artist.name}</h1>

  <h3 class="mt-4 text-lg">Releases</h3>
  <ul>
    {#each data.artist.releases as release (release.id)}
      <Release {...release} />
    {/each}
  </ul>
</Card>
