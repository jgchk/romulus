<script lang="ts">
  import { CaretRight } from 'phosphor-svelte'
  import { equals } from 'ramda'

  import { browser } from '$app/environment'
  import { tooltip } from '$lib/actions/tooltip'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import { slide } from '$lib/transitions/slide'
  import { cn, isFullyVisible, tw } from '$lib/utils/dom'

  import RelevanceChip from './RelevanceChip.svelte'
  import { treeState } from './state'

  export let id: number
  export let path: number[]
  export let treeRef: HTMLElement | undefined

  $: genre = $treeState.genres.get(id)

  $: isSelected = $treeState.selectedPath && equals($treeState.selectedPath, path)
  $: isExpanded = $treeState.expanded.has(path.join('-'))

  let ref: HTMLElement | undefined
  $: if (isSelected && ref && treeRef && browser) {
    const ref_ = ref
    const treeRef_ = treeRef
    setTimeout(() => {
      const visible = isFullyVisible(ref_, treeRef_)
      if (!visible) {
        ref_.scrollIntoView()
      }
    }, 250)
  }

  const userSettings = getUserSettingsContext()
</script>

{#if genre}
  <li
    bind:this={ref}
    class={cn(
      genre.parents.length > 0 && 'ml-4 border-l border-gray-200 transition dark:border-gray-800',
    )}
  >
    <div class="genre-tree-node flex">
      <IconButton
        size="sm"
        tooltip={isExpanded ? 'Collapse' : 'Expand'}
        class={cn('ml-1 flex-shrink-0 text-gray-500', genre.children.length === 0 && 'invisible')}
        onClick={() => treeState.setExpanded(path, !isExpanded)}
      >
        <CaretRight class={cn('transition', isExpanded && 'rotate-90')} />
      </IconButton>

      <a
        href="/genres/{id}"
        class={tw(
          'group block flex-1 truncate rounded border border-black border-opacity-0 px-1.5 text-[0.93rem] transition hover:border-opacity-[0.03] hover:bg-gray-200 dark:border-white dark:border-opacity-0 dark:hover:bg-gray-800',
          isSelected
            ? 'text-primary-500'
            : 'text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white',
          genre.nsfw && !$userSettings.showNsfw && 'blur-sm',
        )}
        on:click={() => {
          treeState.setSelectedId(id)
          treeState.setSelectedPath(path)
        }}
        use:tooltip={{
          content: 'Enable NSFW content in settings to view this genre',
          enabled: genre.nsfw && !$userSettings.showNsfw,
        }}
      >
        <span class="genre-tree-node__name">{genre.name}</span>
        {#if genre.subtitle}
          {' '}
          <span
            class={cn(
              'genre-tree-node__subtitle text-[0.8rem] transition',
              isSelected
                ? 'text-primary-500 dark:text-primary-700'
                : 'text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400',
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
        {#if genre.nsfw}
          <span
            class="align-super text-xs font-bold text-error-500 transition dark:text-error-700"
            use:tooltip={{ content: 'NSFW' }}>N</span
          >
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
