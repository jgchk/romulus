<script lang="ts">
  import type { Snippet } from 'svelte'

  import { tw } from '$lib/utils/dom'

  type Props = {
    for?: string
    class?: string
    children?: Snippet
  }

  let { for: for_, class: class_, children }: Props = $props()
</script>

<label class={tw('text-sm text-gray-600 transition dark:text-gray-400', class_)} for={for_}>
  {@render children?.()}
</label>
