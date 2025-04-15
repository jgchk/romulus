<script lang="ts">
  import { CaretDown, CaretRight } from 'phosphor-svelte'

  import { routes } from '$lib/routes'

  import TreeNode from './TreeNode.svelte'

  let {
    id,
    mediaTypes,
  }: { id: string; mediaTypes: Map<string, { id: string; name: string; children: string[] }> } =
    $props()

  const mediaType = $derived(mediaTypes.get(id)!)
  let expanded = $state(true)
</script>

<li class="py-1">
  <div class="flex items-center rounded p-1 transition-colors hover:bg-gray-100">
    {#if mediaType.children.length > 0}
      <button
        type="button"
        class="mr-1 text-gray-500 hover:text-gray-700"
        onclick={() => (expanded = !expanded)}
      >
        {#if expanded}
          <CaretDown size={16} />
        {:else}
          <CaretRight size={16} />
        {/if}
      </button>
    {:else}
      <span class="mr-1 w-4"></span>
    {/if}

    <a
      href={routes.media.types.details.route(id)}
      class="hover:text-blue-600 flex-1 transition-colors"
    >
      {mediaType.name}
    </a>
  </div>

  {#if mediaType.children.length > 0 && expanded}
    <ul class="mt-1">
      {#each mediaType.children as child (child)}
        <TreeNode id={child} {mediaTypes} />
      {/each}
    </ul>
  {/if}
</li>
