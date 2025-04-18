<script lang="ts">
  import MediaArtifactTypeCard from '$lib/features/media/components/MediaArtifactTypeCard.svelte'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
</script>

<MediaArtifactTypeCard mediaArtifactType={data.mediaArtifactType} mediaTypes={data.mediaTypes} />
