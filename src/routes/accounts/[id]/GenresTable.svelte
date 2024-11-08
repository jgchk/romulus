<script lang="ts">
  import GenreLink from '$lib/components/GenreLink.svelte'
  import { toPrettyDate } from '$lib/utils/datetime'
  import { capitalize } from '$lib/utils/string'
  import ColumnHeader from './ColumnHeader.svelte'

  import type { PageData } from './$types'

  export let data: PageData

  let sortedHistory: Awaited<PageData['history']> = []
  $: {
    sortedHistory = data.history.sort((a, b) => {
      switch (data.sort) {
        case 'genre':
          return a.name.localeCompare(b.name)
        case 'change':
          return a.operation.localeCompare(b.operation)
        case 'date':
          return a.createdAt.getTime() - b.createdAt.getTime()
      }
    })

    if (data.order === 'desc') {
      sortedHistory = sortedHistory.reverse()
    }
  }
</script>

<div class="py-2">
  <div>Genres created: {data.numCreated}</div>
  <div>Genres edited: {data.numUpdated}</div>
  <div>Genres deleted: {data.numDeleted}</div>
</div>

<div class="h-full min-h-0 w-full flex-1 flex-col overflow-auto p-2">
  <table class="w-full table-fixed">
    <thead>
      <tr>
        <th class="p-1 px-2 text-left">
          <ColumnHeader label="Genre" sort="genre" {data} />
        </th>
        <th class="p-1 px-2 text-left">
          <ColumnHeader label="Change" sort="change" {data} />
        </th>
        <th class="p-1 px-2 text-left">
          <ColumnHeader label="Date" sort="date" {data} />
        </th>
      </tr>
    </thead>
    <tbody>
      {#each sortedHistory as entry (entry.id)}
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
