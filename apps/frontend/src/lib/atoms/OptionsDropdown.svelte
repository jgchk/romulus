<script lang="ts" module>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type O = { value: unknown; label: string }
</script>

<script lang="ts" generics="Option extends O">
  import type { Snippet } from 'svelte'
  import { fade } from 'svelte/transition'

  import type { Action } from '$lib/actions/types'
  import { disableTransitionInUnitTests } from '$lib/transitions/utils'
  import { tw } from '$lib/utils/dom'

  type Props = {
    options: Option[] | Promise<Option[]>
    popoverElement: Action
    focusedIndex: number
    hasMore?: boolean
    option?: Snippet<[{ option: Option }]>
    onSelect?: (data: { option: Option; i: number }) => void
    onLoadMore?: () => void
  }

  let {
    options,
    popoverElement,
    focusedIndex = $bindable(),
    hasMore = false,
    option: optionSnippet,
    onSelect,
    onLoadMore,
  }: Props = $props()
</script>

<div
  role="listbox"
  class="relative z-10 max-h-[calc(100vh/3)] w-full overflow-auto rounded border border-gray-300 bg-gray-100 p-1 text-sm text-black shadow transition dark:border-gray-600 dark:bg-gray-800 dark:text-white"
  transition:fade={{ duration: disableTransitionInUnitTests(75) }}
  tabindex="-1"
  use:popoverElement
>
  {#await options}
    <div>Loading...</div>
  {:then options}
    {#if options.length === 0}
      <div class="select-none px-2 py-1 text-gray-700 transition dark:text-gray-300">
        No results
      </div>
    {:else}
      {#each options as option, i (option.value)}
        <button
          type="button"
          class={tw(
            'block w-full rounded border border-transparent p-1 px-1.5 text-left transition hover:bg-gray-200 dark:hover:bg-gray-700',
            focusedIndex === i && 'border-secondary-500',
          )}
          tabindex="-1"
          onclick={() => onSelect?.({ option, i })}
          onmouseenter={() => (focusedIndex = i)}
          data-testId="multiselect__option"
        >
          {#if optionSnippet}
            {@render optionSnippet({ option })}
          {:else}
            {option.label}
          {/if}
        </button>
      {/each}

      {#if hasMore}
        <button
          type="button"
          class={tw(
            'block w-full rounded border border-transparent p-1 px-1.5 text-left transition hover:bg-gray-200 dark:hover:bg-gray-700',
            focusedIndex === options.length && 'border-secondary-500',
          )}
          tabindex="-1"
          onclick={() => onLoadMore?.()}
          onmouseenter={() => (focusedIndex = options.length)}
        >
          Load More...
        </button>
      {/if}
    {/if}
    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
  {:catch error}
    <div>Error: Failed to load options</div>
  {/await}
</div>
