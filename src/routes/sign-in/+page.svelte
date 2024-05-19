<script lang="ts">
  import { superForm } from 'sveltekit-superforms'

  import Button from '$lib/atoms/Button.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'

  import type { PageData } from './$types'

  export let data: PageData

  const { form, errors, constraints, delayed, enhance } = superForm(data.form)
</script>

<form method="POST" use:enhance>
  <InputGroup errors={$errors.username}>
    <Label for="username">Username</Label>
    <Input
      type="text"
      id="username"
      name="username"
      autofocus
      bind:value={$form.username}
      {...$constraints.username}
    />
  </InputGroup>

  <InputGroup errors={$errors.password}>
    <Label for="password">Password</Label>
    <Input
      type="password"
      id="password"
      name="password"
      bind:value={$form.password}
      {...$constraints.password}
    />
  </InputGroup>

  <Button type="submit" loading={$delayed}>Sign in</Button>
</form>
