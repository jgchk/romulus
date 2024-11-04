<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import { getUserContext } from '$lib/contexts/user'
  import { pageTitle } from '$lib/utils/string'

  import type { ActionData, PageData } from './$types'
  import GenresTable from './GenresTable.svelte'

  export let data: PageData
  export let form: ActionData

  const user = getUserContext()
</script>

<svelte:head>
  <title>{pageTitle(data.account.username, 'Accounts')}</title>
</svelte:head>

<div class="h-full w-full">
  <Card class="h-full p-4">
    <div class="flex h-full max-h-full min-h-0 flex-col">
      <div class="text-xl font-bold">{data.account.username}</div>
      {#if $user?.id === 1}
        <form method="POST" action="?/createPasswordResetLink">
          <Button type="submit">Create Password Reset Link</Button>
        </form>
        {#if form?.verificationLink}
          <input type="text" value={form.verificationLink} readonly class="my-2 w-full p-1" />
        {/if}
      {/if}

      <GenresTable {data} />
    </div>
  </Card>
</div>
