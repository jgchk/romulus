<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import MediaArtifactTypeCard from '$lib/features/media/components/MediaArtifactTypeCard.svelte'
  import MediaArtifactTypeForm from '$lib/features/media/components/MediaArtifactTypeForm.svelte'
  import { routes } from '$lib/routes'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
</script>

<div class="mb-4 flex items-center justify-between">
  <h2 class="text-lg font-semibold">Media Artifact Types</h2>
  <LinkButton href={routes.media.artifactTypes.create.route()}>New Type</LinkButton>
</div>

<div>
  <Card>
    <MediaArtifactTypeForm data={data.form} mediaTypes={data.mediaTypes} />
  </Card>

  {#each data.mediaArtifactTypes as mediaArtifactType (mediaArtifactType.id)}
    <MediaArtifactTypeCard {mediaArtifactType} mediaTypes={data.mediaTypes} />
  {/each}
</div>
