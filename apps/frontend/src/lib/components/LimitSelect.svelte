<script lang="ts">
  import { type ComponentProps } from 'svelte'

  import Select from '$lib/atoms/Select.svelte'

  type Props = Omit<ComponentProps<Select<number>>, 'options'>

  let { value = $bindable(undefined), ...rest }: Props = $props()

  const options = [10, 20, 30, 40, 50].map((value) => ({ value, label: `Show ${value}` }))
</script>

<Select bind:value {options} {...rest} />
