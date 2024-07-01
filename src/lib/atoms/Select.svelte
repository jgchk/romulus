<script lang="ts" context="module">
  type InternalOption = Option<OptionData>
</script>

<script lang="ts" generics="InternalOption extends Option<OptionData>">
  import { flip, offset } from '@floating-ui/dom'
  import { CaretDown } from 'phosphor-svelte'
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'

  import { clickOutside } from '$lib/actions/clickOutside'
  import { createPopoverActions } from '$lib/actions/popover'
  import { sortBy } from '$lib/utils/array'
  import { cn, tw } from '$lib/utils/dom'
  import { diceCoefficient } from '$lib/utils/string'

  import { getInputGroupErrors } from './InputGroup'
  import type { Option, OptionData } from './Select'

  export let filterable = false
  export let value: InternalOption | undefined = undefined
  export let options: InternalOption[] = []
  export let hasMore = false
  export let open = false
  export let filter = ''
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  export let displayFilter = value?.label ?? ''
  export let virtual = false
  export let disabled = false
  export let focusedIndex = 0
  export let id: string | undefined = undefined
  let class_: string | undefined = undefined
  export { class_ as class }
  export let placeholder: string | undefined = undefined
  export let closeOnSelect = true

  let propErrors: string[] | undefined = undefined
  export { propErrors as errors }
  const contextErrors = getInputGroupErrors()
  $: errors = propErrors || ($contextErrors && $contextErrors.length > 0)

  let inputRef: HTMLInputElement | undefined
  let triggerButton: HTMLButtonElement | undefined

  $: if (!open) {
    displayFilter = value?.label ?? ''
  }

  $: filteredOptions =
    virtual || !filter
      ? options
      : sortBy(
          options,
          (option) => option.label,
          (a, b) => {
            if (filter.length === 1) {
              return a.toLowerCase().startsWith(filter.toLowerCase()) ? -1 : 1
            } else {
              return diceCoefficient(b, filter) - diceCoefficient(a, filter)
            }
          },
        )

  $: lastIndex = hasMore ? filteredOptions.length : filteredOptions.length - 1

  // prevent focusedIndex from being out of bounds
  $: filteredOptions && (focusedIndex = Math.min(focusedIndex, lastIndex))

  // reset focusedIndex when closing
  $: !open && (focusedIndex = 0)

  const dispatch = createEventDispatcher<{
    loadMore: undefined
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    change: { value: InternalOption | undefined }
  }>()

  const handleSelect = (option: InternalOption) => {
    if (closeOnSelect) {
      open = false
    } else {
      inputRef?.focus()
    }

    value = option
    filter = ''
    displayFilter = option.label
    dispatch('change', { value })
  }

  const handleLoadMore = () => {
    dispatch('loadMore')
  }

  $: if (filter.length > 0) {
    open = true
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      open = false
    } else if (event.key === 'Enter') {
      if (!open) {
        event.preventDefault()
        open = true
        return
      }

      // if user is focused on the load more button, load more
      if (focusedIndex === filteredOptions.length) {
        handleLoadMore()
        return
      }

      // otherwise, add the focused option
      const focusedOption = filteredOptions[focusedIndex]
      if (focusedOption === undefined) {
        if (closeOnSelect) {
          open = false
        }
        return
      }

      event.preventDefault()
      handleSelect(focusedOption)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      open = true
      focusedIndex = (focusedIndex + 1) % (lastIndex + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      open = true
      focusedIndex = (focusedIndex - 1 + lastIndex + 1) % (lastIndex + 1)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      handleCancel()
    }
  }

  const handleCancel = () => {
    open = false
    filter = ''
    displayFilter = value?.label ?? ''
  }

  const [popoverReference, popoverElement] = createPopoverActions({
    middleware: [offset(4), flip()],
  })
</script>

<svelte:window
  on:keydown={(e) => {
    if (!filterable && (open || document.activeElement === triggerButton)) {
      handleKeyDown(e)
    }
  }}
/>

<div
  use:popoverReference
  data-invalid={errors}
  class={tw('select relative w-56', class_)}
  use:clickOutside={(e) => {
    if (open) {
      e.stopPropagation()
      handleCancel()
    }
  }}
>
  {#if filterable}
    <div
      class="flex rounded border border-gray-300 bg-black bg-opacity-[0.04] transition focus-within:border-secondary-500 hover:bg-opacity-[0.07] dark:border-gray-600 dark:bg-white dark:bg-opacity-5 dark:hover:bg-opacity-10"
    >
      <input
        {id}
        class="w-0 flex-1 bg-transparent p-1.5 px-2 text-sm text-black outline-none transition dark:text-white"
        {disabled}
        {placeholder}
        type="text"
        value={displayFilter}
        autocomplete="off"
        on:input={(event) => {
          displayFilter = event.currentTarget.value
          filter = event.currentTarget.value
        }}
        on:focus={() => (open = true)}
        on:click={() => (open = true)}
        bind:this={inputRef}
        on:keydown={handleKeyDown}
        on:blur
      />

      <button
        class="px-2"
        type="button"
        {disabled}
        tabindex="-1"
        on:click={(e) => {
          e.currentTarget.blur()
          open = !open
          if (open) {
            inputRef?.focus()
          }
        }}
      >
        <CaretDown size={14} class={cn('transition-transform', open && 'rotate-180 transform')} />
      </button>
    </div>
  {:else}
    <button
      {id}
      type="button"
      class="flex w-full items-center justify-between rounded border border-gray-300 bg-black bg-opacity-[0.04] p-1.5 px-2 text-left text-sm text-black outline-none transition hover:bg-opacity-[0.07] focus:border-secondary-500 dark:border-gray-600 dark:bg-white dark:bg-opacity-5 dark:text-white dark:hover:bg-opacity-10"
      on:click={() => (open = !open)}
      bind:this={triggerButton}
    >
      <span>
        {#if value !== undefined}
          {value.label}
        {:else}
          {placeholder}
        {/if}
      </span>
      <CaretDown size={14} class={cn('transition-transform', open && 'rotate-180 transform')} />
    </button>
  {/if}

  {#if open}
    <div
      role="listbox"
      class="select__list relative z-10 max-h-[calc(100vh/3)] w-full overflow-auto rounded border border-gray-300 bg-gray-100 p-1 text-sm text-black shadow transition dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      transition:fade={{ duration: 75 }}
      tabindex="-1"
      on:keydown={handleKeyDown}
      use:popoverElement
    >
      {#if filteredOptions.length === 0}
        <div class="select-none px-2 py-1 text-gray-700 transition dark:text-gray-300">
          No results
        </div>
      {:else}
        {#each filteredOptions as option, i}
          <button
            type="button"
            class={tw(
              'block w-full rounded border border-transparent p-1 px-1.5 text-left transition hover:bg-gray-200 dark:hover:bg-gray-700',
              option.value === value?.value && 'border-primary-500',
              focusedIndex === i && 'border-secondary-500',
            )}
            tabindex="-1"
            on:click={() => {
              handleSelect(option)
            }}
            on:mouseenter={() => (focusedIndex = i)}
          >
            {option.label}
          </button>
        {/each}
      {/if}

      {#if hasMore}
        <button
          type="button"
          class={tw(
            'block w-full rounded border border-transparent p-1 px-1.5 text-left transition hover:bg-gray-200 dark:hover:bg-gray-700',
            focusedIndex === filteredOptions.length && 'border-secondary-500',
          )}
          tabindex="-1"
          on:click={() => handleLoadMore()}
          on:mouseenter={() => (focusedIndex = filteredOptions.length)}
        >
          Load More...
        </button>
      {/if}
    </div>
  {/if}
</div>
