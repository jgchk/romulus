<script lang="ts">
  import { enhance } from '$app/forms'
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import Input from '$lib/atoms/Input.svelte'
  import { pageTitle } from '$lib/utils/string'

  import type { PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  let usernameSearch = $state(data.usernameFilter ?? '')

  const editorIds = $derived(new Set(data.editors.map((e) => e.id)))
  const nonEditorAccounts = $derived(data.accounts.filter((a) => !editorIds.has(a.id)))
</script>

<svelte:head>
  <title>{pageTitle('Genre Editors')}</title>
</svelte:head>

<div class="flex h-full w-full flex-col gap-4 p-4 lg:flex-row">
  <Card class="flex-1 p-4">
    <h2 class="mb-4 text-xl font-bold">Current Genre Editors</h2>
    {#if data.editors.length === 0}
      <p class="text-gray-600 transition dark:text-gray-400">No genre editors assigned yet.</p>
    {:else}
      <div class="space-y-2">
        {#each data.editors as editor (editor.id)}
          <div
            class="flex items-center justify-between rounded border border-gray-200 p-2 transition dark:border-gray-700"
          >
            <a href="/accounts/{editor.id}" class="text-primary-500 hover:underline">
              {editor.username}
            </a>
            <form method="POST" action="?/remove" use:enhance>
              <input type="hidden" name="userId" value={editor.id} />
              <Button type="submit" color="error">Remove</Button>
            </form>
          </div>
        {/each}
      </div>
    {/if}
  </Card>

  <Card class="flex-1 p-4">
    <h2 class="mb-4 text-xl font-bold">Add Genre Editor</h2>

    <form method="GET" class="mb-4">
      <div class="flex gap-2">
        <Input
          type="text"
          name="username"
          placeholder="Search by username..."
          bind:value={usernameSearch}
          class="flex-1"
        />
        <Button type="submit">Search</Button>
      </div>
    </form>

    {#if nonEditorAccounts.length === 0}
      <p class="text-gray-600 transition dark:text-gray-400">
        {#if data.usernameFilter}
          No users found matching "{data.usernameFilter}".
        {:else}
          All users are already genre editors.
        {/if}
      </p>
    {:else}
      <div class="space-y-2">
        {#each nonEditorAccounts as account (account.id)}
          <div
            class="flex items-center justify-between rounded border border-gray-200 p-2 transition dark:border-gray-700"
          >
            <a href="/accounts/{account.id}" class="text-primary-500 hover:underline">
              {account.username}
            </a>
            <form method="POST" action="?/add" use:enhance>
              <input type="hidden" name="userId" value={account.id} />
              <Button type="submit" color="secondary">Add</Button>
            </form>
          </div>
        {/each}
      </div>
    {/if}

    {#if data.total > data.accounts.length}
      <p class="mt-4 text-sm text-gray-600 transition dark:text-gray-400">
        Showing {data.accounts.length} of {data.total} users. Use search to find more.
      </p>
    {/if}
  </Card>
</div>
