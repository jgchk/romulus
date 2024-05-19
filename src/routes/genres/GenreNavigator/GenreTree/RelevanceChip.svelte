<script lang="ts">
  import Chip from '$lib/atoms/Chip.svelte'
  import { tw } from '$lib/utils/dom'

  export let relevance: number

  let class_: string | undefined = undefined
  export { class_ as class }
</script>

{#if relevance === 99}
  <Chip
    text="?"
    tooltip="Missing Relevance"
    class={tw(
      'bg-error-200 text-error-500 dark:bg-error-800 dark:bg-opacity-25 dark:text-error-600',
      class_,
    )}
  />
{:else}
  <Chip text={relevance.toString()} class={class_} />
{/if}
