<script lang="ts">
  import { Multiselect } from '$lib/atoms/Multiselect'
  import { useDebounce } from '$lib/runes/use-debounce.svelte'
  import { toAscii } from '$lib/utils/string'

  let {
    value = $bindable([]),
    exclude = [],
    id,
    class: class_,
    mediaArtifactTypes,
  }: {
    value?: string[]
    exclude?: string[]
    id?: string
    class?: string
    mediaArtifactTypes: Map<string, { id: string; name: string }>
  } = $props()

  let excludeSet = $derived(new Set(exclude))

  let filter = $state('')
  const debouncedFilter = useDebounce(() => filter, 250)

  const selectedItems = $derived(
    value.map((id) => ({ id, mediaArtifactType: mediaArtifactTypes.get(id) })),
  )

  let options = $derived(
    [...mediaArtifactTypes.values()]
      .filter(
        (mediaArtifactType) =>
          !excludeSet.has(mediaArtifactType.id) &&
          !value.includes(mediaArtifactType.id) &&
          toAscii(mediaArtifactType.name)
            .toLowerCase()
            .startsWith(toAscii(debouncedFilter.current).toLowerCase()),
      )
      .slice(0, 100),
  )
</script>

<Multiselect.Root bind:value options={options.map(({ id }) => id)} class={class_}>
  <Multiselect.Trigger>
    {#each selectedItems as { id, mediaArtifactType } (id)}
      <Multiselect.SelectedItem value={id}>
        {#if mediaArtifactType === undefined}
          Unknown
        {:else}
          {mediaArtifactType.name}
        {/if}
      </Multiselect.SelectedItem>
    {/each}
    <Multiselect.Input {id} bind:value={filter} />
  </Multiselect.Trigger>
  <Multiselect.Options>
    {#each options as mediaArtifactType (mediaArtifactType.id)}
      <Multiselect.Option value={mediaArtifactType.id}>
        {mediaArtifactType.name}
      </Multiselect.Option>
    {/each}
  </Multiselect.Options>
</Multiselect.Root>
