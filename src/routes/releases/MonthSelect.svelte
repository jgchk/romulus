<script lang="ts">
  import { type ComponentProps, createEventDispatcher } from 'svelte'

  import type { Option } from '$lib/atoms/Select'
  import Select from '$lib/atoms/Select.svelte'

  type $$Props = Omit<ComponentProps<Select<number>>, 'options'>

  export let value: $$Props['value'] = undefined

  const options = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ]

  const dispatch = createEventDispatcher<{ change: Option<number> }>()
</script>

<Select bind:value {options} on:change={(e) => dispatch('change', e.detail)} {...$$restProps} />
