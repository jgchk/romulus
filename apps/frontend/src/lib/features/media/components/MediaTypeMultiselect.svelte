<script lang="ts">
  import { Multiselect } from '$lib/atoms/Multiselect'
  import { useDebounce } from '$lib/runes/use-debounce.svelte'
  import { toAscii } from '$lib/utils/string'

  let {
    value = $bindable([]),
    exclude = [],
    id,
    class: class_,
    mediaTypes,
  }: {
    value?: string[]
    exclude?: string[]
    id?: string
    class?: string
    mediaTypes: Map<string, { id: string; name: string }>
  } = $props()

  let excludeSet = $derived(new Set(exclude))

  let filter = $state('')
  const debouncedFilter = useDebounce(() => filter, 250)

  const selectedItems = $derived(value.map((id) => ({ id, mediaType: mediaTypes.get(id) })))

  let options = $derived(
    [...mediaTypes.values()]
      .filter(
        (mediaType) =>
          !excludeSet.has(mediaType.id) &&
          !value.includes(mediaType.id) &&
          toAscii(mediaType.name)
            .toLowerCase()
            .startsWith(toAscii(debouncedFilter.current).toLowerCase()),
      )
      .slice(0, 100),
  )
</script>

<Multiselect.Root bind:value options={options.map(({ id }) => id)} class={class_}>
  <Multiselect.Trigger>
    {#each selectedItems as { id, mediaType } (id)}
      <Multiselect.SelectedItem value={id}>
        {#if mediaType === undefined}
          Unknown
        {:else}
          {mediaType.name}
        {/if}
      </Multiselect.SelectedItem>
    {/each}
    <Multiselect.Input {id} bind:value={filter} />
  </Multiselect.Trigger>
  <Multiselect.Options>
    {#each options as mediaType (mediaType.id)}
      <Multiselect.Option value={mediaType.id}>
        {mediaType.name}
      </Multiselect.Option>
    {/each}
  </Multiselect.Options>
</Multiselect.Root>
