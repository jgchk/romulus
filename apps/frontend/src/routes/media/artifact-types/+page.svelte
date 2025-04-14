<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { Pencil } from 'phosphor-svelte'

  import Card from '$lib/atoms/Card.svelte'
  import Chip from '$lib/atoms/Chip.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import LinkIconButton from '$lib/atoms/LinkIconButton.svelte'
  import Loader from '$lib/atoms/Loader.svelte'
  import { mediaTypeQueries } from '$lib/features/media/state/tanstack'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const mediaTypeTreeQuery = createQuery(mediaTypeQueries.tree())
</script>

<div class="mb-4 flex items-center justify-between">
  <h2 class="text-lg font-semibold">Media Artifact Types</h2>
  <LinkButton href="/media-artifact-types/create">New Type</LinkButton>
</div>

<div>
  {#each data.mediaArtifactTypes as mediaArtifactType (mediaArtifactType.id)}
    <Card class="relative p-4">
      <div class="absolute right-2 top-2 flex space-x-1">
        <LinkIconButton tooltip="Edit" href="/media-artifact-types/{mediaArtifactType.id}/edit"
          ><Pencil /></LinkIconButton
        >
      </div>

      <h3 class="font-medium">{mediaArtifactType.name}</h3>
      <div>
        {#if $mediaTypeTreeQuery.data}
          {#each mediaArtifactType.mediaTypes as mediaTypeId (mediaTypeId)}
            {@const mediaType = $mediaTypeTreeQuery.data.get(mediaTypeId)}
            <Chip text={mediaType?.name ?? 'Unknown'} />
          {/each}
        {:else if $mediaTypeTreeQuery.error}
          <div>Error loading media types: {$mediaTypeTreeQuery.error.message}</div>
        {:else}
          <Loader size={32} />
        {/if}
      </div>
    </Card>
  {/each}
</div>
