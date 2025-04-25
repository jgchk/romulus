<script lang="ts">
  import { type Snippet } from 'svelte'

  import { isFullyVisible, tw } from '$lib/utils/dom'

  import { getSelectState } from './SelectState.svelte'

  let { value, children }: { value: string; children?: Snippet } = $props()

  const selectState = getSelectState()

  let ref = $state<HTMLElement | null>(null)
  let isFocused = $derived(selectState.focusedValue === value)
  let isSelected = $derived(selectState.value.current === value)

  $effect(() => {
    if (isFocused && ref !== null && selectState.optionsRef !== null) {
      const visible = isFullyVisible(ref, selectState.optionsRef)
      if (!visible) {
        ref?.scrollIntoView({ behavior: 'auto', block: 'nearest' })
      }
    }
  })
</script>

<button
  role="option"
  aria-selected={isSelected}
  {value}
  type="button"
  class={tw(
    'multiselect-option block w-full rounded border border-transparent p-1 px-1.5 text-left transition hover:bg-gray-200 dark:hover:bg-gray-700',
    isFocused && 'border-secondary-500',
  )}
  tabindex="-1"
  bind:this={ref}
  onmouseenter={() => {
    selectState.focusedValue = value
  }}
  onclick={() => {
    selectState.value.current = value
    selectState.close()
  }}
  data-value={value}
  data-testId="multiselect__option"
>
  {@render children?.()}
</button>
