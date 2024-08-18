<script lang="ts">
  export let id: number
  export let art: string
  export let title: string
  export let artists: { id: number; name: string }[]
</script>

<a
  href="/releases/{id}"
  class="block rounded border p-1 transition dark:border-gray-700 dark:bg-gray-800"
>
  <img src={art} class="h-52 w-52" />
  <div class="font-medium">{title}</div>
  <div class="text-sm">
    {#each artists as artist (artist.id)}
      <a href="/artists/{artist.id}" class="hover:underline">{artist.name}</a>
    {/each}
  </div>
</a>
