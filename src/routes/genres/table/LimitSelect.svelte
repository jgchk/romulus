<script lang="ts">
  import { type ComponentProps, createEventDispatcher } from 'svelte'

  import type { Option } from '$lib/atoms/Select'
  import Select from '$lib/atoms/Select.svelte'

  type $$Props = Omit<ComponentProps<Select<number>>, 'options'>

  export let value: $$Props['value'] = undefined

  const options = [10, 20, 30, 40, 50].map((value) => ({ value, label: `Show ${value}` }))

  const dispatch = createEventDispatcher<{ change: Option<number> }>()
</script>

<Select bind:value {options} on:change={(e) => dispatch('change', e.detail)} {...$$restProps} />
