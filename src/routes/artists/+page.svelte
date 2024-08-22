<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'

  import type { PageData } from './$types'

  export let data: PageData
</script>

<Card class="h-full w-full space-y-2 p-4">
  {#if data.user?.permissions?.includes('EDIT_ARTISTS')}
    <LinkButton href="/artists/create">Create Artist</LinkButton>
  {/if}

  <div class="flex flex-wrap items-start justify-start gap-2">
    {#each data.artists as artist (artist.id)}
      <a href="/artists/{artist.id}">{artist.name}</a>
    {/each}
  </div>
</Card>
