<script lang="ts">
  import { onDestroy } from 'svelte'

  import { createSelectHandleKeyDown, getSelectState } from './SelectState.svelte'

  let { value: value_ = $bindable(''), placeholder }: { value?: string; placeholder?: string } =
    $props()

  const selectState = getSelectState()

  $effect(() => {
    value_ = selectState.filter
  })

  onDestroy(() => {
    value_ = selectState.filter
  })
</script>

<input
  class="w-full border-b bg-transparent py-1.5 pl-1 text-sm text-black outline-none transition dark:border-gray-700 dark:text-white"
  placeholder={placeholder ?? 'Search...'}
  type="text"
  autocomplete="off"
  value={value_}
  oninput={(e) => {
    value_ = e.currentTarget.value
    selectState.filter = e.currentTarget.value
  }}
  onkeydown={createSelectHandleKeyDown(selectState)}
  onclick={() => {
    selectState.open = true
  }}
  onfocus={() => {
    selectState.open = true
  }}
  bind:this={selectState.inputRef}
  disabled={selectState.disabled.current}
/>
