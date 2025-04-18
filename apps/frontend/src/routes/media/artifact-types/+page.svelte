<script lang="ts">
  import MediaArtifactTypeTree from '$lib/features/media/components/MediaArtifactTypeTree.svelte'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
</script>

<MediaArtifactTypeTree
  mediaArtifactTypes={data.mediaArtifactTypes}
  mediaArtifactRelationshipTypes={data.mediaArtifactRelationshipTypes}
/>
