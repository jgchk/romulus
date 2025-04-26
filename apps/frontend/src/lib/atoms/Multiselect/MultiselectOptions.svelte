<script lang="ts">
  import type { Snippet } from 'svelte'
  import { fade } from 'svelte/transition'

  import { disableTransitionInUnitTests } from '$lib/transitions/utils'
  import { cn } from '$lib/utils/dom'

  import Portal from '../Portal.svelte'
  import { getMultiselectState } from './MultiselectState.svelte'

  let { children }: { children?: Snippet } = $props()

  const multiselectState = getMultiselectState()

  const popoverElement = multiselectState.popoverElement
</script>

{#if multiselectState.open}
  <Portal>
    <div
      role="listbox"
      class={cn(
        'z-10 max-h-[calc(100vh/3)] overflow-auto rounded border border-gray-300 bg-gray-100 p-1 text-sm text-black shadow transition dark:border-gray-600 dark:bg-gray-800 dark:text-white',
        multiselectState.optionsClassname,
      )}
      transition:fade={{ duration: disableTransitionInUnitTests(75) }}
      tabindex="-1"
      use:popoverElement
      bind:this={multiselectState.optionsRef}
    >
      {#if multiselectState.options.current.length > 0}
        {@render children?.()}
      {:else}
        <div class="select-none px-2 py-1 text-gray-700 transition dark:text-gray-300">
          No results
        </div>
      {/if}
    </div>
  </Portal>
{/if}
