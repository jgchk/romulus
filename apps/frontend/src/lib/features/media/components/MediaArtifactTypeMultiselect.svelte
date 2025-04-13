<script lang="ts">
  import type { MultiselectProps, PlainOption } from '$lib/atoms/Multiselect'
  import Multiselect from '$lib/atoms/Multiselect.svelte'
  import { toAscii } from '$lib/utils/string'
  import { isDefined, type Timeout } from '$lib/utils/types'

  type Props = Omit<MultiselectProps<PlainOption<string>>, 'value' | 'options'> & {
    value: string[]
    exclude?: string[]
    onChange?: (value: string[]) => void
    mediaArtifactTypes: Map<string, { id: string; name: string }>
  }

  let {
    value = $bindable(),
    exclude = [],
    onChange = undefined,
    mediaArtifactTypes,
    ...rest
  }: Props = $props()

  let excludeSet = $derived(new Set(exclude))

  let values = $derived(
    value
      .map((id) => {
        const mediaArtifactType = mediaArtifactTypes.get(id)
        if (!mediaArtifactType) return

        return {
          value: id,
          label: mediaArtifactType.name,
        }
      })
      .filter(isDefined),
  )

  let filter = $state('')

  let debouncedFilter = $state('')

  let timeout: Timeout | undefined
  $effect(() => {
    const v = filter
    clearTimeout(timeout)
    timeout = setTimeout(() => (debouncedFilter = v), 250)
    return () => clearTimeout(timeout)
  })

  let options = $derived(
    [...mediaArtifactTypes.values()]
      .filter(
        (mediaArtifactType) =>
          !excludeSet.has(mediaArtifactType.id) &&
          toAscii(mediaArtifactType.name.toLowerCase()).startsWith(debouncedFilter.toLowerCase()),
      )
      .slice(0, 100)
      .map((mediaArtifactType) => ({
        value: mediaArtifactType.id,
        label: mediaArtifactType.name,
      })),
  )
</script>

<Multiselect
  value={values}
  virtual
  bind:filter
  {options}
  onChange={(newValue) => {
    value = newValue.map((v) => v.value)
    onChange?.(value)
  }}
  {...rest}
/>
