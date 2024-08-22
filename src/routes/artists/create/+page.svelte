<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'

  import type { ActionData } from './$types'

  export let form: ActionData
</script>

<Card class="h-full w-full p-4">
  <form method="POST">
    <InputGroup errors={form?.errors.name}>
      <Label for="name">Name</Label>
      <Input type="text" id="name" name="name" />
    </InputGroup>

    <Button type="submit">Create</Button>
  </form>
</Card>
