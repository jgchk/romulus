<script lang="ts">
  import GenreForm from '../GenreForm.svelte'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<GenreForm data={data.form} genres={data.streamed.genres} />
