<script lang="ts">
  import { Trash } from 'phosphor-svelte'
  import type { Snippet } from 'svelte'

  import { tooltip } from '$lib/actions/tooltip'

  import { getSelectState } from './SelectState.svelte'

  let { children }: { children?: Snippet } = $props()

  const selectState = getSelectState()
</script>

<div
  role="option"
  aria-selected="true"
  class="flex overflow-hidden rounded-[3px] border border-gray-400 bg-gray-300 text-xs font-medium transition hover:bg-opacity-75 dark:border-gray-600 dark:bg-gray-700"
  tabindex="-1"
  data-testId="multiselect__selected"
>
  <div class="text-nowrap px-1.5 py-0.5" data-testId="multiselect__selected__label ">
    {@render children?.()}
  </div>
  <button
    type="button"
    class="flex w-5 items-center justify-center border-l border-gray-400 transition hover:border-error-800 hover:bg-error-500 dark:border-gray-600 dark:text-gray-400 dark:hover:text-error-200"
    use:tooltip={{ content: 'Remove' }}
    aria-label="Remove item"
    onclick={() => {
      selectState.value.current = undefined
      selectState.inputRef?.focus()
    }}
  >
    <Trash />
  </button>
</div>
