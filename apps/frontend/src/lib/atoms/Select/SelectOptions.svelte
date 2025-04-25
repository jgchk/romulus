<script lang="ts">
  import { type Snippet } from 'svelte'
  import { fade } from 'svelte/transition'

  import { disableTransitionInUnitTests } from '$lib/transitions/utils'
  import { cn } from '$lib/utils/dom'

  import Portal from '../Portal.svelte'
  import { getSelectState } from './SelectState.svelte'

  let { children }: { children?: Snippet } = $props()

  const selectState = getSelectState()

  const popoverElement = selectState.popoverElement
</script>

{#if selectState.open}
  <Portal>
    <div
      role="listbox"
      class={cn(
        'z-10 max-h-[calc(100vh/3)] overflow-auto rounded border border-gray-300 bg-gray-100 p-1 text-sm text-black shadow transition dark:border-gray-600 dark:bg-gray-800 dark:text-white',
        selectState.optionsClassname,
      )}
      transition:fade={{ duration: disableTransitionInUnitTests(75) }}
      onintroend={() => {
        selectState.inputRef?.focus()
      }}
      tabindex="-1"
      use:popoverElement
      bind:this={selectState.optionsRef}
    >
      {@render children?.()}
      {#if selectState.options.current.length === 0}
        <div class="mt-1 select-none px-2 py-1 text-gray-700 transition dark:text-gray-300">
          No results
        </div>
      {/if}
    </div>
  </Portal>
{/if}
