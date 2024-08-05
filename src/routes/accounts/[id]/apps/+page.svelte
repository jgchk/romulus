<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Button from '$lib/atoms/Button.svelte'
  import { toPrettyDate } from '$lib/utils/datetime'

  import type { ActionData, PageData } from './$types'
  import CreateApiKeyDialog from './CreateApiKeyDialog.svelte'

  export let data: PageData
  export let form: ActionData
  export let disableFormSubmission = false

  let showCreateDialog = false
  $: createdKey =
    form && 'success' in form && form.success ? { name: form.name, key: form.key } : null

  const dispatch = createEventDispatcher<{ submit: { name: string } }>()
</script>

{#if data.keys.length === 0 && !createdKey}
  <div>No keys found</div>
  <Button on:click={() => (showCreateDialog = true)}>Create a key</Button>
{:else}
  <Button on:click={() => (showCreateDialog = true)}>Create a key</Button>
  <table>
    <thead>
      <th>Name</th>
      <th>Created</th>
    </thead>
    <tbody>
      {#if createdKey}
        <tr>
          <td>{createdKey.name}</td>
          <td>Just now</td>
        </tr>
        <tr>
          <td>{createdKey.key}</td>
        </tr>
      {/if}
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
    {form}
    {disableFormSubmission}
    on:cancel={() => (showCreateDialog = false)}
    on:submit={(e) => {
      dispatch('submit', e.detail)
    }}
  />
{/if}
