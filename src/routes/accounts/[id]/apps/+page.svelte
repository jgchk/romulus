<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'

  import type { PageData } from './$types'

  export let data: PageData
</script>

{#if data.keys.length === 0}
  <div>No keys found</div>
  <Button>Add a key</Button>
{/if}
