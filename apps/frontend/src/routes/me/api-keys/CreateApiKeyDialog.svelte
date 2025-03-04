<script lang="ts">
  import { enhance } from '$app/forms'
  import Button from '$lib/atoms/Button.svelte'
  import Dialog from '$lib/atoms/Dialog.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'

  import type { ActionData } from './$types'

  type Props = {
    form: ActionData
    disableFormSubmission?: boolean
    onClose?: () => void
    onCreate?: (data: { name: string }) => void
  }

  let { form, disableFormSubmission = false, onClose, onCreate }: Props = $props()
</script>

<form
  method="post"
  action="?/create"
  onsubmit={(e) => {
    if (disableFormSubmission) {
      e.preventDefault()
    }

    onCreate?.({ name: new FormData(e.currentTarget).get('name')?.toString() ?? '' })
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
  <Dialog title="Create an API key" on:close={() => onClose?.()}>
    <InputGroup errors={form?.action === 'create' ? form.errors.name : undefined}>
      <Label for="api-key-name">Name</Label>
      <Input id="api-key-name" name="name" class="w-full" required autofocus />
    </InputGroup>

    {#snippet buttons()}
      <Button type="submit">Create</Button>
      <Button kind="text" onClick={() => onClose?.()}>Cancel</Button>
    {/snippet}
  </Dialog>
</form>
