<script lang="ts">
    
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import { tw } from '$lib/utils/dom'
  import { tooltip } from '$lib/actions/tooltip'

  export let id: number
  export let text: string | undefined = undefined
  export let genres: { id: number; name: string }[]

  $: genre = genres.find((genre) => genre.id === id)
    
  const userSettings = getUserSettingsContext()
</script>

<a href={genre ? `/genres/${id}` : `/genre/${id}/history`} class={tw(
      "underline inline-block",
      genre.nsfw && !$userSettings.showNsfw && 'blur-sm'
    )}>
  {#if text}
    {text}
  {:else if genre}
    {genre.name}
  {:else}
    {'<Deleted Genre>'}
  {/if}
</a>

{#if genre.nsfw}
  <span
    class="align-super text-xs font-bold text-error-500 transition dark:text-error-700 no-underline"
    use:tooltip={{ content: 'NSFW' }}>N</span
  >
{/if}
