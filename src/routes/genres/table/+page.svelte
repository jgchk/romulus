<script lang="ts">
  import Loader from '$lib/atoms/Loader.svelte'

  import type { PageData } from './$types'
  import GenresTable from './GenresTable.svelte'

  export let data: PageData
</script>

{#await data.streamed.genres}
  <div class="center h-full max-h-96 w-full">
    <Loader size={32} class="text-primary-500" />
  </div>
{:then genres}
  <GenresTable {genres} {data} />
{/await}
