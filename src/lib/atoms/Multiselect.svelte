<script lang="ts" context="module">
  type InternalOption = Option<OptionData>
  type Value = InternalOption['value']
</script>

<script lang="ts" generics="InternalOption extends Option<OptionData>">
  import { flip, offset } from '@floating-ui/dom'
  import { CaretDown } from 'phosphor-svelte'
  import { createEventDispatcher } from 'svelte'

  import { clickOutside } from '$lib/actions/clickOutside'
  import { createPopoverActions } from '$lib/actions/popover'
  import { tooltip } from '$lib/actions/tooltip'
  import { getInputGroupErrors } from '$lib/atoms/InputGroup'
  import { sortBy } from '$lib/utils/array'
  import { cn, tw } from '$lib/utils/dom'
  import { diceCoefficient } from '$lib/utils/string'

  import type { MultiselectProps, Option, OptionData } from './Multiselect'
  import OptionsDropdown from './OptionsDropdown.svelte'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type $$Slots = {
    default: never
    selected: { option: InternalOption }
    option: { option: InternalOption }
  }

  type $$Props = MultiselectProps<InternalOption>

  export let value: NonNullable<$$Props['value']> = []
  export let options: NonNullable<$$Props['options']> = []
  export let hasMore = false
  export let open = false
  export let filter = ''
  export let virtual = false
  export let focusedIndex = 0
  export let id: $$Props['id'] = undefined
  export let placeholder: $$Props['placeholder'] = undefined
  export let disabled = false

  let class_: $$Props['class'] = undefined
  export { class_ as class }

  let propErrors: string[] | undefined = undefined
  export { propErrors as errors }
  const contextErrors = getInputGroupErrors()
  $: errors = propErrors ?? ($contextErrors && $contextErrors.length > 0)

  let inputRef: HTMLInputElement | undefined

  $: selectedValues = new Set<Value>(value.map((v) => v.value))

  $: isValueSelected = (value: Value) => selectedValues.has(value)

  $: filteredOptions = (
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
  ).filter((option) => !isValueSelected(option.value))

  $: lastIndex = hasMore ? filteredOptions.length : filteredOptions.length - 1

  // prevent focusedIndex from being out of bounds
  $: if (filteredOptions) {
    focusedIndex = Math.min(focusedIndex, lastIndex)
  }

  // reset focusedIndex when closing
  $: if (!open) {
    focusedIndex = 0
  }

  const dispatch = createEventDispatcher<{
    loadMore: undefined
    change: { value: InternalOption[] }
  }>()

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
    dispatch('change', { value })
  }

  const handleRemove = (option: InternalOption) => {
    value = value.filter((v) => v.value !== option.value)
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
      <div class="flex items-center gap-1 pl-1">
        {#each value as v (v.value)}
          <button
            type="button"
            class="rounded-[3px] border border-gray-400 bg-gray-300 px-1.5 py-0.5 text-xs font-medium transition hover:border-error-800 hover:bg-error-500 hover:bg-opacity-75 dark:border-gray-600 dark:bg-gray-700"
            use:tooltip={{ content: 'Remove' }}
            on:click={() => {
              handleRemove(v)
              inputRef?.focus()
            }}
            tabindex="-1"
            data-testId="multiselect__selected"
          >
            {#if $$slots.selected}
              <slot name="selected" option={v} />
            {:else}
              <div>
                {v.label}
              </div>
            {/if}
          </button>
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
      on:keydown={handleKeyDown}
      on:click={() => (open = true)}
      on:focus={() => (open = true)}
      on:blur
      bind:this={inputRef}
      {disabled}
    />

    <button
      class="px-2"
      type="button"
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

  {#if open}
    <OptionsDropdown
      options={filteredOptions}
      {popoverElement}
      bind:focusedIndex
      {hasMore}
      on:select={({ detail: { option } }) => {
        handleSelect(option)
        inputRef?.focus()
      }}
      on:loadMore={() => handleLoadMore()}
    >
      <svelte:fragment slot="option" let:option>
        <slot name="option" {option} />
      </svelte:fragment>
    </OptionsDropdown>
  {/if}
</div>
