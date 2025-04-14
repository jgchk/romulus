<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { Pencil } from 'phosphor-svelte'

  import Card from '$lib/atoms/Card.svelte'
  import Chip from '$lib/atoms/Chip.svelte'
  import LinkIconButton from '$lib/atoms/LinkIconButton.svelte'
  import Loader from '$lib/atoms/Loader.svelte'
  import { routes } from '$lib/routes'

  import { mediaTypeQueries } from '../state/tanstack'

  let { id, name, mediaTypes }: { id: string; name: string; mediaTypes: string[] } = $props()

  const mediaTypeTreeQuery = createQuery(mediaTypeQueries.tree())
</script>

<Card class="relative p-4">
  <div class="absolute right-2 top-2 flex space-x-1">
    <LinkIconButton tooltip="Edit" href={routes.media.artifactTypes.details.edit.route(id)}
      ><Pencil /></LinkIconButton
    >
  </div>

  <h3 class="font-medium">{name}</h3>
  <div>
    {#if $mediaTypeTreeQuery.data}
      {#each mediaTypes as mediaTypeId (mediaTypeId)}
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
