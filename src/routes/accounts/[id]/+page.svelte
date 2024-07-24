<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import GenreLink from '$lib/components/GenreLink.svelte'
  import { user } from '$lib/contexts/user'
  import { toPrettyDate } from '$lib/utils/datetime'
  import { capitalize, pageTitle } from '$lib/utils/string'

  import type { ActionData, PageData } from './$types'

  export let data: PageData
  export let form: ActionData
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

      <div class="py-2">
        <div>Genres created: {data.numCreated}</div>
        <div>Genres edited: {data.numUpdated}</div>
        <div>Genres deleted: {data.numDeleted}</div>
      </div>

      <div class="min-h-0 flex-1 overflow-auto">
        <table class="w-full">
          <thead>
            <tr>
              <th class="p-1 px-2 text-left">Genre</th>
              <th class="p-1 px-2 text-left">Change</th>
              <th class="p-1 px-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {#each data.history as entry (entry.id)}
              <tr>
                <td class="p-1 px-2">
                  <GenreLink
                    id={entry.treeGenreId}
                    name={entry.name}
                    type={entry.type}
                    subtitle={entry.subtitle}
                    nsfw={entry.nsfw}
                  />
                </td>
                <td class="p-1 px-2">{capitalize(entry.operation)}</td>
                <td class="p-1 px-2">{toPrettyDate(entry.createdAt)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </Card>
</div>
