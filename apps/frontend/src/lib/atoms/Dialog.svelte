<script lang="ts">
  import type { Snippet } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import type { AriaRole } from 'svelte/elements'
  import { fade, scale } from 'svelte/transition'

  import { trapFocus } from '$lib/actions/trapFocus'
  import { disableTransitionInUnitTests } from '$lib/transitions/utils'
  import { tw } from '$lib/utils/dom'

  type Props = {
    title?: string
    role?: AriaRole
    class?: string
    children?: Snippet
    buttons?: Snippet
  }

  let { title, role = 'dialog', class: class_, children, buttons }: Props = $props()

  const dispatch = createEventDispatcher<{ close: undefined }>()
  const close = () => dispatch('close')

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    }
  }
</script>

<div {role} class="fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-sm">
  <button
    aria-label="Close dialog"
    type="button"
    class="absolute h-full w-full cursor-default bg-black opacity-50"
    onclick={close}
    transition:fade={{ duration: disableTransitionInUnitTests(125) }}
    tabindex="-1"
  ></button>

  <div
    class={tw(
      'relative flex max-h-full w-full max-w-md flex-col rounded-lg border border-gray-200 bg-gray-100 shadow-lg dark:border-gray-700 dark:bg-gray-800',
      class_,
    )}
    transition:scale={{ start: 0.95, duration: disableTransitionInUnitTests(125) }}
    use:trapFocus
  >
    {#if title !== undefined}
      <h2 class="p-4 pb-0 text-lg font-semibold">{title}</h2>
    {/if}
    {#if children}
      <div class="flex-1 overflow-auto p-4">
        {@render children?.()}
      </div>
    {/if}
    {#if buttons}
      <div class="flex gap-1 p-4 pt-2">
        {@render buttons?.()}
      </div>
    {/if}
  </div>
</div>

<svelte:window onkeydown={handleKeyDown} />
