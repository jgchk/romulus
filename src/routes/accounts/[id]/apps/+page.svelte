<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import { toPrettyDate } from '$lib/utils/datetime'

  import type { PageData } from './$types'

  export let data: PageData
</script>

{#if data.keys.length === 0}
  <div>No keys found</div>
  <Button>Add a key</Button>
{:else}
  <table>
    <thead>
      <th>Name</th>
      <th>Created</th>
    </thead>
    <tbody>
      {#each data.keys as key}
        <tr>
          <td>{key.name}</td>
          <td>{toPrettyDate(key.createdAt)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
