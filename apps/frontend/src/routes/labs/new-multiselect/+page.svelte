<script lang="ts">
  import MediaTypeMultiselect from '$lib/features/media/components/MediaTypeMultiselect.svelte'

  import GenreMultiselect from '../../genres/GenreMultiselect.svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  let genres = $state([])
  let mediaTypes = $state([])
</script>

<div>
  <label for="genre">Genre</label>
  <GenreMultiselect id="genre" bind:value={genres} />
  <div>{genres.join(', ')}</div>
</div>

<div>
  <label for="media-type">Media Type</label>
  <MediaTypeMultiselect id="media-type" bind:value={mediaTypes} mediaTypes={data.mediaTypes} />
  <div>{mediaTypes.join(', ')}</div>
</div>
