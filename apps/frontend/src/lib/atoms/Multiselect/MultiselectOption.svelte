<script lang="ts">
  import type { Snippet } from 'svelte'

  import { isFullyVisible, tw } from '$lib/utils/dom'

  import { getMultiselectState } from './MultiselectState.svelte'

  let { value, children }: { value: string; children?: Snippet } = $props()

  const multiselectState = getMultiselectState()

  let ref = $state<HTMLElement | null>(null)
  let isFocused = $derived(multiselectState.focusedValue === value)

  $effect(() => {
    if (isFocused && ref !== null && multiselectState.optionsRef !== null) {
      const visible = isFullyVisible(ref, multiselectState.optionsRef)
      if (!visible) {
        ref?.scrollIntoView({ behavior: 'auto', block: 'nearest' })
      }
    }
  })
</script>

<button
  type="button"
  class={tw(
    'multiselect-option block w-full rounded border border-transparent p-1 px-1.5 text-left transition hover:bg-gray-200 dark:hover:bg-gray-700',
    isFocused && 'border-secondary-500',
  )}
  tabindex="-1"
  bind:this={ref}
  onmouseenter={() => {
    multiselectState.focusedValue = value
  }}
  onclick={() => {
    multiselectState.selectValue(value)
    multiselectState.filter = ''
    multiselectState.inputRef?.focus()
  }}
  data-value={value}
  data-testId="multiselect__option"
>
  {@render children?.()}
</button>
