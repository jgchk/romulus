<script lang="ts">
  import MediaArtifactRelationshipTypeForm from '$lib/features/media/components/MediaArtifactRelationshipTypeForm.svelte'
  import { pageTitle } from '$lib/utils/string'

  import type { PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()
</script>

<svelte:head>
  <title>{pageTitle('New Media Artifact Type', 'Media Artifact Types')}</title>
</svelte:head>

<MediaArtifactRelationshipTypeForm
  data={data.form}
  mediaArtifactTypes={new Map(
    data.mediaArtifactTypes.map((mediaArtifactType) => [mediaArtifactType.id, mediaArtifactType]),
  )}
/>
