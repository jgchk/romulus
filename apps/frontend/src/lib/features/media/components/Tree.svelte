<script lang="ts">
  import TreeNode from './TreeNode.svelte'

  let {
    mediaTypes,
  }: { mediaTypes: Map<string, { id: string; name: string; children: string[] }> } = $props()

  const topLevelMediaTypes = $derived.by(() => {
    // Step 1: Collect all child IDs into a Set
    const childIds = new Set<string>()
    for (const node of mediaTypes.values()) {
      for (const childId of node.children) {
        childIds.add(childId)
      }
    }

    // Step 2: Identify nodes that are not in childIds (i.e., roots)
    const rootIds: string[] = []
    for (const genreId of mediaTypes.keys()) {
      if (!childIds.has(genreId)) {
        rootIds.push(genreId)
      }
    }

    // Step 3: Return the array of root IDs
    return rootIds
  })
</script>

<nav aria-label="Media Type Tree" class="media-type-tree">
  {#if topLevelMediaTypes.length > 0}
    <ul class="space-y-1">
      {#each topLevelMediaTypes as mediaTypeId (mediaTypeId)}
        <TreeNode id={mediaTypeId} {mediaTypes} />
      {/each}
    </ul>
  {:else}
    <div class="italic text-gray-500">No media types available</div>
  {/if}
</nav>

<style>
  :global(.media-type-tree ul) {
    list-style-type: none;
    padding-left: 1.5rem;
  }

  :global(.media-type-tree) {
    font-size: 0.95rem;
  }
</style>
