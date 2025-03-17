<script lang="ts" module>
  type T = unknown
  type O = AutocompleteOption<T>
</script>

<script lang="ts" generics="T, O extends AutocompleteOption<T>">
  import { flip, offset } from '@floating-ui/dom'

  import { clickOutside } from '$lib/actions/clickOutside'
  import { createPopoverActions } from '$lib/actions/popover'
  import { getInputGroupErrors } from '$lib/atoms/InputGroup'
  import { cn, tw } from '$lib/utils/dom'

  import type { AutocompleteOption, AutocompleteProps } from './Autocomplete'
  import OptionsDropdown from './OptionsDropdown.svelte'

  let open = $state(false)
  let focusedIndex = $state(0)

  type Props = AutocompleteProps<T, O>

  let {
    value = $bindable(),
    options,
    id,
    placeholder,
    disabled = false,
    autofocus = false,
    class: class_,
    errors: propErrors,
    onInput,
    onSelect,
    option: optionSnippet,
  }: Props = $props()

  const contextErrors = getInputGroupErrors()
  let errors = $derived(propErrors ?? ($contextErrors && $contextErrors.length > 0))

  let inputRef: HTMLInputElement | undefined = $state()

  let lastIndex = $derived(options.length - 1)

  // prevent focusedIndex from being out of bounds
  $effect(() => {
    focusedIndex = Math.min(focusedIndex, lastIndex)
  })

  // reset focusedIndex when closing
  $effect(() => {
    if (!open) {
      focusedIndex = 0
    }
  })

  $effect(() => {
    if (value.length > 0) {
      open = true
    }
  })

  const handleSelect = (option: O) => {
    onSelect?.(option)
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
    <!-- svelte-ignore a11y_autofocus -->
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
      onkeydown={handleKeyDown}
      onclick={() => (open = true)}
      onfocus={() => (open = true)}
      oninput={(e) => onInput?.(e.currentTarget.value)}
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
      onSelect={({ option }) => {
        handleSelect(option)
        inputRef?.focus()
      }}
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
