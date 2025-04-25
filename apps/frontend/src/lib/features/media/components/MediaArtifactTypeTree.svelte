<script lang="ts">
  import { type MediaArtifactTypeTreeMap } from './MediaArtifactTypeTree'
  import MediaArtifactTypeTreeNode from './MediaArtifactTypeTreeNode.svelte'

  let {
    mediaArtifactTypes,
    mediaArtifactRelationshipTypes,
  }: {
    mediaArtifactTypes: { id: string; name: string }[]
    mediaArtifactRelationshipTypes: {
      id: string
      name: string
      parentMediaArtifactType: string
      childMediaArtifactTypes: string[]
    }[]
  } = $props()

  const tree: MediaArtifactTypeTreeMap = $derived.by(() => {
    const tree: MediaArtifactTypeTreeMap = new Map(
      mediaArtifactTypes.map((mediaArtifactType) => [
        mediaArtifactType.id,
        { ...mediaArtifactType, relationships: [] },
      ]),
    )

    for (const mediaArtifactRelationshipType of mediaArtifactRelationshipTypes) {
      tree
        .get(mediaArtifactRelationshipType.parentMediaArtifactType)
        ?.relationships.push(mediaArtifactRelationshipType)
    }

    return tree
  })
</script>

<nav aria-label="Media Artifact Type Tree" class="media-artifact-type-tree">
  {#if tree.size > 0}
    <ul>
      {#each tree.keys() as mediaArtifactTypeId (mediaArtifactTypeId)}
        <MediaArtifactTypeTreeNode id={mediaArtifactTypeId} mediaArtifactTypes={tree} />
      {/each}
    </ul>
  {:else}
    <div class="italic text-gray-500">No media artifact types available</div>
  {/if}
</nav>

<style>
  :global(.media-artifact-type-tree ul) {
    list-style-type: none;
    padding-left: 1.5rem;
  }

  :global(.media-artifact-type-tree) {
    font-size: 0.95rem;
  }
</style>
