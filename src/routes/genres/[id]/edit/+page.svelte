<script lang="ts">
  import { genreTitle, pageTitle } from '$lib/utils/string'

  import GenreForm from '../../GenreForm.svelte'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<svelte:head>
  <title
    >{pageTitle(genreTitle(data.form.data.name, data.form.data.subtitle), 'Edit', 'Genres')}</title
  >
</svelte:head>

<GenreForm data={data.form} autoFocus={data.autoFocus} genres={data.streamed.genres} id={data.id} />
