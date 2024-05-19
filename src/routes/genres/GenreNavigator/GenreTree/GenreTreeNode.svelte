<script lang="ts">
  import { equals } from 'ramda'

  import { browser } from '$app/environment'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { userSettings } from '$lib/contexts/user'
  import ChevronRightIcon from '$lib/icons/ChevronRightIcon.svelte'
  import { slide } from '$lib/transitions/slide'
  import { cn, isFullyVisible } from '$lib/utils/dom'

  import RelevanceChip from './RelevanceChip.svelte'
  import { treeState } from './state'

  export let id: number
  export let path: number[]
  export let treeRef: HTMLElement | undefined

  const genre = $treeState.genres.get(id)

  $: isSelected = $treeState.selectedPath && equals($treeState.selectedPath, path)
  $: isExpanded = $treeState.expanded.has(path.join('-'))

  let ref: HTMLElement | undefined
  $: if (isSelected && ref && treeRef && browser) {
    const visible = isFullyVisible(ref, treeRef)
    if (!visible) {
      ref.scrollIntoView()
    }
  }
</script>

{#if genre}
  <li
    bind:this={ref}
    class={cn(
      genre.parents.length > 0 && 'ml-4 border-l border-gray-200 transition dark:border-gray-800',
    )}
  >
    <div class="flex">
      <IconButton
        size="sm"
        tooltip={isExpanded ? 'Collapse' : 'Expand'}
        class={cn('ml-1 flex-shrink-0 text-gray-500', genre.children.length === 0 && 'invisible')}
        on:click={() => treeState.setExpanded(path, !isExpanded)}
      >
        <ChevronRightIcon class={cn('transition', isExpanded && 'rotate-90')} />
      </IconButton>

      <a
        href={`/genres/${id}`}
        class={cn(
          'block truncate rounded border border-white border-opacity-0 px-1.5 text-[0.93rem] hover:border-opacity-[0.03] hover:bg-gray-800',
          isSelected ? 'text-primary-500' : 'text-gray-400 hover:text-white',
        )}
        on:click={() => {
          treeState.setSelectedId(id)
          treeState.setSelectedPath(path)
        }}
      >
        {genre.name}
        {#if genre.subtitle}
          {' '}
          <span
            class={cn(
              'text-sm transition',
              isSelected ? 'text-primary-500 dark:text-primary-700' : 'text-gray-500',
            )}
          >
            [{genre.subtitle}]
          </span>
        {/if}
        {#if $userSettings.showTypeTags && genre.type !== 'STYLE'}
          {' '}
          <GenreTypeChip type={genre.type} />
        {/if}
        {#if $userSettings.showRelevanceTags}
          {' '}
          <RelevanceChip relevance={genre.relevance} />
        {/if}
      </a>
    </div>

    {#if isExpanded && genre.children.length > 0}
      <ul transition:slide|local={{ axis: 'y' }}>
        {#each genre.children as childId (childId)}
          {@const childPath = [...path, childId]}
          <svelte:self id={childId} path={childPath} {treeRef} />
        {/each}
      </ul>
    {/if}
  </li>
{/if}
