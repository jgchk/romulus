<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  import GenreForm from '$lib/features/genres/components/GenreForm.svelte'
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
  <title>{pageTitle('New Genre', 'Genres')}</title>
</svelte:head>

<GenreForm data={data.form} showRelevance genres={$genreTreeQuery.promise} />
