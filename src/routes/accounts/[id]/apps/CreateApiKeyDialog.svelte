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

  const dispatch = createEventDispatcher<{ cancel: undefined; submit: { name: string } }>()
</script>

<form
  method="POST"
  action="?/create"
  on:submit={(e) => {
    if (disableFormSubmission) {
      e.preventDefault()
    }

    dispatch('submit', { name: new FormData(e.currentTarget).get('name')?.toString() ?? '' })
  }}
  use:enhance={() => {
    return ({ result, update }) => {
      if (result.type === 'success') {
        dispatch('cancel')
      }
      void update()
    }
  }}
>
  <Dialog title="Create a key">
    <InputGroup errors={form?.errors?.name}>
      <Label for="api-key-name">Name</Label>
      <Input id="api-key-name" name="name" required />
    </InputGroup>

    <svelte:fragment slot="buttons">
      <Button type="submit">Create</Button>
      <Button kind="text" on:click={() => dispatch('cancel')}>Cancel</Button>
    </svelte:fragment>
  </Dialog>
</form>
