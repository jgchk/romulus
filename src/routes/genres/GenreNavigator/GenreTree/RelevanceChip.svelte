<script lang="ts">
  import Chip from '$lib/atoms/Chip.svelte'
  import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
  import { cn, tw } from '$lib/utils/dom'

  export let relevance: number

  let class_: string | undefined = undefined
  export { class_ as class }
</script>

{#if relevance === UNSET_GENRE_RELEVANCE}
  <Chip
    text="?"
    tooltip="Missing Relevance"
    class={tw(
      'genre-relevance-chip bg-error-200 text-error-500 transition dark:bg-error-800 dark:bg-opacity-25 dark:text-error-600',
      class_,
    )}
  />
{:else}
  <Chip text={relevance.toString()} class={cn('genre-relevance-chip', class_)} />
{/if}
