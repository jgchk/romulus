<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import CoverArt from '$lib/components/CoverArt.svelte'
  import { getUserContext } from '$lib/contexts/user'

  import type { PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  const user = getUserContext()
</script>

<Card class="h-full w-full space-y-2 p-4">
  {#if $user?.permissions?.includes('EDIT_RELEASES')}
    <LinkButton href="/releases/{data.release.id}/issues/create">Create Release Issue</LinkButton>
    <form method="POST" action="?/delete">
      <Button type="submit" color="error">Delete Release</Button>
    </form>
  {/if}

  <div class="flex gap-2">
    <div class="flex-1">
      <CoverArt
        class="w-full"
        art={data.release.art}
        title={data.release.title}
        artists={data.release.artists.map((a) => a.name)}
      />

      <h3 class="mt-4 text-lg font-bold">Tracks</h3>
      <ol>
        {#each data.release.tracks as track, i (track.id)}
          <li>
            <span class="font-bold dark:text-gray-400">{i + 1}.</span>
            <a class="hover:underline" href="/tracks/{track.id}">{track.title}</a>
          </li>
        {/each}
      </ol>
    </div>

    <div class="flex-[4]">
      <h1 class="text-2xl">{data.release.title}</h1>
      <h2 class="text-xl">
        {#each data.release.artists as artist (artist.id)}
          <a href="/artists/{artist.id}" class="hover:underline">{artist.name}</a>
        {/each}
      </h2>

      <h3 class="mt-4 text-lg font-bold">Issues</h3>
      <ul>
        {#each data.release.issues as issue, i (issue.id)}
          <li>
            <span class="font-bold dark:text-gray-400">{i + 1}.</span>
            <a class="hover:underline" href="/release-issues/{issue.id}">{issue.title}</a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</Card>
