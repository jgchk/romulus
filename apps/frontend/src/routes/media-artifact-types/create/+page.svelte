<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  import MediaArtifactTypeForm from '$lib/features/media/components/MediaArtifactTypeForm.svelte'
  import { mediaTypeQueries } from '$lib/features/media/state/tanstack'
  import { pageTitle } from '$lib/utils/string'

  import type { PageData } from './$types'

  type Props = {
    data: PageData
  }

  let { data }: Props = $props()

  const mediaTypeTreeQuery = createQuery(mediaTypeQueries.tree())
</script>

<svelte:head>
  <title>{pageTitle('New Media Artifact Type', 'Media Artifact Types')}</title>
</svelte:head>

{#if $mediaTypeTreeQuery.data}
  <MediaArtifactTypeForm data={data.form} mediaTypes={$mediaTypeTreeQuery.data} />
{/if}
