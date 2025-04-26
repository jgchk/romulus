<script lang="ts">
  import type { ComponentProps } from 'svelte'

  import Input from './Input.svelte'

  type Props = Omit<ComponentProps<typeof Input>, 'type' | 'value' | 'onInput'> & {
    value: number | undefined
    onInput?: (value: number | undefined) => void
  }

  let { value = $bindable(undefined), onInput, ...rest }: Props = $props()

  function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    const inputValue = event.currentTarget.value
    value = inputValue === '' ? undefined : Number(inputValue)
    onInput?.(value)
  }
</script>

<Input type="number" value={value?.toString() ?? ''} onInput={handleInput} {...rest} />
