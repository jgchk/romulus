<script lang="ts">
  export let id: number
  export let text: string | undefined = undefined
  export let genres: { id: number; name: string }[]

  $: genre = genres.find((genre) => genre.id === id)
</script>

<a href={genre ? `/genres/${id}` : `/genre/${id}/history`} class="underline">
  {#if text}
    {text}
  {:else if genre}
    {genre.name}
  {:else}
    {'<Deleted Genre>'}
  {/if}
</a>
