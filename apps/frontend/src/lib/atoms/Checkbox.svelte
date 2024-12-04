<script lang="ts">
  import { tw } from '$lib/utils/dom'

  type Props = {
    checked?: boolean
    id?: string
    class?: string
    tabindex?: number
    onChange?: (checked: boolean) => void
  }

  let { checked = $bindable(false), id, class: class_, tabindex, onChange }: Props = $props()
</script>

<input
  {id}
  {tabindex}
  type="checkbox"
  bind:checked
  onchange={(e) => onChange?.(e.currentTarget.checked)}
  class={tw('h-5 w-5 cursor-pointer accent-secondary-600', class_)}
/>
