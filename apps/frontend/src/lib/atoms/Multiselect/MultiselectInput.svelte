<script lang="ts">
  import { writableBoxWith } from '$lib/runes/box.svelte'

  import { getMultiselectState } from './MultiselectState.svelte'

  let {
    value: value_ = $bindable(''),
    id,
    placeholder,
  }: { value?: string; id?: string; placeholder?: string } = $props()

  const multiselectState = getMultiselectState()

  const value = writableBoxWith(
    () => value_,
    (v) => {
      value_ = v
      multiselectState.filter = v
    },
  )

  $effect(() => {
    value.current = multiselectState.filter
  })

  function handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Tab': {
        multiselectState.open = false
        return
      }

      case 'Enter': {
        if (!multiselectState.open) {
          event.preventDefault()
          multiselectState.open = true
          return
        }

        const focusedValue = multiselectState.focusedValue
        if (focusedValue === undefined) {
          multiselectState.open = false
          return
        }

        event.preventDefault()
        multiselectState.selectValue(focusedValue)
        value.current = ''

        return
      }

      case 'ArrowDown': {
        event.preventDefault()
        multiselectState.focusNextValue()
        return
      }

      case 'ArrowUp': {
        event.preventDefault()
        multiselectState.focusPreviousValue()
        return
      }

      case 'Backspace': {
        if (value.current.length === 0 && multiselectState.value.current.length > 0) {
          event.preventDefault()
          multiselectState.deselectLastValue()
        }
        return
      }

      case 'Escape': {
        if (multiselectState.open) {
          event.preventDefault()
          event.stopPropagation()
          multiselectState.open = false
        }
        return
      }
    }
  }
</script>

<input
  {id}
  class="-my-1 flex-1 bg-transparent py-1.5 pl-1 text-sm text-black outline-none transition dark:text-white"
  placeholder={multiselectState.value.current.length === 0 ? placeholder : undefined}
  type="text"
  autocomplete="off"
  bind:value={value.current}
  onkeydown={handleKeyDown}
  onclick={() => {
    multiselectState.open = true
  }}
  onfocus={() => {
    multiselectState.open = true
  }}
  bind:this={multiselectState.inputRef}
  disabled={multiselectState.disabled.current}
/>
