<script lang="ts">
  import { ArrowLeft, Pencil } from 'phosphor-svelte'

  import Chip from '$lib/atoms/Chip.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import LinkIconButton from '$lib/atoms/LinkIconButton.svelte'
  import MediaArtifactTypeTree from '$lib/features/media/components/MediaArtifactTypeTree.svelte'
  import { routes } from '$lib/routes'

  import { type PageProps } from './$types'

  let { data }: PageProps = $props()

  // Get child media types (media types that have this one as parent)
  const childMediaTypes = $derived(
    [...data.mediaTypes.values()].filter((mt) => mt.parents.includes(data.mediaType.id)),
  )
</script>

<div class="space-y-6 p-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-2">
      <LinkButton href={routes.media.types.route()} kind="text">
        <ArrowLeft class="mr-1" />Back to Media Types
      </LinkButton>
      <h1 class="text-2xl font-semibold">{data.mediaType.name}</h1>
    </div>
    <LinkIconButton tooltip="Edit" href={routes.media.types.details.edit.route(data.mediaType.id)}>
      <Pencil />
    </LinkIconButton>
  </div>

  <div class="space-y-4 rounded-md border bg-white p-4">
    <div>
      <h2 class="mb-2 text-lg font-medium">Details</h2>
      <p class="text-sm text-gray-600">ID: {data.mediaType.id}</p>
    </div>

    <div>
      <h2 class="mb-2 text-lg font-medium">Parents</h2>
      {#if data.mediaType.parents.length > 0}
        <div class="flex flex-wrap gap-2">
          {#each data.mediaType.parents as parentId (parentId)}
            {@const parent = data.mediaTypes.get(parentId)}
            <a href={routes.media.types.details.route(parentId)}>
              <Chip text={parent?.name ?? 'Unknown'} />
            </a>
          {/each}
        </div>
      {:else}
        <p class="text-sm text-gray-600">This is a top-level media type with no parents</p>
      {/if}
    </div>

    <div>
      <h2 class="mb-2 text-lg font-medium">Child Media Types</h2>
      {#if childMediaTypes.length > 0}
        <div class="flex flex-wrap gap-2">
          {#each childMediaTypes as child (child.id)}
            <a href={routes.media.types.details.route(child.id)}>
              <Chip text={child.name} />
            </a>
          {/each}
        </div>
      {:else}
        <p class="text-sm text-gray-600">No child media types</p>
      {/if}
    </div>
  </div>
</div>

<MediaArtifactTypeTree
  mediaArtifactTypes={data.mediaArtifactTypes}
  mediaArtifactRelationshipTypes={data.mediaArtifactRelationshipTypes}
/>
