<script lang="ts">
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import MediaArtifactRelationshipTypeCard from '$lib/features/media/components/MediaArtifactRelationshipTypeCard.svelte'
  import { routes } from '$lib/routes'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const mediaArtifactTypes = $derived(
    new Map(
      data.mediaArtifactTypes.map((mediaArtifactType) => [mediaArtifactType.id, mediaArtifactType]),
    ),
  )
</script>

<div class="mb-4 flex items-center justify-between">
  <h2 class="text-lg font-semibold">Media Artifact Relationship Types</h2>
  <LinkButton href={routes.media.artifactTypes.relationships.create.route()}
    >New Relationship Type</LinkButton
  >
</div>

<div>
  {#each data.mediaArtifactRelationshipTypes as mediaArtifactRelationshipType (mediaArtifactRelationshipType.id)}
    <MediaArtifactRelationshipTypeCard {...mediaArtifactRelationshipType} {mediaArtifactTypes} />
  {/each}
</div>
