<script lang="ts">
  import { Copy, Warning } from 'phosphor-svelte'
  import { createEventDispatcher } from 'svelte'

  import { enhance } from '$app/forms'
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import Dialog from '$lib/atoms/Dialog.svelte'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import { toPrettyDate } from '$lib/utils/datetime'
  import { copyTextToClipboard } from '$lib/utils/dom'

  import type { ActionData, PageData } from './$types'
  import CreateApiKeyDialog from './CreateApiKeyDialog.svelte'

  export let data: PageData
  export let form: ActionData
  export let disableFormSubmission = false

  let showCreateDialog = false
  let showDeleteDialog: false | { id: number; name: string } = false

  $: createdKey =
    form && 'success' in form && form.success
      ? { id: form.id, name: form.name, key: form.key }
      : null

  const dispatch = createEventDispatcher<{ create: { name: string }; delete: { id: number } }>()
</script>

<Card class="h-full space-y-2 p-4">
  <h1 class="text-xl font-bold">API Keys</h1>

  <Button on:click={() => (showCreateDialog = true)}>Create an API key</Button>

  {#if data.keys.length === 0 && !createdKey}
    <div
      class="flex h-full max-h-96 w-full items-center justify-center text-gray-600 transition dark:text-gray-400"
    >
      <div class="text-center">
        <div>No API keys found.</div>
        <div>
          <button
            type="button"
            class="text-primary-500 hover:underline"
            on:click={() => (showCreateDialog = true)}>Create one!</button
          >
        </div>
      </div>
    </div>
  {:else}
    {#if createdKey}
      <div
        class="flex items-center gap-2.5 rounded border border-warning-300 bg-warning-200 px-3 py-2 text-sm transition dark:border-warning-700 dark:bg-warning-900"
      >
        <Warning class="transition dark:text-warning-300" size={16} /> Make sure to copy your API key
        somewhere safe. You won't be able to see it again!
      </div>
    {/if}

    <div class="overflow-hidden rounded border border-gray-200 transition dark:border-gray-700">
      {#if createdKey}
        <div
          class="flex flex-wrap items-center justify-between gap-4 border-b border-success-300 bg-success-200 p-2 transition last:border-b-0 dark:border-success-800 dark:bg-success-900 dark:bg-opacity-60"
        >
          <div class="space-y-0.5">
            <div class="font-medium">{createdKey.name}</div>
            <div class="text-xs transition dark:text-gray-400">Created just now</div>
          </div>

          <div class="flex flex-1 basis-[440px] justify-center overflow-hidden">
            <div class="flex gap-1 overflow-hidden">
              <pre
                class="truncate rounded bg-success-300 px-2 py-0.5 transition dark:bg-success-800">{createdKey.key}</pre>
              <IconButton
                class="flex-shrink-0 text-success-600 dark:text-success-300"
                tooltip="Copy"
                on:click={() => copyTextToClipboard(createdKey.key)}
              >
                <Copy />
              </IconButton>
            </div>
          </div>
        </div>
      {/if}
      {#each data.keys as key (key.id)}
        {#if key.id !== createdKey?.id}
          <div
            class="flex min-w-52 items-center justify-between gap-2 border-b border-gray-200 p-2 transition last:border-b-0 dark:border-gray-700"
          >
            <div class="space-y-0.5">
              <div class="font-medium">{key.name}</div>
              <div class="text-xs transition dark:text-gray-400">
                Created on {toPrettyDate(key.createdAt)}
              </div>
            </div>
            <Button color="error" kind="outline" on:click={() => (showDeleteDialog = key)}
              >Delete</Button
            >
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</Card>

{#if showCreateDialog}
  <CreateApiKeyDialog
    {form}
    {disableFormSubmission}
    on:cancel={() => (showCreateDialog = false)}
    on:create={(e) => dispatch('create', e.detail)}
  />
{/if}

{#if showDeleteDialog}
  {@const deletingKey = showDeleteDialog}
  <Dialog title="Delete {showDeleteDialog.name}?" role="alertdialog">
    <svelte:fragment slot="buttons">
      <form
        method="POST"
        action="?/delete"
        use:enhance={() => {
          return ({ result, update }) => {
            if (result.type === 'success') {
              showDeleteDialog = false
            }
            void update()
          }
        }}
        on:submit={(e) => {
          if (disableFormSubmission) {
            e.preventDefault()
          }

          dispatch('delete', { id: deletingKey.id })
        }}
      >
        <input type="hidden" name="id" value={deletingKey.id} />
        <Button kind="solid" color="error" type="submit">Delete</Button>
      </form>
      <Button kind="text" on:click={() => (showDeleteDialog = false)}>Cancel</Button>
    </svelte:fragment>
  </Dialog>
{/if}
