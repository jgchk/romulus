<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Button from '$lib/atoms/Button.svelte'
  import Dialog from '$lib/atoms/Dialog.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'

  export let disableFormSubmission = false

  let name = ''

  const dispatch = createEventDispatcher<{ cancel: undefined; submit: { name: string } }>()
</script>

<form
  on:submit={(e) => {
    if (disableFormSubmission) {
      e.preventDefault()
    }

    dispatch('submit', { name })
  }}
>
  <Dialog title="Create a key">
    <InputGroup>
      <Label for="api-key-name">Name</Label>
      <Input id="api-key-name" bind:value={name} />
    </InputGroup>

    <svelte:fragment slot="buttons">
      <Button type="submit">Create</Button>
      <Button kind="text" on:click={() => dispatch('cancel')}>Cancel</Button>
    </svelte:fragment>
  </Dialog>
</form>
