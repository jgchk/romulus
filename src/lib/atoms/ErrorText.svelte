<script lang="ts">
  import type { AriaRole } from 'svelte/elements'

  export let role: AriaRole | null | undefined = 'alert'
</script>

<div class="text-sm text-error-500" {role}>
  <slot />
</div>
