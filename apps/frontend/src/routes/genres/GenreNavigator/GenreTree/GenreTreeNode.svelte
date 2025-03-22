<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { CaretRight } from 'phosphor-svelte'
  import { equals } from 'ramda'

  import { browser } from '$app/environment'
  import { tooltip } from '$lib/actions/tooltip'
  import IconButton from '$lib/atoms/IconButton.svelte'
  import GenreTypeChip from '$lib/components/GenreTypeChip.svelte'
  import { getUserSettingsContext } from '$lib/contexts/user-settings'
  import type { GenreDatabase } from '$lib/genre-db/infrastructure/db'
  import { createGenreDatabaseQueries } from '$lib/genre-db/tanstack-query'
  import { slide } from '$lib/transitions/slide'
  import { cn, isFullyVisible, tw } from '$lib/utils/dom'

  import { getGenreTreeStoreContext } from '../../genre-tree-store.svelte'
  import { getTreeStateStoreContext } from '../../tree-state-store.svelte'
  import GenreTreeNode from './GenreTreeNode.svelte'
  import RelevanceChip from './RelevanceChip.svelte'

  type Props = {
    id: number
    path: (number | 'derived')[]
    treeRef: HTMLElement | undefined
    genreDatabase: GenreDatabase
  }

  let { id, path, treeRef, genreDatabase }: Props = $props()

  const tree = getGenreTreeStoreContext()
  const treeState = getTreeStateStoreContext()

  let genre = tree.getGenre(id)

  const genreDatabaseQueries = createGenreDatabaseQueries(genreDatabase)
  const childrenQuery = createQuery(genreDatabaseQueries.getChildren(id))
  const derivationsQuery = createQuery(genreDatabaseQueries.getDerivations(id))

  let isSelected = $derived(equals(treeState.getSelectedPath(), path))
  let isExpanded = $derived(treeState.isExpanded(path))
  let isExpandable = $derived(
    ($childrenQuery.data ?? []).length > 0 || ($derivationsQuery.data ?? []).length > 0,
  )

  let isDerivedExpandable = $derived(($derivationsQuery.data ?? []).length > 0)
  let isDerivedExpanded = $derived(treeState.isExpanded([...path, 'derived']))

  let ref: HTMLElement | undefined = $state()
  $effect(() => {
    if (isSelected && ref && treeRef && browser) {
      const ref_ = ref
      const treeRef_ = treeRef
      setTimeout(() => {
        const visible = isFullyVisible(ref_, treeRef_)
        if (!visible) {
          ref_.scrollIntoView()
        }
      }, 250)
    }
  })

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
        class={cn('ml-1 flex-shrink-0 text-gray-500', !isExpandable && 'invisible')}
        onClick={() => {
          if (isExpanded) {
            treeState.setCollapsed(path)
          } else {
            treeState.setExpanded(path)
          }
        }}
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
        onclick={() => {
          treeState.setSelectedPath(path)
          treeState.setExpanded(path)
        }}
        use:tooltip={{
          content: 'Enable NSFW content in settings to view this genre',
          enabled: genre.nsfw && !$userSettings.showNsfw,
        }}
      >
        <span class="genre-tree-node__name">{genre.name}</span>
        {#if genre.subtitle}
          &nbsp;
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
          &nbsp;
          <GenreTypeChip type={genre.type} />
        {/if}
        {#if $userSettings.showRelevanceTags}
          &nbsp;
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

    {#if isExpanded && isExpandable}
      <div transition:slide|local={{ axis: 'y' }}>
        {#if $childrenQuery.data}
          {@const children = $childrenQuery.data}
          {#if children.length > 0}
            <ul>
              {#each children as child (child.id)}
                {@const childPath = [...path, child.id]}
                <GenreTreeNode id={child.id} path={childPath} {treeRef} {genreDatabase} />
              {/each}
            </ul>
          {/if}
        {/if}

        {#if isDerivedExpandable}
          <div class="ml-4">
            <div class="flex">
              <IconButton
                size="sm"
                tooltip={isDerivedExpanded ? 'Collapse' : 'Expand'}
                class={cn('ml-1 flex-shrink-0 text-gray-500', !isDerivedExpandable && 'invisible')}
                onClick={() => {
                  if (isDerivedExpanded) {
                    treeState.setCollapsed([...path, 'derived'])
                  } else {
                    treeState.setExpanded([...path, 'derived'])
                  }
                }}
              >
                <CaretRight class={cn('transition', isDerivedExpanded && 'rotate-90')} />
              </IconButton>

              <button
                type="button"
                class="block flex-1 truncate rounded border border-black border-opacity-0 px-1.5 text-left text-[0.93rem] italic text-gray-500 transition hover:border-opacity-[0.03] hover:bg-gray-200 hover:text-black dark:border-white dark:border-opacity-0 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-white"
                onclick={() => {
                  if (isDerivedExpanded) {
                    treeState.setCollapsed([...path, 'derived'])
                  } else {
                    treeState.setExpanded([...path, 'derived'])
                  }
                }}
              >
                Derived Genres
              </button>
            </div>

            {#if isDerivedExpanded && isDerivedExpandable}
              <ul transition:slide|local={{ axis: 'y' }}>
                {#if $derivationsQuery.data}
                  {@const derivations = $derivationsQuery.data}
                  {#each derivations as derivation (derivation.id)}
                    {@const derivationPath = [...path, 'derived' as const, derivation.id]}
                    <GenreTreeNode
                      id={derivation.id}
                      path={derivationPath}
                      {treeRef}
                      {genreDatabase}
                    />
                  {/each}
                {/if}
              </ul>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </li>
{/if}
