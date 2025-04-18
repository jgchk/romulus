<script lang="ts">
  import { CaretRight, Pencil, Trash } from 'phosphor-svelte'

  import IconButton from '$lib/atoms/IconButton.svelte'
  import LinkIconButton from '$lib/atoms/LinkIconButton.svelte'
  import { routes } from '$lib/routes'
  import { slide } from '$lib/transitions/slide'
  import { cn } from '$lib/utils/dom'

  import MediaTypeTreeNode from './MediaTypeTreeNode.svelte'

  let {
    id,
    mediaTypes,
  }: { id: string; mediaTypes: Map<string, { id: string; name: string; children: string[] }> } =
    $props()

  const mediaType = $derived(mediaTypes.get(id)!)
  let isExpanded = $state(true)

  const isExpandable = $derived(mediaType.children.length > 0)
</script>

<li class="ml-4 border-l border-gray-200 transition dark:border-gray-800">
  <div class="media-type-tree-node flex">
    <IconButton
      size="sm"
      tooltip={isExpanded ? 'Collapse' : 'Expand'}
      class={cn('ml-1 flex-shrink-0 text-gray-500', !isExpandable && 'invisible')}
      onClick={() => (isExpanded = !isExpanded)}
    >
      <CaretRight class={cn('transition', isExpanded && 'rotate-90')} />
    </IconButton>

    <a
      href={routes.media.types.details.route(id)}
      class="group block flex-1 truncate rounded border border-black border-opacity-0 px-1.5 text-[0.93rem] text-gray-600 transition hover:border-opacity-[0.03] hover:bg-gray-200 hover:text-black dark:border-white dark:border-opacity-0 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      {mediaType.name}
    </a>

    <LinkIconButton
      tooltip="Edit"
      href={routes.media.types.details.edit.route(mediaType.id)}
      size="sm"
    >
      <Pencil />
    </LinkIconButton>
    <form method="post" action={routes.media.types.details.delete.route(mediaType.id)}>
      <input type="hidden" name="id" value={mediaType.id} />
      <IconButton tooltip="Delete" type="submit" size="sm">
        <Trash />
      </IconButton>
    </form>
  </div>

  {#if isExpanded && isExpandable}
    <div transition:slide|local={{ axis: 'y' }}>
      {#if mediaType.children.length > 0}
        <ul>
          {#each mediaType.children as childId (childId)}
            <MediaTypeTreeNode id={childId} {mediaTypes} />
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</li>
