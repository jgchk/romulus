<script lang="ts">
  import { Pencil } from 'phosphor-svelte'

  import Card from '$lib/atoms/Card.svelte'
  import Chip from '$lib/atoms/Chip.svelte'
  import LinkIconButton from '$lib/atoms/LinkIconButton.svelte'
  import { routes } from '$lib/routes'

  let {
    id,
    name,
    parentMediaArtifactType,
    childMediaArtifactTypes,

    mediaArtifactTypes,
  }: {
    id: string
    name: string
    parentMediaArtifactType: string
    childMediaArtifactTypes: string[]

    mediaArtifactTypes: Map<
      string,
      {
        id: string
        name: string
        mediaTypes: string[]
      }
    >
  } = $props()
</script>

<Card class="relative p-4">
  <div class="absolute right-2 top-2 flex space-x-1">
    <LinkIconButton
      tooltip="Edit"
      href={routes.media.artifactRelationshipTypes.details.edit.route(id)}
      ><Pencil /></LinkIconButton
    >
  </div>

  <h3 class="font-medium">{name}</h3>
  <div>
    <Chip text={mediaArtifactTypes.get(parentMediaArtifactType)?.name ?? 'Unknown'} />
    &gt;
    {#each childMediaArtifactTypes as childMediaArtifactTypeId (childMediaArtifactTypeId)}
      {@const childMediaArtifactType = mediaArtifactTypes.get(childMediaArtifactTypeId)}
      <Chip text={childMediaArtifactType?.name ?? 'Unknown'} />
    {/each}
  </div>
</Card>
