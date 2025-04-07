<script lang="ts">
  import type { MultiselectProps, PlainOption } from '$lib/atoms/Multiselect'
  import Multiselect from '$lib/atoms/Multiselect.svelte'
  import { toAscii } from '$lib/utils/string'
  import { isDefined, type Timeout } from '$lib/utils/types'

  type Props = Omit<MultiselectProps<PlainOption<string>>, 'value' | 'options'> & {
    value: string[]
    exclude?: string[]
    onChange?: (value: string[]) => void
    mediaTypes: Map<string, { id: string; name: string }>
  }

  let {
    value = $bindable(),
    exclude = [],
    onChange = undefined,
    mediaTypes,
    ...rest
  }: Props = $props()

  let excludeSet = $derived(new Set(exclude))

  let values = $derived(
    value
      .map((id) => {
        const mediaType = mediaTypes.get(id)
        if (!mediaType) return

        return {
          value: id,
          label: mediaType.name,
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
    [...mediaTypes.values()]
      .filter(
        (mediaType) =>
          !excludeSet.has(mediaType.id) &&
          toAscii(mediaType.name.toLowerCase()).startsWith(debouncedFilter.toLowerCase()),
      )
      .slice(0, 100)
      .map((mediaType) => ({
        value: mediaType.id,
        label: mediaType.name,
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
