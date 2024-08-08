<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import { enhance } from '$app/forms'
  import Button from '$lib/atoms/Button.svelte'
  import Dialog from '$lib/atoms/Dialog.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'

  import type { ActionData } from './$types'

  export let form: ActionData
  export let disableFormSubmission = false

  const dispatch = createEventDispatcher<{ close: undefined; create: { name: string } }>()
</script>

<form
  method="POST"
  action="?/create"
  on:submit={(e) => {
    if (disableFormSubmission) {
      e.preventDefault()
    }

    dispatch('create', { name: new FormData(e.currentTarget).get('name')?.toString() ?? '' })
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
  <Dialog title="Create an API key" on:close={() => dispatch('close')}>
    <InputGroup errors={form?.action === 'create' ? form.errors.name : undefined}>
      <Label for="api-key-name">Name</Label>
      <Input id="api-key-name" name="name" class="w-full" required autofocus />
    </InputGroup>

    <svelte:fragment slot="buttons">
      <Button type="submit">Create</Button>
      <Button kind="text" on:click={() => dispatch('close')}>Cancel</Button>
    </svelte:fragment>
  </Dialog>
</form>
