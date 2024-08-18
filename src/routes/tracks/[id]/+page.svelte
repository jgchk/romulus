<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import Input from '$lib/atoms/Input.svelte'

  import type { PageData } from './$types'

  export let data: PageData
</script>

<Card class="h-full w-full p-4">
  <h1 class="text-2xl">{data.track.title}</h1>
  <form method="POST" action="?/merge">
    <Input name="id" type="number" />
    <Button type="submit">Merge</Button>
  </form>

  <h3 class="mt-4 text-lg">Appears on</h3>
  <ul>
    {#each data.track.releases as release (release.id)}
      <li><a href="/releases/{release.id}" class="hover:underline">{release.title}</a></li>
    {/each}
  </ul>
</Card>
