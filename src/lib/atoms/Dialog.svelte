<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { AriaRole } from 'svelte/elements'
  import { fade, scale } from 'svelte/transition'

  import { trapFocus } from '$lib/actions/trapFocus'
  import { tw } from '$lib/utils/dom'

  export let title: string | undefined = undefined
  export let role: AriaRole | undefined = 'dialog'

  let class_: string | undefined = undefined
  export { class_ as class }

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
    on:click={close}
    transition:fade={{ duration: 125 }}
    tabindex="-1"
  ></button>

  <div
    class={tw(
      'relative flex max-h-full w-full max-w-md flex-col rounded-lg border border-gray-200 bg-gray-100 shadow-lg dark:border-gray-700 dark:bg-gray-800',
      class_,
    )}
    transition:scale={{ start: 0.95, duration: 125 }}
    use:trapFocus
  >
    {#if title !== undefined}
      <h2 class="p-4 pb-0 text-lg font-semibold">{title}</h2>
    {/if}
    {#if $$slots.default}
      <div class="flex-1 overflow-auto p-4">
        <slot />
      </div>
    {/if}
    {#if $$slots.buttons}
      <div class="flex gap-1 p-4 pt-2">
        <slot name="buttons" />
      </div>
    {/if}
  </div>
</div>

<svelte:window on:keydown={handleKeyDown} />
