<script lang="ts">
  import GenreForm from '../../GenreForm.svelte'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<GenreForm data={data.form} autoFocus={data.autoFocus} genres={data.streamed.genres} id={data.id} />
