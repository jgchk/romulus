<script lang="ts">
  import { Pencil } from 'phosphor-svelte'

  import Card from '$lib/atoms/Card.svelte'
  import Chip from '$lib/atoms/Chip.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import LinkIconButton from '$lib/atoms/LinkIconButton.svelte'
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
    <Card class="relative p-4">
      <div class="absolute right-2 top-2 flex space-x-1">
        <LinkIconButton
          tooltip="Edit"
          href={routes.media.artifactTypes.relationships.details.edit.route(
            mediaArtifactRelationshipType.id,
          )}><Pencil /></LinkIconButton
        >
      </div>

      <h3 class="font-medium">{mediaArtifactRelationshipType.name}</h3>
      <div>
        <Chip
          text={mediaArtifactTypes.get(mediaArtifactRelationshipType.parentMediaArtifactType)
            ?.name ?? 'Unknown'}
        />
        &gt;
        {#each mediaArtifactRelationshipType.childMediaArtifactTypes as childMediaArtifactTypeId (childMediaArtifactTypeId)}
          {@const childMediaArtifactType = mediaArtifactTypes.get(childMediaArtifactTypeId)}
          <Chip text={childMediaArtifactType?.name ?? 'Unknown'} />
        {/each}
      </div>
    </Card>
  {/each}
</div>
