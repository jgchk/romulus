<script lang="ts">
  import { type ComponentProps, createEventDispatcher } from 'svelte'

  import type { Option } from '$lib/atoms/Select'
  import Select from '$lib/atoms/Select.svelte'

  type Opt = Option<{ value: number }>

  interface $$Props extends Omit<ComponentProps<Select<Opt>>, 'value' | 'options'> {
    value?: number
  }

  export let value: $$Props['value'] = undefined

  const options = [10, 20, 30, 40, 50].map((value) => ({ value, label: `Show ${value}` }))

  const valueOption = options.find((o) => o.value === value)

  const dispatch = createEventDispatcher<{
    change: { value: number | undefined }
  }>()
</script>

<Select
  value={valueOption}
  {options}
  on:change={(e) => {
    value = e.detail.value?.value
    dispatch('change', { value })
  }}
  on:blur
  {...$$restProps}
/>
