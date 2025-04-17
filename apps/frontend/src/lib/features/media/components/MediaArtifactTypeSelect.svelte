<script lang="ts">
  import { Select } from '$lib/atoms/Select'
  import { useDebounce } from '$lib/runes/use-debounce.svelte'
  import { toAscii } from '$lib/utils/string'
  import { ifDefined } from '$lib/utils/types'

  type Props = {
    id?: string
    class?: string
    value?: string
    exclude?: string[]
    onChange?: (value: string | undefined) => void
    mediaArtifactTypes: Map<string, { id: string; name: string }>
  }

  let {
    id,
    class: class_,
    value = $bindable(undefined),
    exclude,
    onChange,
    mediaArtifactTypes,
  }: Props = $props()

  let filter = $state('')
  const debouncedFilter = useDebounce(() => filter, 250)

  const selectedItem = $derived(ifDefined(value, (value) => mediaArtifactTypes.get(value)))

  const excludeSet = $derived(new Set(exclude))
  const options = $derived(
    [...mediaArtifactTypes.values()]
      .filter(
        (mediaType) =>
          !excludeSet.has(mediaType.id) &&
          toAscii(mediaType.name)
            .toLowerCase()
            .startsWith(toAscii(debouncedFilter.current).toLowerCase()),
      )
      .slice(0, 100),
  )
</script>

<Select.Root bind:value options={options.map(({ id }) => id)} {onChange} class={class_}>
  <Select.Trigger {id}>
    {selectedItem?.name ?? 'Select a media artifact type...'}
  </Select.Trigger>
  <Select.Options>
    <Select.Input bind:value={filter} />
    {#each options as mediaArtifactType (mediaArtifactType.id)}
      <Select.Option value={mediaArtifactType.id}>
        {mediaArtifactType.name}
      </Select.Option>
    {/each}
  </Select.Options>
</Select.Root>
