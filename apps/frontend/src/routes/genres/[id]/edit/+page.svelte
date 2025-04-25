<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  import GenreForm from '$lib/features/genres/components/GenreForm.svelte'
  import { genreQueries } from '$lib/features/genres/tanstack'
  import { genreTitle, pageTitle } from '$lib/utils/string'

  import { type PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  const genreTreeQuery = createQuery(genreQueries.tree())
</script>

<svelte:head>
  <title
    >{pageTitle(genreTitle(data.form.data.name, data.form.data.subtitle), 'Edit', 'Genres')}</title
  >
</svelte:head>

<GenreForm
  data={data.form}
  autoFocus={data.autoFocus}
  id={data.id}
  genres={$genreTreeQuery.promise}
/>
