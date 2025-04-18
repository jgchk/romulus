<script lang="ts">
  import Tree from '$lib/features/media/components/Tree.svelte'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  function convertTree(
    mediaTypes: { id: string; name: string; parents: string[] }[],
  ): Map<string, { id: string; name: string; children: string[] }> {
    const store = new Map<string, { id: string; name: string; children: string[] }>(
      mediaTypes.map((mediaType) => [
        mediaType.id,
        { id: mediaType.id, name: mediaType.name, children: [] },
      ]),
    )

    for (const mediaType of mediaTypes) {
      for (const parentId of mediaType.parents) {
        const parent = store.get(parentId)
        if (parent !== undefined) {
          parent.children.push(mediaType.id)
        }
      }
    }

    return store
  }
</script>

<div class="max-w-lg">
  <Tree mediaTypes={convertTree([...data.mediaTypes.values()])} />
</div>
