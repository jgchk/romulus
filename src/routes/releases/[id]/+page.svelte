<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import CoverArt from '$lib/components/CoverArt.svelte'

  import type { PageData } from './$types'

  export let data: PageData
</script>

<Card class="flex h-full w-full gap-2 p-4">
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
  </div>
</Card>
