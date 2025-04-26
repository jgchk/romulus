<script lang="ts">
  import MediaArtifactRelationshipTypeCard from '$lib/features/media/components/MediaArtifactRelationshipTypeCard.svelte'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const mediaArtifactTypes = $derived(
    new Map(
      data.mediaArtifactTypes.map((mediaArtifactType) => [mediaArtifactType.id, mediaArtifactType]),
    ),
  )
</script>

<div>
  {#each data.mediaArtifactRelationshipTypes as mediaArtifactRelationshipType (mediaArtifactRelationshipType.id)}
    <MediaArtifactRelationshipTypeCard {...mediaArtifactRelationshipType} {mediaArtifactTypes} />
  {/each}
</div>
