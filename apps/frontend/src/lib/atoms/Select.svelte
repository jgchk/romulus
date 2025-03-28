<script lang="ts" module>
  export type T = string | number
</script>

<script lang="ts" generics="T">
  import { flip, offset } from '@floating-ui/dom'
  import { CaretDown } from 'phosphor-svelte'
  import { fade } from 'svelte/transition'

  import { clickOutside } from '$lib/actions/clickOutside'
  import { createPopoverActions } from '$lib/actions/popover'
  import { disableTransitionInUnitTests } from '$lib/transitions/utils'
  import { cn } from '$lib/utils/dom'

  import type { Option, SelectProps } from './Select'

  type Props = SelectProps<T>

  let {
    value = $bindable(undefined),
    options = [],
    placeholder = 'Select...',
    id = undefined,
    class: class_ = undefined,
    onChange,
  }: Props = $props()

  let selectedOption = $derived(options.find((option) => option.value === value))

  let open = $state(false)
  let hoveredIndex = $state(
    Math.max(
      options.findIndex((option) => option.value === value),
      0,
    ),
  )

  $effect(() => {
    if (!open) {
      hoveredIndex = Math.max(
        options.findIndex((option) => option.value === value),
        0,
      )
    }
  })

  const handleSelect = (option: Option<T>) => {
    value = option.value
    onChange?.(option)
    open = false
  }

  const [popoverReference, popoverElement] = createPopoverActions({
    middleware: [offset(4), flip()],
  })
</script>

<div
  data-testid="select-root"
  class={cn('relative', class_)}
  use:clickOutside={(e) => {
    if (open) {
      e.stopPropagation()
      open = false
    }
  }}
>
  <button
    {id}
    class="flex w-full items-center justify-between rounded border border-gray-300 bg-black bg-opacity-[0.04] px-2 py-1.5 text-left text-sm outline-none transition hover:bg-opacity-[0.07] focus:border-secondary-500 dark:border-gray-600 dark:bg-white dark:bg-opacity-5 dark:hover:bg-opacity-10"
    type="button"
    onclick={() => (open = !open)}
    onkeydown={(e) => {
      if (e.key === 'Tab') {
        open = false
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!open) {
          open = true
          return
        }
        hoveredIndex = (hoveredIndex - 1 + options.length) % options.length
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!open) {
          open = true
          return
        }
        hoveredIndex = (hoveredIndex + 1) % options.length
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!open) {
          open = true
          return
        }
        const option = options.at(hoveredIndex)
        if (option) {
          handleSelect(option)
        }
      }
    }}
    use:popoverReference
  >
    {#if value !== undefined}
      {#if selectedOption}
        {selectedOption.label}
      {:else}
        Unknown value
      {/if}
    {:else}
      <span class="text-gray-400 transition dark:text-gray-600">{placeholder}</span>
    {/if}

    <CaretDown size={14} class={cn('transition-transform', open && 'rotate-180 transform')} />
  </button>

  {#if open}
    <ul
      role="listbox"
      class="relative z-10 max-h-[calc(100vh/3)] w-full overflow-auto rounded border border-gray-300 bg-gray-100 p-1 text-sm text-black shadow transition dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      use:popoverElement
      transition:fade={{ duration: disableTransitionInUnitTests(75) }}
    >
      {#each options as option, i (option.value)}
        <li>
          <input
            type="button"
            role="option"
            tabindex="-1"
            class="absolute -left-[99999999px] -top-[99999999px]"
            value={option.value}
            aria-selected={option.value === value}
            onclick={() => handleSelect(option)}
            onmouseenter={() => (hoveredIndex = i)}
          />
          <button
            type="button"
            tabindex="-1"
            class={cn(
              'w-full rounded border border-transparent p-1 px-1.5 text-left transition',
              hoveredIndex === i && 'bg-gray-200 dark:bg-gray-700',
            )}
            onclick={() => handleSelect(option)}
            onmouseenter={() => (hoveredIndex = i)}
          >
            {option.label}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
