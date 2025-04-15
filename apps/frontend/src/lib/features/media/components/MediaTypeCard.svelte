<script lang="ts">
  import { Pencil, Trash } from 'phosphor-svelte'

  import Card from '$lib/atoms/Card.svelte'
  import Chip from '$lib/atoms/Chip.svelte'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import LinkIconButton from '$lib/atoms/LinkIconButton.svelte'
  import { routes } from '$lib/routes'

  let {
    mediaType,
    parentMediaTypes,
  }: {
    mediaType: { id: string; name: string; parents: string[] }
    parentMediaTypes: Map<string, { id: string; name: string }>
  } = $props()
</script>

<Card class="relative p-4">
  <div class="absolute right-2 top-2 flex space-x-1">
    <LinkIconButton tooltip="Edit" href={routes.media.types.details.edit.route(mediaType.id)}>
      <Pencil />
    </LinkIconButton>
    <form method="post" action={routes.media.types.details.delete.route(mediaType.id)}>
      <input type="hidden" name="id" value={mediaType.id} />
      <IconButton tooltip="Delete" type="submit">
        <Trash />
      </IconButton>
    </form>
  </div>

  <h3 class="font-medium">{mediaType.name}</h3>
  <div>
    {#if mediaType.parents.length > 0}
      <div class="mt-1">
        <span class="text-sm text-gray-500">Parents:</span>
        {#each mediaType.parents as parentId (parentId)}
          {@const parent = parentMediaTypes.get(parentId)}
          <Chip text={parent?.name ?? 'Unknown'} />
        {/each}
      </div>
    {:else}
      <div class="mt-1">
        <span class="text-xs text-gray-500">Top level media type</span>
      </div>
    {/if}
  </div>
</Card>
