<script lang="ts">
  import { type Snippet } from 'svelte'

  type Props = {
    children?: Snippet
  }

  let { children }: Props = $props()
</script>

<div class="flex gap-1 border-t border-gray-200 p-1 transition dark:border-gray-800">
  {@render children?.()}
</div>
