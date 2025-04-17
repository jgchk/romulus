<script lang="ts">
  import { CaretDown } from 'phosphor-svelte'
  import type { Snippet } from 'svelte'

  import { cn } from '$lib/utils/dom'

  import { getMultiselectState } from './MultiselectState.svelte'

  let { children }: { children?: Snippet } = $props()

  const multiselectState = getMultiselectState()
</script>

<div
  class="flex rounded border border-gray-300 bg-black bg-opacity-[0.04] transition focus-within:border-secondary-500 hover:bg-opacity-[0.07] dark:border-gray-600 dark:bg-white dark:bg-opacity-5 dark:hover:bg-opacity-10"
>
  <div class="flex flex-1 flex-wrap items-center gap-1 p-1 pr-0">
    {@render children?.()}
  </div>

  <button
    class="px-2"
    type="button"
    tabindex="-1"
    onclick={(e) => {
      e.currentTarget.blur()

      const open = !multiselectState.open

      multiselectState.open = open
      if (open) {
        multiselectState.inputRef?.focus()
      }
    }}
  >
    <CaretDown
      size={14}
      class={cn('transition-transform', multiselectState.open && 'rotate-180 transform')}
    />
  </button>
</div>
