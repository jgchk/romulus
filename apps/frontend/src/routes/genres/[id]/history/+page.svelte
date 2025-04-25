<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import GenreDiff from '$lib/features/genres/components/GenreDiff.svelte'
  import { genreQueries } from '$lib/features/genres/tanstack'
  import { genreTitle, pageTitle } from '$lib/utils/string'

  import Footer from '../../Footer.svelte'
  import GenrePageHeader from '../GenrePageHeader.svelte'
  import type { PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  let latestEntry = $derived(data.genreHistory.at(-1))

  const genreTreeQuery = createQuery(genreQueries.tree())
</script>

<svelte:head>
  <title
    >{pageTitle(
      latestEntry ? genreTitle(latestEntry.name, latestEntry.subtitle) : 'Unknown',
      'History',
      'Genres',
    )}</title
  >
</svelte:head>

<div class="flex h-full flex-col">
  {#if !latestEntry}
    <div>No history found :(</div>
  {:else}
    <GenrePageHeader
      id={data.id}
      name={latestEntry.name}
      subtitle={latestEntry.subtitle}
      nsfw={latestEntry.nsfw}
    />

    <div class="flex-1 overflow-auto p-4">
      {#if data.genreHistory.length > 0}
        <div class="max-w-lg space-y-3">
          {#each data.genreHistory as entry, i (entry.id)}
            <GenreDiff
              previousHistory={data.genreHistory[i - 1]}
              currentHistory={entry}
              genres={$genreTreeQuery.promise}
            />
          {/each}
        </div>
      {:else}
        <div class="flex justify-center text-gray-600">No history</div>
      {/if}
    </div>
  {/if}

  <Footer>
    <LinkButton kind="outline" href="/genres/{data.id}">Back to genre page</LinkButton>
  </Footer>
</div>
