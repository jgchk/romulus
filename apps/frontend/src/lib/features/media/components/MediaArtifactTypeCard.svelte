<script lang="ts">
  import { Pencil, Trash } from 'phosphor-svelte'

  import Card from '$lib/atoms/Card.svelte'
  import Chip from '$lib/atoms/Chip.svelte'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import LinkIconButton from '$lib/atoms/LinkIconButton.svelte'
  import { routes } from '$lib/routes'

  let {
    mediaArtifactType,
    mediaTypes,
  }: {
    mediaArtifactType: { id: string; name: string; mediaTypes: string[] }
    mediaTypes: Map<string, { id: string; name: string }>
  } = $props()
</script>

<Card class="relative p-4">
  <div class="absolute right-2 top-2 flex space-x-1">
    <LinkIconButton
      tooltip="Edit"
      href={routes.media.artifactTypes.details.edit.route(mediaArtifactType.id)}
    >
      <Pencil />
    </LinkIconButton>
    <form
      method="post"
      action={routes.media.artifactTypes.details.delete.route(mediaArtifactType.id)}
    >
      <input type="hidden" name="id" value={mediaArtifactType.id} />
      <IconButton tooltip="Delete" type="submit">
        <Trash />
      </IconButton>
    </form>
  </div>

  <h3 class="font-medium">{mediaArtifactType.name}</h3>
  <div>
    {#each mediaArtifactType.mediaTypes as mediaTypeId (mediaTypeId)}
      {@const mediaType = mediaTypes.get(mediaTypeId)}
      <Chip text={mediaType?.name ?? 'Unknown'} />
    {/each}
  </div>
</Card>
