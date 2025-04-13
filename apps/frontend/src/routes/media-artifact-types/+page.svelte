<script lang="ts">
  import LinkButton from '$lib/atoms/LinkButton.svelte'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
</script>

<LinkButton href="/media-artifact-types/create">Create Media Artifact Type</LinkButton>
<LinkButton href="/media-artifact-types/relationships/create"
  >Create Media Artifact Relationship Type</LinkButton
>

<div>
  {#each data.mediaArtifactTypes as mediaArtifactType (mediaArtifactType.id)}
    <div>
      <h2>Media Artifact Type Details</h2>
      <p>Media Artifact Type ID: {mediaArtifactType.id}</p>
      <p>Media Artifact Type Name: {mediaArtifactType.name}</p>
    </div>
  {/each}
</div>

<div>
  {#each data.mediaArtifactRelationshipTypes as mediaArtifactRelationshipType (mediaArtifactRelationshipType.id)}
    <div>
      <h2>Media Artifact Relationship Type Details</h2>
      <p>Media Artifact Relationship Type ID: {mediaArtifactRelationshipType.id}</p>
      <p>Media Artifact Relationship Type Name: {mediaArtifactRelationshipType.name}</p>
    </div>
  {/each}
</div>
