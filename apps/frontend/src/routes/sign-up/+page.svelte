<script lang="ts">
  import { superForm } from 'sveltekit-superforms'

  import Button from '$lib/atoms/Button.svelte'
  import ErrorText from '$lib/atoms/ErrorText.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import InputGroup from '$lib/atoms/InputGroup.svelte'
  import Label from '$lib/atoms/Label.svelte'
  import { pageTitle } from '$lib/utils/string'

  import type { PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  const { form, errors, constraints, delayed, enhance } = superForm(data.form, { dataType: 'json' })
</script>

<svelte:head>
  <title>{pageTitle('Sign Up')}</title>
</svelte:head>

<div class="flex h-full w-full items-center justify-center">
  <form method="post" use:enhance class="space-y-2">
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

    <InputGroup errors={$errors.password?.password}>
      <Label for="password">Password</Label>
      <Input
        type="password"
        id="password"
        name="password"
        bind:value={$form.password.password}
        {...$constraints.password?.password}
      />
    </InputGroup>

    <InputGroup errors={$errors.password?.confirmPassword}>
      <Label for="confirm-password">Confirm password</Label>
      <Input
        type="password"
        id="confirm-password"
        name="confirmPassword"
        bind:value={$form.password.confirmPassword}
        {...$constraints.password?.confirmPassword}
      />
    </InputGroup>

    <Button type="submit" loading={$delayed}>Sign up</Button>

    <ErrorText errors={$errors._errors} />
  </form>
</div>
