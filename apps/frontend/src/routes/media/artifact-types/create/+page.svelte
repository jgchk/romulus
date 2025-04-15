<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import MediaArtifactTypeCard from '$lib/features/media/components/MediaArtifactTypeCard.svelte'
  import MediaArtifactTypeForm from '$lib/features/media/components/MediaArtifactTypeForm.svelte'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
</script>

<div>
  <Card>
    <MediaArtifactTypeForm data={data.form} mediaTypes={data.mediaTypes} />
  </Card>

  {#each data.mediaArtifactTypes as mediaArtifactType (mediaArtifactType.id)}
    <MediaArtifactTypeCard {mediaArtifactType} mediaTypes={data.mediaTypes} />
  {/each}
</div>
