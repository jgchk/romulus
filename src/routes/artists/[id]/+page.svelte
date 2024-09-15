<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import Release from '$lib/components/Release.svelte'
  import { getUserContext } from '$lib/contexts/user'

  import type { PageData } from './$types'

  export let data: PageData

  const user = getUserContext()
</script>

<Card class="h-full w-full p-4">
  {#if $user?.permissions?.includes('EDIT_RELEASES')}
    <form method="POST" action="?/delete">
      <Button type="submit" color="error">Delete Artist</Button>
    </form>
  {/if}

  <h1 class="text-2xl">{data.artist.name}</h1>

  <h3 class="mt-4 text-lg">Releases</h3>
  <div class="flex flex-wrap items-start justify-start gap-2">
    {#each data.artist.releases as release (release.id)}
      <Release {...release} />
    {/each}
  </div>
</Card>
