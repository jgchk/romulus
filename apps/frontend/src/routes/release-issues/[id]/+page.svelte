<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import CoverArt from '$lib/components/CoverArt.svelte'

  import type { PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()
</script>

<Card class="h-full w-full space-y-2 p-4">
  <div class="flex gap-2">
    <div class="flex-1">
      <CoverArt
        class="w-full"
        art={data.releaseIssue.art}
        title={data.releaseIssue.title}
        artists={data.releaseIssue.artists.map((a) => a.name)}
      />

      <h3 class="mt-4 text-lg font-bold">Tracks</h3>
      <ol>
        {#each data.releaseIssue.tracks as track, i (track.id)}
          <li>
            <span class="font-bold dark:text-gray-400">{i + 1}.</span>
            <a class="hover:underline" href="/tracks/{track.id}">{track.title}</a>
          </li>
        {/each}
      </ol>
    </div>

    <div class="flex-[4]">
      <h1 class="text-2xl">{data.releaseIssue.title}</h1>
      <h2 class="text-xl">
        {#each data.releaseIssue.artists as artist (artist.id)}
          <a href="/artists/{artist.id}" class="hover:underline">{artist.name}</a>
        {/each}
      </h2>

      <h3 class="mt-4 text-lg font-bold">Parent Release</h3>
      <a class="hover:underline" href="/releases/{data.releaseIssue.release.id}"
        >{data.releaseIssue.release.title}</a
      >
    </div>
  </div>
</Card>
