<script lang="ts">
  import Chip from '$lib/atoms/Chip.svelte'
  import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
  import { cn, tw } from '$lib/utils/dom'

  type Props = {
    relevance: number
    class?: string
  }

  let { relevance, class: class_ }: Props = $props()
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
