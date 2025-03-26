<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  import Loader from '$lib/atoms/Loader.svelte'
  import { genreQueries } from '$lib/features/genres/tanstack'
  import { pageTitle } from '$lib/utils/string'

  import type { PageData } from './$types'
  import GenresTable from './GenresTable.svelte'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  const genreTreeQuery = createQuery(genreQueries.tree())
</script>

<svelte:head>
  <title>{pageTitle('Table', 'Genres')}</title>
</svelte:head>

{#if $genreTreeQuery.data}
  <GenresTable genres={$genreTreeQuery.data} {data} />
{:else if $genreTreeQuery.error}
  <div>Error fetching genres</div>
{:else}
  <div class="center h-full max-h-96 w-full">
    <Loader size={32} class="text-primary-500" />
  </div>
{/if}
