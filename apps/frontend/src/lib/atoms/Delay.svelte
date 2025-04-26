<script lang="ts">
  import type { Snippet } from 'svelte'

  let { delay = 500, children }: { delay?: number; children: Snippet } = $props()

  let show = $state(delay === 0 ? true : false)

  $effect(() => {
    if (delay === 0) {
      show = true
    } else {
      const timeout = setTimeout(() => {
        show = true
      }, delay)

      return () => clearTimeout(timeout)
    }
  })
</script>

{#if show}
  {@render children()}
{/if}
