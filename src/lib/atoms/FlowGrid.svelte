<script lang="ts">
  import { cn } from '$lib/utils/dom'

  export let minColumnWidth = 150
  let class_: string | undefined = undefined
  export { class_ as class }
</script>

<div
  class={cn('grid gap-4', class_)}
  style:grid-template-columns="repeat(auto-fill, minmax({minColumnWidth}px, 1fr))"
>
  <slot />
</div>
