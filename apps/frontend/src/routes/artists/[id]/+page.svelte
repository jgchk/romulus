<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import Release from '$lib/components/Release.svelte'
  import { getUserContext } from '$lib/contexts/user'

  import type { PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  const user = getUserContext()
</script>

<Card class="h-full w-full p-4">
  {#if $user?.permissions?.includes('EDIT_RELEASES')}
    <LinkButton href="/releases/create?artist={data.artist.id}">Add Release</LinkButton>
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
