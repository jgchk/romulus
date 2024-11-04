<script lang="ts">
  import Button from '$lib/atoms/Button.svelte'
  import Card from '$lib/atoms/Card.svelte'
  import GenreLink from '$lib/components/GenreLink.svelte'
  import { getUserContext } from '$lib/contexts/user'
  import { toPrettyDate } from '$lib/utils/datetime'
  import { capitalize } from '$lib/utils/string'
  import type { ActionData, PageData } from './$types'

  export let data: PageData
  export let form: ActionData

  const user = getUserContext()
</script>

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
