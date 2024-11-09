<script lang="ts">
  import { type ComponentProps, createEventDispatcher } from 'svelte'

  import Input from './Input.svelte'

  type $$Props = Omit<ComponentProps<typeof Input>, 'type' | 'value'> & {
    value: number | undefined
  }

  export let value: $$Props['value'] = undefined

  const dispatch = createEventDispatcher<{ input: $$Props['value'] }>()

  function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    const inputValue = event.currentTarget.value
    value = inputValue === '' ? undefined : Number(inputValue)
    dispatch('input', value)
  }
</script>

<Input type="number" value={value?.toString() ?? ''} onInput={handleInput} {...$$restProps} />
