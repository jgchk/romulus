<script lang="ts">
  import MediaArtifactTypeCard from '$lib/features/media/components/MediaArtifactTypeCard.svelte'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
</script>

<div>
  {#each data.mediaArtifactTypes as mediaArtifactType (mediaArtifactType.id)}
    <MediaArtifactTypeCard {mediaArtifactType} mediaTypes={data.mediaTypes} />
  {/each}
</div>
