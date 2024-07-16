<script lang="ts">
  import { superForm } from 'sveltekit-superforms'

  import Button from '$lib/atoms/Button.svelte'
  import ErrorText from '$lib/atoms/ErrorText.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import { pageTitle } from '$lib/utils/string'

  import type { PageData } from './$types'

  export let data: PageData

  const { form, errors, constraints, delayed, enhance } = superForm(data.form)
</script>

<svelte:head>
  <title>{pageTitle('Reset Password')}</title>
</svelte:head>

<div class="flex h-full w-full items-center justify-center">
  <form method="POST" use:enhance class="space-y-2">
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

    <InputGroup errors={$errors.confirmPassword}>
      <Label for="confirm-password">Confirm password</Label>
      <Input
        type="password"
        id="confirm-password"
        name="confirmPassword"
        bind:value={$form.confirmPassword}
        {...$constraints.confirmPassword}
      />
    </InputGroup>

    <Button type="submit" loading={$delayed}>Update Password</Button>

    <ErrorText errors={$errors._errors} />
  </form>
</div>
