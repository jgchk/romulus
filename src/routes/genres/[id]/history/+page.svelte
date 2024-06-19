<script lang="ts">
  import IconButton from '$lib/atoms/IconButton.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import ChevronRightIcon from '$lib/icons/ChevronRightIcon.svelte'
  import { toPrettyDate } from '$lib/utils/datetime'
  import { cn } from '$lib/utils/dom'
  import { capitalize } from '$lib/utils/string'

  import Footer from '../../Footer.svelte'
  import GenrePageHeader from '../GenrePageHeader.svelte'
  import type { PageData } from './$types'
  import Diff from './Diff.svelte'

  export let data: PageData

  $: latestEntry = data.genreHistory.at(-1)

  let expanded = new Set()

  function setExpanded(id: number, value: boolean) {
    if (value) {
      expanded.add(id)
    } else {
      expanded.delete(id)
    }
    expanded = expanded
  }
</script>

<div class="flex h-full flex-col">
  {#if !latestEntry}
    <div>No history found :(</div>
  {:else}
    <GenrePageHeader id={data.id} name={latestEntry.name} subtitle={latestEntry.subtitle} />

    <div class="flex-1 overflow-auto p-2 py-4">
      {#if data.genreHistory.length > 0}
        <table class="w-full table-auto">
          <thead>
            <tr>
              <th />
              <th class="p-1 px-2 text-left">Change</th>
              <th class="p-1 px-2 text-left">Contributor</th>
              <th class="p-1 px-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {#each data.genreHistory as entry, i (entry.id)}
              {@const isExpanded = expanded.has(entry.id)}
              {@const previousHistory = data.genreHistory[i - 1]}
              <tr>
                <td class="w-px p-1 px-2">
                  <IconButton
                    tooltip={isExpanded ? 'Collapse' : 'Expand'}
                    on:click={() => setExpanded(entry.id, !isExpanded)}
                  >
                    <ChevronRightIcon class={cn('transition', isExpanded && 'rotate-90')} />
                  </IconButton>
                </td>
                <td class="p-1 px-2">{capitalize(entry.operation)}</td>
                <td class="p-1 px-2">
                  {#if entry.account}
                    <a href="/accounts/{entry.account.id}" class="text-primary-500 hover:underline"
                      >{entry.account.username}</a
                    >
                  {:else}
                    <div class="text-gray-500 line-through">Deleted</div>
                  {/if}
                </td>
                <td class="p-1 px-2">{toPrettyDate(entry.createdAt)}</td>
              </tr>

              {#if isExpanded}
                <tr>
                  <td />
                  <td class="p-1 px-2" colSpan={3}>
                    <Diff {previousHistory} currentHistory={entry} genres={data.streamed.genres} />
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      {:else}
        <div class="flex justify-center text-gray-600">No history</div>
      {/if}
    </div>
  {/if}

  <Footer>
    <LinkButton kind="outline" href="/genres/{data.id}">Back to genre page</LinkButton>
  </Footer>
</div>
