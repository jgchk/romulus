<script lang="ts">
  import type { SelectProps } from '$lib/atoms/Select'
  import Select from '$lib/atoms/Select.svelte'

  type Props = Omit<SelectProps<string>, 'options'> & {
    exclude?: string[]
    onChange?: (value: string[]) => void
    mediaArtifactTypes: Map<string, { id: string; name: string }>
  }

  let { value = $bindable(undefined), mediaArtifactTypes, ...rest }: Props = $props()

  let options = $derived(
    [...mediaArtifactTypes.values()].map((mediaArtifactType) => ({
      value: mediaArtifactType.id,
      label: mediaArtifactType.name,
    })),
  )
</script>

<Select bind:value {options} {...rest} />
