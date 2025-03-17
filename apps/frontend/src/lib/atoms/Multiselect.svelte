<script lang="ts" module>
  type InternalOption = Option<OptionData>
  type Value = InternalOption['value']
</script>

<script lang="ts" generics="InternalOption extends Option<OptionData>">
  import { flip, offset } from '@floating-ui/dom'
  import { CaretDown, DotsSixVertical, Trash } from 'phosphor-svelte'
  import { flip as flipAnimation } from 'svelte/animate'
  import {
    dragHandle,
    dragHandleZone,
    overrideItemIdKeyNameBeforeInitialisingDndZones,
  } from 'svelte-dnd-action'

  import { clickOutside } from '$lib/actions/clickOutside'
  import { createPopoverActions } from '$lib/actions/popover'
  import { tooltip } from '$lib/actions/tooltip'
  import { getInputGroupErrors } from '$lib/atoms/InputGroup'
  import { sortBy } from '$lib/utils/array'
  import { cn, tw } from '$lib/utils/dom'
  import { diceCoefficient } from '$lib/utils/string'

  import type { MultiselectProps, Option, OptionData } from './Multiselect'
  import OptionsDropdown from './OptionsDropdown.svelte'

  type Props = MultiselectProps<InternalOption>

  let {
    value = [],
    options = [],
    hasMore = false,
    open = false,
    filter = $bindable(''),
    virtual = false,
    focusedIndex = 0,
    id,
    placeholder,
    disabled = false,
    reorderable = false,
    class: class_,
    errors: propErrors,
    selected: selectedSnippet,
    option: optionSnippet,

    onLoadMore,
    onChange,
  }: Props = $props()

  const contextErrors = getInputGroupErrors()
  let errors = $derived(propErrors ?? ($contextErrors && $contextErrors.length > 0))

  let inputRef: HTMLInputElement | undefined

  let selectedValues = $derived(new Set<Value>(value.map((v) => v.value)))

  let isValueSelected = $derived((value: Value) => selectedValues.has(value))

  let filteredOptions = $derived(
    (virtual || !filter
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
    ).filter((option) => !isValueSelected(option.value)),
  )

  let lastIndex = $derived(hasMore ? filteredOptions.length : filteredOptions.length - 1)

  // prevent focusedIndex from being out of bounds
  $effect(() => {
    if (filteredOptions) {
      focusedIndex = Math.min(focusedIndex, lastIndex)
    }
  })

  // reset focusedIndex when closing
  $effect(() => {
    if (!open) {
      focusedIndex = 0
    }
  })

  const handleSelect = (option: InternalOption) => {
    filter = ''
    if (isValueSelected(option.value)) {
      handleRemove(option)
    } else {
      handleAdd(option)
    }
  }

  const handleAdd = (option: InternalOption) => {
    value = [...value, option]
    onChange?.(value)
  }

  const handleRemove = (option: InternalOption) => {
    value = value.filter((v) => v.value !== option.value)
    onChange?.(value)
  }

  function handleReorder(from: number, to: number) {
    const newValue = [...value]
    const [removed] = newValue.splice(from, 1)
    newValue.splice(to, 0, removed)
    value = newValue
    onChange?.(value)
  }

  const handleLoadMore = () => {
    onLoadMore?.()
  }

  $effect(() => {
    if (filter.length > 0) {
      open = true
    }
  })

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
        open = false
        return
      }

      event.preventDefault()
      handleAdd(focusedOption)
      filter = ''
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusedIndex = (focusedIndex + 1) % (lastIndex + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusedIndex = (focusedIndex - 1 + (lastIndex + 1)) % (lastIndex + 1)
    } else if (event.key === 'Backspace' && filter.length === 0 && value.length > 0) {
      event.preventDefault()
      handleRemove(value[value.length - 1])
    } else if (event.key === 'Escape') {
      if (open) {
        event.preventDefault()
        event.stopPropagation()
        open = false
      }
    }
  }

  const [popoverReference, popoverElement] = createPopoverActions({
    middleware: [offset(4), flip()],
  })

  try {
    overrideItemIdKeyNameBeforeInitialisingDndZones('value')
  } catch (e) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'message' in e &&
      e.message === 'can only override the id key before initialising any dndzone'
    ) {
      // ignore
    } else {
      throw e
    }
  }

  const flipDurationMs = 75
</script>

<div
  use:popoverReference
  data-invalid={errors}
  class={tw('relative', class_)}
  use:clickOutside={(e) => {
    if (open) {
      e.stopPropagation()
      open = false
    }
  }}
>
  <div
    class="flex rounded border border-gray-300 bg-black bg-opacity-[0.04] transition focus-within:border-secondary-500 hover:bg-opacity-[0.07] dark:border-gray-600 dark:bg-white dark:bg-opacity-5 dark:hover:bg-opacity-10"
  >
    {#if value.length > 0}
      <div
        class="flex items-center gap-1 pl-1"
        use:dragHandleZone={{
          items: value,
          flipDurationMs,
          dropTargetStyle: {},
          dropTargetClasses: ['rounded', 'outline', 'outline-1', 'outline-primary-500'],
        }}
        onconsider={(e) => {
          value = e.detail.items
        }}
        onfinalize={(e) => {
          value = e.detail.items
          onChange?.(value)
        }}
      >
        {#each value as v, index (v.value)}
          <div
            role="option"
            aria-selected="true"
            class="flex overflow-hidden rounded-[3px] border border-gray-400 bg-gray-300 text-xs font-medium transition hover:bg-opacity-75 dark:border-gray-600 dark:bg-gray-700"
            animate:flipAnimation={{ duration: flipDurationMs }}
            tabindex="-1"
            data-testId="multiselect__selected"
            ondragstart={(e) => {
              if (!e.dataTransfer) {
                console.error('Drag failed: dataTransfer is not available')
                return
              }

              e.dataTransfer?.setData('text/plain', index.toString())
            }}
            ondragover={(e) => {
              e.preventDefault()
            }}
            ondrop={(e) => {
              if (!e.dataTransfer) {
                console.error('Drop failed: dataTransfer is not available')
                return
              }

              e.preventDefault()
              const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
              handleReorder(fromIndex, index)
            }}
          >
            {#if reorderable}
              <div
                use:dragHandle
                aria-label="drag-handle for {v.label}"
                class="flex w-5 items-center justify-center border-r border-gray-400 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                use:tooltip={{ content: 'Drag to reorder' }}
              >
                <DotsSixVertical />
              </div>
            {/if}
            <div class="px-1.5 py-0.5" data-testId="multiselect__selected__label">
              {#if selectedSnippet}
                {@render selectedSnippet({ option: v })}
              {:else}
                <div class="text-nowrap">
                  {v.label}
                </div>
              {/if}
            </div>
            <button
              type="button"
              class="flex w-5 items-center justify-center border-l border-gray-400 transition hover:border-error-800 hover:bg-error-500 dark:border-gray-600 dark:text-gray-400 dark:hover:text-error-200"
              use:tooltip={{ content: 'Remove' }}
              aria-label="Remove {v.label}"
              onclick={() => {
                handleRemove(v)
                inputRef?.focus()
              }}
            >
              <Trash />
            </button>
          </div>
        {/each}
      </div>
    {/if}

    <input
      {id}
      class={cn(
        'flex-1 bg-transparent py-1.5 text-sm text-black outline-none transition dark:text-white',
        value.length > 0 ? 'pl-1' : 'pl-2',
      )}
      placeholder={value.length === 0 ? placeholder : undefined}
      type="text"
      autocomplete="off"
      bind:value={filter}
      onkeydown={handleKeyDown}
      onclick={() => (open = true)}
      onfocus={() => (open = true)}
      bind:this={inputRef}
      {disabled}
    />

    <button
      class="px-2"
      type="button"
      tabindex="-1"
      onclick={(e) => {
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

  {#if open}
    <OptionsDropdown
      options={filteredOptions}
      {popoverElement}
      bind:focusedIndex
      {hasMore}
      onSelect={({ option }) => {
        handleSelect(option)
        inputRef?.focus()
      }}
      onLoadMore={() => handleLoadMore()}
    >
      {#snippet option({ option })}
        {#if optionSnippet}
          {@render optionSnippet({ option })}
        {:else}
          {option.label}
        {/if}
      {/snippet}
    </OptionsDropdown>
  {/if}
</div>
