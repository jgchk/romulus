<script lang="ts">
  import TreeNode from './TreeNode.svelte'

  let {
    id,
    mediaTypes,
  }: { id: string; mediaTypes: Map<string, { id: string; name: string; children: string[] }> } =
    $props()

  const mediaType = $derived(mediaTypes.get(id)!)
</script>

<li class="ml-2">
  <a href="/media-types/{mediaType.id}">{mediaType.name}</a>
  {#if mediaType.children.length > 0}
    <ul>
      {#each mediaType.children as child (child)}
        <TreeNode id={child} {mediaTypes} />
      {/each}
    </ul>
  {/if}
</li>
