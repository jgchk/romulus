<script lang="ts">
  import MediaArtifactTypeSelect from '$lib/features/media/components/MediaArtifactTypeSelect.svelte'
  import MediaTypeMultiselect from '$lib/features/media/components/MediaTypeMultiselect.svelte'

  import GenreMultiselect from '../../genres/GenreMultiselect.svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  let genres = $state([])
  let mediaTypes = $state([])
  let mediaArtifactType = $state<string | undefined>(undefined)
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

<div>
  <label for="media-artifact-type">Media Artifact Type</label>
  <MediaArtifactTypeSelect
    id="media-artifact-type"
    bind:value={mediaArtifactType}
    mediaArtifactTypes={data.mediaArtifactTypes}
  />
  <div>{mediaTypes.join(', ')}</div>
</div>
