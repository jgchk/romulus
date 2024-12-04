<script lang="ts">
  import { enhance } from '$app/forms'
  import Button from '$lib/atoms/Button.svelte'
  import Dialog from '$lib/atoms/Dialog.svelte'

  type Props = {
    deletingKey: { id: number; name: string }
    disableFormSubmission?: boolean
    onClose?: () => void
    onDelete?: () => void
  }

  let { deletingKey, disableFormSubmission = false, onClose, onDelete }: Props = $props()
</script>

<Dialog title="Delete {deletingKey.name}?" role="alertdialog" on:close={() => onClose?.()}>
  Any applications or scripts using this key will no longer be able to access the Romulus API. You
  cannot undo this action.

  {#snippet buttons()}
    <form
      method="POST"
      action="?/delete"
      onsubmit={(e) => {
        if (disableFormSubmission) {
          e.preventDefault()
        }

        onDelete?.()
      }}
      use:enhance={() => {
        return ({ result, update }) => {
          if (result.type === 'success') {
            onClose?.()
          }
          void update()
        }
      }}
    >
      <input type="hidden" name="id" value={deletingKey.id} />
      <Button kind="solid" color="error" type="submit">Delete</Button>
    </form>
    <Button kind="text" onClick={() => onClose?.()}>Cancel</Button>
  {/snippet}
</Dialog>
