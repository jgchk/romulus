<script lang="ts">
  import { CaretDown } from 'phosphor-svelte'
  import { type Snippet } from 'svelte'

  import { cn } from '$lib/utils/dom'

  import { createSelectHandleKeyDown, getSelectState } from './SelectState.svelte'

  let { id, children }: { id?: string; children?: Snippet } = $props()

  const selectState = getSelectState()
</script>

<button
  type="button"
  {id}
  class="flex w-full items-center rounded border border-gray-300 bg-black bg-opacity-[0.04] outline-none transition hover:bg-opacity-[0.07] focus:border-secondary-500 dark:border-gray-600 dark:bg-white dark:bg-opacity-5 dark:hover:bg-opacity-10"
  onclick={() => {
    const open = !selectState.open

    selectState.open = open
    if (open) {
      selectState.inputRef?.focus()
    }
  }}
  bind:this={selectState.triggerRef}
  onkeydown={createSelectHandleKeyDown(selectState)}
>
  <div
    class={cn(
      'flex-1 px-2 py-1.5 text-left text-sm',
      selectState.value.current === undefined && 'text-gray-400',
    )}
  >
    {@render children?.()}
    <span class="invisible">-</span>
  </div>

  <div class="px-2">
    <CaretDown
      size={14}
      class={cn('transition-transform', selectState.open && 'rotate-180 transform')}
    />
  </div>
</button>
