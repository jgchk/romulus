<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  import Card from '$lib/atoms/Card.svelte'
  import LinkButton from '$lib/atoms/LinkButton.svelte'
  import Loader from '$lib/atoms/Loader.svelte'
  import MediaArtifactTypeCard from '$lib/features/media/components/MediaArtifactTypeCard.svelte'
  import MediaArtifactTypeForm from '$lib/features/media/components/MediaArtifactTypeForm.svelte'
  import { mediaTypeQueries } from '$lib/features/media/state/tanstack'
  import { routes } from '$lib/routes'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const mediaTypeTreeQuery = createQuery(mediaTypeQueries.tree())
</script>

<div class="mb-4 flex items-center justify-between">
  <h2 class="text-lg font-semibold">Media Artifact Types</h2>
  <LinkButton href={routes.media.artifactTypes.create.route()}>New Type</LinkButton>
</div>

<div>
  <Card>
    {#if $mediaTypeTreeQuery.data}
      <MediaArtifactTypeForm data={data.form} mediaTypes={$mediaTypeTreeQuery.data} />
    {:else if $mediaTypeTreeQuery.error}
      <div>Error loading media types: {$mediaTypeTreeQuery.error.message}</div>
    {:else}
      <Loader size={32} />
    {/if}
  </Card>

  {#each data.mediaArtifactTypes as mediaArtifactType (mediaArtifactType.id)}
    <MediaArtifactTypeCard {...mediaArtifactType} />
  {/each}
</div>
