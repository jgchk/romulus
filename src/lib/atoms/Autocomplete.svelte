<script lang="ts" context="module">
  type T = unknown
  type O = AutocompleteOption<T>
</script>

<script lang="ts" generics="T, O extends AutocompleteOption<T>">
  import { flip, offset } from '@floating-ui/dom'
  import { createEventDispatcher } from 'svelte'

  import { clickOutside } from '$lib/actions/clickOutside'
  import { createPopoverActions } from '$lib/actions/popover'
  import { getInputGroupErrors } from '$lib/atoms/InputGroup'
  import { cn, tw } from '$lib/utils/dom'

  import type { AutocompleteOption, AutocompleteProps } from './Autocomplete'
  import OptionsDropdown from './OptionsDropdown.svelte'

  type $$Props = AutocompleteProps<T, O>

  export let value: $$Props['value']
  export let options: $$Props['options']
  export let id: $$Props['id'] = undefined
  export let placeholder: $$Props['placeholder'] = undefined
  export let disabled: $$Props['disabled'] = false
  export let autofocus: $$Props['autofocus'] = false

  let class_: $$Props['class'] = undefined
  export { class_ as class }

  let open = false
  let focusedIndex = 0

  let propErrors: string[] | undefined = undefined
  export { propErrors as errors }
  const contextErrors = getInputGroupErrors()
  $: errors = propErrors ?? ($contextErrors && $contextErrors.length > 0)

  let inputRef: HTMLInputElement | undefined

  $: lastIndex = options.length - 1

  // prevent focusedIndex from being out of bounds
  $: focusedIndex = Math.min(focusedIndex, lastIndex)

  // reset focusedIndex when closing
  $: if (!open) {
    focusedIndex = 0
  }

  $: if (value.length > 0) {
    open = true
  }

  const dispatch = createEventDispatcher<{
    input: { value: string }
    select: { option: O }
  }>()

  const handleSelect = (option: O) => {
    dispatch('select', { option })
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

      const focusedOption = options[focusedIndex]
      if (focusedOption === undefined) {
        open = false
        return
      }

      event.preventDefault()
      handleSelect(focusedOption)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusedIndex = (focusedIndex + 1) % (lastIndex + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusedIndex = (focusedIndex - 1 + (lastIndex + 1)) % (lastIndex + 1)
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
    <!-- svelte-ignore a11y-autofocus -->
    <input
      {id}
      class={cn(
        'flex-1 bg-transparent py-1.5 text-sm text-black outline-none transition dark:text-white',
        value.length > 0 ? 'pl-1' : 'pl-2',
      )}
      placeholder={value.length === 0 ? placeholder : undefined}
      type="text"
      autocomplete="off"
      bind:value
      on:keydown={handleKeyDown}
      on:click={() => (open = true)}
      on:focus={() => (open = true)}
      on:blur
      on:input={(e) => dispatch('input', { value: e.currentTarget.value })}
      bind:this={inputRef}
      {disabled}
      {autofocus}
    />
  </div>

  {#if open}
    <OptionsDropdown
      {options}
      {popoverElement}
      bind:focusedIndex
      on:select={({ detail: { option } }) => {
        handleSelect(option)
        inputRef?.focus()
      }}
    />
  {/if}
</div>
