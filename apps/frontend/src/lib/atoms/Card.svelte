<script lang="ts">
  import type { Snippet } from 'svelte'

  import { tw } from '$lib/utils/dom'

  type Props = {
    class?: string
    children?: Snippet
  }

  let { class: class_, children }: Props = $props()
</script>

<div
  class={tw(
    'relative rounded-lg border border-black border-opacity-10 bg-gray-100 transition dark:border-white dark:border-opacity-10 dark:bg-gray-900',
    class_,
  )}
>
  {@render children?.()}
</div>
