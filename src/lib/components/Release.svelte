<script lang="ts">
  export let id: number
  export let art: string
  export let title: string
  export let artists: { id: number; name: string }[]
</script>

<a href="/releases/{id}" class="block rounded border p-1 dark:border-gray-700 dark:bg-gray-800">
  <img src={art} class="h-52 w-52" />
  <h2>{title}</h2>
  <p>
    {#each artists as artist (artist.id)}
      <a href="/artists/{artist.id}">{artist.name}</a>
    {/each}
  </p>
</a>
