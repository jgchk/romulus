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

<nav aria-label="Media Type Tree">
  {#if topLevelMediaTypes.length > 0}
    <ul>
      {#each topLevelMediaTypes as mediaTypeId (mediaTypeId)}
        <TreeNode id={mediaTypeId} {mediaTypes} />
      {/each}
    </ul>
  {/if}
</nav>
