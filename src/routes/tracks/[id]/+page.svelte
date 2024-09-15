<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import { getUserContext } from '$lib/contexts/user'

  import type { PageData } from './$types'

  export let data: PageData

  const user = getUserContext()
</script>

<Card class="h-full w-full p-4">
  {#if $user?.permissions?.includes('EDIT_RELEASES')}
    <form method="POST" action="?/delete">
      <Button type="submit" color="error">Delete Track</Button>
    </form>
  {/if}

  <h1 class="text-2xl">{data.track.title}</h1>

  <h3 class="mt-4 text-lg">Appears on</h3>
  <h4 class="mt-4">Releases</h4>
  <ul>
    {#each data.track.releases as release (release.id)}
      <li><a href="/releases/{release.id}" class="hover:underline">{release.title}</a></li>
    {/each}
  </ul>
  <h4 class="mt-4">Release Issues</h4>
  <ul>
    {#each data.track.releaseIssues as releaseIssue (releaseIssue.id)}
      <li>
        <a href="/release-issues/{releaseIssue.id}" class="hover:underline">{releaseIssue.title}</a>
      </li>
    {/each}
  </ul>
</Card>
