<script lang="ts">
  import CoverArt from './CoverArt.svelte'

  export let id: number
  export let art: string | null | undefined = undefined
  export let title: string
  export let artists: { id: number; name: string }[]
</script>

<div class="block rounded border p-1 transition dark:border-gray-700 dark:bg-gray-800">
  <a href="/releases/{id}">
    <CoverArt class="h-52 w-52" {art} {title} artists={artists.map((a) => a.name)} />
    <div class="font-medium">{title}</div>
  </a>
  <div class="text-sm">
    {#each artists as artist, index (artist.id)}
      <a href="/artists/{artist.id}" class="hover:underline">{artist.name}</a>
      {#if index < artists.length - 1},
      {/if}
    {/each}
  </div>
</div>
