<script lang="ts">
  import Card from '$lib/atoms/Card.svelte'
  import MediaArtifactRelationshipTypeCard from '$lib/features/media/components/MediaArtifactRelationshipTypeCard.svelte'
  import MediaArtifactRelationshipTypeForm from '$lib/features/media/components/MediaArtifactRelationshipTypeForm.svelte'

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
    {@const isEditing = data.id === mediaArtifactRelationshipType.id}

    {#if isEditing}
      <Card class="relative p-4">
        <MediaArtifactRelationshipTypeForm id={data.id} data={data.form} {mediaArtifactTypes} />
      </Card>
    {:else}
      <MediaArtifactRelationshipTypeCard {...mediaArtifactRelationshipType} {mediaArtifactTypes} />
    {/if}
  {/each}
</div>
