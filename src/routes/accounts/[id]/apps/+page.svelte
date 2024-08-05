<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Button from '$lib/atoms/Button.svelte'
  import { toPrettyDate } from '$lib/utils/datetime'

  import type { PageData } from './$types'
  import CreateApiKeyDialog from './CreateApiKeyDialog.svelte'

  export let data: PageData
  export let disableFormSubmission = false

  let showCreateDialog = false

  const dispatch = createEventDispatcher<{ submit: { name: string } }>()
</script>

{#if data.keys.length === 0}
  <div>No keys found</div>
  <Button on:click={() => (showCreateDialog = true)}>Create a key</Button>
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

{#if showCreateDialog}
  <CreateApiKeyDialog
    {disableFormSubmission}
    on:cancel={() => (showCreateDialog = false)}
    on:submit={(e) => {
      dispatch('submit', e.detail)
      showCreateDialog = false
    }}
  />
{/if}
