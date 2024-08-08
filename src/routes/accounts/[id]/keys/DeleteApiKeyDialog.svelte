<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import { enhance } from '$app/forms'
  import Button from '$lib/atoms/Button.svelte'
  import Dialog from '$lib/atoms/Dialog.svelte'

  export let deletingKey: { id: number; name: string }
  export let disableFormSubmission = false

  const dispatch = createEventDispatcher<{ close: undefined; delete: undefined }>()
</script>

<Dialog title="Delete {deletingKey.name}?" role="alertdialog" on:close={() => dispatch('close')}>
  Any applications or scripts using this key will no longer be able to access the Romulus API. You
  cannot undo this action.

  <svelte:fragment slot="buttons">
    <form
      method="POST"
      action="?/delete"
      on:submit={(e) => {
        if (disableFormSubmission) {
          e.preventDefault()
        }

        dispatch('delete')
      }}
      use:enhance={() => {
        return ({ result, update }) => {
          if (result.type === 'success') {
            dispatch('close')
          }
          void update()
        }
      }}
    >
      <input type="hidden" name="id" value={deletingKey.id} />
      <Button kind="solid" color="error" type="submit">Delete</Button>
    </form>
    <Button kind="text" on:click={() => dispatch('close')}>Cancel</Button>
  </svelte:fragment>
</Dialog>
