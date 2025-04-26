<script lang="ts">
  import type { Snippet } from 'svelte'

  import { tw } from '$lib/utils/dom'

  let {
    isFocused,
    onClick,
    onMouseEnter,
    children,
  }: { isFocused: boolean; onClick?: () => void; onMouseEnter?: () => void; children?: Snippet } =
    $props()
</script>

<button
  type="button"
  class={tw(
    'block w-full rounded border border-transparent p-1 px-1.5 text-left transition hover:bg-gray-200 dark:hover:bg-gray-700',
    isFocused && 'border-secondary-500',
  )}
  tabindex="-1"
  onclick={() => onClick?.()}
  onmouseenter={() => onMouseEnter?.()}
  data-testId="multiselect__option"
>
  {@render children?.()}
</button>
