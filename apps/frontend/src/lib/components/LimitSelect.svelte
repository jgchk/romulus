<script lang="ts">
  import { Select } from '$lib/atoms/Select'
  import { ifDefined } from '$lib/utils/types'

  type Props = {
    id?: string
    class?: string
    value?: number
    onChange?: (value: number | undefined) => void
  }

  let { value = $bindable(undefined), id, class: class_, onChange }: Props = $props()

  const options = [10, 20, 30, 40, 50]
</script>

<Select.Root
  value={value?.toString()}
  options={options.map((v) => v.toString())}
  onChange={(vs) => {
    const v = ifDefined(vs, Number.parseInt)
    value = v
    onChange?.(v)
  }}
  class={class_}
>
  <Select.Trigger {id}>
    {value}
  </Select.Trigger>
  <Select.Options>
    {#each options as option (option)}
      <Select.Option value={option.toString()}>
        {option}
      </Select.Option>
    {/each}
  </Select.Options>
</Select.Root>
