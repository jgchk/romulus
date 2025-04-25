<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  import GenreDiff from '$lib/features/genres/components/GenreDiff.svelte'
  import { genreQueries } from '$lib/features/genres/tanstack'
  import { pageTitle } from '$lib/utils/string'

  import { type PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  const genreTreeQuery = createQuery(genreQueries.tree())
</script>

<svelte:head>
  <title>{pageTitle('Latest', 'Genres')}</title>
</svelte:head>

<div class="h-full w-full overflow-auto p-4">
  <div class="max-w-lg space-y-3">
    {#each data.genreHistory as entry (entry.genre.id)}
      <GenreDiff
        previousHistory={entry.previousHistory}
        currentHistory={entry.genre}
        genres={$genreTreeQuery.promise}
      />
    {/each}
  </div>
</div>
