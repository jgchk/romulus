<script lang="ts">
  import { CaretRight, Pencil, Trash } from 'phosphor-svelte'

  import IconButton from '$lib/atoms/IconButton.svelte'
  import LinkIconButton from '$lib/atoms/LinkIconButton.svelte'
  import { routes } from '$lib/routes'
  import { slide } from '$lib/transitions/slide'
  import { cn } from '$lib/utils/dom'

  import type { MediaArtifactTypeTreeMap } from './MediaArtifactTypeTree'
  import MediaArtifactTypeTreeNode from './MediaArtifactTypeTreeNode.svelte'

  let { id, mediaArtifactTypes }: { id: string; mediaArtifactTypes: MediaArtifactTypeTreeMap } =
    $props()

  const mediaArtifactType = $derived(mediaArtifactTypes.get(id))
  let isExpanded = $state(true)

  const isExpandable = $derived(!!mediaArtifactType?.relationships.length)
</script>

{#if mediaArtifactType}
  <li class="ml-4 border-l border-gray-200 transition dark:border-gray-800">
    <div class="media-artifact-type-tree-node flex">
      <IconButton
        size="sm"
        tooltip={isExpanded ? 'Collapse' : 'Expand'}
        class={cn('ml-1 flex-shrink-0 text-gray-500', !isExpandable && 'invisible')}
        onClick={() => (isExpanded = !isExpanded)}
      >
        <CaretRight class={cn('transition', isExpanded && 'rotate-90')} />
      </IconButton>

      <a
        href={routes.media.artifactTypes.details.route(id)}
        class="group block flex-1 truncate rounded border border-black border-opacity-0 px-1.5 text-[0.93rem] text-gray-600 transition hover:border-opacity-[0.03] hover:bg-gray-200 hover:text-black dark:border-white dark:border-opacity-0 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        {mediaArtifactType.name}
      </a>

      <LinkIconButton
        tooltip="Edit"
        href={routes.media.types.details.edit.route(mediaArtifactType.id)}
        size="sm"
      >
        <Pencil />
      </LinkIconButton>
      <form method="post" action={routes.media.types.details.delete.route(mediaArtifactType.id)}>
        <input type="hidden" name="id" value={mediaArtifactType.id} />
        <IconButton tooltip="Delete" type="submit" size="sm">
          <Trash />
        </IconButton>
      </form>
    </div>

    {#if isExpanded && isExpandable}
      <div transition:slide|local={{ axis: 'y' }}>
        {#if mediaArtifactType.relationships.length > 0}
          <ul>
            {#each mediaArtifactType.relationships as relationship (relationship.id)}
              <li>
                <div class="flex">
                  <a
                    href={routes.media.artifactTypes.details.route(id)}
                    class="group block flex-1 truncate rounded border border-black border-opacity-0 px-1.5 text-[0.93rem] italic text-gray-500 transition hover:border-opacity-[0.03] hover:bg-gray-200 hover:text-black dark:border-white dark:border-opacity-0 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    {relationship.name}
                  </a>
                </div>

                {#if relationship.childMediaArtifactTypes.length > 0}
                  <ul>
                    {#each relationship.childMediaArtifactTypes as childMediaArtifactTypeId (childMediaArtifactTypeId)}
                      <MediaArtifactTypeTreeNode
                        id={childMediaArtifactTypeId}
                        {mediaArtifactTypes}
                      />
                    {/each}
                  </ul>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </li>
{/if}
