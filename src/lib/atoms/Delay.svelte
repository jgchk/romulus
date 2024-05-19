<script lang="ts">
  import { onMount } from 'svelte'

  export let delay = 500

  let show = false

  onMount(() => {
    const timeout = setTimeout(() => {
      show = true
    }, delay)

    return () => {
      clearTimeout(timeout)
    }
  })
</script>

{#if show}
  <slot />
{/if}
